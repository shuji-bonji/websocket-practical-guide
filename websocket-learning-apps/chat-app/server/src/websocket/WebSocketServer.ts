import WebSocket, { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { URL } from 'url';
import type {
	User,
	UserSession,
	WebSocketMessage,
	ChatMessage,
	ChatRoom,
	AuthToken,
	ServerConfig
} from '../types/index.js';
import { MessageType } from '../types/index.js';
import { ChatDatabase } from '../database/Database.js';
import { AuthManager } from '../auth/AuthManager.js';

export class ChatWebSocketServer {
	private wss: WebSocketServer;
	private sessions: Map<string, UserSession> = new Map();
	private userSockets: Map<string, Set<WebSocket>> = new Map();
	private roomUsers: Map<string, Set<string>> = new Map();
	private db: ChatDatabase;
	private auth: AuthManager;
	private config: ServerConfig;

	constructor(config: ServerConfig, db: ChatDatabase, auth: AuthManager) {
		this.config = config;
		this.db = db;
		this.auth = auth;
		
		this.wss = new WebSocketServer({
			port: config.port,
			host: config.host,
			verifyClient: this.verifyClient.bind(this)
		});

		this.setupEventHandlers();
		console.log(`WebSocket server started on ws://${config.host}:${config.port}`);
	}

	private verifyClient(info: { origin: string; secure: boolean; req: IncomingMessage }): boolean {
		// Basic CORS check
		const allowedOrigins = Array.isArray(this.config.cors.origin) 
			? this.config.cors.origin 
			: [this.config.cors.origin];
			
		return allowedOrigins.includes(info.origin) || allowedOrigins.includes('*');
	}

	private setupEventHandlers(): void {
		this.wss.on('connection', this.handleConnection.bind(this));
		this.wss.on('error', this.handleServerError.bind(this));

		// Cleanup interval
		setInterval(() => {
			this.cleanupSessions();
		}, 30000); // Every 30 seconds

		// Ping interval for connection health
		setInterval(() => {
			this.pingClients();
		}, 30000);
	}

	private handleConnection(ws: WebSocket, req: IncomingMessage): void {
		const url = new URL(req.url || '/', `http://${req.headers.host}`);
		const sessionId = this.generateSessionId();
		
		console.log(`New WebSocket connection attempt: ${sessionId}`);

		// Set up basic message handler for authentication
		ws.on('message', (data: Buffer) => {
			try {
				const message = JSON.parse(data.toString()) as WebSocketMessage;
				this.handlePreAuthMessage(ws, message, sessionId, req);
			} catch (error) {
				console.error('Invalid message format:', error);
				this.sendError(ws, 'Invalid message format');
				ws.close();
			}
		});

		ws.on('close', () => {
			this.handleDisconnection(sessionId);
		});

		ws.on('error', (error) => {
			console.error(`WebSocket error for session ${sessionId}:`, error);
			this.handleDisconnection(sessionId);
		});

		// Send authentication required message
		this.sendMessage(ws, {
			type: MessageType.AUTH_ERROR,
			payload: { message: 'Authentication required' }
		});
	}

	private handlePreAuthMessage(
		ws: WebSocket, 
		message: WebSocketMessage, 
		sessionId: string, 
		req: IncomingMessage
	): void {
		// Extract token from message or URL
		const token = message.payload as string || 
			new URL(req.url || '/', `http://${req.headers.host}`).searchParams.get('token');

		if (!token) {
			this.sendError(ws, 'No authentication token provided');
			ws.close();
			return;
		}

		const user = this.auth.getUserFromToken(token);
		if (!user) {
			this.sendError(ws, 'Invalid or expired token');
			ws.close();
			return;
		}

		// Create user session
		const session: UserSession = {
			ws,
			user,
			roomId: 'general', // Default room
			lastSeen: new Date(),
			isTyping: false,
			ipAddress: req.socket.remoteAddress || 'unknown',
			userAgent: req.headers['user-agent'] || 'unknown'
		};

		this.sessions.set(sessionId, session);
		
		// Track user sockets
		if (!this.userSockets.has(user.id)) {
			this.userSockets.set(user.id, new Set());
		}
		this.userSockets.get(user.id)!.add(ws);

		// Update user online status
		this.db.updateUserOnlineStatus(user.id, true);

		// Join default room
		this.joinRoom(sessionId, 'general');

		// Set up authenticated message handler
		ws.removeAllListeners('message');
		ws.on('message', (data: Buffer) => {
			try {
				const msg = JSON.parse(data.toString()) as WebSocketMessage;
				this.handleAuthenticatedMessage(sessionId, msg);
			} catch (error) {
				console.error('Invalid message format:', error);
				this.sendError(ws, 'Invalid message format');
			}
		});

		// Send authentication success
		this.sendMessage(ws, {
			type: MessageType.AUTH_SUCCESS,
			payload: { 
				user: this.sanitizeUser(user),
				roomId: session.roomId
			}
		});

		// Send initial data
		this.sendRoomList(sessionId);
		this.sendMessageHistory(sessionId, session.roomId);
		this.sendUserList(sessionId, session.roomId);

		console.log(`User ${user.username} authenticated successfully`);
	}

	private handleAuthenticatedMessage(sessionId: string, message: WebSocketMessage): void {
		const session = this.sessions.get(sessionId);
		if (!session) {
			console.error(`Session not found: ${sessionId}`);
			return;
		}

		session.lastSeen = new Date();

		switch (message.type) {
			case MessageType.CHAT_MESSAGE:
				this.handleChatMessage(sessionId, message.payload as any);
				break;
			
			case MessageType.TYPING_START:
				this.handleTypingStart(sessionId);
				break;
			
			case MessageType.TYPING_STOP:
				this.handleTypingStop(sessionId);
				break;
			
			case MessageType.ROOM_JOIN:
				this.handleRoomJoin(sessionId, message.payload as { roomId: string });
				break;
			
			case MessageType.ROOM_CREATE:
				this.handleRoomCreate(sessionId, message.payload as any);
				break;
			
			case MessageType.PING:
				this.handlePing(sessionId);
				break;
			
			default:
				console.warn(`Unknown message type: ${message.type}`);
		}
	}

	private handleChatMessage(sessionId: string, payload: { content: string; replyToId?: string }): void {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		// Create message in database
		const message = this.db.createMessage({
			type: 'message',
			content: payload.content,
			userId: session.user.id,
			username: session.user.username,
			roomId: session.roomId,
			replyToId: payload.replyToId
		});

		// Broadcast to room members
		this.broadcastToRoom(session.roomId, {
			type: MessageType.CHAT_MESSAGE,
			payload: message
		});
	}

	private handleTypingStart(sessionId: string): void {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		session.isTyping = true;
		
		this.broadcastToRoom(session.roomId, {
			type: MessageType.TYPING_START,
			payload: {
				userId: session.user.id,
				username: session.user.username
			}
		}, sessionId); // Exclude sender
	}

	private handleTypingStop(sessionId: string): void {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		session.isTyping = false;
		
		this.broadcastToRoom(session.roomId, {
			type: MessageType.TYPING_STOP,
			payload: {
				userId: session.user.id,
				username: session.user.username
			}
		}, sessionId); // Exclude sender
	}

	private handleRoomJoin(sessionId: string, payload: { roomId: string }): void {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		const room = this.db.getRoomById(payload.roomId);
		if (!room) {
			this.sendError(session.ws, 'Room not found');
			return;
		}

		// Leave current room
		this.leaveRoom(sessionId, session.roomId);
		
		// Join new room
		this.joinRoom(sessionId, payload.roomId);
		
		// Update session
		session.roomId = payload.roomId;

		// Send room data
		this.sendMessageHistory(sessionId, payload.roomId);
		this.sendUserList(sessionId, payload.roomId);
	}

	private handleRoomCreate(sessionId: string, payload: { name: string; description?: string; isPrivate?: boolean }): void {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		try {
			const room = this.db.createRoom(payload, session.user.id);
			
			this.sendMessage(session.ws, {
				type: MessageType.ROOM_CREATE,
				payload: { room: this.sanitizeRoom(room) }
			});

			// Broadcast room list update to all users
			this.broadcastToAll({
				type: MessageType.ROOM_LIST,
				payload: { rooms: this.getRoomList() }
			});
		} catch (error) {
			this.sendError(session.ws, error instanceof Error ? error.message : 'Failed to create room');
		}
	}

	private handlePing(sessionId: string): void {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		this.sendMessage(session.ws, {
			type: MessageType.PONG,
			payload: { timestamp: new Date() }
		});
	}

	private joinRoom(sessionId: string, roomId: string): void {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		// Add to database
		this.db.joinRoom(roomId, session.user.id);

		// Add to room tracking
		if (!this.roomUsers.has(roomId)) {
			this.roomUsers.set(roomId, new Set());
		}
		this.roomUsers.get(roomId)!.add(session.user.id);

		// Notify room members
		this.broadcastToRoom(roomId, {
			type: MessageType.USER_JOINED,
			payload: {
				user: this.sanitizeUser(session.user),
				roomId
			}
		}, sessionId); // Exclude the joining user
	}

	private leaveRoom(sessionId: string, roomId: string): void {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		// Remove from room tracking
		this.roomUsers.get(roomId)?.delete(session.user.id);

		// Notify room members
		this.broadcastToRoom(roomId, {
			type: MessageType.USER_LEFT,
			payload: {
				user: this.sanitizeUser(session.user),
				roomId
			}
		}, sessionId); // Exclude the leaving user
	}

	private handleDisconnection(sessionId: string): void {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		console.log(`User ${session.user.username} disconnected`);

		// Remove from user sockets
		const userSockets = this.userSockets.get(session.user.id);
		if (userSockets) {
			userSockets.delete(session.ws);
			if (userSockets.size === 0) {
				this.userSockets.delete(session.user.id);
				// Update user offline status only if no other connections
				this.db.updateUserOnlineStatus(session.user.id, false);
			}
		}

		// Leave room
		this.leaveRoom(sessionId, session.roomId);

		// Remove session
		this.sessions.delete(sessionId);
	}

	private sendRoomList(sessionId: string): void {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		const rooms = this.db.getRoomsByUserId(session.user.id);
		this.sendMessage(session.ws, {
			type: MessageType.ROOM_LIST,
			payload: { rooms: rooms.map((r: ChatRoom) => this.sanitizeRoom(r)) }
		});
	}

	private sendMessageHistory(sessionId: string, roomId: string): void {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		const result = this.db.getMessagesByRoom(roomId, { page: 1, limit: 50 });
		this.sendMessage(session.ws, {
			type: MessageType.MESSAGE_HISTORY,
			payload: { 
				messages: result.data,
				roomId,
				pagination: {
					total: result.total,
					page: result.page,
					totalPages: result.totalPages
				}
			}
		});
	}

	private sendUserList(sessionId: string, roomId: string): void {
		const session = this.sessions.get(sessionId);
		if (!session) return;

		const roomUserIds = this.roomUsers.get(roomId) || new Set();
		const users = Array.from(roomUserIds)
			.map(userId => this.db.getUserById(userId))
			.filter(user => user !== null)
			.map(user => this.sanitizeUser(user!));

		this.sendMessage(session.ws, {
			type: MessageType.USER_LIST,
			payload: { users, roomId }
		});
	}

	private broadcastToRoom(roomId: string, message: WebSocketMessage, excludeSessionId?: string): void {
		const roomUserIds = this.roomUsers.get(roomId);
		if (!roomUserIds) return;

		for (const userId of roomUserIds) {
			const userSockets = this.userSockets.get(userId);
			if (!userSockets) continue;

			for (const ws of userSockets) {
				// Find session to check if it should be excluded
				const sessionEntry = Array.from(this.sessions.entries()).find(([, session]) => session.ws === ws);
				if (sessionEntry && sessionEntry[0] === excludeSessionId) continue;

				if (ws.readyState === WebSocket.OPEN) {
					this.sendMessage(ws, message);
				}
			}
		}
	}

	private broadcastToAll(message: WebSocketMessage): void {
		for (const session of this.sessions.values()) {
			if (session.ws.readyState === WebSocket.OPEN) {
				this.sendMessage(session.ws, message);
			}
		}
	}

	private sendMessage(ws: WebSocket, message: WebSocketMessage): void {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(JSON.stringify({
				...message,
				id: message.id || this.generateMessageId(),
				timestamp: message.timestamp || new Date()
			}));
		}
	}

	private sendError(ws: WebSocket, error: string): void {
		this.sendMessage(ws, {
			type: MessageType.ERROR,
			payload: { error }
		});
	}

	private pingClients(): void {
		for (const session of this.sessions.values()) {
			if (session.ws.readyState === WebSocket.OPEN) {
				this.sendMessage(session.ws, {
					type: MessageType.PING,
					payload: { timestamp: new Date() }
				});
			}
		}
	}

	private cleanupSessions(): void {
		const now = Date.now();
		const staleThreshold = 5 * 60 * 1000; // 5 minutes

		for (const [sessionId, session] of this.sessions.entries()) {
			if (now - session.lastSeen.getTime() > staleThreshold || 
				session.ws.readyState !== WebSocket.OPEN) {
				this.handleDisconnection(sessionId);
			}
		}
	}

	private handleServerError(error: Error): void {
		console.error('WebSocket server error:', error);
	}

	private generateSessionId(): string {
		return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private generateMessageId(): string {
		return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private sanitizeUser(user: User): Omit<User, 'email'> {
		return {
			id: user.id,
			username: user.username,
			avatar: user.avatar,
			isOnline: user.isOnline,
			lastSeen: user.lastSeen,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt
		};
	}

	private sanitizeRoom(room: ChatRoom): Omit<ChatRoom, 'typingUsers'> {
		return {
			id: room.id,
			name: room.name,
			description: room.description,
			isPrivate: room.isPrivate,
			ownerId: room.ownerId,
			members: room.members,
			createdAt: room.createdAt,
			lastActivity: room.lastActivity
		};
	}

	private getRoomList(): Omit<ChatRoom, 'typingUsers'>[] {
		// Get all public rooms
		const publicRooms = this.db.getRoomsByUserId('general'); // This would need to be updated to get public rooms
		return publicRooms.map((room: ChatRoom) => this.sanitizeRoom(room));
	}

	// Graceful shutdown
	public close(): Promise<void> {
		return new Promise((resolve) => {
			// Close all connections
			for (const session of this.sessions.values()) {
				session.ws.close();
			}

			// Close server
			this.wss.close(() => {
				console.log('WebSocket server closed');
				resolve();
			});
		});
	}

	// Getters for monitoring
	public getStats() {
		return {
			totalConnections: this.sessions.size,
			totalUsers: this.userSockets.size,
			totalRooms: this.roomUsers.size,
			uptime: process.uptime()
		};
	}
}
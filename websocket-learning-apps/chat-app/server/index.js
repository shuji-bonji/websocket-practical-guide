import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
// import { parse } from 'cookie'; // For cookie parsing if needed

// Configuration
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
// Redis URL for production scaling
// const REDIS_URL = process.env.REDIS_URL;

// In-memory storage (replace with Redis in production)
const chatRooms = new Map();
const userSessions = new Map();
const messageHistory = new Map();

// Default room
const DEFAULT_ROOM = 'general';
chatRooms.set(DEFAULT_ROOM, {
	id: DEFAULT_ROOM,
	name: 'General',
	description: 'General chat room',
	members: new Set(),
	typingUsers: new Map(),
	createdAt: new Date(),
	lastActivity: new Date()
});
messageHistory.set(DEFAULT_ROOM, []);

// WebSocket Message Types
const MESSAGE_TYPES = {
	CHAT_MESSAGE: 'chat_message',
	TYPING_START: 'typing_start',
	TYPING_STOP: 'typing_stop',
	USER_JOINED: 'user_joined',
	USER_LEFT: 'user_left',
	ROOM_UPDATE: 'room_update',
	ERROR: 'error',
	PING: 'ping',
	PONG: 'pong',
	AUTH_SUCCESS: 'auth_success',
	MESSAGE_HISTORY: 'message_history'
};

// Authentication middleware
function authenticateToken(token) {
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		return decoded;
	} catch {
		return null;
	}
}

// Create HTTP server
const server = createServer();
const wss = new WebSocketServer({
	server,
	verifyClient: (info) => {
		// Extract token from query string or headers
		const url = new URL(info.req.url, `http://${info.req.headers.host}`);
		const token =
			url.searchParams.get('token') || info.req.headers.authorization?.replace('Bearer ', '');

		if (!token) {
			return false;
		}

		const user = authenticateToken(token);
		if (!user) {
			return false;
		}

		// Store user info for later use
		info.req.user = user;
		return true;
	}
});

// WebSocket connection handler
wss.on('connection', (ws, req) => {
	const user = req.user;
	const sessionId = nanoid();

	// Store session
	userSessions.set(sessionId, {
		ws,
		user,
		roomId: DEFAULT_ROOM,
		lastSeen: new Date(),
		isTyping: false
	});

	// Add user to default room
	const room = chatRooms.get(DEFAULT_ROOM);
	room.members.add(user.id);

	console.log(`User ${user.username} connected to room ${DEFAULT_ROOM}`);

	// Send authentication success and initial data
	sendMessage(ws, {
		type: MESSAGE_TYPES.AUTH_SUCCESS,
		payload: { user, roomId: DEFAULT_ROOM }
	});

	// Send message history
	const history = messageHistory.get(DEFAULT_ROOM) || [];
	sendMessage(ws, {
		type: MESSAGE_TYPES.MESSAGE_HISTORY,
		payload: { messages: history.slice(-50) } // Last 50 messages
	});

	// Broadcast user joined
	broadcastToRoom(
		DEFAULT_ROOM,
		{
			type: MESSAGE_TYPES.USER_JOINED,
			payload: {
				userId: user.id,
				username: user.username,
				timestamp: new Date()
			}
		},
		sessionId
	);

	// Send room update
	broadcastToRoom(DEFAULT_ROOM, {
		type: MESSAGE_TYPES.ROOM_UPDATE,
		payload: {
			roomId: DEFAULT_ROOM,
			members: Array.from(room.members),
			memberCount: room.members.size
		}
	});

	// Handle incoming messages
	ws.on('message', (data) => {
		try {
			const message = JSON.parse(data.toString());
			handleMessage(sessionId, message);
		} catch (error) {
			console.error('Error parsing message:', error);
			sendError(ws, 'Invalid message format');
		}
	});

	// Handle connection close
	ws.on('close', () => {
		console.log(`User ${user.username} disconnected`);

		// Remove from room
		room.members.delete(user.id);

		// Clear typing indicator
		if (room.typingUsers.has(user.id)) {
			room.typingUsers.delete(user.id);
			broadcastTypingUpdate(DEFAULT_ROOM);
		}

		// Broadcast user left
		broadcastToRoom(DEFAULT_ROOM, {
			type: MESSAGE_TYPES.USER_LEFT,
			payload: {
				userId: user.id,
				username: user.username,
				timestamp: new Date()
			}
		});

		// Send room update
		broadcastToRoom(DEFAULT_ROOM, {
			type: MESSAGE_TYPES.ROOM_UPDATE,
			payload: {
				roomId: DEFAULT_ROOM,
				members: Array.from(room.members),
				memberCount: room.members.size
			}
		});

		// Clean up session
		userSessions.delete(sessionId);
	});

	// Handle errors
	ws.on('error', (error) => {
		console.error('WebSocket error:', error);
	});

	// Ping/Pong for connection health
	const pingInterval = setInterval(() => {
		if (ws.readyState === ws.OPEN) {
			sendMessage(ws, { type: MESSAGE_TYPES.PING, payload: {} });
		} else {
			clearInterval(pingInterval);
		}
	}, 30000);
});

// Message handler
function handleMessage(sessionId, message) {
	const session = userSessions.get(sessionId);
	if (!session) return;

	const { ws } = session;

	switch (message.type) {
		case MESSAGE_TYPES.CHAT_MESSAGE:
			handleChatMessage(sessionId, message.payload);
			break;

		case MESSAGE_TYPES.TYPING_START:
			handleTypingStart(sessionId);
			break;

		case MESSAGE_TYPES.TYPING_STOP:
			handleTypingStop(sessionId);
			break;

		case MESSAGE_TYPES.PONG:
			// Update last seen
			session.lastSeen = new Date();
			break;

		default:
			sendError(ws, `Unknown message type: ${message.type}`);
	}
}

// Chat message handler
function handleChatMessage(sessionId, payload) {
	const session = userSessions.get(sessionId);
	if (!session) return;

	const { user, roomId } = session;
	const { content, replyTo } = payload;

	if (!content || content.trim().length === 0) {
		sendError(session.ws, 'Message content cannot be empty');
		return;
	}

	const chatMessage = {
		id: nanoid(),
		type: 'message',
		content: content.trim(),
		userId: user.id,
		username: user.username,
		timestamp: new Date(),
		replyTo: replyTo || undefined
	};

	// Store message
	if (!messageHistory.has(roomId)) {
		messageHistory.set(roomId, []);
	}
	messageHistory.get(roomId).push(chatMessage);

	// Update room activity
	const room = chatRooms.get(roomId);
	if (room) {
		room.lastActivity = new Date();
	}

	// Broadcast to room
	broadcastToRoom(roomId, {
		type: MESSAGE_TYPES.CHAT_MESSAGE,
		payload: chatMessage
	});

	// Clear typing indicator for this user
	if (room && room.typingUsers.has(user.id)) {
		room.typingUsers.delete(user.id);
		broadcastTypingUpdate(roomId);
	}
}

// Typing indicator handlers
function handleTypingStart(sessionId) {
	const session = userSessions.get(sessionId);
	if (!session) return;

	const { user, roomId } = session;
	const room = chatRooms.get(roomId);

	if (room) {
		room.typingUsers.set(user.id, {
			userId: user.id,
			username: user.username,
			timestamp: new Date()
		});

		session.isTyping = true;
		broadcastTypingUpdate(roomId);

		// Auto-clear typing after 5 seconds
		setTimeout(() => {
			if (session.isTyping) {
				handleTypingStop(sessionId);
			}
		}, 5000);
	}
}

function handleTypingStop(sessionId) {
	const session = userSessions.get(sessionId);
	if (!session) return;

	const { user, roomId } = session;
	const room = chatRooms.get(roomId);

	if (room && room.typingUsers.has(user.id)) {
		room.typingUsers.delete(user.id);
		session.isTyping = false;
		broadcastTypingUpdate(roomId);
	}
}

// Broadcast typing update to room
function broadcastTypingUpdate(roomId) {
	const room = chatRooms.get(roomId);
	if (!room) return;

	broadcastToRoom(roomId, {
		type: MESSAGE_TYPES.TYPING_START,
		payload: {
			typingUsers: Array.from(room.typingUsers.values())
		}
	});
}

// Broadcast message to room
function broadcastToRoom(roomId, message, excludeSessionId = null) {
	const room = chatRooms.get(roomId);
	if (!room) return;

	userSessions.forEach((session, sessionId) => {
		if (session.roomId === roomId && sessionId !== excludeSessionId) {
			sendMessage(session.ws, message);
		}
	});
}

// Send message to specific WebSocket
function sendMessage(ws, message) {
	if (ws.readyState === ws.OPEN) {
		ws.send(
			JSON.stringify({
				...message,
				id: nanoid(),
				timestamp: new Date()
			})
		);
	}
}

// Send error message
function sendError(ws, errorMessage) {
	sendMessage(ws, {
		type: MESSAGE_TYPES.ERROR,
		payload: { error: errorMessage }
	});
}

// Start server
server.listen(PORT, () => {
	console.log(`WebSocket Chat Server running on port ${PORT}`);
	console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
	console.log('Shutting down WebSocket server...');
	wss.close(() => {
		server.close(() => {
			console.log('Server closed');
			process.exit(0);
		});
	});
});

export { wss, server };

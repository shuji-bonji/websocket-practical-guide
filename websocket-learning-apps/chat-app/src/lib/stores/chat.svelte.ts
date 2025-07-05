import { nanoid } from 'nanoid';
import type {
	ChatMessage,
	User,
	ConnectionState,
	WebSocketMessage,
	TypingIndicator,
	ChatConfig
	// AuthState - type definition for future use
} from '$types/chat';

export class ChatStore {
	private socket = $state<WebSocket | null>(null);
	private _connectionState = $state<ConnectionState>({
		status: 'disconnected',
		reconnectAttempts: 0
	});
	private _messages = $state<ChatMessage[]>([]);
	private _typingUsers = $state<TypingIndicator[]>([]);
	private _error = $state<string | null>(null);
	private _currentUser = $state<User | null>(null);
	private _roomMembers = $state<User[]>([]);
	private _memberCount = $state<number>(0);

	private reconnectTimer: NodeJS.Timeout | null = null;
	private pingTimer: NodeJS.Timeout | null = null;
	private typingTimer: NodeJS.Timeout | null = null;
	private isTyping = false;

	private config: ChatConfig = {
		wsUrl: 'ws://localhost:8080',
		reconnectInterval: 5000,
		maxReconnectAttempts: 10,
		typingTimeout: 3000,
		messageHistoryLimit: 1000,
		enableTypingIndicators: true,
		enableMessagePersistence: true
	};

	// Reactive getters
	get connectionState() {
		return this._connectionState;
	}

	get messages() {
		return this._messages;
	}

	get typingUsers() {
		return this._typingUsers;
	}

	get error() {
		return this._error;
	}

	get currentUser() {
		return this._currentUser;
	}

	get roomMembers() {
		return this._roomMembers;
	}

	get memberCount() {
		return this._memberCount;
	}

	get isConnected() {
		return this._connectionState.status === 'connected';
	}

	get canSend() {
		return this.isConnected && this.socket?.readyState === WebSocket.OPEN;
	}

	// Configure the chat store
	configure(config: Partial<ChatConfig>) {
		this.config = { ...this.config, ...config };
	}

	// Connect to WebSocket server
	connect(token: string, wsUrl?: string) {
		if (typeof window === 'undefined') {
			console.warn('WebSocket connection attempted on server side');
			return;
		}

		const url = wsUrl || this.config.wsUrl;
		const wsUrlWithToken = `${url}?token=${encodeURIComponent(token)}`;

		this.disconnect();
		this._connectionState = {
			...this._connectionState,
			status: 'connecting',
			error: undefined
		};

		try {
			this.socket = new WebSocket(wsUrlWithToken);
			this.setupEventHandlers();
		} catch (error) {
			this.handleError(`Connection failed: ${error}`);
		}
	}

	// Disconnect from WebSocket
	disconnect() {
		if (this.socket) {
			this.socket.close();
			this.socket = null;
		}

		this.clearTimers();
		this._connectionState = {
			...this._connectionState,
			status: 'disconnected'
		};
	}

	// Send chat message
	sendMessage(content: string, replyTo?: string) {
		if (!this.canSend) {
			this.handleError('Cannot send message: not connected');
			return;
		}

		const message: WebSocketMessage = {
			id: nanoid(),
			type: 'chat_message',
			payload: { content, replyTo },
			timestamp: new Date()
		};

		this.sendWebSocketMessage(message);

		// Stop typing indicator when sending message
		if (this.isTyping) {
			this.stopTyping();
		}
	}

	// Start typing indicator
	startTyping() {
		if (!this.config.enableTypingIndicators || !this.canSend || this.isTyping) {
			return;
		}

		this.isTyping = true;
		this.sendWebSocketMessage({
			id: nanoid(),
			type: 'typing_start',
			payload: {},
			timestamp: new Date()
		});

		// Auto-stop typing after timeout
		this.typingTimer = setTimeout(() => {
			this.stopTyping();
		}, this.config.typingTimeout);
	}

	// Stop typing indicator
	stopTyping() {
		if (!this.isTyping) return;

		this.isTyping = false;

		if (this.typingTimer) {
			clearTimeout(this.typingTimer);
			this.typingTimer = null;
		}

		if (this.canSend) {
			this.sendWebSocketMessage({
				id: nanoid(),
				type: 'typing_stop',
				payload: {},
				timestamp: new Date()
			});
		}
	}

	// Setup WebSocket event handlers
	private setupEventHandlers() {
		if (!this.socket) return;

		this.socket.onopen = () => {
			this._connectionState = {
				status: 'connected',
				reconnectAttempts: 0,
				lastConnected: new Date()
			};
			this._error = null;
			this.startPingPong();
		};

		this.socket.onmessage = (event) => {
			try {
				const message: WebSocketMessage = JSON.parse(event.data);
				this.handleIncomingMessage(message);
			} catch (error) {
				console.error('Error parsing WebSocket message:', error);
			}
		};

		this.socket.onclose = (event) => {
			this._connectionState = {
				...this._connectionState,
				status: 'disconnected'
			};

			this.clearTimers();

			// Auto-reconnect if not intentionally closed
			if (
				event.code !== 1000 &&
				this._connectionState.reconnectAttempts < this.config.maxReconnectAttempts
			) {
				this.scheduleReconnect();
			}
		};

		this.socket.onerror = (error) => {
			console.error('WebSocket error:', error);
			this.handleError('WebSocket connection error');
		};
	}

	// Handle incoming WebSocket messages
	private handleIncomingMessage(message: WebSocketMessage) {
		switch (message.type) {
			case 'auth_success':
				this._currentUser = message.payload.user;
				break;

			case 'message_history':
				this._messages = message.payload.messages;
				break;

			case 'chat_message':
				this.addMessage(message.payload);
				break;

			case 'typing_start':
				this._typingUsers = message.payload.typingUsers || [];
				break;

			case 'user_joined':
				this.handleUserJoined(message.payload);
				break;

			case 'user_left':
				this.handleUserLeft(message.payload);
				break;

			case 'room_update':
				this._memberCount = message.payload.memberCount;
				break;

			case 'ping':
				this.sendPong();
				break;

			case 'pong':
				this.updateLatency(message.timestamp);
				break;

			case 'error':
				this.handleError(message.payload.error);
				break;

			default:
				console.warn('Unknown message type:', message.type);
		}
	}

	// Add message to chat
	private addMessage(message: ChatMessage) {
		this._messages = [...this._messages, message];

		// Limit message history
		if (this._messages.length > this.config.messageHistoryLimit) {
			this._messages = this._messages.slice(-this.config.messageHistoryLimit);
		}
	}

	// Handle user joined event
	private handleUserJoined(payload: { username: string; timestamp: string }) {
		// Add system message
		this.addMessage({
			id: nanoid(),
			type: 'system',
			content: `${payload.username} joined the chat`,
			userId: 'system',
			username: 'System',
			timestamp: new Date(payload.timestamp)
		});
	}

	// Handle user left event
	private handleUserLeft(payload: { username: string; timestamp: string }) {
		// Add system message
		this.addMessage({
			id: nanoid(),
			type: 'system',
			content: `${payload.username} left the chat`,
			userId: 'system',
			username: 'System',
			timestamp: new Date(payload.timestamp)
		});

		// Remove from typing users
		this._typingUsers = this._typingUsers.filter((user) => user.userId !== payload.userId);
	}

	// Send WebSocket message
	private sendWebSocketMessage(message: WebSocketMessage) {
		if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
			this.handleError('Cannot send message: connection not open');
			return;
		}

		this.socket.send(JSON.stringify(message));
	}

	// Send pong response
	private sendPong() {
		this.sendWebSocketMessage({
			id: nanoid(),
			type: 'pong',
			payload: {},
			timestamp: new Date()
		});
	}

	// Update connection latency
	private updateLatency(serverTimestamp: Date) {
		const now = new Date();
		const latency = now.getTime() - new Date(serverTimestamp).getTime();
		this._connectionState = {
			...this._connectionState,
			latency: Math.max(0, latency)
		};
	}

	// Start ping/pong heartbeat
	private startPingPong() {
		this.pingTimer = setInterval(() => {
			if (this.canSend) {
				this.sendWebSocketMessage({
					id: nanoid(),
					type: 'ping',
					payload: {},
					timestamp: new Date()
				});
			}
		}, 30000);
	}

	// Schedule reconnection
	private scheduleReconnect() {
		if (this.reconnectTimer) return;

		this._connectionState = {
			...this._connectionState,
			status: 'reconnecting',
			reconnectAttempts: this._connectionState.reconnectAttempts + 1
		};

		this.reconnectTimer = setTimeout(() => {
			this.reconnectTimer = null;
			// Note: We'd need the token to reconnect - this should be handled at a higher level
			console.log('Reconnection attempt needed - token required');
		}, this.config.reconnectInterval);
	}

	// Handle errors
	private handleError(error: string) {
		this._error = error;
		this._connectionState = {
			...this._connectionState,
			status: 'error',
			error
		};
		console.error('Chat error:', error);
	}

	// Clear all timers
	private clearTimers() {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}

		if (this.pingTimer) {
			clearInterval(this.pingTimer);
			this.pingTimer = null;
		}

		if (this.typingTimer) {
			clearTimeout(this.typingTimer);
			this.typingTimer = null;
		}
	}

	// Cleanup method
	destroy() {
		this.disconnect();
		this.clearTimers();
	}
}

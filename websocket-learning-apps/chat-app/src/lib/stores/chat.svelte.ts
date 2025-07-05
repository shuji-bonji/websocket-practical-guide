import { nanoid } from 'nanoid';
import { isOnline, enableBackgroundSync, showNotification } from '$lib/pwa/service-worker';
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
	private _offlineMessages = $state<ChatMessage[]>([]);

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

	get offlineMessages() {
		return this._offlineMessages;
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
	sendMessage(content: string, replyToId?: string) {
		// Create message object
		const messageId = nanoid();
		const message: ChatMessage = {
			id: messageId,
			type: 'message',
			content,
			userId: this._currentUser?.id || 'unknown',
			username: this._currentUser?.username || 'Unknown',
			roomId: 'default',
			replyToId,
			timestamp: new Date()
		};

		// If online and connected, send immediately
		if (this.canSend && isOnline()) {
			const wsMessage: WebSocketMessage = {
				type: 'chat_message',
				payload: { content, replyToId },
				timestamp: new Date()
			};

			this.sendWebSocketMessage(wsMessage);

			// Stop typing indicator when sending message
			if (this.isTyping) {
				this.stopTyping();
			}
		} else {
			// Store message for later sending when back online
			this.storeOfflineMessage(message);

			// Add to local messages immediately for better UX
			this.addMessage({
				...message,
				type: 'message' // Mark as pending/offline
			});

			console.log('[Chat] Message queued for sending when online');
		}
	}

	// Start typing indicator
	startTyping() {
		if (!this.config.enableTypingIndicators || !this.canSend || this.isTyping) {
			return;
		}

		this.isTyping = true;
		this.sendWebSocketMessage({
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
				this._currentUser = (message.payload as { user: User })?.user;
				break;

			case 'auth_error':
				this.handleError(
					(message.payload as { message: string })?.message || 'Authentication failed'
				);
				break;

			case 'message_history':
				this._messages = (message.payload as { messages: ChatMessage[] })?.messages || [];
				break;

			case 'chat_message':
				this.addMessage(message.payload as ChatMessage);

				// Show notification if app is in background
				if (typeof document !== 'undefined' && document.hidden) {
					const msg = message.payload as ChatMessage;
					showNotification(`New message from ${msg.username}`, {
						body: msg.content,
						tag: `message-${msg.id}`,
						data: { messageId: msg.id, roomId: msg.roomId }
					});
				}
				break;

			case 'typing_start':
				this.handleTypingStart(message.payload as { userId: string; username: string });
				break;

			case 'typing_stop':
				this.handleTypingStop(message.payload as { userId: string; username: string });
				break;

			case 'user_joined':
				this.handleUserJoined(message.payload as { user: User; roomId: string });
				break;

			case 'user_left':
				this.handleUserLeft(message.payload as { user: User; roomId: string });
				break;

			case 'user_list':
				this._roomMembers = (message.payload as { users: User[] })?.users || [];
				this._memberCount = this._roomMembers.length;
				break;

			case 'ping':
				this.sendPong();
				break;

			case 'pong':
				if (message.timestamp) {
					this.updateLatency(message.timestamp);
				}
				break;

			case 'error':
				this.handleError((message.payload as { error: string })?.error || 'Unknown error');
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

	// Handle typing start event
	private handleTypingStart(payload: { userId: string; username: string }) {
		const existingUser = this._typingUsers.find((user) => user.userId === payload.userId);
		if (!existingUser) {
			this._typingUsers = [
				...this._typingUsers,
				{
					userId: payload.userId,
					username: payload.username,
					timestamp: new Date()
				}
			];
		}
	}

	// Handle typing stop event
	private handleTypingStop(payload: { userId: string; username: string }) {
		this._typingUsers = this._typingUsers.filter((user) => user.userId !== payload.userId);
	}

	// Handle user joined event
	private handleUserJoined(payload: { user: User; roomId: string }) {
		// Add system message
		this.addMessage({
			id: nanoid(),
			type: 'join',
			content: `${payload.user.username} joined the chat`,
			userId: 'system',
			username: 'System',
			roomId: payload.roomId,
			timestamp: new Date()
		});
	}

	// Handle user left event
	private handleUserLeft(payload: { user: User; roomId: string }) {
		// Add system message
		this.addMessage({
			id: nanoid(),
			type: 'leave',
			content: `${payload.user.username} left the chat`,
			userId: 'system',
			username: 'System',
			roomId: payload.roomId,
			timestamp: new Date()
		});

		// Remove from typing users
		this._typingUsers = this._typingUsers.filter((user) => user.userId !== payload.user.id);
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
			type: 'pong',
			payload: { timestamp: new Date() },
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
					type: 'ping',
					payload: { timestamp: new Date() },
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

	// Store message for offline sending
	private storeOfflineMessage(message: ChatMessage) {
		this._offlineMessages = [...this._offlineMessages, message];

		// Enable background sync for message sending
		enableBackgroundSync('chat-messages-sync');

		// Store in localStorage as backup
		if (typeof localStorage !== 'undefined') {
			try {
				localStorage.setItem('chat-offline-messages', JSON.stringify(this._offlineMessages));
			} catch (error) {
				console.error('[Chat] Failed to store offline messages:', error);
			}
		}
	}

	// Load offline messages from storage
	private loadOfflineMessages() {
		if (typeof localStorage === 'undefined') return;

		try {
			const stored = localStorage.getItem('chat-offline-messages');
			if (stored) {
				const messages = JSON.parse(stored);
				this._offlineMessages = messages;
			}
		} catch (error) {
			console.error('[Chat] Failed to load offline messages:', error);
		}
	}

	// Send pending offline messages
	async sendOfflineMessages() {
		if (this._offlineMessages.length === 0 || !this.canSend) {
			return;
		}

		console.log(`[Chat] Sending ${this._offlineMessages.length} offline messages`);

		// Copy messages to send
		const messagesToSend = [...this._offlineMessages];

		// Clear offline messages
		this._offlineMessages = [];

		// Clear from localStorage
		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem('chat-offline-messages');
		}

		// Send each message
		for (const message of messagesToSend) {
			try {
				const wsMessage: WebSocketMessage = {
					type: 'chat_message',
					payload: {
						content: message.content,
						replyToId: message.replyToId
					},
					timestamp: message.timestamp
				};

				this.sendWebSocketMessage(wsMessage);

				// Small delay between messages
				await new Promise((resolve) => setTimeout(resolve, 100));
			} catch (error) {
				console.error('[Chat] Failed to send offline message:', error);
				// Re-add failed message to offline queue
				this.storeOfflineMessage(message);
			}
		}
	}

	// Get offline message count
	getOfflineMessageCount(): number {
		return this._offlineMessages.length;
	}

	// Clear all offline messages
	clearOfflineMessages() {
		this._offlineMessages = [];

		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem('chat-offline-messages');
		}
	}

	// Initialize offline features
	initOfflineFeatures() {
		// Load any stored offline messages
		this.loadOfflineMessages();

		// Listen for online events to send offline messages
		if (typeof window !== 'undefined') {
			window.addEventListener('online', () => {
				// Wait a bit for connection to stabilize
				setTimeout(() => {
					if (this.isConnected) {
						this.sendOfflineMessages();
					}
				}, 2000);
			});
		}
	}

	// Cleanup method
	destroy() {
		this.disconnect();
		this.clearTimers();
	}
}

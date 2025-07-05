export interface User {
	id: string;
	username: string;
	email: string;
	avatar?: string;
	lastSeen: Date;
	isOnline: boolean;
}

export interface ChatMessage {
	id: string;
	type: 'message' | 'system' | 'typing' | 'user_joined' | 'user_left';
	content: string;
	userId: string;
	username: string;
	timestamp: Date;
	edited?: boolean;
	editedAt?: Date;
	replyTo?: string; // Reference to another message ID
}

export interface TypingIndicator {
	userId: string;
	username: string;
	timestamp: Date;
}

export interface ChatRoom {
	id: string;
	name: string;
	description?: string;
	members: User[];
	messages: ChatMessage[];
	typingUsers: TypingIndicator[];
	createdAt: Date;
	lastActivity: Date;
}

export interface WebSocketMessage<T = unknown> {
	id: string;
	type:
		| 'chat_message'
		| 'typing_start'
		| 'typing_stop'
		| 'user_joined'
		| 'user_left'
		| 'room_update'
		| 'error'
		| 'ping'
		| 'pong';
	payload: T;
	timestamp: Date;
	userId?: string;
	roomId?: string;
}

export interface ConnectionState {
	status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
	error?: string;
	reconnectAttempts: number;
	lastConnected?: Date;
	latency?: number;
}

export interface ChatConfig {
	wsUrl: string;
	reconnectInterval: number;
	maxReconnectAttempts: number;
	typingTimeout: number;
	messageHistoryLimit: number;
	enableTypingIndicators: boolean;
	enableMessagePersistence: boolean;
}

export interface AuthState {
	isAuthenticated: boolean;
	user?: User;
	token?: string;
	expiresAt?: Date;
}

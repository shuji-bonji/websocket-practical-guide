/**
 * Shared WebSocket types for the learning project
 * Phase-aware type definitions for educational progression
 */

// ============================================================================
// Base WebSocket Message Protocol
// ============================================================================

export interface WSMessage<TPayload = unknown> {
	id: string;
	type: string;
	payload: TPayload;
	timestamp: Date;
	metadata?: WSMessageMetadata;
}

export interface WSMessageMetadata {
	version: string;
	source?: string;
	userId?: string;
	sessionId?: string;
	retryCount?: number;
	priority?: 'low' | 'normal' | 'high' | 'critical';
}

// ============================================================================
// Connection Management
// ============================================================================

export interface ConnectionState {
	status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
	reconnectAttempts: number;
	lastConnected?: Date;
	latency?: number;
	error?: string;
}

export interface ConnectionConfig {
	url: string;
	protocols?: string[];
	reconnect?: boolean;
	maxReconnectAttempts?: number;
	reconnectInterval?: number;
	heartbeatInterval?: number;
	timeout?: number;
}

// ============================================================================
// Chat Application Types (Phase 4A)
// ============================================================================

export interface ChatMessage {
	id: string;
	type: 'message' | 'join' | 'leave' | 'system';
	content: string;
	userId: string;
	username: string;
	roomId: string;
	timestamp: Date;
	replyToId?: string;
	editedAt?: Date;
	reactions?: ChatReaction[];
}

export interface ChatReaction {
	emoji: string;
	userId: string;
	username: string;
	timestamp: Date;
}

export interface ChatUser {
	id: string;
	username: string;
	email?: string;
	avatarUrl?: string;
	status: 'online' | 'offline' | 'away' | 'busy';
	lastSeen: Date;
	roles?: string[];
}

export interface ChatRoom {
	id: string;
	name: string;
	description?: string;
	type: 'public' | 'private' | 'direct';
	members: Set<string>;
	admins: Set<string>;
	createdAt: Date;
	lastActivity: Date;
	settings: ChatRoomSettings;
}

export interface ChatRoomSettings {
	allowFileUploads: boolean;
	maxMessageLength: number;
	retentionDays: number;
	readOnly: boolean;
	requireApproval: boolean;
}

export interface TypingIndicator {
	userId: string;
	username: string;
	timestamp: Date;
	roomId?: string;
}

// Chat WebSocket Message Types
export type ChatWSMessage =
	| (WSMessage<{ user: ChatUser; roomId: string }> & { type: 'auth_success' })
	| (WSMessage<{ messages: ChatMessage[] }> & { type: 'message_history' })
	| (WSMessage<ChatMessage> & { type: 'chat_message' })
	| (WSMessage<TypingIndicator> & { type: 'typing_start' | 'typing_stop' })
	| (WSMessage<{ userId: string; username: string; roomId: string }> & {
			type: 'user_joined' | 'user_left';
	  })
	| (WSMessage<{ users: ChatUser[]; roomId: string }> & { type: 'user_list' })
	| (WSMessage<{ error: string }> & { type: 'error' })
	| (WSMessage<{ timestamp: Date }> & { type: 'ping' | 'pong' });

// ============================================================================
// RPS Game Types (Phase 4B)
// ============================================================================

export type RPSMove = 'rock' | 'paper' | 'scissors';
export type RPSResult = 'win' | 'lose' | 'draw';

export interface RPSGameState {
	gameId: string;
	status: 'waiting' | 'playing' | 'finished';
	players: RPSPlayer[];
	currentRound: number;
	maxRounds: number;
	scores: Record<string, number>;
	winner?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface RPSPlayer {
	id: string;
	username: string;
	isReady: boolean;
	move?: RPSMove;
	moveSubmittedAt?: Date;
}

export interface RPSRound {
	roundNumber: number;
	moves: Record<string, RPSMove>;
	results: Record<string, RPSResult>;
	winner?: string;
	completedAt: Date;
}

// RPS WebSocket Message Types
export type RPSWSMessage =
	| (WSMessage<{ gameId: string; player: RPSPlayer }> & { type: 'game_joined' })
	| (WSMessage<RPSGameState> & { type: 'game_state' })
	| (WSMessage<{ move: RPSMove }> & { type: 'player_move' })
	| (WSMessage<{ playerId: string; isReady: boolean }> & { type: 'player_ready' })
	| (WSMessage<RPSRound> & { type: 'round_complete' })
	| (WSMessage<{ winner: string; finalScores: Record<string, number> }> & { type: 'game_complete' })
	| (WSMessage<{ error: string }> & { type: 'error' });

// ============================================================================
// Location Share Types (Phase 4C)
// ============================================================================

export interface LocationData {
	latitude: number;
	longitude: number;
	accuracy?: number;
	altitude?: number;
	altitudeAccuracy?: number;
	heading?: number;
	speed?: number;
	timestamp: Date;
}

export interface LocationUser {
	id: string;
	username: string;
	location: LocationData;
	lastUpdate: Date;
	isSharing: boolean;
	shareRadius?: number; // meters
}

export interface LocationRoom {
	id: string;
	name: string;
	description?: string;
	participants: LocationUser[];
	bounds?: LocationBounds;
	createdAt: Date;
	settings: LocationRoomSettings;
}

export interface LocationBounds {
	north: number;
	south: number;
	east: number;
	west: number;
}

export interface LocationRoomSettings {
	maxParticipants: number;
	shareAccuracy: boolean;
	requireInvite: boolean;
	autoExpire: boolean;
	expiresAt?: Date;
}

// Location WebSocket Message Types
export type LocationWSMessage =
	| (WSMessage<{ roomId: string; user: LocationUser }> & { type: 'location_update' })
	| (WSMessage<{ users: LocationUser[] }> & { type: 'user_list' })
	| (WSMessage<{ userId: string; username: string }> & { type: 'user_joined' | 'user_left' })
	| (WSMessage<{ userId: string; isSharing: boolean }> & { type: 'sharing_status' })
	| (WSMessage<{ error: string }> & { type: 'error' });

// ============================================================================
// Phase-Specific Configurations
// ============================================================================

export interface Phase1Config extends ConnectionConfig {
	demoType: 'echo' | 'broadcast' | 'notification';
	fallbackUrls?: string[];
	publicServiceOnly: true;
}

export interface Phase2Config extends ConnectionConfig {
	subprotocols: string[];
	serverType: 'basic' | 'graphql-ws' | 'mqtt' | 'custom';
	localDevelopment: true;
}

export interface Phase3Config extends ConnectionConfig {
	testMode: boolean;
	mockServer: boolean;
	chaosEngineering?: {
		enabled: boolean;
		failureRate: number;
		latencySimulation: boolean;
	};
}

export interface Phase4Config extends ConnectionConfig {
	production: true;
	scaling?: {
		clustered: boolean;
		redisUrl?: string;
		loadBalancer?: string;
	};
	monitoring?: {
		healthCheck: boolean;
		metrics: boolean;
		logging: boolean;
	};
	security?: {
		rateLimit: boolean;
		corsOrigins: string[];
		jwtRequired: boolean;
	};
}

// ============================================================================
// Error Types
// ============================================================================

export interface WSError {
	code: string;
	message: string;
	details?: unknown;
	timestamp: Date;
	retryable: boolean;
}

export interface WSErrorDetails {
	originalError?: Error;
	context?: Record<string, unknown>;
	stack?: string;
}

// Common error codes
export const WS_ERROR_CODES = {
	CONNECTION_FAILED: 'CONNECTION_FAILED',
	AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
	MESSAGE_PARSE_ERROR: 'MESSAGE_PARSE_ERROR',
	RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
	ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
	USER_NOT_FOUND: 'USER_NOT_FOUND',
	PERMISSION_DENIED: 'PERMISSION_DENIED',
	SERVER_ERROR: 'SERVER_ERROR',
	NETWORK_ERROR: 'NETWORK_ERROR',
	TIMEOUT: 'TIMEOUT'
} as const;

export type WSErrorCode = (typeof WS_ERROR_CODES)[keyof typeof WS_ERROR_CODES];

// ============================================================================
// WebSocket Manager Interface
// ============================================================================

export interface IWebSocketManager {
	connect(config: ConnectionConfig): Promise<void>;
	disconnect(): void;
	send<T>(message: WSMessage<T>): void;
	subscribe<T>(type: string, handler: (message: WSMessage<T>) => void): () => void;
	getConnectionState(): ConnectionState;
	isConnected(): boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

export type WSMessageType<T extends WSMessage> = T['type'];
export type WSMessagePayload<T extends WSMessage> = T['payload'];

// Helper type for extracting payload type from message type
export type ExtractPayload<T, K extends string> = T extends WSMessage<infer P> & { type: K }
	? P
	: never;

// Union type for all WebSocket messages across all applications
export type AllWSMessages = ChatWSMessage | RPSWSMessage | LocationWSMessage;

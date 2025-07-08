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
  type: 'message' | 'system' | 'join' | 'leave';
  content: string;
  userId: string;
  username: string;
  roomId: string;
  replyToId?: string;
  timestamp: Date;
  editedAt?: Date;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  username: string;
  timestamp: Date;
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
  id?: string;
  type:
    | 'auth_success'
    | 'auth_error'
    | 'chat_message'
    | 'message_history'
    | 'typing_start'
    | 'typing_stop'
    | 'user_joined'
    | 'user_left'
    | 'user_list'
    | 'room_create'
    | 'room_join'
    | 'room_list'
    | 'ping'
    | 'pong'
    | 'error';
  payload: T;
  timestamp?: Date;
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

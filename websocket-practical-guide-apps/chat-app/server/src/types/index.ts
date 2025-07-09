import WebSocket from 'ws';

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthToken {
  userId: string;
  username: string;
  email: string;
  iat: number;
  exp: number;
}

// Chat Room types
export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  ownerId: string;
  members: Set<string>;
  typingUsers: Map<string, TypingUser>;
  createdAt: Date;
  lastActivity: Date;
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

// Message types
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

export interface TypingUser {
  userId: string;
  username: string;
  timestamp: Date;
}

// WebSocket types
export interface WebSocketMessage {
  id?: string;
  type: MessageType;
  payload: unknown;
  timestamp?: Date;
}

export interface UserSession {
  ws: WebSocket;
  user: User;
  roomId: string;
  lastSeen: Date;
  isTyping: boolean;
  ipAddress: string;
  userAgent: string;
}

// Message type enumeration
export enum MessageType {
  // Authentication
  AUTH_SUCCESS = 'auth_success',
  AUTH_ERROR = 'auth_error',

  // Chat messages
  CHAT_MESSAGE = 'chat_message',
  MESSAGE_HISTORY = 'message_history',
  MESSAGE_EDIT = 'message_edit',
  MESSAGE_DELETE = 'message_delete',
  MESSAGE_REACTION = 'message_reaction',

  // Typing indicators
  TYPING_START = 'typing_start',
  TYPING_STOP = 'typing_stop',

  // User presence
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  USER_LIST = 'user_list',

  // Room management
  ROOM_CREATE = 'room_create',
  ROOM_JOIN = 'room_join',
  ROOM_LEAVE = 'room_leave',
  ROOM_UPDATE = 'room_update',
  ROOM_LIST = 'room_list',

  // Connection health
  PING = 'ping',
  PONG = 'pong',

  // Errors
  ERROR = 'error'
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Database types
export interface DatabaseUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  avatar?: string;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMessage {
  id: string;
  type: string;
  content: string;
  user_id: string;
  room_id: string;
  reply_to_id?: string;
  created_at: string;
  updated_at?: string;
  edited_at?: string;
}

export interface DatabaseRoom {
  id: string;
  name: string;
  description?: string;
  is_private: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

// Error types
export class ChatError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message);
    this.name = 'ChatError';
  }
}

export class AuthError extends ChatError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class ValidationError extends ChatError {
  constructor(message: string = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends ChatError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

// Configuration types
export interface ServerConfig {
  port: number;
  host: string;
  jwtSecret: string;
  dbPath: string;
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  messageHistory: {
    maxMessages: number;
    retentionDays: number;
  };
}

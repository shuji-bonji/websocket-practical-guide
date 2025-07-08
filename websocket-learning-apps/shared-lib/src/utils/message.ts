/**
 * Shared utilities for WebSocket message handling
 * Common functions used across all learning applications
 */

import { nanoid } from 'nanoid';
import type { WSMessage, WSMessageMetadata, WSError, WSErrorCode } from '../types/websocket.js';

// ============================================================================
// Message Creation Utilities
// ============================================================================

export function createWSMessage<TPayload = unknown>(
  type: string,
  payload: TPayload,
  metadata?: Partial<WSMessageMetadata>
): WSMessage<TPayload> {
  const message: WSMessage<TPayload> = {
    id: nanoid(),
    type,
    payload,
    timestamp: new Date()
  };

  if (metadata) {
    message.metadata = {
      version: '1.0',
      ...metadata
    };
  }

  return message;
}

export function createErrorMessage(
  code: WSErrorCode,
  message: string,
  details?: unknown
): WSMessage<WSError> {
  return createWSMessage('error', {
    code,
    message,
    details,
    timestamp: new Date(),
    retryable: isRetryableError(code)
  });
}

export function createPingMessage(): WSMessage<{ timestamp: Date }> {
  return createWSMessage('ping', { timestamp: new Date() });
}

export function createPongMessage(
  pingTimestamp?: Date
): WSMessage<{ timestamp: Date; latency?: number }> {
  const now = new Date();
  const payload: { timestamp: Date; latency?: number } = {
    timestamp: now
  };

  if (pingTimestamp) {
    payload.latency = now.getTime() - pingTimestamp.getTime();
  }

  return createWSMessage('pong', payload);
}

// ============================================================================
// Message Validation
// ============================================================================

export function isValidWSMessage(data: unknown): data is WSMessage {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const msg = data as Record<string, unknown>;

  return (
    typeof msg.id === 'string' &&
    typeof msg.type === 'string' &&
    msg.payload !== undefined &&
    (msg.timestamp instanceof Date || typeof msg.timestamp === 'string')
  );
}

export function validateMessageType<T>(
  message: WSMessage,
  expectedType: string
): message is WSMessage<T> {
  return message.type === expectedType;
}

export function sanitizeMessage(message: WSMessage): WSMessage {
  // Remove potentially dangerous content
  const sanitized = { ...message };

  // Ensure timestamp is a Date object
  if (typeof sanitized.timestamp === 'string') {
    sanitized.timestamp = new Date(sanitized.timestamp);
  }

  // Validate message size (max 64KB)
  const messageSize = JSON.stringify(sanitized).length;
  if (messageSize > 65536) {
    throw new Error(`Message too large: ${messageSize} bytes (max 64KB)`);
  }

  return sanitized;
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

export function isRetryableError(code: WSErrorCode): boolean {
  const retryableCodes: WSErrorCode[] = [
    'CONNECTION_FAILED',
    'NETWORK_ERROR',
    'TIMEOUT',
    'SERVER_ERROR'
  ];

  return retryableCodes.includes(code);
}

export function getErrorSeverity(code: WSErrorCode): 'low' | 'medium' | 'high' | 'critical' {
  switch (code) {
    case 'CONNECTION_FAILED':
    case 'NETWORK_ERROR':
    case 'TIMEOUT':
      return 'medium';

    case 'AUTHENTICATION_FAILED':
    case 'PERMISSION_DENIED':
      return 'high';

    case 'SERVER_ERROR':
      return 'critical';

    case 'MESSAGE_PARSE_ERROR':
    case 'RATE_LIMIT_EXCEEDED':
    case 'ROOM_NOT_FOUND':
    case 'USER_NOT_FOUND':
    default:
      return 'low';
  }
}

// ============================================================================
// Message Serialization
// ============================================================================

export function serializeMessage(message: WSMessage): string {
  return JSON.stringify(message, (_key, value) => {
    // Handle Date objects
    if (value instanceof Date) {
      return value.toISOString();
    }
    // Handle Set objects
    if (value instanceof Set) {
      return Array.from(value);
    }
    // Handle Map objects
    if (value instanceof Map) {
      return Object.fromEntries(value);
    }
    return value;
  });
}

export function deserializeMessage(data: string): WSMessage {
  const parsed = JSON.parse(data);

  // Convert ISO date strings back to Date objects
  if (typeof parsed.timestamp === 'string') {
    parsed.timestamp = new Date(parsed.timestamp);
  }

  if (parsed.metadata?.timestamp && typeof parsed.metadata.timestamp === 'string') {
    parsed.metadata.timestamp = new Date(parsed.metadata.timestamp);
  }

  if (!isValidWSMessage(parsed)) {
    throw new Error('Invalid message format');
  }

  return sanitizeMessage(parsed);
}

// ============================================================================
// Connection State Utilities
// ============================================================================

export function calculateLatency(pingTimestamp: Date, pongTimestamp: Date): number {
  return Math.max(0, pongTimestamp.getTime() - pingTimestamp.getTime());
}

export function isConnectionHealthy(
  lastPingTime: Date,
  heartbeatInterval: number = 30000
): boolean {
  const now = new Date();
  const timeSinceLastPing = now.getTime() - lastPingTime.getTime();
  return timeSinceLastPing <= heartbeatInterval * 2; // Allow 2 missed heartbeats
}

export function shouldReconnect(
  reconnectAttempts: number,
  maxReconnectAttempts: number,
  lastError?: WSError
): boolean {
  if (reconnectAttempts >= maxReconnectAttempts) {
    return false;
  }

  // Don't reconnect for authentication errors
  if (lastError?.code === 'AUTHENTICATION_FAILED' || lastError?.code === 'PERMISSION_DENIED') {
    return false;
  }

  return true;
}

export function getReconnectDelay(attempt: number, baseDelay: number = 1000): number {
  // Exponential backoff with jitter
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), 30000);
  const jitter = Math.random() * 1000; // Add up to 1 second of jitter
  return exponentialDelay + jitter;
}

// ============================================================================
// Room and User Utilities
// ============================================================================

export function generateRoomId(): string {
  return `room_${nanoid(12)}`;
}

export function generateSessionId(): string {
  return `session_${nanoid(16)}`;
}

export function isValidRoomId(roomId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(roomId) && roomId.length >= 3 && roomId.length <= 64;
}

export function isValidUserId(userId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(userId) && userId.length >= 2 && userId.length <= 32;
}

export function isValidUsername(username: string): boolean {
  return (
    /^[a-zA-Z0-9_-\s]+$/.test(username) &&
    username.trim().length >= 2 &&
    username.trim().length <= 32
  );
}

// ============================================================================
// Rate Limiting Utilities
// ============================================================================

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const validRequests = requests.filter((time) => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    const validRequests = requests.filter((time) => now - time < this.windowMs);

    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(identifier: string): Date {
    const requests = this.requests.get(identifier) || [];
    if (requests.length === 0) {
      return new Date();
    }

    const oldestRequest = Math.min(...requests);
    return new Date(oldestRequest + this.windowMs);
  }

  cleanup(): void {
    const now = Date.now();

    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter((time) => now - time < this.windowMs);

      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

// ============================================================================
// Debug and Logging Utilities
// ============================================================================

export function formatMessageForLogging(message: WSMessage): string {
  const { id, type, timestamp } = message;
  const payloadSize = JSON.stringify(message.payload).length;

  return `[${timestamp.toISOString()}] ${type} (${id.substring(0, 8)}) - ${payloadSize} bytes`;
}

export function createDebugMessage(
  level: 'debug' | 'info' | 'warn' | 'error',
  content: string
): WSMessage<{ level: string; content: string }> {
  return createWSMessage('debug', { level, content });
}

export function measureMessageProcessingTime<T>(label: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();

  console.debug(`${label} took ${(end - start).toFixed(2)}ms`);
  return result;
}

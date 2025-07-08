/**
 * @websocket-learning/shared-lib
 *
 * Shared types and utilities for WebSocket learning applications
 * Educational progression: Phase 1 → Phase 2 → Phase 3 → Phase 4
 */

// Export all types
export type * from './types/websocket.js';

// Export utilities
export * from './utils/message.js';

// Re-export commonly used types for convenience
export type {
  WSMessage,
  ConnectionState,
  ConnectionConfig,
  ChatMessage,
  ChatUser,
  RPSGameState,
  LocationData,
  Phase1Config,
  Phase2Config,
  Phase3Config,
  Phase4Config
} from './types/websocket.js';

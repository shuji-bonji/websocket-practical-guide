import {
  RxWebSocket,
  type RxWebSocketConfig,
  type RxWebSocketState
} from '../websocket/rx-websocket.js';
import type { WebSocketMessage } from '../types/websocket.js';
import { Subject, type Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

/**
 * Svelte 5 WebSocket store with RxJS integration
 * Provides reactive WebSocket state management with automatic cleanup
 */
export class WebSocketStore {
  private rxSocket: RxWebSocket | null = $state(null);
  private subscriptions = new Set<Subscription>();
  private _state = $state<RxWebSocketState>({
    status: 'disconnected',
    messageCount: 0,
    reconnectAttempts: 0
  });
  private _messages = $state<WebSocketMessage[]>([]);
  private _lastMessage = $state<WebSocketMessage | null>(null);
  private messageSubject = new Subject<WebSocketMessage>();

  // Public reactive getters
  get state() {
    return this._state;
  }

  get messages() {
    return this._messages;
  }

  get lastMessage() {
    return this._lastMessage;
  }

  get isConnected() {
    return this._state.status === 'connected';
  }

  get status() {
    return this._state.status;
  }

  get messageCount() {
    return this._state.messageCount;
  }

  // Observable streams
  public messages$ = this.messageSubject.asObservable();

  /**
   * Connect to WebSocket server
   */
  connect(config: RxWebSocketConfig): void {
    // Disconnect if already connected
    if (this.rxSocket) {
      this.disconnect();
    }

    // Create new RxWebSocket instance
    this.rxSocket = new RxWebSocket(config);

    // Subscribe to state changes
    const stateSub = this.rxSocket.state$.subscribe((state) => {
      this._state = state;
    });
    this.subscriptions.add(stateSub);

    // Subscribe to messages
    const messageSub = this.rxSocket.connect().subscribe({
      next: (message) => {
        this._lastMessage = message;
        this._messages = [...this._messages, message];

        // Limit message history to last 100 messages
        if (this._messages.length > 100) {
          this._messages = this._messages.slice(-100);
        }

        this.messageSubject.next(message);
      },
      error: (error) => {
        console.error('WebSocket error:', error);
      },
      complete: () => {
        console.log('WebSocket connection closed');
      }
    });
    this.subscriptions.add(messageSub);
  }

  /**
   * Send a message through WebSocket
   */
  send(data: unknown): void {
    if (!this.rxSocket) {
      throw new Error('WebSocket not connected');
    }
    this.rxSocket.send(data);
  }

  /**
   * Send a JSON message
   */
  sendJSON(data: Record<string, unknown>): void {
    this.send(JSON.stringify(data));
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();

    // Disconnect RxSocket
    if (this.rxSocket) {
      this.rxSocket.disconnect();
      this.rxSocket = null;
    }

    // Reset state
    this._state = {
      status: 'disconnected',
      messageCount: 0,
      reconnectAttempts: 0
    };
  }

  /**
   * Clear message history
   */
  clearMessages(): void {
    this._messages = [];
    this._lastMessage = null;
  }

  /**
   * Filter messages by type
   */
  filterMessagesByType(type: string): WebSocketMessage[] {
    return this._messages.filter((msg) => {
      const payload = msg.payload;
      return (
        typeof payload === 'object' &&
        payload !== null &&
        'type' in payload &&
        payload.type === type
      );
    });
  }

  /**
   * Get messages of specific type as observable
   */
  ofType<T>(type: string) {
    return this.messages$.pipe(
      filter((message) => {
        const payload = message.payload;
        return (
          typeof payload === 'object' &&
          payload !== null &&
          'type' in payload &&
          payload.type === type
        );
      }),
      map((message) => message.payload as T)
    );
  }

  /**
   * Cleanup store
   */
  destroy(): void {
    this.disconnect();
    this.messageSubject.complete();
  }
}

// Global WebSocket store instances
const stores = new Map<string, WebSocketStore>();

/**
 * Get or create a WebSocket store instance
 */
export function getWebSocketStore(id: string = 'default'): WebSocketStore {
  if (!stores.has(id)) {
    stores.set(id, new WebSocketStore());
  }
  return stores.get(id)!;
}

/**
 * Create a new WebSocket store instance
 */
export function createWebSocketStore(): WebSocketStore {
  return new WebSocketStore();
}

/**
 * Destroy a WebSocket store instance
 */
export function destroyWebSocketStore(id: string = 'default'): void {
  const store = stores.get(id);
  if (store) {
    store.destroy();
    stores.delete(id);
  }
}

/**
 * Destroy all WebSocket store instances
 */
export function destroyAllWebSocketStores(): void {
  stores.forEach((store) => store.destroy());
  stores.clear();
}

import { Observable, Subject, BehaviorSubject, timer, of, throwError } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, tap, delay, takeUntil, mergeMap, filter, map } from 'rxjs/operators';
import type { WebSocketMessage, WebSocketConnectionConfig } from '../types/websocket.js';

export interface RxWebSocketState {
	status: 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'error';
	lastMessage?: WebSocketMessage;
	messageCount: number;
	errorMessage?: string;
	reconnectAttempts: number;
	connectedAt?: number;
	disconnectedAt?: number;
}

export interface RxWebSocketConfig extends WebSocketConnectionConfig {
	serializer?: (value: unknown) => string;
	deserializer?: (e: MessageEvent) => unknown;
	openObserver?: Subject<Event>;
	closeObserver?: Subject<CloseEvent>;
	enableAutoReconnect?: boolean;
	maxReconnectAttempts?: number;
	reconnectDelay?: number;
}

/**
 * RxJS-based WebSocket wrapper for reactive WebSocket programming
 * Provides automatic reconnection, error handling, and state management
 */
export class RxWebSocket {
	private socket$: WebSocketSubject<unknown> | null = null;
	private messageSubject = new Subject<WebSocketMessage>();
	private stateSubject = new BehaviorSubject<RxWebSocketState>({
		status: 'disconnected',
		messageCount: 0,
		reconnectAttempts: 0
	});
	private destroy$ = new Subject<void>();
	private config: RxWebSocketConfig;
	private reconnectAttempts = 0;

	public messages$ = this.messageSubject.asObservable();
	public state$ = this.stateSubject.asObservable();

	constructor(config: RxWebSocketConfig) {
		this.config = {
			enableAutoReconnect: true,
			maxReconnectAttempts: 5,
			reconnectDelay: 3000,
			...config
		};
	}

	/**
	 * Connect to WebSocket server with automatic reconnection
	 */
	connect(): Observable<WebSocketMessage> {
		if (this.socket$) {
			this.disconnect();
		}

		this.updateState({ status: 'connecting', reconnectAttempts: 0 });
		this.reconnectAttempts = 0;

		// Create WebSocket subject with RxJS
		this.socket$ = webSocket({
			url: this.config.url,
			protocol: this.config.protocols,
			serializer: this.config.serializer,
			deserializer: this.config.deserializer,
			openObserver: {
				next: () => {
					this.updateState({
						status: 'connected',
						connectedAt: Date.now(),
						reconnectAttempts: this.reconnectAttempts
					});
					this.reconnectAttempts = 0;
				}
			},
			closeObserver: {
				next: () => {
					this.updateState({
						status: 'disconnected',
						disconnectedAt: Date.now()
					});

					// Handle auto-reconnect
					if (
						this.config.enableAutoReconnect &&
						this.reconnectAttempts < (this.config.maxReconnectAttempts || 5)
					) {
						this.scheduleReconnect();
					}
				}
			}
		});

		// Subscribe to messages with error handling and reconnection
		return this.socket$.pipe(
			// Handle errors with retry logic
			catchError((error) => {
				this.updateState({
					status: 'error',
					errorMessage: error.message || 'WebSocket error'
				});

				if (
					this.config.enableAutoReconnect &&
					this.reconnectAttempts < (this.config.maxReconnectAttempts || 5)
				) {
					return this.handleReconnect();
				}

				return throwError(() => error);
			}),
			// Convert to WebSocketMessage format
			map((data) => {
				const message: WebSocketMessage = {
					type: 'message',
					timestamp: Date.now(),
					payload: data
				};

				this.messageSubject.next(message);
				this.updateState({
					lastMessage: message,
					messageCount: this.stateSubject.value.messageCount + 1
				});
				return message;
			}),
			// Complete on destroy
			takeUntil(this.destroy$)
		) as Observable<WebSocketMessage>;
	}

	/**
	 * Send a message through the WebSocket
	 */
	send(data: unknown): void {
		if (!this.socket$ || this.stateSubject.value.status !== 'connected') {
			throw new Error('WebSocket is not connected');
		}

		this.socket$.next(data);
	}

	/**
	 * Send multiple messages as an observable stream
	 */
	sendStream(messages$: Observable<unknown>): Observable<void> {
		if (!this.socket$ || this.stateSubject.value.status !== 'connected') {
			return throwError(() => new Error('WebSocket is not connected'));
		}

		return messages$.pipe(
			tap((message) => this.send(message)),
			map(() => void 0),
			takeUntil(this.destroy$)
		);
	}

	/**
	 * Disconnect from WebSocket
	 */
	disconnect(): void {
		this.updateState({ status: 'disconnecting' });

		if (this.socket$) {
			this.socket$.complete();
			this.socket$ = null;
		}

		this.updateState({
			status: 'disconnected',
			disconnectedAt: Date.now()
		});
	}

	/**
	 * Destroy the WebSocket connection and clean up resources
	 */
	destroy(): void {
		this.disconnect();
		this.destroy$.next();
		this.destroy$.complete();
		this.messageSubject.complete();
		this.stateSubject.complete();
	}

	/**
	 * Get current connection state
	 */
	getState(): RxWebSocketState {
		return this.stateSubject.value;
	}

	/**
	 * Check if WebSocket is connected
	 */
	isConnected(): boolean {
		return this.stateSubject.value.status === 'connected';
	}

	/**
	 * Schedule automatic reconnection
	 */
	private scheduleReconnect(): void {
		this.reconnectAttempts++;
		const delay = this.config.reconnectDelay || 3000;

		this.updateState({
			status: 'disconnected',
			errorMessage: `Reconnecting in ${delay / 1000}s (attempt ${this.reconnectAttempts})`
		});

		timer(delay)
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.connect();
			});
	}

	/**
	 * Handle reconnection logic
	 */
	private handleReconnect(): Observable<unknown> {
		return of(null).pipe(
			delay(this.config.reconnectDelay || 3000),
			mergeMap(() => {
				this.reconnectAttempts++;
				this.updateState({
					status: 'connecting',
					reconnectAttempts: this.reconnectAttempts
				});
				return this.connect();
			})
		);
	}

	/**
	 * Update internal state
	 */
	private updateState(partial: Partial<RxWebSocketState>): void {
		this.stateSubject.next({
			...this.stateSubject.value,
			...partial
		});
	}

	/**
	 * Create a filtered message stream
	 */
	filterMessages<T>(predicate: (message: WebSocketMessage) => boolean): Observable<T> {
		return this.messages$.pipe(
			filter(predicate),
			map((message) => message.payload as T)
		);
	}

	/**
	 * Create a typed message stream for specific message types
	 */
	ofType<T>(type: string): Observable<T> {
		return this.filterMessages<T>(
			(message) =>
				typeof message.payload === 'object' &&
				message.payload !== null &&
				'type' in message.payload &&
				message.payload.type === type
		);
	}
}

// Factory function for creating RxWebSocket instances
export function createRxWebSocket(config: RxWebSocketConfig): RxWebSocket {
	return new RxWebSocket(config);
}

// Operator for WebSocket message handling
export function handleWebSocketMessage<T>(
	handler: (message: T) => void
): (source: Observable<T>) => Observable<T> {
	return (source: Observable<T>) =>
		source.pipe(
			tap(handler),
			catchError((error) => {
				console.error('WebSocket message handling error:', error);
				return of();
			})
		);
}

/**
 * Phase 1 WebSocket Manager
 *
 * Browser-only WebSocket manager for public services
 * Includes automatic fallback and educational features
 */

import type {
	PublicWebSocketService,
	Phase1WebSocketMessage,
	Phase1ConnectionState,
	Phase1ConnectionOptions,
	Phase1WebSocketManagerConfig,
	Phase1ConnectionMetrics,
	WebSocketEducationalEvent
} from '$lib/types/websocket';

import {
	PUBLIC_WEBSOCKET_SERVICES,
	WEBSOCKET_READY_STATE_LABELS,
	WEBSOCKET_CLOSE_CODES
} from '$lib/types/websocket';

/**
 * Phase 1 WebSocket Manager
 * Handles connections to public WebSocket services with automatic fallback
 */
export class Phase1WebSocketManager {
	private socket: WebSocket | null = null;
	private config: Phase1WebSocketManagerConfig;
	private connectionState: Phase1ConnectionState;
	private messageHistory: Phase1WebSocketMessage[] = [];
	private metrics: Phase1ConnectionMetrics;
	private fallbackIndex = 0;
	private reconnectTimer: number | null = null;
	private connectionStartTime: number | null = null;
	private latencyMeasurements: number[] = [];
	private educationalEventHandlers: Array<(event: WebSocketEducationalEvent) => void> = [];

	constructor(config: Partial<Phase1WebSocketManagerConfig> = {}) {
		// Ensure browser environment
		if (typeof window === 'undefined') {
			throw new Error('Phase1WebSocketManager can only be used in browser environment');
		}

		this.config = {
			debug: true,
			collectMetrics: true,
			enableFallback: true,
			connectionTimeout: 10000,
			visualIndicators: true,
			...config
		};

		this.connectionState = {
			status: 'disconnected',
			service: null
		};

		this.metrics = {
			messagesSent: 0,
			messagesReceived: 0,
			uptime: 0,
			averageLatency: 0,
			stabilityScore: 100
		};
	}

	/**
	 * Connect to a WebSocket service
	 */
	async connect(options: Phase1ConnectionOptions): Promise<void> {
		const { service, onOpen, onMessage, onError, onClose, onEducationalEvent } = options;

		if (onEducationalEvent) {
			this.educationalEventHandlers.push(onEducationalEvent);
		}

		this.logEducationalEvent({
			id: crypto.randomUUID(),
			timestamp: Date.now(),
			type: 'handshake',
			description: `Initiating WebSocket connection to ${service.name}`,
			details: {
				protocol: 'WebSocket',
				headers: {
					Upgrade: 'websocket',
					Connection: 'Upgrade'
				}
			}
		});

		return this.connectToService(service, { onOpen, onMessage, onError, onClose });
	}

	/**
	 * Connect to a specific service with fallback support
	 */
	private async connectToService(
		service: PublicWebSocketService,
		handlers: Omit<Phase1ConnectionOptions, 'service' | 'onEducationalEvent'>,
		isRetry = false
	): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.updateConnectionState('connecting', service);
				this.connectionStartTime = Date.now();

				this.log(`Connecting to ${service.name} at ${service.url}...`);
				this.socket = new WebSocket(service.url);

				// Connection timeout
				const timeoutId = setTimeout(() => {
					if (this.socket && this.socket.readyState === WebSocket.CONNECTING) {
						this.log('Connection timeout exceeded');
						this.socket.close();
						this.handleConnectionFailure(service, handlers, 'Connection timeout');
						reject(new Error('Connection timeout'));
					}
				}, this.config.connectionTimeout);

				// WebSocket event handlers
				this.socket.onopen = (event) => {
					clearTimeout(timeoutId);
					this.handleOpen(event, service, handlers.onOpen);
					resolve();
				};

				this.socket.onmessage = (event) => {
					this.handleMessage(event, handlers.onMessage);
				};

				this.socket.onerror = (event) => {
					clearTimeout(timeoutId);
					this.handleError(event, handlers.onError);
				};

				this.socket.onclose = (event) => {
					clearTimeout(timeoutId);
					this.handleClose(event, service, handlers);
					if (!isRetry) {
						reject(new Error(`Connection closed: ${event.reason || 'Unknown reason'}`));
					}
				};
			} catch (error) {
				this.log(`Failed to create WebSocket: ${error}`);
				this.handleConnectionFailure(service, handlers, String(error));
				reject(error);
			}
		});
	}

	/**
	 * Handle successful connection
	 */
	private handleOpen(
		event: Event,
		service: PublicWebSocketService,
		onOpen?: (event: Event) => void
	): void {
		const connectionTime = Date.now() - (this.connectionStartTime || 0);

		this.updateConnectionState('connected', service);
		this.fallbackIndex = 0; // Reset fallback index on successful connection

		this.log(`✅ Connected to ${service.name} in ${connectionTime}ms`);

		this.logEducationalEvent({
			id: crypto.randomUUID(),
			timestamp: Date.now(),
			type: 'open',
			description: `WebSocket connection established to ${service.name}`,
			details: {
				protocol: this.socket?.protocol || 'none',
				headers: {
					Connection: 'Upgrade successful'
				}
			}
		});

		this.addSystemMessage(`Connected to ${service.name}`);

		if (onOpen) {
			onOpen(event);
		}

		// Start metrics collection
		if (this.config.collectMetrics) {
			this.startMetricsCollection();
		}
	}

	/**
	 * Handle incoming messages
	 */
	private handleMessage(event: MessageEvent, onMessage?: (event: MessageEvent) => void): void {
		this.metrics.messagesReceived++;

		const message: Phase1WebSocketMessage = {
			id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			type: 'received',
			content: event.data,
			timestamp: Date.now(),
			service: this.connectionState.service?.name,
			metadata: {
				size: event.data.length,
				frameType: typeof event.data === 'string' ? 'text' : 'binary'
			}
		};

		this.messageHistory.push(message);
		this.log(`📥 Received: ${event.data}`);

		this.logEducationalEvent({
			id: crypto.randomUUID(),
			timestamp: Date.now(),
			type: 'message',
			description: 'Received WebSocket message',
			details: {
				protocol: 'WebSocket Data Frame'
			}
		});

		if (onMessage) {
			onMessage(event);
		}
	}

	/**
	 * Handle connection errors
	 */
	private handleError(event: Event, onError?: (event: Event) => void): void {
		this.log('❌ WebSocket error occurred');
		this.updateConnectionState('error', this.connectionState.service, 'WebSocket error');
		this.metrics.stabilityScore = Math.max(0, this.metrics.stabilityScore - 10);

		this.logEducationalEvent({
			id: crypto.randomUUID(),
			timestamp: Date.now(),
			type: 'error',
			description: 'WebSocket error occurred',
			details: {}
		});

		this.addSystemMessage('Connection error occurred', 'error');

		if (onError) {
			onError(event);
		}
	}

	/**
	 * Handle connection close
	 */
	private handleClose(
		event: CloseEvent,
		service: PublicWebSocketService,
		handlers: Omit<Phase1ConnectionOptions, 'service' | 'onEducationalEvent'>
	): void {
		const closeReason = WEBSOCKET_CLOSE_CODES[event.code] || 'Unknown reason';

		this.log(`🔌 Connection closed: ${closeReason} (${event.code})`);

		this.logEducationalEvent({
			id: crypto.randomUUID(),
			timestamp: Date.now(),
			type: 'close',
			description: `WebSocket connection closed: ${closeReason}`,
			details: {
				code: event.code,
				reason: event.reason || closeReason
			}
		});

		this.updateConnectionState('disconnected', null, closeReason);
		this.addSystemMessage(`Disconnected: ${closeReason}`, 'system');

		// Stop metrics collection
		this.stopMetricsCollection();

		if (handlers.onClose) {
			handlers.onClose(event);
		}

		// Handle abnormal closure with fallback
		if (event.code !== 1000 && event.code !== 1001 && this.config.enableFallback) {
			this.attemptFallback(handlers);
		}
	}

	/**
	 * Handle connection failure and attempt fallback
	 */
	private handleConnectionFailure(
		service: PublicWebSocketService,
		handlers: Omit<Phase1ConnectionOptions, 'service' | 'onEducationalEvent'>,
		error: string
	): void {
		this.log(`Failed to connect to ${service.name}: ${error}`);
		this.updateConnectionState('error', service, error);
		this.metrics.stabilityScore = Math.max(0, this.metrics.stabilityScore - 20);

		if (this.config.enableFallback) {
			this.attemptFallback(handlers);
		}
	}

	/**
	 * Attempt connection to fallback service
	 */
	private attemptFallback(
		handlers: Omit<Phase1ConnectionOptions, 'service' | 'onEducationalEvent'>
	): void {
		this.fallbackIndex++;

		if (this.fallbackIndex < PUBLIC_WEBSOCKET_SERVICES.length) {
			const nextService = PUBLIC_WEBSOCKET_SERVICES[this.fallbackIndex];
			this.log(`Attempting fallback to ${nextService.name}...`);

			this.updateConnectionState('reconnecting', nextService);

			// Delay before retry
			setTimeout(() => {
				this.connectToService(nextService, handlers, true).catch(() => {
					// Fallback will be handled in error handler
				});
			}, 1000);
		} else {
			this.log('All fallback services exhausted');
			this.updateConnectionState('error', null, 'All services unavailable');
			this.addSystemMessage('Unable to establish WebSocket connection', 'error');
		}
	}

	/**
	 * Send a message through the WebSocket
	 */
	send(data: string): void {
		if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
			throw new Error('WebSocket is not connected');
		}

		this.socket.send(data);
		this.metrics.messagesSent++;

		const message: Phase1WebSocketMessage = {
			id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			type: 'sent',
			content: data,
			timestamp: Date.now(),
			service: this.connectionState.service?.name,
			metadata: {
				size: data.length,
				frameType: 'text'
			}
		};

		this.messageHistory.push(message);
		this.log(`📤 Sent: ${data}`);
	}

	/**
	 * Close the WebSocket connection
	 */
	disconnect(): void {
		if (this.socket) {
			this.log('Closing WebSocket connection...');
			this.socket.close(1000, 'Client disconnect');
			this.socket = null;
		}

		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}

		this.stopMetricsCollection();
		this.updateConnectionState('disconnected', null);
	}

	/**
	 * Get current connection state
	 */
	getConnectionState(): Phase1ConnectionState {
		return { ...this.connectionState };
	}

	/**
	 * Get connection metrics
	 */
	getMetrics(): Phase1ConnectionMetrics {
		return { ...this.metrics };
	}

	/**
	 * Get message history
	 */
	getMessageHistory(): Phase1WebSocketMessage[] {
		return [...this.messageHistory];
	}

	/**
	 * Clear message history
	 */
	clearMessageHistory(): void {
		this.messageHistory = [];
	}

	/**
	 * Get WebSocket ready state with label
	 */
	getReadyState(): { state: number; label: string } | null {
		if (!this.socket) {
			return null;
		}

		return {
			state: this.socket.readyState,
			label: WEBSOCKET_READY_STATE_LABELS[this.socket.readyState] || 'UNKNOWN'
		};
	}

	/**
	 * Update connection state
	 */
	private updateConnectionState(
		status: Phase1ConnectionState['status'],
		service: PublicWebSocketService | null,
		error?: string
	): void {
		this.connectionState = {
			status,
			service,
			lastError: error,
			connectedAt: status === 'connected' ? Date.now() : this.connectionState.connectedAt,
			reconnectAttempts:
				status === 'reconnecting' ? (this.connectionState.reconnectAttempts || 0) + 1 : 0
		};
	}

	/**
	 * Add system message to history
	 */
	private addSystemMessage(content: string, type: 'system' | 'error' = 'system'): void {
		const message: Phase1WebSocketMessage = {
			id: `sys-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			type,
			content,
			timestamp: Date.now(),
			service: this.connectionState.service?.name
		};

		this.messageHistory.push(message);
	}

	/**
	 * Log educational event
	 */
	private logEducationalEvent(event: WebSocketEducationalEvent): void {
		this.educationalEventHandlers.forEach((handler) => handler(event));
	}

	/**
	 * Start collecting connection metrics
	 */
	private startMetricsCollection(): void {
		if (!this.connectionState.connectedAt) return;

		// Update metrics every second
		const metricsInterval = setInterval(() => {
			if (this.connectionState.status !== 'connected') {
				clearInterval(metricsInterval);
				return;
			}

			this.metrics.uptime = Date.now() - (this.connectionState.connectedAt || 0);

			// Calculate average latency if we have measurements
			if (this.latencyMeasurements.length > 0) {
				this.metrics.averageLatency =
					this.latencyMeasurements.reduce((a, b) => a + b, 0) / this.latencyMeasurements.length;
			}
		}, 1000);
	}

	/**
	 * Stop collecting metrics
	 */
	private stopMetricsCollection(): void {
		// Metrics collection cleanup if needed
	}

	/**
	 * Debug logging
	 */
	private log(message: string): void {
		if (this.config.debug) {
			console.log(`[Phase1WebSocket] ${message}`);
		}
	}
}

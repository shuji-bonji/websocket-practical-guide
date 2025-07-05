import type { WebSocketMessage } from '../types/websocket.js';

export interface MockServerConfig {
	port: number;
	protocol: string;
	latency?: number;
	errorRate?: number;
	maxConnections?: number;
	messageBufferSize?: number;
}

export interface MockServerStats {
	connections: number;
	messagesReceived: number;
	messagesSent: number;
	errors: number;
	uptime: number;
}

export interface TestScenario {
	id: string;
	name: string;
	description: string;
	config: Partial<MockServerConfig>;
	behaviors: ServerBehavior[];
}

export interface ServerBehavior {
	trigger: 'onConnect' | 'onMessage' | 'onDisconnect' | 'onTimer';
	action: 'sendMessage' | 'closeConnection' | 'sendError' | 'delay';
	payload?: WebSocketMessage | ((data: unknown) => WebSocketMessage);
	delay?: number;
	condition?: (data: unknown) => boolean;
}

export class MockWebSocketServer {
	private config: MockServerConfig;
	private connections: Map<string, MockWebSocketConnection>;
	private messageHandlers: Map<string, (message: WebSocketMessage) => void>;
	private eventHandlers: Map<string, (event: unknown) => void>;
	private stats: MockServerStats;
	private isRunning: boolean;
	private startTime: number;
	private scenarios: Map<string, TestScenario>;
	private activeScenario: string | null;

	constructor(config: MockServerConfig) {
		this.config = config;
		this.connections = new Map();
		this.messageHandlers = new Map();
		this.eventHandlers = new Map();
		this.scenarios = new Map();
		this.activeScenario = null;
		this.isRunning = false;
		this.startTime = 0;
		this.stats = {
			connections: 0,
			messagesReceived: 0,
			messagesSent: 0,
			errors: 0,
			uptime: 0
		};

		this.setupDefaultScenarios();
	}

	private setupDefaultScenarios(): void {
		const scenarios: TestScenario[] = [
			{
				id: 'echo',
				name: 'Echo Server',
				description: 'Simple echo server that returns all messages',
				config: { protocol: 'echo' },
				behaviors: [
					{
						trigger: 'onConnect',
						action: 'sendMessage',
						payload: {
							type: 'welcome',
							timestamp: Date.now(),
							payload: { message: 'Connected to echo server' }
						} as WebSocketMessage
					},
					{
						trigger: 'onMessage',
						action: 'sendMessage',
						payload: (data: unknown) =>
							({
								type: 'echo',
								timestamp: Date.now(),
								payload: data
							}) as WebSocketMessage
					}
				]
			},
			{
				id: 'chat',
				name: 'Chat Server',
				description: 'Multi-client chat server simulation',
				config: { protocol: 'chat' },
				behaviors: [
					{
						trigger: 'onConnect',
						action: 'sendMessage',
						payload: {
							type: 'system',
							timestamp: Date.now(),
							payload: { message: 'Welcome to chat server' }
						} as WebSocketMessage
					},
					{
						trigger: 'onMessage',
						action: 'sendMessage',
						payload: (data: unknown) =>
							({
								type: 'broadcast',
								timestamp: Date.now(),
								payload: data
							}) as WebSocketMessage
					}
				]
			},
			{
				id: 'unreliable',
				name: 'Unreliable Server',
				description: 'Server that randomly drops connections and messages',
				config: { protocol: 'unreliable', errorRate: 0.3 },
				behaviors: [
					{
						trigger: 'onMessage',
						action: 'sendError',
						condition: () => Math.random() < 0.3
					}
				]
			},
			{
				id: 'slow',
				name: 'Slow Server',
				description: 'Server with high latency responses',
				config: { protocol: 'slow', latency: 2000 },
				behaviors: [
					{
						trigger: 'onMessage',
						action: 'delay',
						delay: 2000
					}
				]
			}
		];

		scenarios.forEach((scenario) => {
			this.scenarios.set(scenario.id, scenario);
		});
	}

	public start(): Promise<void> {
		return new Promise((resolve) => {
			if (this.isRunning) {
				resolve();
				return;
			}

			this.isRunning = true;
			this.startTime = Date.now();
			this.stats = {
				connections: 0,
				messagesReceived: 0,
				messagesSent: 0,
				errors: 0,
				uptime: 0
			};

			this.emit('serverStarted', {
				port: this.config.port,
				protocol: this.config.protocol
			});

			// Simulate server startup delay
			setTimeout(() => {
				resolve();
			}, 100);
		});
	}

	public stop(): Promise<void> {
		return new Promise((resolve) => {
			if (!this.isRunning) {
				resolve();
				return;
			}

			this.isRunning = false;

			// Close all connections
			this.connections.forEach((conn) => {
				conn.close();
			});
			this.connections.clear();

			this.emit('serverStopped', {
				uptime: this.getUptime()
			});

			setTimeout(() => {
				resolve();
			}, 100);
		});
	}

	public isServerRunning(): boolean {
		return this.isRunning;
	}

	public getStats(): MockServerStats {
		return {
			...this.stats,
			uptime: this.getUptime(),
			connections: this.connections.size
		};
	}

	public getUptime(): number {
		return this.isRunning ? Date.now() - this.startTime : 0;
	}

	public createConnection(connectionId: string, protocols?: string[]): MockWebSocketConnection {
		if (!this.isRunning) {
			throw new Error('Server not running');
		}

		if (this.config.maxConnections && this.connections.size >= this.config.maxConnections) {
			throw new Error('Maximum connections reached');
		}

		const connection = new MockWebSocketConnection(connectionId, this, protocols);
		this.connections.set(connectionId, connection);
		this.stats.connections++;

		this.emit('connectionCreated', { connectionId, protocolsRequested: protocols });
		this.executeBehaviors('onConnect', connection);

		return connection;
	}

	public closeConnection(connectionId: string): void {
		const connection = this.connections.get(connectionId);
		if (connection) {
			connection.close();
			this.connections.delete(connectionId);
			this.emit('connectionClosed', { connectionId });
			this.executeBehaviors('onDisconnect', connection);
		}
	}

	public handleMessage(connectionId: string, message: WebSocketMessage): void {
		const connection = this.connections.get(connectionId);
		if (!connection) {
			return;
		}

		this.stats.messagesReceived++;
		this.emit('messageReceived', { connectionId, message });

		// Apply latency if configured
		const latency = this.config.latency || 0;
		setTimeout(() => {
			this.executeBehaviors('onMessage', connection, message);
		}, latency);
	}

	public sendMessage(connectionId: string, message: WebSocketMessage): void {
		const connection = this.connections.get(connectionId);
		if (connection && connection.isConnected()) {
			connection.receiveMessage(message);
			this.stats.messagesSent++;
			this.emit('messageSent', { connectionId, message });
		}
	}

	public broadcastMessage(message: WebSocketMessage, excludeConnectionId?: string): void {
		this.connections.forEach((connection, connectionId) => {
			if (connectionId !== excludeConnectionId && connection.isConnected()) {
				this.sendMessage(connectionId, message);
			}
		});
	}

	public setScenario(scenarioId: string): void {
		if (!this.scenarios.has(scenarioId)) {
			throw new Error(`Scenario '${scenarioId}' not found`);
		}

		this.activeScenario = scenarioId;
		const scenario = this.scenarios.get(scenarioId)!;

		// Apply scenario configuration
		this.config = { ...this.config, ...scenario.config };

		this.emit('scenarioChanged', { scenarioId, scenario });
	}

	public getScenarios(): TestScenario[] {
		return Array.from(this.scenarios.values());
	}

	public getActiveScenario(): TestScenario | null {
		return this.activeScenario ? this.scenarios.get(this.activeScenario) || null : null;
	}

	public simulateNetworkIssue(duration: number = 5000): void {
		this.emit('networkIssueStarted', { duration });

		// Temporarily increase error rate
		const originalErrorRate = this.config.errorRate || 0;
		this.config.errorRate = 1.0;

		setTimeout(() => {
			this.config.errorRate = originalErrorRate;
			this.emit('networkIssueEnded', {});
		}, duration);
	}

	public simulateServerOverload(): void {
		this.emit('serverOverloadStarted', {});

		// Increase latency and error rate
		const originalLatency = this.config.latency || 0;
		const originalErrorRate = this.config.errorRate || 0;

		this.config.latency = (this.config.latency || 0) + 5000;
		this.config.errorRate = Math.min((this.config.errorRate || 0) + 0.5, 1.0);

		setTimeout(() => {
			this.config.latency = originalLatency;
			this.config.errorRate = originalErrorRate;
			this.emit('serverOverloadEnded', {});
		}, 10000);
	}

	private executeBehaviors(
		trigger: ServerBehavior['trigger'],
		connection: MockWebSocketConnection,
		data?: unknown
	): void {
		const scenario = this.getActiveScenario();
		if (!scenario) return;

		scenario.behaviors
			.filter((behavior) => behavior.trigger === trigger)
			.forEach((behavior) => {
				// Check condition if present
				if (behavior.condition && !behavior.condition(data)) {
					return;
				}

				// Apply error rate
				if (this.config.errorRate && Math.random() < this.config.errorRate) {
					this.stats.errors++;
					this.emit('errorOccurred', { connectionId: connection.getId(), behavior });
					return;
				}

				switch (behavior.action) {
					case 'sendMessage': {
						const payload =
							typeof behavior.payload === 'function' ? behavior.payload(data) : behavior.payload;
						if (payload) {
							this.sendMessage(connection.getId(), payload);
						}
						break;
					}
					case 'closeConnection':
						this.closeConnection(connection.getId());
						break;
					case 'sendError':
						this.stats.errors++;
						this.emit('errorOccurred', { connectionId: connection.getId(), behavior });
						break;
					case 'delay':
						// Delay is handled by the caller
						break;
				}
			});
	}

	public on(event: string, handler: (data: unknown) => void): void {
		this.eventHandlers.set(event, handler);
	}

	public off(event: string): void {
		this.eventHandlers.delete(event);
	}

	private emit(event: string, data: unknown): void {
		const handler = this.eventHandlers.get(event);
		if (handler) {
			handler(data);
		}
	}
}

export class MockWebSocketConnection {
	private id: string;
	private server: MockWebSocketServer;
	private connected: boolean;
	private protocol: string | null;
	private messageHandlers: Map<string, (message: WebSocketMessage) => void>;

	constructor(id: string, server: MockWebSocketServer, protocols?: string[]) {
		this.id = id;
		this.server = server;
		this.connected = true;
		this.protocol = protocols && protocols.length > 0 ? protocols[0] : null;
		this.messageHandlers = new Map();
	}

	public getId(): string {
		return this.id;
	}

	public isConnected(): boolean {
		return this.connected;
	}

	public getProtocol(): string | null {
		return this.protocol;
	}

	public sendMessage(message: WebSocketMessage): void {
		if (!this.connected) {
			throw new Error('Connection closed');
		}

		this.server.handleMessage(this.id, message);
	}

	public receiveMessage(message: WebSocketMessage): void {
		if (!this.connected) {
			return;
		}

		const handler = this.messageHandlers.get('message');
		if (handler) {
			handler(message);
		}
	}

	public close(): void {
		this.connected = false;
		const handler = this.messageHandlers.get('close');
		if (handler) {
			handler({
				type: 'close',
				timestamp: Date.now(),
				payload: null
			} as WebSocketMessage);
		}
	}

	public on(event: string, handler: (message: WebSocketMessage) => void): void {
		this.messageHandlers.set(event, handler);
	}

	public off(event: string): void {
		this.messageHandlers.delete(event);
	}
}

// Factory function for creating mock servers with different configurations
export function createMockServer(config: MockServerConfig): MockWebSocketServer {
	return new MockWebSocketServer(config);
}

// Predefined server configurations for common test scenarios
export const TestServerConfigs = {
	Echo: {
		port: 9999,
		protocol: 'echo',
		latency: 50,
		errorRate: 0
	},
	Chat: {
		port: 9998,
		protocol: 'chat',
		latency: 100,
		errorRate: 0.05,
		maxConnections: 100
	},
	Unreliable: {
		port: 9997,
		protocol: 'unreliable',
		latency: 200,
		errorRate: 0.3
	},
	Slow: {
		port: 9996,
		protocol: 'slow',
		latency: 5000,
		errorRate: 0.1
	}
} as const;

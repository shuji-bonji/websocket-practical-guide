/**
 * WebSocket Type Definitions for Phase 1 & Phase 2
 *
 * Phase 1 Constraints:
 * - Public WebSocket services only
 * - No server-side implementation
 * - GitHub Pages compatible
 * - Educational focus
 *
 * Phase 2 Extensions:
 * - Local server support
 * - Multiple protocol analysis
 * - Frame structure inspection
 * - Protocol debugging
 */

/**
 * Public WebSocket service configuration
 */
export interface PublicWebSocketService {
	/** Service display name */
	name: string;
	/** WebSocket URL (must be wss://) */
	url: string;
	/** Service description for educational purposes */
	description: string;
	/** Supported features */
	features: string[];
	/** Service reliability indicator */
	reliability: 'high' | 'medium' | 'low';
	/** Expected latency */
	latency: 'low' | 'medium' | 'high';
}

/**
 * Phase 1 WebSocket message structure
 */
export interface Phase1WebSocketMessage {
	/** Unique message identifier */
	id: string;
	/** Message type for visualization */
	type: 'sent' | 'received' | 'system' | 'error';
	/** Message content */
	content: string;
	/** Message timestamp */
	timestamp: number;
	/** Source service (for multi-service demos) */
	service?: string;
	/** Additional metadata for educational purposes */
	metadata?: {
		size?: number;
		latency?: number;
		frameType?: 'text' | 'binary';
	};
}

/**
 * WebSocket connection state for Phase 1
 */
export interface Phase1ConnectionState {
	/** Current connection status */
	status: 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting';
	/** Currently connected service */
	service: PublicWebSocketService | null;
	/** Last error message if any */
	lastError?: string;
	/** Connection start time */
	connectedAt?: number;
	/** Number of reconnection attempts */
	reconnectAttempts?: number;
}

/**
 * Phase 1 demo configuration
 */
export interface Phase1DemoConfig {
	/** Demo type for different learning scenarios */
	demoType: 'echo' | 'broadcast' | 'connection-lifecycle';
	/** Primary WebSocket service URL */
	primaryUrl: string;
	/** Fallback service URLs */
	fallbackUrls: string[];
	/** Enable automatic reconnection */
	autoReconnect: boolean;
	/** Maximum reconnection attempts */
	maxReconnectAttempts: number;
	/** Reconnection delay in milliseconds */
	reconnectDelay: number;
	/** Show educational tooltips */
	showEducationalHints: boolean;
}

/**
 * WebSocket event for educational visualization
 */
export interface WebSocketEducationalEvent {
	/** Unique event identifier */
	id: string;
	/** Event timestamp */
	timestamp: number;
	/** Event type */
	type: 'handshake' | 'open' | 'message' | 'close' | 'error' | 'ping' | 'pong' | 'system';
	/** Human-readable description */
	description: string;
	/** Technical details for learning */
	details?: {
		code?: number;
		reason?: string;
		headers?: Record<string, string>;
		protocol?: string;
	};
}

/**
 * Connection metrics for educational purposes
 */
export interface Phase1ConnectionMetrics {
	/** Total messages sent */
	messagesSent: number;
	/** Total messages received */
	messagesReceived: number;
	/** Connection uptime in milliseconds */
	uptime: number;
	/** Average round-trip time */
	averageLatency: number;
	/** Connection stability score (0-100) */
	stabilityScore: number;
}

/**
 * Phase 1 WebSocket manager configuration
 */
export interface Phase1WebSocketManagerConfig {
	/** Enable debug logging for educational purposes */
	debug: boolean;
	/** Enable connection metrics collection */
	collectMetrics: boolean;
	/** Enable automatic fallback to other services */
	enableFallback: boolean;
	/** Connection timeout in milliseconds */
	connectionTimeout: number;
	/** Enable visual connection state indicators */
	visualIndicators: boolean;
}

/**
 * Available public WebSocket services for Phase 1
 */
export const PUBLIC_WEBSOCKET_SERVICES: PublicWebSocketService[] = [
	{
		name: 'Echo WebSocket',
		url: 'wss://echo.websocket.org',
		description: 'Simple echo server for basic testing',
		features: ['echo', 'text-messages', 'connection-test'],
		reliability: 'high',
		latency: 'low'
	},
	{
		name: 'Postman Echo',
		url: 'wss://ws.postman-echo.com/raw',
		description: "Postman's WebSocket echo service with headers inspection",
		features: ['echo', 'headers-inspection', 'json-support'],
		reliability: 'high',
		latency: 'medium'
	}
];

/**
 * Type guard to check if a value is a valid WebSocket readyState
 */
export function isValidWebSocketState(state: number): state is 0 | 1 | 2 | 3 {
	return state >= 0 && state <= 3;
}

/**
 * WebSocket readyState labels for educational display
 */
export const WEBSOCKET_READY_STATE_LABELS: Record<number, string> = {
	0: 'CONNECTING',
	1: 'OPEN',
	2: 'CLOSING',
	3: 'CLOSED'
};

/**
 * WebSocket close event codes for educational purposes
 */
export const WEBSOCKET_CLOSE_CODES: Record<number, string> = {
	1000: 'Normal Closure',
	1001: 'Going Away',
	1002: 'Protocol Error',
	1003: 'Unsupported Data',
	1005: 'No Status Received',
	1006: 'Abnormal Closure',
	1007: 'Invalid Frame Payload Data',
	1008: 'Policy Violation',
	1009: 'Message Too Big',
	1010: 'Mandatory Extension',
	1011: 'Internal Server Error',
	1015: 'TLS Handshake'
};

/**
 * Helper type for WebSocket event handlers
 */
export type WebSocketEventHandler<T = Event> = (event: T) => void;

/**
 * Phase 1 WebSocket connection options
 */
export interface Phase1ConnectionOptions {
	/** Service to connect to */
	service: PublicWebSocketService;
	/** Event handlers */
	onOpen?: WebSocketEventHandler;
	onMessage?: WebSocketEventHandler<MessageEvent>;
	onError?: WebSocketEventHandler;
	onClose?: WebSocketEventHandler<CloseEvent>;
	/** Educational event tracking */
	onEducationalEvent?: (event: WebSocketEducationalEvent) => void;
}

// ============================================================================
// PHASE 2 TYPE DEFINITIONS
// ============================================================================

/**
 * Phase 2 local WebSocket server configuration
 */
export interface Phase2LocalServer {
	/** Server name for identification */
	name: string;
	/** WebSocket URL (ws://localhost:port) */
	url: string;
	/** Server type and protocol */
	protocol: 'basic' | 'graphql-ws' | 'mqtt' | 'custom';
	/** Supported subprotocols */
	subprotocols: string[];
	/** Server description */
	description: string;
	/** Educational features available */
	features: string[];
	/** Server status */
	status: 'unknown' | 'running' | 'stopped' | 'error';
}

/**
 * WebSocket frame structure for Phase 2 analysis
 */
export interface WebSocketFrame {
	/** Frame timestamp */
	timestamp: number;
	/** Frame direction */
	direction: 'inbound' | 'outbound';
	/** Frame type */
	type: 'text' | 'binary' | 'ping' | 'pong' | 'close' | 'continuation';
	/** Frame size in bytes */
	size: number;
	/** Raw frame data */
	data: ArrayBuffer | string;
	/** Parsed frame details */
	details: {
		fin: boolean;
		rsv1: boolean;
		rsv2: boolean;
		rsv3: boolean;
		opcode: number;
		masked: boolean;
		payloadLength: number;
		maskingKey?: number[];
	};
	/** Protocol-specific information */
	protocolInfo?: GraphQLWSFrameInfo | MQTTFrameInfo;
}

/**
 * GraphQL-WS specific frame information
 */
export interface GraphQLWSFrameInfo {
	messageType:
		| 'connection_init'
		| 'connection_ack'
		| 'start'
		| 'data'
		| 'error'
		| 'complete'
		| 'stop'
		| 'connection_terminate';
	subscriptionId?: string;
	payload?: unknown;
}

/**
 * MQTT specific frame information
 */
export interface MQTTFrameInfo {
	messageType:
		| 'CONNECT'
		| 'CONNACK'
		| 'PUBLISH'
		| 'PUBACK'
		| 'SUBSCRIBE'
		| 'SUBACK'
		| 'UNSUBSCRIBE'
		| 'UNSUBACK'
		| 'PINGREQ'
		| 'PINGRESP'
		| 'DISCONNECT';
	packetId?: number;
	topic?: string;
	qos?: 0 | 1 | 2;
	retain?: boolean;
	payload?: ArrayBuffer;
}

/**
 * Protocol analyzer configuration
 */
export interface ProtocolAnalyzerConfig {
	/** Enable frame capture */
	captureFrames: boolean;
	/** Maximum frames to store */
	maxFrames: number;
	/** Enable protocol parsing */
	parseProtocol: boolean;
	/** Enable binary data visualization */
	visualizeBinary: boolean;
	/** Real-time analysis */
	realTimeAnalysis: boolean;
}

/**
 * Phase 2 connection state (extends Phase 1)
 */
export interface Phase2ConnectionState extends Phase1ConnectionState {
	/** Local server information */
	server: Phase2LocalServer | null;
	/** Negotiated subprotocol */
	subprotocol: string | null;
	/** Protocol-specific state */
	protocolState: GraphQLWSConnectionState | MQTTConnectionState | null;
	/** Frame capture state */
	frameCaptureEnabled: boolean;
	/** Analysis mode */
	analysisMode: 'basic' | 'advanced' | 'expert';
}

/**
 * GraphQL-WS connection state
 */
export interface GraphQLWSConnectionState {
	connectionInitialized: boolean;
	activeSubscriptions: Map<string, GraphQLSubscription>;
	lastKeepAlive: number | null;
}

/**
 * GraphQL subscription information
 */
export interface GraphQLSubscription {
	id: string;
	query: string;
	variables?: Record<string, unknown>;
	startedAt: number;
	lastData: number | null;
	dataCount: number;
}

/**
 * MQTT connection state
 */
export interface MQTTConnectionState {
	clientId: string;
	isConnected: boolean;
	subscriptions: Map<string, MQTTSubscription>;
	publishedTopics: Set<string>;
	keepAlive: number;
	lastPing: number | null;
}

/**
 * MQTT subscription information
 */
export interface MQTTSubscription {
	topic: string;
	qos: 0 | 1 | 2;
	subscribedAt: number;
	messageCount: number;
	lastMessage: number | null;
}

/**
 * Phase 2 connection options
 */
export interface Phase2ConnectionOptions {
	/** Local server to connect to */
	server: Phase2LocalServer;
	/** Requested subprotocols */
	subprotocols?: string[];
	/** Protocol analyzer configuration */
	analyzerConfig?: ProtocolAnalyzerConfig;
	/** Event handlers */
	onOpen?: WebSocketEventHandler;
	onMessage?: WebSocketEventHandler<MessageEvent>;
	onError?: WebSocketEventHandler;
	onClose?: WebSocketEventHandler<CloseEvent>;
	/** Frame capture handler */
	onFrameCapture?: (frame: WebSocketFrame) => void;
	/** Protocol-specific handlers */
	onProtocolEvent?: (event: ProtocolEvent) => void;
}

/**
 * Protocol-specific events
 */
export interface ProtocolEvent {
	timestamp: number;
	protocol: 'basic' | 'graphql-ws' | 'mqtt' | 'custom';
	eventType: string;
	data: unknown;
	description: string;
}

/**
 * Frame analysis result
 */
export interface FrameAnalysisResult {
	frame: WebSocketFrame;
	analysis: {
		isValid: boolean;
		errors: string[];
		warnings: string[];
		protocolCompliance: boolean;
		recommendations: string[];
	};
	visualization: {
		hexDump: string;
		structureTree: FrameStructureNode[];
		protocolDiagram?: string;
	};
}

/**
 * Frame structure tree node
 */
export interface FrameStructureNode {
	name: string;
	type: 'header' | 'payload' | 'field' | 'value';
	offset: number;
	length: number;
	value: string | number | boolean;
	description: string;
	children?: FrameStructureNode[];
}

/**
 * Available Phase 2 local servers
 */
export const PHASE2_LOCAL_SERVERS: Phase2LocalServer[] = [
	{
		name: 'Basic WebSocket Server',
		url: 'ws://localhost:8080',
		protocol: 'basic',
		subprotocols: [],
		description: 'Educational basic WebSocket server with frame analysis',
		features: ['frame-analysis', 'binary-handling', 'ping-pong', 'metrics'],
		status: 'unknown'
	},
	{
		name: 'GraphQL-WS Server',
		url: 'ws://localhost:8081',
		protocol: 'graphql-ws',
		subprotocols: ['graphql-ws', 'graphql-transport-ws'],
		description: 'GraphQL over WebSocket with subscription support',
		features: ['subprotocol-negotiation', 'subscriptions', 'multiplexing'],
		status: 'unknown'
	},
	{
		name: 'MQTT over WebSocket Server',
		url: 'ws://localhost:8082',
		protocol: 'mqtt',
		subprotocols: ['mqtt', 'mqttv3.1', 'mqttv3.1.1'],
		description: 'MQTT protocol over WebSocket transport',
		features: ['topic-messaging', 'qos-levels', 'pub-sub-pattern'],
		status: 'unknown'
	}
];

/**
 * Protocol message patterns for analysis
 */
export const PROTOCOL_PATTERNS = {
	graphqlWS: {
		connectionInit: /^{"type":"connection_init"/,
		connectionAck: /^{"type":"connection_ack"/,
		start: /^{"type":"start"/,
		data: /^{"type":"data"/,
		error: /^{"type":"error"/,
		complete: /^{"type":"complete"/,
		stop: /^{"type":"stop"/,
		connectionTerminate: /^{"type":"connection_terminate"/
	}
} as const;

/**
 * Frame opcode definitions for WebSocket
 */
export const WEBSOCKET_OPCODES = {
	0x0: 'Continuation Frame',
	0x1: 'Text Frame',
	0x2: 'Binary Frame',
	0x8: 'Connection Close Frame',
	0x9: 'Ping Frame',
	0xa: 'Pong Frame'
} as const;

/**
 * Type guard for Phase 2 local server
 */
export function isPhase2LocalServer(server: unknown): server is Phase2LocalServer {
	if (typeof server !== 'object' || server === null) return false;

	const obj = server as Record<string, unknown>;

	return (
		'name' in obj &&
		typeof obj.name === 'string' &&
		'url' in obj &&
		typeof obj.url === 'string' &&
		'protocol' in obj &&
		obj.url.startsWith('ws://localhost:') &&
		['basic', 'graphql-ws', 'mqtt', 'custom'].includes(obj.protocol as string)
	);
}

/**
 * Type guard for WebSocket frame
 */
export function isWebSocketFrame(frame: unknown): frame is WebSocketFrame {
	return (
		typeof frame === 'object' &&
		frame !== null &&
		'timestamp' in frame &&
		typeof (frame as Record<string, unknown>).timestamp === 'number' &&
		'direction' in frame &&
		['inbound', 'outbound'].includes((frame as Record<string, unknown>).direction as string) &&
		'type' in frame &&
		['text', 'binary', 'ping', 'pong', 'close', 'continuation'].includes(
			(frame as Record<string, unknown>).type as string
		) &&
		'size' in frame &&
		typeof (frame as Record<string, unknown>).size === 'number'
	);
}

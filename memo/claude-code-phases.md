# Claude Code Phase別開発ガイド

> このドキュメントは、Claude Codeが各フェーズの特性を理解し、適切なレベルの実装を行うためのガイドです。

## 🎯 Phase別開発戦略の核心

### 教育的progression（段階的習得）

各Phaseで**技術的複雑度を段階的に上げる**ことで、学習者が無理なくWebSocketをマスターできる設計

### 環境的制約の活用

制約を**教育的メリット**として活用し、各段階で最適な学習体験を提供

---

## 🌱 **Phase 1: 基礎理解** - GitHub Pages最適化

### 🎯 **開発方針**

**「制約を力に変える」** - GitHub Pagesの制約を活用してWebSocket基礎に集中

### 🔧 **技術的制約**

```typescript
// ✅ 許可される実装パターン
if (typeof window !== 'undefined') {
	const ws = new WebSocket('wss://echo.websocket.org');
}

// ❌ 禁止される実装パターン
const server = new WebSocketServer({ port: 8080 }); // サーバー実装不可
```

### 📋 **Phase 1用コンポーネント実装指針**

```svelte
<!-- Phase1WebSocketDemo.svelte のテンプレート -->
<script>
	// Phase 1 特有のパターン
	let { demoType = 'echo', showCode = false } = $props();

	let connectionState = $state('disconnected');
	let messages = $state([]);
	let inputMessage = $state('');
	let socket = $state(null);

	// Phase 1では単純な状態管理
	let canConnect = $derived(connectionState === 'disconnected');
	let canSend = $derived(connectionState === 'connected' && inputMessage.trim().length > 0);

	// パブリックサービスへの接続のみ
	const DEMO_URLS = {
		echo: 'wss://echo.websocket.org',
		postman: 'wss://ws.postman-echo.com/raw'
	};

	$effect(() => {
		// ブラウザ環境でのみ実行
		if (typeof window === 'undefined') return;

		return () => {
			if (socket) socket.close();
		};
	});

	function connect() {
		if (typeof window === 'undefined') return;

		connectionState = 'connecting';
		socket = new WebSocket(DEMO_URLS[demoType]);

		socket.onopen = () => {
			connectionState = 'connected';
			addMessage('system', 'Connected to WebSocket server');
		};

		socket.onmessage = (event) => {
			addMessage('received', event.data);
		};

		socket.onclose = () => {
			connectionState = 'disconnected';
			addMessage('system', 'Connection closed');
		};

		socket.onerror = () => {
			connectionState = 'error';
			addMessage('error', 'Connection failed');
		};
	}

	function addMessage(type, content) {
		messages = [
			...messages,
			{
				type,
				content,
				timestamp: new Date().toLocaleTimeString()
			}
		];
	}
</script>

<!-- Phase 1では教育的なUIを重視 -->
<div class="websocket-demo">
	<div class="demo-header">
		<h3>WebSocket基本接続デモ - {demoType}</h3>
		<span class="status status-{connectionState}">{connectionState}</span>
	</div>

	<!-- 接続コントロール -->
	<div class="controls">
		<button onclick={connect} disabled={!canConnect}> Connect </button>
		<button onclick={() => socket?.close()} disabled={connectionState !== 'connected'}>
			Disconnect
		</button>
	</div>

	<!-- メッセージ送信（echo typeのみ） -->
	{#if demoType === 'echo' && connectionState === 'connected'}
		<div class="message-input">
			<input
				bind:value={inputMessage}
				placeholder="Type message..."
				onkeydown={(e) => e.key === 'Enter' && canSend && sendMessage()}
			/>
			<button onclick={sendMessage} disabled={!canSend}>Send</button>
		</div>
	{/if}

	<!-- メッセージログ -->
	<div class="message-log">
		{#each messages as message}
			<div class="message message-{message.type}">
				<span class="timestamp">{message.timestamp}</span>
				<span class="content">{message.content}</span>
			</div>
		{/each}
	</div>

	<!-- コード表示（教育用） -->
	{#if showCode}
		<details class="code-example">
			<summary>実装コードを見る</summary>
			<pre><code>{getCodeExample()}</code></pre>
		</details>
	{/if}
</div>
```

### 🎨 **Phase 1設計原則**

- **即座に体験**: 設定なしで動作するデモ
- **可視化重視**: WebSocketの状態変化を明確に表示
- **フォールバック**: 接続失敗時の代替手段
- **教育的UI**: 学習効果を高めるインターフェース

---

## 🔧 **Phase 2: 実装技術** - ローカル開発最適化

### 🎯 **開発方針**

**「プロトコルマスター」** - WebSocketの内部動作を深く理解

### 🏗️ **サーバーサイド実装戦略**

```javascript
// phase2-server/multi-protocol-server.js
class Phase2LearningServer {
	constructor() {
		this.servers = {
			basic: this.createBasicServer(8080),
			graphqlWs: this.createGraphQLWSServer(8081),
			mqtt: this.createMQTTServer(8082),
			binary: this.createBinaryServer(8083)
		};
	}

	createBasicServer(port) {
		const wss = new WebSocket.Server({ port });

		wss.on('connection', (ws) => {
			console.log(`[Basic:${port}] Client connected`);

			// フレーム構造の学習用
			ws.on('message', (data) => {
				// テキストフレーム vs バイナリフレームの処理
				if (data instanceof Buffer) {
					this.handleBinaryFrame(ws, data);
				} else {
					this.handleTextFrame(ws, data.toString());
				}
			});

			// Ping/Pongフレームの学習
			const pingInterval = setInterval(() => {
				if (ws.readyState === WebSocket.OPEN) {
					ws.ping('learning-ping');
				}
			}, 30000);

			ws.on('close', () => {
				clearInterval(pingInterval);
				console.log(`[Basic:${port}] Client disconnected`);
			});
		});

		return wss;
	}

	createGraphQLWSServer(port) {
		const wss = new WebSocket.Server({
			port,
			handleProtocols: (protocols, request) => {
				// サブプロトコル学習用
				console.log('Requested protocols:', protocols);
				return protocols.includes('graphql-ws') ? 'graphql-ws' : false;
			}
		});

		wss.on('connection', (ws, request) => {
			console.log(`[GraphQL-WS:${port}] Protocol: ${ws.protocol}`);

			ws.on('message', (data) => {
				try {
					const message = JSON.parse(data);
					this.handleGraphQLWSMessage(ws, message);
				} catch (error) {
					ws.send(
						JSON.stringify({
							type: 'error',
							payload: { message: 'Invalid JSON' }
						})
					);
				}
			});
		});

		return wss;
	}

	handleGraphQLWSMessage(ws, message) {
		// GraphQL-WS プロトコル仕様に従った処理
		switch (message.type) {
			case 'connection_init':
				ws.send(JSON.stringify({ type: 'connection_ack' }));
				break;
			case 'start':
				// 擬似的なGraphQLサブスクリプション
				this.startSubscription(ws, message.id, message.payload);
				break;
			case 'stop':
				this.stopSubscription(ws, message.id);
				break;
		}
	}
}
```

### 🧪 **Phase 2クライアント実装**

```svelte
<!-- Phase2ProtocolDemo.svelte -->
<script>
	let { protocol = 'basic' } = $props();

	// Phase 2では複雑な状態管理
	let connectionConfig = $state({
		url: getProtocolUrl(protocol),
		protocols: getProtocolList(protocol),
		binaryType: 'arraybuffer'
	});

	let frameStats = $state({
		textFrames: 0,
		binaryFrames: 0,
		pingFrames: 0,
		pongFrames: 0
	});

	let protocolState = $state({
		negotiated: null,
		extensions: [],
		subprotocol: null
	});

	// プロトコル固有の状態
	let subscriptions = $state(new Map());
	let binaryBuffer = $state(new ArrayBuffer(0));

	function getProtocolUrl(protocol) {
		const urls = {
			basic: 'ws://localhost:8080',
			graphqlWs: 'ws://localhost:8081',
			mqtt: 'ws://localhost:8082',
			binary: 'ws://localhost:8083'
		};
		return urls[protocol];
	}

	function getProtocolList(protocol) {
		const protocols = {
			basic: [],
			graphqlWs: ['graphql-ws'],
			mqtt: ['mqtt'],
			binary: []
		};
		return protocols[protocol];
	}

	function createConnection() {
		const ws = new WebSocket(connectionConfig.url, connectionConfig.protocols);
		ws.binaryType = connectionConfig.binaryType;

		ws.onopen = (event) => {
			protocolState.negotiated = ws.protocol;
			protocolState.extensions = ws.extensions ? ws.extensions.split(', ') : [];

			console.log('Protocol negotiated:', ws.protocol);
			console.log('Extensions:', ws.extensions);
		};

		ws.onmessage = (event) => {
			if (event.data instanceof ArrayBuffer) {
				frameStats.binaryFrames++;
				handleBinaryMessage(event.data);
			} else {
				frameStats.textFrames++;
				handleTextMessage(event.data);
			}
		};

		return ws;
	}

	function handleTextMessage(data) {
		if (protocol === 'graphqlWs') {
			try {
				const message = JSON.parse(data);
				handleGraphQLWSMessage(message);
			} catch (error) {
				console.error('Invalid GraphQL-WS message:', error);
			}
		}
	}

	function handleBinaryMessage(buffer) {
		// バイナリフレーム分析
		const view = new DataView(buffer);
		const frameType = view.getUint8(0);

		switch (frameType) {
			case 0x01: // カスタムプロトコル例
				handleCustomBinaryFrame(buffer);
				break;
			default:
				console.log('Unknown binary frame type:', frameType);
		}
	}
</script>

<!-- Phase 2では詳細な分析UIを提供 -->
<div class="protocol-demo">
	<div class="protocol-selector">
		<h3>プロトコル選択</h3>
		<select bind:value={protocol}>
			<option value="basic">Basic WebSocket</option>
			<option value="graphqlWs">GraphQL-WS</option>
			<option value="mqtt">MQTT over WebSocket</option>
			<option value="binary">Binary Protocol</option>
		</select>
	</div>

	<div class="connection-info">
		<h4>接続情報</h4>
		<p>URL: {connectionConfig.url}</p>
		<p>Protocol: {protocolState.negotiated || 'none'}</p>
		<p>Extensions: {protocolState.extensions.join(', ') || 'none'}</p>
	</div>

	<div class="frame-statistics">
		<h4>フレーム統計</h4>
		<table>
			<tr><td>Text frames:</td><td>{frameStats.textFrames}</td></tr>
			<tr><td>Binary frames:</td><td>{frameStats.binaryFrames}</td></tr>
			<tr><td>Ping frames:</td><td>{frameStats.pingFrames}</td></tr>
			<tr><td>Pong frames:</td><td>{frameStats.pongFrames}</td></tr>
		</table>
	</div>

	<!-- プロトコル固有のコントロール -->
	{#if protocol === 'graphqlWs'}
		<GraphQLWSControls bind:subscriptions />
	{:else if protocol === 'mqtt'}
		<MQTTControls />
	{:else if protocol === 'binary'}
		<BinaryProtocolControls bind:binaryBuffer />
	{/if}
</div>
```

---

## 🧪 **Phase 3: テスト・評価** - 品質保証特化

### 🎯 **開発方針**

**「プロダクション品質」** - 実用レベルの堅牢性を追求

### 🔧 **テスト環境構築**

```typescript
// tests/websocket-test-utils.ts
export class WebSocketTestHarness {
	private testServer: WebSocketTestServer;
	private mockClients: Map<string, MockWebSocketClient>;

	constructor(config: TestConfig) {
		this.testServer = new WebSocketTestServer(config.port);
		this.mockClients = new Map();
	}

	async setupScenario(scenario: TestScenario): Promise<void> {
		await this.testServer.loadScenario(scenario);

		// 複数クライアントの同期テスト
		for (const clientConfig of scenario.clients) {
			const client = new MockWebSocketClient(clientConfig);
			this.mockClients.set(clientConfig.id, client);
		}
	}

	async simulateNetworkConditions(conditions: NetworkConditions): Promise<void> {
		await this.testServer.setLatency(conditions.latency);
		await this.testServer.setPacketLoss(conditions.packetLoss);
		await this.testServer.setBandwidth(conditions.bandwidth);
	}

	async verifySequence(expectedSequence: MessageSequence[]): Promise<TestResult> {
		const actualSequence = await this.collectMessageSequence();
		return this.compareSequences(expectedSequence, actualSequence);
	}
}

// tests/websocket-integration.test.ts
describe('WebSocket Integration Tests', () => {
	let testHarness: WebSocketTestHarness;

	beforeEach(async () => {
		testHarness = new WebSocketTestHarness({ port: 9999 });
		await testHarness.start();
	});

	afterEach(async () => {
		await testHarness.stop();
	});

	describe('Connection Management', () => {
		test('handles concurrent connections', async () => {
			await testHarness.setupScenario({
				name: 'concurrent-connections',
				clients: Array.from({ length: 100 }, (_, i) => ({
					id: `client-${i}`,
					connectDelay: i * 10 // Staggered connections
				}))
			});

			const results = await testHarness.executeScenario();
			expect(results.allConnected).toBe(true);
			expect(results.connectionTime).toBeLessThan(5000);
		});

		test('recovers from server restart', async () => {
			const client = await testHarness.createClient('resilient-client');
			await client.connect();

			// サーバー再起動をシミュレート
			await testHarness.restartServer();

			// クライアントの自動再接続を確認
			await testHarness.waitForReconnection(client, { timeout: 10000 });
			expect(client.isConnected()).toBe(true);
		});
	});

	describe('Message Ordering', () => {
		test('preserves message order under load', async () => {
			const client = await testHarness.createClient('order-test');
			await client.connect();

			// 1000件のメッセージを高速送信
			const messages = Array.from({ length: 1000 }, (_, i) => ({
				id: i,
				content: `Message ${i}`,
				timestamp: Date.now() + i
			}));

			await client.sendBatch(messages);
			const received = await client.waitForMessages(1000);

			// 順序保証の確認
			for (let i = 0; i < received.length; i++) {
				expect(received[i].id).toBe(i);
			}
		});
	});

	describe('Error Handling', () => {
		test('handles malformed messages gracefully', async () => {
			const client = await testHarness.createClient('error-test');
			await client.connect();

			// 不正なJSONを送信
			await client.sendRaw('invalid json {{{');

			// エラーレスポンスの確認
			const errorResponse = await client.waitForMessage({ timeout: 1000 });
			expect(errorResponse.type).toBe('error');
			expect(errorResponse.code).toBe('INVALID_JSON');

			// 接続が維持されていることを確認
			expect(client.isConnected()).toBe(true);
		});
	});
});
```

---

## 🚀 **Phase 4: 実践開発** - 本番環境最適化

### 🎯 **開発方針**

**「エンタープライズグレード」** - 実際のプロダクションで使える品質

### ☁️ **クラウドアーキテクチャ**

```typescript
// Phase 4A: Vercel チャットアプリ
// api/websocket.js
import { Server } from 'socket.io';
import Redis from 'ioredis';

export default function handler(req, res) {
	if (!res.socket.server.io) {
		const io = new Server(res.socket.server, {
			path: '/api/websocket',
			cors: {
				origin:
					process.env.NODE_ENV === 'production' ? process.env.VERCEL_URL : 'http://localhost:5173'
			}
		});

		// Redis Cluster for horizontal scaling
		const redis = new Redis.Cluster(
			[
				{
					host: process.env.REDIS_HOST,
					port: process.env.REDIS_PORT
				}
			],
			{
				redisOptions: {
					password: process.env.REDIS_PASSWORD
				}
			}
		);

		// Production-grade message handling
		io.on('connection', (socket) => {
			// Rate limiting
			const rateLimiter = new RateLimiter({
				windowMs: 15 * 60 * 1000, // 15 minutes
				max: 100 // limit each IP to 100 requests per windowMs
			});

			socket.use(async (packet, next) => {
				const allowed = await rateLimiter.check(socket.handshake.address);
				if (allowed) {
					next();
				} else {
					next(new Error('Rate limit exceeded'));
				}
			});

			// Message persistence
			socket.on('chat-message', async (data) => {
				try {
					// Validate message schema
					const validatedData = await validateChatMessage(data);

					// Store in Redis with TTL
					await redis.setex(
						`msg:${validatedData.id}`,
						86400, // 24 hours
						JSON.stringify(validatedData)
					);

					// Broadcast to room
					io.to(validatedData.roomId).emit('chat-message', validatedData);

					// Update room activity
					await redis.zadd(`room:${validatedData.roomId}:activity`, Date.now(), socket.id);
				} catch (error) {
					socket.emit('error', {
						type: 'MESSAGE_VALIDATION_ERROR',
						message: error.message
					});
				}
			});
		});

		res.socket.server.io = io;
	}

	res.end();
}

// Phase 4B: Railway 共同編集システム
// server/collaborative-server.js
class ProductionCollaborativeServer {
	constructor() {
		this.redis = new Redis(process.env.REDIS_URL);
		this.metrics = new PrometheusMetrics();
		this.setupCluster();
	}

	setupCluster() {
		if (cluster.isMaster) {
			// Master process: health checks, metrics collection
			this.startHealthCheckServer();
			this.startMetricsServer();

			// Fork workers
			for (let i = 0; i < os.cpus().length; i++) {
				cluster.fork();
			}

			cluster.on('exit', (worker, code, signal) => {
				console.log(`Worker ${worker.process.pid} died. Restarting...`);
				cluster.fork();
			});
		} else {
			// Worker process: handle WebSocket connections
			this.startWebSocketServer();
		}
	}

	startWebSocketServer() {
		const wss = new WebSocket.Server({
			port: process.env.PORT || 8080,
			perMessageDeflate: {
				// Optimize for large documents
				threshold: 1024,
				zlibDeflateOptions: {
					chunkSize: 16 * 1024,
					windowBits: 15,
					level: 3
				}
			},
			maxPayload: 1024 * 1024 // 1MB max message size
		});

		wss.on('connection', (ws, request) => {
			// Connection monitoring
			this.metrics.incrementConnectionCount();

			// Authenticate connection
			this.authenticateConnection(ws, request)
				.then((user) => {
					ws.userId = user.id;
					ws.permissions = user.permissions;
					this.handleAuthenticatedConnection(ws);
				})
				.catch((error) => {
					ws.close(1008, 'Authentication failed');
				});
		});
	}

	async handleTextOperation(ws, operation) {
		const startTime = Date.now();

		try {
			// Distributed locking for consistency
			const lockKey = `lock:doc:${operation.documentId}`;
			const lock = await this.redis.set(lockKey, ws.userId, 'PX', 5000, 'NX');

			if (!lock) {
				throw new Error('Document locked by another operation');
			}

			// Apply operational transformation
			const transformedOp = await this.transformOperation(operation);

			// Persist to distributed storage
			await this.persistOperation(transformedOp);

			// Broadcast to all connected clients
			this.broadcastOperation(transformedOp);

			// Release lock
			await this.redis.del(lockKey);

			// Record metrics
			this.metrics.recordOperationLatency(Date.now() - startTime);
		} catch (error) {
			this.metrics.incrementErrorCount();
			ws.send(
				JSON.stringify({
					type: 'operation-error',
					error: error.message
				})
			);
		}
	}
}
```

### 📊 **Phase 4監視・運用**

```typescript
// monitoring/websocket-metrics.ts
export class WebSocketMetrics {
	private promClient = require('prom-client');

	constructor() {
		this.connectionGauge = new this.promClient.Gauge({
			name: 'websocket_connections_active',
			help: 'Number of active WebSocket connections'
		});

		this.messageCounter = new this.promClient.Counter({
			name: 'websocket_messages_total',
			help: 'Total number of WebSocket messages',
			labelNames: ['type', 'status']
		});

		this.latencyHistogram = new this.promClient.Histogram({
			name: 'websocket_operation_duration_seconds',
			help: 'WebSocket operation duration',
			labelNames: ['operation'],
			buckets: [0.001, 0.01, 0.1, 1, 5, 10]
		});
	}

	recordConnection() {
		this.connectionGauge.inc();
	}

	recordDisconnection() {
		this.connectionGauge.dec();
	}

	recordMessage(type: string, status: 'success' | 'error') {
		this.messageCounter.inc({ type, status });
	}

	recordOperationLatency(operation: string, durationMs: number) {
		this.latencyHistogram.labels({ operation }).observe(durationMs / 1000);
	}
}
```

---

## 🎯 **Claude Code実装指針まとめ**

### 🔄 **Phase間の設計一貫性**

1. **型安全性**: 全Phaseで完全なTypeScript対応
2. **Svelte 5準拠**: 全Phaseでrunes使用
3. **段階的複雑度**: Phase進行に伴う自然な機能拡張
4. **教育的価値**: 各Phaseで学習目標に最適化

### 📋 **Phase別チェックリスト**

#### Phase 1

- ✅ GitHub Pages互換（サーバーレス）
- ✅ パブリックWebSocketサービス利用
- ✅ 教育的UI/UX
- ✅ SSR対応

#### Phase 2

- ✅ ローカルサーバー実装
- ✅ 複数プロトコル対応
- ✅ フレーム分析機能
- ✅ Docker統合

#### Phase 3

- ✅ 包括的テストスイート
- ✅ モック・スタブ活用
- ✅ パフォーマンステスト
- ✅ エラーシナリオ検証

#### Phase 4

- ✅ 本番環境デプロイ
- ✅ スケーラビリティ対応
- ✅ 監視・ログ統合
- ✅ セキュリティ実装

この段階的アプローチにより、学習者は確実にWebSocketの専門知識を身につけ、実用的なアプリケーション開発スキルを習得できます。

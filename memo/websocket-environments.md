# WebSocket環境戦略の技術的詳細

> このドキュメントは、各Phase環境の技術的詳細と実装上の考慮事項をまとめています。

## 🎯 環境戦略の設計思想

### 段階的複雑度の管理

各Phaseで**技術的制約を意図的に設計**し、学習者が段階的にWebSocketの理解を深められる環境を提供

### 教育効果の最大化

制約を**学習のメリット**として活用し、各段階で最も効果的な学習体験を実現

---

## 🌱 **Phase 1: GitHub Pages + パブリックWebSocketサービス**

### 🏗️ アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Pages                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │           SvelteKit Static Site                     ││
│  │  ┌─────────────────┐  ┌─────────────────────────────┤│
│  │  │   Learning      │  │     Interactive Demos      ││
│  │  │   Content       │  │                             ││
│  │  │   (.svx)        │  │  ┌─────────────────────────┤│
│  │  │                 │  │  │    WebSocket Demo       ││
│  │  │  • 基本概念     │  │  │                         ││
│  │  │  • プロトコル   │  │  │  Browser WebSocket API  ││
│  │  │  • 利用例       │  │  │          ↓              ││
│  │  │                 │  │  │  wss://echo.websocket   ││
│  │  └─────────────────┘  │  │        .org             ││
│  └─────────────────────────┤  └─────────────────────────┤│
│                           └─────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                                    ↓ HTTPS/WSS
┌─────────────────────────────────────────────────────────┐
│                パブリック WebSocket サービス               │
│                                                         │
│  • echo.websocket.org          (エコーテスト)           │
│  • ws.postman-echo.com        (API テスト)             │
│  • socketsbay.com             (学習用サービス)          │
│  • websocket.org test servers (標準準拠テスト)          │
└─────────────────────────────────────────────────────────┘
```

### 🔧 技術実装詳細

#### **WebSocket URL マネージャー**

```typescript
// src/lib/utils/phase1-websocket-urls.ts
export interface PublicWebSocketService {
	name: string;
	url: string;
	description: string;
	features: string[];
	reliability: 'high' | 'medium' | 'low';
	latency: 'low' | 'medium' | 'high';
}

export const PUBLIC_WEBSOCKET_SERVICES: PublicWebSocketService[] = [
	{
		name: 'Echo WebSocket',
		url: 'wss://echo.websocket.org',
		description: 'Simple echo server for basic testing',
		features: ['echo', 'connection-test', 'message-round-trip'],
		reliability: 'high',
		latency: 'low'
	},
	{
		name: 'Postman Echo',
		url: 'wss://ws.postman-echo.com/raw',
		description: 'Postman WebSocket echo service',
		features: ['echo', 'headers-inspection', 'json-support'],
		reliability: 'high',
		latency: 'medium'
	},
	{
		name: 'SocketsBay Demo',
		url: 'wss://socketsbay.com/wss/v2/1/demo/',
		description: 'Educational WebSocket service',
		features: ['multi-client', 'broadcasting', 'room-concept'],
		reliability: 'medium',
		latency: 'medium'
	}
];

export class Phase1WebSocketManager {
	private currentService: PublicWebSocketService | null = null;
	private socket: WebSocket | null = null;
	private fallbackIndex = 0;

	async connectToService(serviceName: string): Promise<WebSocket> {
		const service = PUBLIC_WEBSOCKET_SERVICES.find((s) => s.name === serviceName);
		if (!service) {
			throw new Error(`Service ${serviceName} not found`);
		}

		return this.connectWithFallback(service);
	}

	private async connectWithFallback(
		service: PublicWebSocketService,
		attempt = 0
	): Promise<WebSocket> {
		try {
			return await this.createConnection(service.url);
		} catch (error) {
			if (attempt < PUBLIC_WEBSOCKET_SERVICES.length - 1) {
				console.warn(`Failed to connect to ${service.name}, trying fallback...`);
				const fallbackService = PUBLIC_WEBSOCKET_SERVICES[attempt + 1];
				return this.connectWithFallback(fallbackService, attempt + 1);
			}
			throw new Error('All public WebSocket services unavailable');
		}
	}

	private createConnection(url: string): Promise<WebSocket> {
		return new Promise((resolve, reject) => {
			const ws = new WebSocket(url);
			const timeout = setTimeout(() => {
				ws.close();
				reject(new Error('Connection timeout'));
			}, 10000);

			ws.onopen = () => {
				clearTimeout(timeout);
				this.socket = ws;
				resolve(ws);
			};

			ws.onerror = () => {
				clearTimeout(timeout);
				reject(new Error('Connection failed'));
			};
		});
	}
}
```

#### **SSR対応パターン**

```typescript
// src/lib/components/Phase1WebSocketDemo.svelte
<script>
  import { browser } from '$app/environment';
  import { Phase1WebSocketManager } from '$lib/utils/phase1-websocket-urls.js';

  let { serviceName = 'Echo WebSocket' } = $props();

  // SSR-safe state management
  let wsManager = $state(null);
  let connectionState = $state('disconnected');
  let isClient = $state(false);

  // Browser environment detection
  $effect(() => {
    if (browser) {
      isClient = true;
      wsManager = new Phase1WebSocketManager();
    }
  });

  async function connect() {
    if (!browser || !wsManager) {
      console.warn('WebSocket only available in browser environment');
      return;
    }

    try {
      connectionState = 'connecting';
      const socket = await wsManager.connectToService(serviceName);
      connectionState = 'connected';

      socket.onclose = () => {
        connectionState = 'disconnected';
      };

      socket.onerror = () => {
        connectionState = 'error';
      };
    } catch (error) {
      connectionState = 'error';
      console.error('Connection failed:', error);
    }
  }
</script>

<!-- Graceful degradation for SSR -->
{#if isClient}
  <div class="websocket-demo">
    <h3>WebSocket Demo: {serviceName}</h3>
    <p>Status: {connectionState}</p>
    <button onclick={connect} disabled={connectionState === 'connecting'}>
      Connect
    </button>
  </div>
{:else}
  <div class="websocket-demo-placeholder">
    <h3>WebSocket Demo: {serviceName}</h3>
    <p>Loading interactive demo...</p>
  </div>
{/if}
```

### 📊 **Phase 1の制約とメリット**

#### ⚠️ **制約事項**

- サーバーサイド実装不可
- WebSocketサーバーのカスタマイズ不可
- デバッグ情報の制限
- 外部サービス依存によるレイテンシー

#### ✅ **教育的メリット**

- **即座の学習開始**: 環境構築不要
- **プロトコル標準への集中**: 基本仕様の理解
- **クライアント実装の習得**: ブラウザAPI完全理解
- **デプロイ体験**: 静的サイトホスティング

---

## 🔧 **Phase 2: ローカル開発 + Docker環境**

### 🏗️ アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│                  Development Environment                │
│                                                         │
│  ┌─────────────────┐    ┌───────────────────────────────┤
│  │   SvelteKit     │    │     Local WebSocket Servers  ││
│  │   Frontend      │    │                               ││
│  │                 │    │  ┌─────────────────────────────┤│
│  │  localhost:5173 │────┼─→│ Basic WS Server :8080       ││
│  │                 │    │  │ • Frame analysis            ││
│  │                 │    │  │ • Protocol debugging       ││
│  │                 │    │  │ • Binary data handling     ││
│  │                 │    │  └─────────────────────────────┤│
│  │                 │    │  ┌─────────────────────────────┤│
│  │                 │────┼─→│ GraphQL-WS Server :8081     ││
│  │                 │    │  │ • Subprotocol negotiation   ││
│  │                 │    │  │ • Subscription management   ││
│  │                 │    │  └─────────────────────────────┤│
│  │                 │    │  ┌─────────────────────────────┤│
│  │                 │────┼─→│ MQTT Server :8082           ││
│  │                 │    │  │ • Topic-based messaging     ││
│  │                 │    │  │ • QoS handling              ││
│  └─────────────────┘    │  └─────────────────────────────┤│
│                         │  ┌─────────────────────────────┤│
│                         └─→│ Redis :6379                 ││
│                            │ • Message persistence       ││
│                            │ • Pub/Sub messaging         ││
│                            └─────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 🐳 **Docker Compose 設定**

```yaml
# websocket-learning-apps/docker-compose.yml
version: '3.8'

services:
  # 基本WebSocketサーバー
  websocket-basic:
    build:
      context: ./phase2-server
      dockerfile: Dockerfile.basic
    ports:
      - '8080:8080'
    environment:
      - SERVER_TYPE=basic
      - DEBUG=websocket:*
    volumes:
      - ./phase2-server/logs:/app/logs
    healthcheck:
      test: ['CMD', 'nc', '-z', 'localhost', '8080']
      interval: 30s
      timeout: 10s
      retries: 3

  # GraphQL-WS サブプロトコルサーバー
  websocket-graphql:
    build:
      context: ./phase2-server
      dockerfile: Dockerfile.graphql
    ports:
      - '8081:8081'
    environment:
      - SERVER_TYPE=graphql-ws
      - GRAPHQL_ENDPOINT=http://localhost:4000/graphql
    depends_on:
      - redis
    healthcheck:
      test: ['CMD', 'nc', '-z', 'localhost', '8081']
      interval: 30s
      timeout: 10s
      retries: 3

  # MQTT over WebSocket サーバー
  websocket-mqtt:
    build:
      context: ./phase2-server
      dockerfile: Dockerfile.mqtt
    ports:
      - '8082:8082'
    environment:
      - SERVER_TYPE=mqtt
      - MQTT_BROKER_URL=mqtt://mosquitto:1883
    depends_on:
      - mosquitto
      - redis

  # Redis (メッセージング・キャッシュ)
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  # MQTT Broker (Mosquitto)
  mosquitto:
    image: eclipse-mosquitto:2
    ports:
      - '1883:1883'
      - '9001:9001'
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - mosquitto_data:/mosquitto/data
      - mosquitto_logs:/mosquitto/log

  # 開発用フロントエンド (オプション)
  frontend-dev:
    build:
      context: ../websocket-learning
      dockerfile: Dockerfile.dev
    ports:
      - '5173:5173'
    volumes:
      - ../websocket-learning:/app
      - /app/node_modules
    environment:
      - VITE_WS_BASIC_URL=ws://localhost:8080
      - VITE_WS_GRAPHQL_URL=ws://localhost:8081
      - VITE_WS_MQTT_URL=ws://localhost:8082

volumes:
  redis_data:
  mosquitto_data:
  mosquitto_logs:

networks:
  default:
    driver: bridge
```

### 🔧 **プロトコル実装詳細**

#### **GraphQL-WS サブプロトコル**

```javascript
// phase2-server/src/graphql-ws-server.js
const WebSocket = require('ws');
const { execute, subscribe, parse, validate } = require('graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');

class GraphQLWSServer {
	constructor(port = 8081) {
		this.port = port;
		this.schema = this.createSchema();
		this.subscriptions = new Map();
		this.setupServer();
	}

	setupServer() {
		this.wss = new WebSocket.Server({
			port: this.port,
			handleProtocols: (protocols, request) => {
				// GraphQL-WS プロトコル交渉
				console.log('Requested protocols:', protocols);
				if (protocols.includes('graphql-ws')) {
					return 'graphql-ws';
				}
				return false;
			}
		});

		this.wss.on('connection', (ws, request) => {
			console.log(`GraphQL-WS connection established. Protocol: ${ws.protocol}`);

			ws.on('message', (data) => {
				try {
					const message = JSON.parse(data);
					this.handleMessage(ws, message);
				} catch (error) {
					this.sendError(ws, null, 'Invalid JSON');
				}
			});

			ws.on('close', () => {
				// クリーンアップ: アクティブなサブスクリプションを停止
				this.cleanupSubscriptions(ws);
			});
		});
	}

	handleMessage(ws, message) {
		const { id, type, payload } = message;

		switch (type) {
			case 'connection_init':
				// 接続初期化
				this.sendMessage(ws, { type: 'connection_ack' });
				break;

			case 'start':
				// GraphQLクエリ/サブスクリプション開始
				this.handleStart(ws, id, payload);
				break;

			case 'stop':
				// サブスクリプション停止
				this.handleStop(ws, id);
				break;

			case 'connection_terminate':
				// 接続終了
				ws.close();
				break;

			default:
				this.sendError(ws, id, `Unknown message type: ${type}`);
		}
	}

	async handleStart(ws, id, payload) {
		try {
			const { query, variables, operationName } = payload;
			const document = parse(query);
			const validationErrors = validate(this.schema, document);

			if (validationErrors.length > 0) {
				this.sendError(ws, id, 'Query validation failed');
				return;
			}

			// サブスクリプションかクエリかを判定
			const operationAST = document.definitions.find((def) => def.kind === 'OperationDefinition');

			if (operationAST.operation === 'subscription') {
				// サブスクリプション処理
				const iterator = await subscribe({
					schema: this.schema,
					document,
					variableValues: variables,
					operationName
				});

				// サブスクリプションを記録
				this.subscriptions.set(id, { ws, iterator });

				// 非同期でデータを送信
				this.handleSubscription(id, iterator);
			} else {
				// 通常のクエリ/ミューテーション
				const result = await execute({
					schema: this.schema,
					document,
					variableValues: variables,
					operationName
				});

				this.sendMessage(ws, {
					id,
					type: 'data',
					payload: result
				});

				this.sendMessage(ws, {
					id,
					type: 'complete'
				});
			}
		} catch (error) {
			this.sendError(ws, id, error.message);
		}
	}

	async handleSubscription(id, iterator) {
		for await (const result of iterator) {
			const subscription = this.subscriptions.get(id);
			if (!subscription) break;

			this.sendMessage(subscription.ws, {
				id,
				type: 'data',
				payload: result
			});
		}

		this.sendMessage(this.subscriptions.get(id)?.ws, {
			id,
			type: 'complete'
		});

		this.subscriptions.delete(id);
	}

	createSchema() {
		const typeDefs = `
      type Query {
        hello: String
        currentTime: String
      }

      type Subscription {
        timeUpdates: String
        messageUpdates: Message
      }

      type Message {
        id: ID!
        content: String!
        timestamp: String!
      }
    `;

		const resolvers = {
			Query: {
				hello: () => 'Hello from GraphQL-WS!',
				currentTime: () => new Date().toISOString()
			},
			Subscription: {
				timeUpdates: {
					subscribe: async function* () {
						while (true) {
							yield { timeUpdates: new Date().toISOString() };
							await new Promise((resolve) => setTimeout(resolve, 1000));
						}
					}
				},
				messageUpdates: {
					subscribe: async function* () {
						let counter = 0;
						while (true) {
							yield {
								messageUpdates: {
									id: `msg_${counter++}`,
									content: `Message ${counter}`,
									timestamp: new Date().toISOString()
								}
							};
							await new Promise((resolve) => setTimeout(resolve, 2000));
						}
					}
				}
			}
		};

		return makeExecutableSchema({ typeDefs, resolvers });
	}
}

module.exports = GraphQLWSServer;
```

### 📊 **Phase 2の学習効果**

#### 🎯 **技術習得項目**

- WebSocketフレーム構造の理解
- サブプロトコル交渉メカニズム
- バイナリデータ処理パターン
- 接続プール管理
- プロトコルデバッグ技法

#### 🔧 **実装スキル**

- Node.js WebSocketサーバー構築
- Docker環境での開発
- 複数プロトコル同時運用
- Redis統合メッセージング

---

## 🧪 **Phase 3: テスト統合環境**

### 🏗️ アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│                  Test Environment                       │
│                                                         │
│  ┌─────────────────┐    ┌───────────────────────────────┤
│  │     Vitest      │    │    WebSocket Test Servers    ││
│  │  Unit Testing   │    │                               ││
│  │                 │    │  ┌─────────────────────────────┤│
│  │  • Component    │────┼─→│ Mock WS Server :9999        ││
│  │    testing      │    │  │ • Controlled responses      ││
│  │  • Store        │    │  │ • Error simulation          ││
│  │    testing      │    │  │ • Latency simulation        ││
│  │  • Utility      │    │  └─────────────────────────────┤│
│  │    testing      │    │  ┌─────────────────────────────┤│
│  └─────────────────┘    │  │ Load Test Server :9998      ││
│                         │  │ • Concurrent connections    ││
│  ┌─────────────────┐    │  │ • Performance metrics       ││
│  │   Playwright    │────┼─→│ • Resource monitoring       ││
│  │   E2E Testing   │    │  └─────────────────────────────┤│
│  │                 │    │  ┌─────────────────────────────┤│
│  │  • User flows   │    │  │ Chaos Test Server :9997     ││
│  │  • Integration  │────┼─→│ • Network partitions        ││
│  │  • Cross-browser│    │  │ • Random disconnections     ││
│  │  • Performance  │    │  │ • Message corruption        ││
│  └─────────────────┘    │  └─────────────────────────────┤│
│                         └─────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 🔧 **テストサーバー実装**

#### **Chaos Engineering WebSocket Server**

```javascript
// tests/servers/chaos-websocket-server.js
class ChaosWebSocketServer {
	constructor(port = 9997) {
		this.port = port;
		this.chaosConfig = {
			disconnectionRate: 0.05, // 5% chance of random disconnection
			messageCorruptionRate: 0.02, // 2% chance of message corruption
			latencyInjection: {
				enabled: true,
				minDelay: 100,
				maxDelay: 2000,
				probability: 0.1
			},
			networkPartition: {
				enabled: false,
				duration: 5000
			}
		};
		this.setupServer();
	}

	setupServer() {
		this.wss = new WebSocket.Server({ port: this.port });

		this.wss.on('connection', (ws) => {
			console.log(`Chaos server: Client connected`);

			// ランダム切断タイマー
			this.scheduleRandomDisconnection(ws);

			ws.on('message', async (data) => {
				await this.handleMessage(ws, data);
			});

			ws.on('close', () => {
				console.log(`Chaos server: Client disconnected`);
			});
		});
	}

	async handleMessage(ws, data) {
		// ネットワーク分断シミュレーション
		if (this.chaosConfig.networkPartition.enabled) {
			console.log('Network partition active - dropping message');
			return;
		}

		// レイテンシー注入
		if (this.shouldInjectLatency()) {
			const delay = this.generateRandomDelay();
			console.log(`Injecting ${delay}ms latency`);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}

		// メッセージ破損シミュレーション
		let processedData = data;
		if (this.shouldCorruptMessage()) {
			processedData = this.corruptMessage(data);
			console.log('Message corrupted');
		}

		// エコー送信（破損または正常）
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(processedData);
		}
	}

	scheduleRandomDisconnection(ws) {
		if (Math.random() < this.chaosConfig.disconnectionRate) {
			const disconnectTime = Math.random() * 30000 + 5000; // 5-35秒後
			setTimeout(() => {
				if (ws.readyState === WebSocket.OPEN) {
					console.log('Chaos server: Random disconnection triggered');
					ws.close(1006, 'Random disconnection');
				}
			}, disconnectTime);
		}
	}

	shouldInjectLatency() {
		return (
			this.chaosConfig.latencyInjection.enabled &&
			Math.random() < this.chaosConfig.latencyInjection.probability
		);
	}

	generateRandomDelay() {
		const { minDelay, maxDelay } = this.chaosConfig.latencyInjection;
		return Math.floor(Math.random() * (maxDelay - minDelay) + minDelay);
	}

	shouldCorruptMessage() {
		return Math.random() < this.chaosConfig.messageCorruptionRate;
	}

	corruptMessage(data) {
		if (typeof data === 'string') {
			// テキストメッセージの破損
			const chars = data.split('');
			const corruptIndex = Math.floor(Math.random() * chars.length);
			chars[corruptIndex] = String.fromCharCode(Math.floor(Math.random() * 126) + 32);
			return chars.join('');
		} else {
			// バイナリメッセージの破損
			const buffer = Buffer.from(data);
			const corruptIndex = Math.floor(Math.random() * buffer.length);
			buffer[corruptIndex] = Math.floor(Math.random() * 256);
			return buffer;
		}
	}

	// Chaos設定の動的変更
	updateChaosConfig(newConfig) {
		this.chaosConfig = { ...this.chaosConfig, ...newConfig };
		console.log('Chaos configuration updated:', this.chaosConfig);
	}

	// ネットワーク分断の開始/停止
	triggerNetworkPartition(duration = 5000) {
		console.log(`Network partition triggered for ${duration}ms`);
		this.chaosConfig.networkPartition.enabled = true;

		setTimeout(() => {
			this.chaosConfig.networkPartition.enabled = false;
			console.log('Network partition ended');
		}, duration);
	}
}

module.exports = ChaosWebSocketServer;
```

### 📊 **Phase 3の品質保証効果**

#### 🔍 **テストカバレッジ項目**

- 接続・切断の耐性テスト
- メッセージ順序保証の検証
- エラー処理の包括的テスト
- パフォーマンス・負荷テスト
- ネットワーク障害シミュレーション

#### 🛡️ **プロダクション準備**

- 障害復旧メカニズムの検証
- リソースリーク検出
- セキュリティ脆弱性テスト
- 国際化・アクセシビリティ対応

---

## 🚀 **Phase 4: 本番環境 (Vercel + Railway)**

### 🏗️ アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────┐
│                   Production Environment                │
│                                                         │
│  ┌─────────────────┐    ┌───────────────────────────────┤
│  │     Vercel      │    │        Railway                ││
│  │   (Chat App)    │    │  (Collaborative Editor)      ││
│  │                 │    │                               ││
│  │  ┌─────────────┤│    │  ┌─────────────────────────────┤│
│  │  │ SvelteKit   ││    │  │ Node.js WebSocket Server   ││
│  │  │ Static Site ││    │  │                             ││
│  │  │             ││    │  │  • Clustered processes     ││
│  │  │ /api/       ││    │  │  • Redis pub/sub           ││
│  │  │ websocket.js││────┼──┼─→│ • Health monitoring      ││
│  │  │             ││    │  │  • Prometheus metrics      ││
│  │  │ Socket.IO   ││    │  │  • Auto-scaling            ││
│  │  │ Server      ││    │  └─────────────────────────────┤│
│  │  └─────────────┤│    └─────────────────────────────────┤│
│  └─────────────────┘                                    │
│           │                                             │
│           ▼                                             │
│  ┌─────────────────┐    ┌───────────────────────────────┤
│  │   Redis Cloud   │    │     Monitoring Stack         ││
│  │                 │    │                               ││
│  │  • 30MB Free    │    │  ┌─────────────────────────────┤│
│  │  • Pub/Sub      │────┼─→│ Uptime Robot (Monitoring)   ││
│  │  • Session      │    │  │ • Endpoint health checks    ││
│  │  • Cache        │    │  │ • SSL certificate monitor  ││
│  │  • Persistence  │    │  │ • Performance alerts       ││
│  └─────────────────┘    │  └─────────────────────────────┤│
│                         │  ┌─────────────────────────────┤│
│                         └─→│ Sentry (Error Tracking)     ││
│                            │ • Real-time error reports   ││
│                            │ • Performance monitoring    ││
│                            │ • User session replay       ││
│                            └─────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### ☁️ **Vercel最適化設定**

```json
// vercel.json - 本番環境設定
{
	"version": 2,
	"functions": {
		"api/websocket.js": {
			"runtime": "@vercel/node@18.x",
			"maxDuration": 300
		}
	},
	"builds": [
		{
			"src": "package.json",
			"use": "@vercel/static-build",
			"config": {
				"distDir": "build"
			}
		}
	],
	"routes": [
		{
			"src": "/api/(.*)",
			"dest": "/api/$1"
		},
		{
			"handle": "filesystem"
		},
		{
			"src": "/.*",
			"dest": "/index.html"
		}
	],
	"env": {
		"REDIS_URL": "@redis_url",
		"WEBSOCKET_SECRET": "@websocket_secret",
		"SENTRY_DSN": "@sentry_dsn"
	},
	"headers": [
		{
			"source": "/api/websocket",
			"headers": [
				{
					"key": "Access-Control-Allow-Origin",
					"value": "*"
				},
				{
					"key": "Access-Control-Allow-Methods",
					"value": "GET, POST, OPTIONS"
				},
				{
					"key": "Access-Control-Allow-Headers",
					"value": "Content-Type, Authorization"
				}
			]
		}
	]
}
```

### 📊 **Phase 4の本番運用効果**

#### 🏭 **エンタープライズ級機能**

- 水平スケーリング対応
- 高可用性アーキテクチャ
- リアルタイム監視・アラート
- 障害自動復旧機能
- セキュリティ強化

#### 💼 **ビジネス価値**

- 実プロダクト運用経験
- パフォーマンス最適化スキル
- 運用コスト最適化
- ユーザー体験向上ノウハウ

---

## 🎯 **環境戦略の成功指標**

### 📈 **学習効果測定**

#### **Phase 1 → Phase 2 移行時**

- WebSocket基本API理解度: 90%以上
- プロトコル仕様理解度: 80%以上
- デバッグスキル習得度: 70%以上

#### **Phase 2 → Phase 3 移行時**

- サーバー実装スキル: 85%以上
- サブプロトコル理解度: 80%以上
- パフォーマンス分析スキル: 75%以上

#### **Phase 3 → Phase 4 移行時**

- テスト設計スキル: 90%以上
- 品質保証プロセス理解: 85%以上
- 障害対応スキル: 80%以上

#### **Phase 4 完了時**

- 本番運用スキル: 95%以上
- スケーラビリティ設計: 85%以上
- セキュリティ実装: 90%以上

### 🏆 **最終達成目標**

学習者が**WebSocket技術の専門家**として、実際のプロダクション環境で通用するスキルセットを完全習得し、企業での即戦力となることを目指します。

この段階的環境戦略により、理論と実践を効果的に組み合わせた学習体験を提供し、確実にWebSocketアプリケーション開発の専門知識を身につけることができます。

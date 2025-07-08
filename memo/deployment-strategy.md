# WebSocket学習プロジェクト デプロイメント戦略

> このドキュメントは、学習サイトと実践アプリケーションの包括的なデプロイメント戦略を定義します。

## 🎯 デプロイメント戦略の基本方針

### 段階的デプロイメント

**学習進度に応じた適切なホスティング環境**を提供し、最終的に本格的なクラウド運用まで体験

### コスト効率性

**無料枠を最大活用**しつつ、必要に応じてスケールアップできる設計

### 教育効果の最大化

**実際のデプロイメント体験**を通じて、DevOps・インフラスキルも習得

---

## 📚 **学習サイト (websocket-learning) のデプロイメント**

### 🌐 **GitHub Pages (メイン運用)**

#### デプロイメント構成

```yaml
# .github/workflows/deploy-github-pages.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build with SvelteKit
        run: npm run build
        env:
          BASE_PATH: ${{ github.event.repository.name != github.event.repository.owner.login && format('/{0}', github.event.repository.name) || '' }}

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: build/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

#### 設定ファイル調整

```javascript
// svelte.config.js - GitHub Pages対応
import adapter from '@sveltejs/adapter-static';

const dev = process.argv.includes('dev');

const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: null,
      precompress: false,
      strict: true
    }),
    paths: {
      base: dev ? '' : process.env.BASE_PATH || ''
    },
    prerender: {
      entries: ['*']
    }
  }
};
```

#### 運用メリット

- ✅ **完全無料**: 制限なしの静的サイトホスティング
- ✅ **自動デプロイ**: Git pushで即座に更新
- ✅ **カスタムドメイン**: 独自ドメイン設定可能
- ✅ **HTTPS標準**: SSL証明書自動設定
- ✅ **CDN配信**: 世界規模のコンテンツ配信

### 🔄 **代替デプロイメントオプション**

#### **Netlify (高機能バックアップ)**

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "20"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

# リダイレクトルール (SPA対応)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Netlifyの優位性**:

- フォーム機能（お問い合わせ）
- プレビューデプロイ（PR単位）
- 分析機能
- A/Bテスト機能

#### **Vercel (React/Next.js最適化)**

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "trailingSlash": false,
  "cleanUrls": true
}
```

**Vercelの特徴**:

- エッジ関数対応
- 画像最適化
- 高速CDN
- TypeScript完全サポート

---

## 🚀 **実践アプリケーション (websocket-learning-apps) のデプロイメント**

### 🔧 **Phase 2: ローカル開発環境**

#### Docker Compose デプロイメント

```yaml
# websocket-learning-apps/docker-compose.production.yml
version: '3.8'

services:
  websocket-basic:
    build:
      context: ./phase2-server
      target: production
    ports:
      - '8080:8080'
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8080/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  websocket-graphql:
    build:
      context: ./phase2-server
      target: graphql-production
    ports:
      - '8081:8081'
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
    depends_on:
      redis:
        condition: service_healthy
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - websocket-basic
      - websocket-graphql
    restart: unless-stopped

volumes:
  redis_data:
```

### 🌐 **Phase 4A: Vercel チャットアプリデプロイメント**

#### 本番環境構成

```javascript
// api/websocket.js - Vercel Edge Functions
import { Server } from 'socket.io';
import Redis from 'ioredis';

let io;

export default function handler(req, res) {
  if (!io) {
    io = new Server(res.socket.server, {
      path: '/api/websocket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL,
        methods: ['GET', 'POST']
      },
      transports: ['websocket', 'polling'],
      allowEIO3: true
    });

    // Redis Adapter for scaling
    if (process.env.REDIS_URL) {
      const redisClient = new Redis(process.env.REDIS_URL);
      const { createAdapter } = require('@socket.io/redis-adapter');
      io.adapter(createAdapter(redisClient, redisClient.duplicate()));
    }

    // Production-grade connection handling
    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Rate limiting per socket
      const rateLimiter = new Map();

      socket.use(async ([event, ...args], next) => {
        const now = Date.now();
        const windowStart = now - 60000; // 1 minute window

        if (!rateLimiter.has(socket.id)) {
          rateLimiter.set(socket.id, []);
        }

        const requests = rateLimiter.get(socket.id);
        const validRequests = requests.filter((time) => time > windowStart);

        if (validRequests.length >= 100) {
          // 100 requests per minute
          return next(new Error('Rate limit exceeded'));
        }

        validRequests.push(now);
        rateLimiter.set(socket.id, validRequests);
        next();
      });

      // Chat message handling
      socket.on('chat-message', async (data) => {
        try {
          // Validate and sanitize message
          const sanitizedMessage = sanitizeMessage(data);

          // Store in Redis with TTL
          if (process.env.REDIS_URL) {
            const redis = new Redis(process.env.REDIS_URL);
            await redis.setex(
              `msg:${sanitizedMessage.id}`,
              86400, // 24 hours
              JSON.stringify(sanitizedMessage)
            );
          }

          // Broadcast to room
          io.to(sanitizedMessage.roomId).emit('chat-message', sanitizedMessage);
        } catch (error) {
          socket.emit('error', { message: 'Invalid message format' });
        }
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        rateLimiter.delete(socket.id);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}

function sanitizeMessage(data) {
  // Input validation and sanitization
  const { roomId, message, username } = data;

  if (!roomId || !message || !username) {
    throw new Error('Missing required fields');
  }

  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    roomId: roomId.replace(/[^a-zA-Z0-9-_]/g, ''),
    message: message.substring(0, 1000), // Limit message length
    username: username.substring(0, 50), // Limit username length
    timestamp: Date.now()
  };
}
```

#### Vercel環境変数設定

```bash
# Vercel CLI での環境変数設定
vercel env add REDIS_URL
# 値: redis://default:password@redis-xxxxx.cloud.redislabs.com:18751

vercel env add WEBSOCKET_SECRET
# 値: your-super-secret-websocket-key-here

vercel env add SENTRY_DSN
# 値: https://xxxxx@sentry.io/xxxxx

vercel env add NODE_ENV
# 値: production
```

#### デプロイメント手順

```bash
# 1. Vercel CLI インストール
npm install -g vercel

# 2. Vercel ログイン
vercel login

# 3. プロジェクト初期化
cd websocket-learning-apps/chat-app
vercel init

# 4. 環境変数設定
vercel env add REDIS_URL
vercel env add WEBSOCKET_SECRET

# 5. プロダクションデプロイ
vercel --prod
```

### 🚂 **Phase 4B: Railway 共同編集システムデプロイメント**

#### Railway設定ファイル

```json
// railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

#### プロダクション用サーバー

```javascript
// server/production-server.js
const cluster = require('cluster');
const os = require('os');
const WebSocket = require('ws');
const express = require('express');
const Redis = require('ioredis');

class ProductionWebSocketServer {
  constructor() {
    this.port = process.env.PORT || 8080;
    this.redisUrl = process.env.REDIS_URL;
    this.nodeEnv = process.env.NODE_ENV || 'production';

    if (cluster.isMaster && this.nodeEnv === 'production') {
      this.setupCluster();
    } else {
      this.startWorker();
    }
  }

  setupCluster() {
    const numWorkers = process.env.WEB_CONCURRENCY || os.cpus().length;

    console.log(`Master ${process.pid} is running`);
    console.log(`Starting ${numWorkers} workers`);

    // Fork workers
    for (let i = 0; i < numWorkers; i++) {
      cluster.fork();
    }

    // Handle worker death
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died`);
      console.log('Starting a new worker');
      cluster.fork();
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('Master received SIGTERM, shutting down gracefully');

      for (const id in cluster.workers) {
        cluster.workers[id].kill();
      }

      setTimeout(() => {
        console.log('Force shutdown');
        process.exit(1);
      }, 10000);
    });
  }

  startWorker() {
    const app = express();

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        worker: process.pid,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    });

    // WebSocket server
    const wss = new WebSocket.Server({
      port: this.port,
      perMessageDeflate: {
        threshold: 1024,
        zlibDeflateOptions: {
          chunkSize: 16 * 1024,
          windowBits: 15,
          level: 3
        }
      }
    });

    // Redis for inter-worker communication
    const redis = new Redis(this.redisUrl);
    const redisSub = new Redis(this.redisUrl);

    wss.on('connection', (ws, request) => {
      ws.isAlive = true;
      ws.workerId = process.pid;

      console.log(`Worker ${process.pid}: Client connected`);

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
          await this.handleMessage(ws, message, redis);
        } catch (error) {
          console.error('Message handling error:', error);
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Invalid message format'
            })
          );
        }
      });

      ws.on('close', () => {
        console.log(`Worker ${process.pid}: Client disconnected`);
      });
    });

    // Health check ping
    setInterval(() => {
      wss.clients.forEach((ws) => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    // Redis subscription for broadcasting
    redisSub.subscribe('broadcast');
    redisSub.on('message', (channel, message) => {
      if (channel === 'broadcast') {
        const data = JSON.parse(message);
        this.broadcastToClients(wss, data);
      }
    });

    const server = app.listen(this.port, () => {
      console.log(`Worker ${process.pid} listening on port ${this.port}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log(`Worker ${process.pid} received SIGTERM`);

      server.close(() => {
        wss.close(() => {
          redis.disconnect();
          redisSub.disconnect();
          process.exit(0);
        });
      });
    });
  }

  async handleMessage(ws, message, redis) {
    switch (message.type) {
      case 'document-operation':
        await this.handleDocumentOperation(ws, message, redis);
        break;
      case 'cursor-update':
        await this.handleCursorUpdate(ws, message, redis);
        break;
      default:
        ws.send(
          JSON.stringify({
            type: 'error',
            message: `Unknown message type: ${message.type}`
          })
        );
    }
  }

  async handleDocumentOperation(ws, message, redis) {
    const { documentId, operation, version } = message;

    // Distributed locking
    const lockKey = `lock:doc:${documentId}`;
    const lock = await redis.set(lockKey, ws.workerId, 'PX', 5000, 'NX');

    if (!lock) {
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Document is locked by another operation'
        })
      );
      return;
    }

    try {
      // Apply operation with version check
      const currentVersion = (await redis.get(`doc:${documentId}:version`)) || '0';

      if (parseInt(version) !== parseInt(currentVersion)) {
        ws.send(
          JSON.stringify({
            type: 'version-mismatch',
            currentVersion: parseInt(currentVersion)
          })
        );
        return;
      }

      // Update document
      const newVersion = parseInt(currentVersion) + 1;
      await redis.set(`doc:${documentId}:version`, newVersion);

      // Broadcast to other workers
      await redis.publish(
        'broadcast',
        JSON.stringify({
          type: 'document-operation',
          documentId,
          operation,
          version: newVersion,
          excludeWorker: ws.workerId
        })
      );

      // Confirm to sender
      ws.send(
        JSON.stringify({
          type: 'operation-confirmed',
          version: newVersion
        })
      );
    } finally {
      await redis.del(lockKey);
    }
  }
}

// Start the server
new ProductionWebSocketServer();
```

#### Railway デプロイメント手順

```bash
# 1. Railway CLI インストール
npm install -g @railway/cli

# 2. Railway ログイン
railway login

# 3. プロジェクト初期化
cd websocket-learning-apps/collaborative-editor
railway init

# 4. Redis サービス追加
railway add redis

# 5. 環境変数確認
railway run printenv | grep REDIS

# 6. デプロイ実行
railway up

# 7. カスタムドメイン設定（オプション）
railway domain
```

---

## 📊 **デプロイメント監視・運用**

### 🔍 **監視スタック**

#### **Uptime Robot (稼働監視)**

```javascript
// scripts/setup-monitoring.js
const monitors = [
  {
    name: 'WebSocket Learning Site',
    url: 'https://shuji-bonji.github.io/websocket-learning/',
    type: 'HTTP',
    interval: 300 // 5 minutes
  },
  {
    name: 'Chat App WebSocket',
    url: 'wss://websocket-chat-app.vercel.app/api/websocket',
    type: 'KEYWORD',
    keyword: 'websocket',
    interval: 300
  },
  {
    name: 'Collaborative Editor API',
    url: 'https://collaborative-editor.up.railway.app/health',
    type: 'HTTP',
    interval: 300
  }
];

// Uptime Robot API経由でモニター設定
async function setupMonitoring() {
  for (const monitor of monitors) {
    await fetch('https://api.uptimerobot.com/v2/newMonitor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        api_key: process.env.UPTIMEROBOT_API_KEY,
        format: 'json',
        type: monitor.type === 'HTTP' ? '1' : '2',
        url: monitor.url,
        friendly_name: monitor.name,
        interval: monitor.interval
      })
    });
  }
}
```

#### **Sentry (エラー追跡)**

```javascript
// src/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/browser';
import { Integrations } from '@sentry/tracing';

if (typeof window !== 'undefined' && import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      new Integrations.BrowserTracing(),
    ],
    tracesSampleRate: 0.1,
    environment: import.meta.env.MODE,
    beforeSend(event) {
      // Filter out known non-critical errors
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (error?.type === 'WebSocket connection failed') {
          return null; // Don't send WebSocket connection errors
        }
      }
      return event;
    }
  });
}

// WebSocket エラーのカスタム追跡
export function trackWebSocketError(error: Error, context: any) {
  Sentry.withScope((scope) => {
    scope.setTag('component', 'websocket');
    scope.setContext('websocket', context);
    Sentry.captureException(error);
  });
}
```

### 📈 **パフォーマンス分析**

#### **Lighthouse CI**

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build site
        run: npm run build

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

#### **Web Vitals 監視**

```javascript
// src/lib/analytics/web-vitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  if (import.meta.env.PROD) {
    // Google Analytics 4
    gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

// Core Web Vitals 測定
getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## 🚀 **デプロイメント自動化**

### 🔄 **CI/CD パイプライン**

#### **GitHub Actions マトリックス**

```yaml
# .github/workflows/ci-cd-matrix.yml
name: CI/CD Matrix

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-matrix:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
        project: [learning-site, chat-app, collaborative-editor]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - name: Test ${{ matrix.project }}
        run: |
          if [ "${{ matrix.project }}" == "learning-site" ]; then
            npm ci
            npm run test
            npm run build
          elif [ "${{ matrix.project }}" == "chat-app" ]; then
            cd websocket-learning-apps/chat-app
            npm ci
            npm run test
          elif [ "${{ matrix.project }}" == "collaborative-editor" ]; then
            cd websocket-learning-apps/collaborative-editor
            npm ci
            npm run test
          fi

  deploy-staging:
    needs: test-matrix
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: echo "Deploy to staging environments"

  deploy-production:
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to production
        run: echo "Deploy to production environments"
```

### 📦 **デプロイメントスクリプト**

```bash
#!/bin/bash
# scripts/deploy-all.sh

set -e

echo "🚀 Starting deployment process..."

# 1. 学習サイトのデプロイ
echo "📚 Deploying learning site to GitHub Pages..."
cd websocket-learning
npm ci
npm run build
git add build/
git commit -m "Deploy: $(date)" || echo "No changes to commit"
git push origin gh-pages

# 2. チャットアプリのデプロイ (Vercel)
echo "💬 Deploying chat app to Vercel..."
cd ../websocket-learning-apps/chat-app
npm ci
vercel --prod --confirm

# 3. 共同編集アプリのデプロイ (Railway)
echo "✏️ Deploying collaborative editor to Railway..."
cd ../collaborative-editor
npm ci
railway up

echo "✅ All deployments completed successfully!"
```

---

## 🔧 **環境別設定管理**

### 🌍 **Environment Configuration**

#### **Development Environment**

```javascript
// config/development.js
module.exports = {
  websocket: {
    basic: {
      url: 'ws://localhost:8080',
      reconnect: true,
      debug: true
    },
    graphql: {
      url: 'ws://localhost:8081',
      protocol: 'graphql-ws',
      debug: true
    },
    mqtt: {
      url: 'ws://localhost:8082',
      protocol: 'mqtt',
      debug: true
    }
  },
  redis: {
    url: 'redis://localhost:6379',
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    lazyConnect: true
  },
  logging: {
    level: 'debug',
    format: 'pretty'
  }
};
```

#### **Production Environment**

```javascript
// config/production.js
module.exports = {
  websocket: {
    chat: {
      url: process.env.VERCEL_URL
        ? `wss://${process.env.VERCEL_URL}/api/websocket`
        : 'wss://websocket-chat-app.vercel.app/api/websocket',
      reconnect: true,
      timeout: 30000,
      transports: ['websocket', 'polling']
    },
    collaborative: {
      url: process.env.RAILWAY_PUBLIC_DOMAIN
        ? `wss://${process.env.RAILWAY_PUBLIC_DOMAIN}`
        : 'wss://collaborative-editor.up.railway.app',
      reconnect: true,
      maxReconnectAttempts: 5,
      reconnectInterval: 2000
    }
  },
  redis: {
    url: process.env.REDIS_URL,
    retryDelayOnFailover: 1000,
    enableReadyCheck: true,
    lazyConnect: false,
    maxRetriesPerRequest: 3
  },
  monitoring: {
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: 'production',
      tracesSampleRate: 0.1
    },
    analytics: {
      googleAnalytics: process.env.GA_TRACKING_ID
    }
  },
  logging: {
    level: 'info',
    format: 'json'
  }
};
```

### 🔐 **Secrets Management**

#### **Environment Variables Template**

```bash
# .env.example - 開発環境用テンプレート

# Development WebSocket URLs
VITE_WS_BASIC_URL=ws://localhost:8080
VITE_WS_GRAPHQL_URL=ws://localhost:8081
VITE_WS_MQTT_URL=ws://localhost:8082

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Monitoring & Analytics
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
GA_TRACKING_ID=G-XXXXXXXXXX
UPTIMEROBOT_API_KEY=your-uptimerobot-api-key

# Production URLs (for CI/CD)
VERCEL_URL=websocket-chat-app.vercel.app
RAILWAY_PUBLIC_DOMAIN=collaborative-editor.up.railway.app

# Security
WEBSOCKET_SECRET=your-super-secret-websocket-key
JWT_SECRET=your-jwt-secret-key
```

#### **Secure Secrets Injection**

```bash
#!/bin/bash
# scripts/setup-secrets.sh

echo "🔐 Setting up secrets for deployment..."

# Vercel secrets
if command -v vercel &> /dev/null; then
    echo "Setting Vercel secrets..."
    vercel env add REDIS_URL
    vercel env add WEBSOCKET_SECRET
    vercel env add SENTRY_DSN
fi

# Railway secrets
if command -v railway &> /dev/null; then
    echo "Setting Railway secrets..."
    railway variables set WEBSOCKET_SECRET=$WEBSOCKET_SECRET
    railway variables set JWT_SECRET=$JWT_SECRET
    railway variables set SENTRY_DSN=$SENTRY_DSN
fi

echo "✅ Secrets setup completed!"
```

---

## 📊 **デプロイメント品質管理**

### 🧪 **Pre-deployment Testing**

#### **Smoke Tests**

```javascript
// tests/smoke/deployment-smoke.test.js
import { test, expect } from '@playwright/test';

const deploymentTargets = [
  {
    name: 'Learning Site',
    url: 'https://shuji-bonji.github.io/websocket-learning/',
    type: 'static'
  },
  {
    name: 'Chat App',
    url: 'https://websocket-chat-app.vercel.app',
    type: 'vercel'
  },
  {
    name: 'Collaborative Editor',
    url: 'https://collaborative-editor.up.railway.app',
    type: 'railway'
  }
];

for (const target of deploymentTargets) {
  test.describe(`${target.name} Smoke Tests`, () => {
    test('should load homepage', async ({ page }) => {
      await page.goto(target.url);
      await expect(page).toHaveTitle(/WebSocket/);
    });

    test('should have no console errors', async ({ page }) => {
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto(target.url);
      await page.waitForLoadState('networkidle');

      expect(errors).toHaveLength(0);
    });

    if (target.type !== 'static') {
      test('should establish WebSocket connection', async ({ page }) => {
        await page.goto(target.url);

        // Wait for WebSocket connection
        const wsConnected = await page.evaluate(() => {
          return new Promise((resolve) => {
            const ws = new WebSocket(
              target.type === 'vercel'
                ? 'wss://websocket-chat-app.vercel.app/api/websocket'
                : 'wss://collaborative-editor.up.railway.app'
            );

            ws.onopen = () => resolve(true);
            ws.onerror = () => resolve(false);

            setTimeout(() => resolve(false), 10000);
          });
        });

        expect(wsConnected).toBe(true);
      });
    }

    test('should have acceptable performance', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(target.url);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(5000); // 5 seconds max load time
    });
  });
}
```

#### **Health Check Endpoints**

```javascript
// api/health.js - Vercel health check
export default function handler(req, res) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    services: {
      redis: checkRedisHealth(),
      websocket: checkWebSocketHealth()
    }
  };

  const isHealthy = Object.values(health.services).every((service) => service.status === 'healthy');

  res.status(isHealthy ? 200 : 503).json(health);
}

async function checkRedisHealth() {
  try {
    if (!process.env.REDIS_URL) {
      return { status: 'not_configured' };
    }

    const Redis = require('ioredis');
    const redis = new Redis(process.env.REDIS_URL);
    await redis.ping();
    redis.disconnect();

    return { status: 'healthy', latency: Date.now() };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}

function checkWebSocketHealth() {
  // WebSocket health check logic
  return { status: 'healthy' };
}
```

### 📈 **Post-deployment Verification**

#### **Automated Verification Pipeline**

```yaml
# .github/workflows/post-deployment-verification.yml
name: Post-Deployment Verification

on:
  workflow_run:
    workflows: ['Deploy to Production']
    types: [completed]

jobs:
  verify-deployment:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run smoke tests
        run: npm run test:smoke

      - name: Run performance tests
        run: npm run test:performance

      - name: Verify WebSocket connectivity
        run: npm run test:websocket-connectivity

      - name: Check health endpoints
        run: |
          curl -f https://shuji-bonji.github.io/websocket-learning/ || exit 1
          curl -f https://websocket-chat-app.vercel.app/api/health || exit 1
          curl -f https://collaborative-editor.up.railway.app/health || exit 1

      - name: Notify on failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: 'Deployment verification failed! 🚨'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 🚨 **障害対応・ロールバック戦略**

### ⚡ **緊急ロールバック手順**

#### **Vercel ロールバック**

```bash
#!/bin/bash
# scripts/rollback-vercel.sh

echo "🔄 Rolling back Vercel deployment..."

# Get current deployment
CURRENT_DEPLOYMENT=$(vercel ls --scope=team_name | grep "websocket-chat-app" | head -1 | awk '{print $2}')
echo "Current deployment: $CURRENT_DEPLOYMENT"

# Get previous successful deployment
PREVIOUS_DEPLOYMENT=$(vercel ls --scope=team_name | grep "websocket-chat-app" | sed -n '2p' | awk '{print $2}')
echo "Previous deployment: $PREVIOUS_DEPLOYMENT"

# Promote previous deployment
vercel promote $PREVIOUS_DEPLOYMENT --scope=team_name

echo "✅ Rollback completed to $PREVIOUS_DEPLOYMENT"
```

#### **Railway ロールバック**

```bash
#!/bin/bash
# scripts/rollback-railway.sh

echo "🔄 Rolling back Railway deployment..."

# Get deployment history
railway status

# Rollback to previous version
railway rollback

echo "✅ Railway rollback completed"
```

### 🔍 **障害検知・通知**

#### **Automated Alerting**

```javascript
// monitoring/alerting.js
const { WebhookClient } = require('discord.js');
const nodemailer = require('nodemailer');

class AlertingSystem {
  constructor() {
    this.discordWebhook = new WebhookClient({
      url: process.env.DISCORD_WEBHOOK_URL
    });

    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendAlert(severity, message, details) {
    const timestamp = new Date().toISOString();

    // Discord notification
    if (this.discordWebhook) {
      await this.discordWebhook.send({
        content: `🚨 **${severity.toUpperCase()} ALERT** 🚨`,
        embeds: [
          {
            title: message,
            description: details,
            color: severity === 'critical' ? 0xff0000 : 0xffff00,
            timestamp: timestamp,
            fields: [
              {
                name: 'Environment',
                value: process.env.NODE_ENV,
                inline: true
              },
              {
                name: 'Service',
                value: process.env.SERVICE_NAME || 'WebSocket Learning',
                inline: true
              }
            ]
          }
        ]
      });
    }

    // Email notification for critical alerts
    if (severity === 'critical' && this.emailTransporter) {
      await this.emailTransporter.sendMail({
        from: process.env.ALERT_EMAIL_FROM,
        to: process.env.ALERT_EMAIL_TO,
        subject: `🚨 Critical Alert: ${message}`,
        html: `
          <h2>Critical System Alert</h2>
          <p><strong>Message:</strong> ${message}</p>
          <p><strong>Details:</strong> ${details}</p>
          <p><strong>Time:</strong> ${timestamp}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
        `
      });
    }

    // Log to console
    console.error(`[${severity.toUpperCase()}] ${timestamp}: ${message}`, details);
  }

  async checkServices() {
    const services = [
      {
        name: 'Learning Site',
        url: 'https://shuji-bonji.github.io/websocket-learning/',
        critical: false
      },
      {
        name: 'Chat App',
        url: 'https://websocket-chat-app.vercel.app/api/health',
        critical: true
      },
      {
        name: 'Collaborative Editor',
        url: 'https://collaborative-editor.up.railway.app/health',
        critical: true
      }
    ];

    for (const service of services) {
      try {
        const response = await fetch(service.url);
        if (!response.ok) {
          await this.sendAlert(
            service.critical ? 'critical' : 'warning',
            `${service.name} is down`,
            `HTTP ${response.status} - ${service.url}`
          );
        }
      } catch (error) {
        await this.sendAlert(
          service.critical ? 'critical' : 'warning',
          `${service.name} is unreachable`,
          `Error: ${error.message} - ${service.url}`
        );
      }
    }
  }
}

// Health check cron job
if (process.env.NODE_ENV === 'production') {
  const alerting = new AlertingSystem();

  // Check every 5 minutes
  setInterval(
    () => {
      alerting.checkServices();
    },
    5 * 60 * 1000
  );
}

module.exports = AlertingSystem;
```

---

## 📋 **デプロイメントチェックリスト**

### ✅ **Pre-deployment Checklist**

#### **Code Quality**

- [ ] TypeScript compilation without errors
- [ ] ESLint passes without errors
- [ ] Prettier formatting applied
- [ ] Unit tests pass (coverage > 80%)
- [ ] Integration tests pass
- [ ] E2E tests pass

#### **Security**

- [ ] No hardcoded secrets in code
- [ ] Environment variables properly configured
- [ ] HTTPS/WSS enforced in production
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation and sanitization

#### **Performance**

- [ ] Bundle size analysis completed
- [ ] Core Web Vitals within thresholds
- [ ] WebSocket connection optimization
- [ ] Redis connection pooling configured
- [ ] Monitoring and logging enabled

### ✅ **Post-deployment Checklist**

#### **Functionality**

- [ ] All pages load correctly
- [ ] WebSocket connections establish successfully
- [ ] Real-time features work as expected
- [ ] Database connections functioning
- [ ] Third-party integrations working

#### **Monitoring**

- [ ] Health check endpoints responding
- [ ] Error tracking active (Sentry)
- [ ] Uptime monitoring configured
- [ ] Performance metrics collecting
- [ ] Log aggregation working

#### **Documentation**

- [ ] Deployment notes updated
- [ ] Environment variables documented
- [ ] Rollback procedures verified
- [ ] Team notified of deployment

---

## 🎯 **デプロイメント成功指標**

### 📊 **Key Performance Indicators (KPIs)**

#### **Technical Metrics**

- **Deployment Frequency**: 週2回以上の安全なデプロイ
- **Lead Time**: コミットから本番反映まで < 1時間
- **Mean Time to Recovery (MTTR)**: 障害から復旧まで < 30分
- **Change Failure Rate**: デプロイ失敗率 < 5%

#### **User Experience Metrics**

- **Page Load Time**: < 3秒 (95th percentile)
- **WebSocket Connection Time**: < 1秒
- **Uptime**: 99.9% 以上
- **Error Rate**: < 0.1%

#### **Educational Impact Metrics**

- **Learning Site Accessibility**: 24/7 可用性
- **Demo Functionality**: 100% 動作保証
- **Content Delivery**: CDN経由での高速配信
- **Mobile Responsiveness**: 全デバイス対応

### 🏆 **成功基準**

#### **Phase 1 (GitHub Pages)**

- ✅ 静的サイトの完全動作
- ✅ WebSocketデモの安定動作
- ✅ モバイル対応完了
- ✅ SEO最適化実装

#### **Phase 4 (Production Apps)**

- ✅ 本番環境での安定稼働
- ✅ スケーラビリティ実証
- ✅ 監視・ログ体制確立
- ✅ セキュリティ要件充足

この包括的なデプロイメント戦略により、学習者は段階的に本格的なWebアプリケーションの運用経験を積み、実際の開発現場で即戦力として活躍できるスキルを身につけることができます。

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **WebSocket learning project** built with SvelteKit and TypeScript. The project focuses on mastering **browser-standard WebSocket API** before exploring advanced libraries like Socket.IO. It includes comprehensive documentation and aims to build PWA-compatible real-time web applications.

### 🎯 **Core Learning Strategy: Phase-Based WebSocket Environments**

The project implements a **4-phase learning approach** with increasingly sophisticated WebSocket communication environments:

- **Phase 1**: GitHub Pages + Public WebSocket services (immediate learning start)
- **Phase 2**: Local Node.js servers + Docker (protocol deep-dive)
- **Phase 3**: Test environments + Mock servers (quality assurance)
- **Phase 4**: Cloud deployment (Vercel/Railway) (production experience)

## Development Commands

### Core Development

- `npm run dev` - Start development server
- `npm run dev -- --open` - Start dev server and open in browser
- `npm run build` - Create production build
- `npm run preview` - Preview production build

### Code Quality & Testing

- `npm run check` - Run Svelte type checking
- `npm run check:watch` - Run type checking in watch mode
- `npm run lint` - Run ESLint and Prettier checks
- `npm run format` - Format code with Prettier

### SvelteKit Specific

- `npm run prepare` - Sync SvelteKit (runs automatically before other commands)

## Technology Stack

- **Frontend**: SvelteKit + TypeScript
- **Svelte Version**: **Svelte 5** with Runes (latest specification)
- **Documentation**: MDSveX (Markdown in Svelte)
- **Build Tool**: Vite
- **Testing**: Svelte-check for type checking
- **Code Quality**: ESLint + Prettier
- **Target**: PWA-enabled real-time applications using native WebSocket API

## Phase-Specific WebSocket Implementation Guidelines

### 🌱 **Phase 1: Basic Understanding (GitHub Pages Compatible)**

**Environment**: Static site with public WebSocket services

```typescript
// Use public WebSocket services for learning (verified working)
const DEMO_WEBSOCKET_URLS = {
	echo: 'wss://echo.websocket.org',
	postman: 'wss://ws.postman-echo.com/raw'
};

// Client-side only implementation
export class Phase1WebSocketManager {
	constructor(url: string) {
		// Ensure browser environment
		if (typeof window === 'undefined') return;
		this.connect(url);
	}
}
```

**Key Constraints**:

- ✅ No server-side WebSocket implementation needed
- ✅ Works on GitHub Pages static hosting
- ✅ Focus on WebSocket API basics and protocol understanding
- ⚠️ **Public WebSocket Service Selection**: Use only verified, authentication-free services
  - `wss://echo.websocket.org` - Stable, no auth required (Primary)
  - `wss://ws.postman-echo.com/raw` - Postman's public echo service (Secondary)
  - ❌ Avoid services requiring authentication or unstable endpoints

### 🔧 **Phase 2: Implementation Technology (Local Development)**

**Environment**: Local Node.js WebSocket servers + Docker

```typescript
// Local development WebSocket server setup
// phase2-server/websocket-server.js
const WebSocket = require('ws');

class Phase2LearningServer {
	constructor() {
		// Multiple protocol servers
		this.basicServer = new WebSocket.Server({ port: 8080 });
		this.graphqlServer = new WebSocket.Server({
			port: 8081,
			handleProtocols: (protocols) => (protocols.includes('graphql-ws') ? 'graphql-ws' : false)
		});
		this.mqttServer = new WebSocket.Server({
			port: 8082,
			handleProtocols: (protocols) => (protocols.includes('mqtt') ? 'mqtt' : false)
		});
	}
}
```

**Setup Instructions for Claude Code**:

```bash
# When working on Phase 2 features:
cd websocket-learning-apps/phase2-server
npm install
npm run dev  # Starts local WebSocket servers

# Or use Docker:
docker-compose up -d
```

### 🧪 **Phase 3: Testing & Evaluation (Test-Integrated Environment)**

**Environment**: Vitest + Mock WebSocket servers + E2E testing

```typescript
// Test WebSocket server for automated testing
export class WebSocketTestServer {
	constructor(port = 9999) {
		this.port = port;
		this.server = new WebSocket.Server({ port });
	}

	// Simulate various WebSocket scenarios
	simulateLatency(ms: number) {
		/* ... */
	}
	simulateConnectionFailure() {
		/* ... */
	}
	simulateServerError() {
		/* ... */
	}
}
```

**Testing Strategy**:

- Unit tests: WebSocket connection logic
- Integration tests: Component + WebSocket interaction
- E2E tests: Full user journey with Playwright

### 🚀 **Phase 4: Production Development (Cloud Deployment)**

**Environment**: Vercel + Railway + Redis + Production WebSocket services

**Vercel Configuration** (for PWA Chat App):

```json
// vercel.json
{
	"functions": {
		"api/websocket.js": {
			"runtime": "@vercel/node@18.x"
		}
	},
	"env": {
		"REDIS_URL": "@redis_url",
		"WEBSOCKET_SECRET": "@websocket_secret"
	}
}
```

**Railway Configuration** (for Collaborative Editor):

```javascript
// Production-ready WebSocket server
class ProductionWebSocketServer {
	setupCluster() {
		// Multi-process WebSocket handling
		// Redis pub/sub for scaling
		// Health checks and monitoring
	}
}
```

**Deployment Commands**:

```bash
# Phase 4A: Chat App to Vercel
cd websocket-learning-apps/chat-app
vercel --prod

# Phase 4B: Collaborative Editor to Railway
cd websocket-learning-apps/collaborative-editor
railway up
```

## Svelte 5 Specification Requirements

### **CRITICAL: Always Use Latest Svelte 5 Specification**

Before coding any Svelte components, **always reference the latest Svelte 5 documentation**:

- 📖 **Primary Reference**: https://svelte.dev/docs/llms
- 📄 **Full Specification**: https://svelte.dev/llms-full.txt
- 📄 **Medium Guide**: https://svelte.dev/llms-medium.txt
- 📄 **Quick Reference**: https://svelte.dev/llms-small.txt

### **Mandatory Svelte 5 Patterns for WebSocket Components**

#### **1. WebSocket State Management with Runes**

```svelte
<!-- ✅ CORRECT: Svelte 5 WebSocket Component -->
<script>
  let { wsUrl, protocols = [] } = $props();

  let connectionState = $state('disconnected');
  let socket = $state(null);
  let messages = $state([]);
  let error = $state(null);

  let isConnected = $derived(connectionState === 'connected');
  let canSend = $derived(isConnected && socket?.readyState === WebSocket.OPEN);

  $effect(() => {
    if (wsUrl && typeof window !== 'undefined') {
      connectWebSocket();
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  });

  function connectWebSocket() {
    connectionState = 'connecting';
    socket = new WebSocket(wsUrl, protocols);

    socket.onopen = () => {
      connectionState = 'connected';
      error = null;
    };

    socket.onmessage = (event) => {
      messages = [...messages, {
        type: 'received',
        data: event.data,
        timestamp: Date.now()
      }];
    };

    socket.onerror = (err) => {
      error = `WebSocket error: ${err.message}`;
      connectionState = 'error';
    };

    socket.onclose = () => {
      connectionState = 'disconnected';
    };
  }
</script>

<!-- ❌ LEGACY (Svelte 3/4) - DO NOT USE -->
<script>
  export let wsUrl;
  export let protocols = [];

  let connectionState = 'disconnected';
  let socket;
  let messages = [];

  $: isConnected = connectionState === 'connected';

  onMount(() => {
    // Legacy lifecycle management
  });
</script>
```

#### **2. WebSocket Store Pattern (Svelte 5)**

```typescript
// src/lib/stores/websocket.svelte.ts
export class WebSocketStore {
	private socket = $state<WebSocket | null>(null);
	private _connectionState = $state<'disconnected' | 'connecting' | 'connected' | 'error'>(
		'disconnected'
	);
	private _messages = $state<WebSocketMessage[]>([]);
	private _error = $state<string | null>(null);

	// Reactive getters
	get connectionState() {
		return this._connectionState;
	}
	get messages() {
		return this._messages;
	}
	get error() {
		return this._error;
	}
	get isConnected() {
		return this._connectionState === 'connected';
	}

	connect(url: string, protocols?: string[]) {
		if (typeof window === 'undefined') return;

		this._connectionState = 'connecting';
		this.socket = new WebSocket(url, protocols);

		this.socket.onopen = () => {
			this._connectionState = 'connected';
			this._error = null;
		};

		this.socket.onmessage = (event) => {
			this._messages = [
				...this._messages,
				{
					type: 'received',
					data: event.data,
					timestamp: Date.now()
				}
			];
		};

		// ... other handlers
	}
}

// Usage in components
const wsStore = new WebSocketStore();
```

### **Phase-Specific Component Requirements**

#### **Phase 1 Components**: Basic Demo Components

- Use `$state` for connection status
- Handle browser-only WebSocket creation
- Graceful fallbacks for SSR

#### **Phase 2 Components**: Protocol Implementations

- Type-safe subprotocol handling
- Binary data processing with proper typing
- Frame structure visualization

#### **Phase 3 Components**: Test-Friendly Components

- Mockable WebSocket dependencies
- Deterministic state changes
- Error simulation capabilities

#### **Phase 4 Components**: Production-Ready Components

- Comprehensive error handling
- Performance optimization
- Scalability considerations

## TypeScript & Code Quality Standards

### Critical WebSocket Type Definitions

```typescript
// src/lib/types/websocket.ts
export interface WebSocketMessage<T = unknown> {
	id?: string;
	type: string;
	timestamp: number;
	payload: T;
}

export interface WebSocketSubprotocol {
	name: string;
	version: string;
	messageTypes: Record<string, MessageSchema>;
}

export interface WebSocketConnectionConfig {
	url: string;
	protocols?: string[];
	reconnect?: boolean;
	maxReconnectAttempts?: number;
	reconnectInterval?: number;
}

// Phase-specific types
export interface Phase1DemoConfig extends WebSocketConnectionConfig {
	demoType: 'echo' | 'chat' | 'notification';
	fallbackUrls?: string[];
}

export interface Phase4ProductionConfig extends WebSocketConnectionConfig {
	auth?: {
		token: string;
		refreshUrl?: string;
	};
	scaling?: {
		clustered: boolean;
		redisUrl?: string;
	};
}
```

### No-Any Policy for WebSocket Code

```typescript
// ❌ NEVER DO THIS
function handleMessage(data: any) {
	console.log(data.someProperty); // Type unsafe
}

// ✅ ALWAYS DO THIS
interface ChatMessage {
	type: 'chat';
	user: string;
	message: string;
	timestamp: number;
}

interface SystemMessage {
	type: 'system';
	event: 'user_joined' | 'user_left';
	userId: string;
}

type WebSocketMessage = ChatMessage | SystemMessage;

function handleMessage(data: WebSocketMessage) {
	switch (data.type) {
		case 'chat':
			// TypeScript knows this is ChatMessage
			console.log(`${data.user}: ${data.message}`);
			break;
		case 'system':
			// TypeScript knows this is SystemMessage
			console.log(`System: ${data.event} - ${data.userId}`);
			break;
	}
}
```

## Claude Code Collaboration Guidelines

### Phase-Specific Request Patterns

#### **Phase 1 Request Template**

```markdown
# Task: Implement Phase 1 WebSocket Demo Component

## Environment Constraints

- Must work on GitHub Pages (static hosting)
- Use public WebSocket services only
- Browser-only implementation (no server code)

## Requirements

1. Create src/lib/components/WebSocketDemo.svelte
2. Use echo.websocket.org for testing
3. Handle SSR gracefully (browser check)
4. Implement with Svelte 5 runes ($state, $derived, $effect)

## Success Criteria

- npm run check passes
- Component works in browser
- No server dependencies
- Graceful SSR handling
```

#### **Phase 2 Request Template**

```markdown
# Task: Implement Phase 2 Subprotocol Server

## Environment Setup

cd websocket-learning-apps/phase2-server
npm install
npm run dev

## Requirements

1. Create GraphQL-WS subprotocol server (port 8081)
2. Handle subscription messages
3. Type-safe message handling
4. Docker Compose integration

## Success Criteria

- Local server starts on port 8081
- GraphQL-WS protocol negotiation works
- Client can connect with subprotocol
- docker-compose up succeeds
```

#### **Phase 4 Request Template**

```markdown
# Task: Deploy Phase 4 Production App

## Environment

- Target: Vercel (Chat App) or Railway (Collaborative Editor)
- Redis: Required for scaling
- WebSocket: Production-grade implementation

## Requirements

1. Configure vercel.json for WebSocket support
2. Implement Redis pub/sub for scaling
3. Add health checks and monitoring
4. Production error handling

## Success Criteria

- Successful deployment to cloud platform
- WebSocket connections work in production
- Redis scaling functional
- Monitoring and logs available
```

### Context-Aware Development

When Claude Code is working on this project, always consider:

1. **Which Phase** the feature belongs to
2. **Environment constraints** for that phase
3. **WebSocket complexity level** appropriate for the learning stage
4. **Deployment target** (GitHub Pages vs Local vs Cloud)

### Quality Assurance Commands

```bash
# Always run these for WebSocket features:
npm run check           # Type safety verification
npm run lint           # Code quality (no eslint-disable allowed)
npm run dev            # Local development test
npm run build          # Production build test

# Phase-specific testing:
# Phase 1: Open browser to verify demo
# Phase 2: Test with local WebSocket servers
# Phase 3: Run test suite
# Phase 4: Deploy to staging environment
```

## Development Standards

### Pre-Commit Checklist for WebSocket Features

Always ensure these pass before committing:

```bash
npm run check    # TypeScript + Svelte type checking
npm run lint     # ESLint + Prettier (must pass without eslint-disable)
npm run format   # Code formatting
```

### WebSocket-Specific Quality Gates

- **Zero `any` types**: All WebSocket messages must be properly typed
- **Phase-appropriate complexity**: Don't implement Phase 4 features in Phase 1
- **Environment compatibility**: Respect the constraints of each phase
- **Browser compatibility**: Handle SSR gracefully for WebSocket code
- **Error handling**: Comprehensive error states for connection issues

### Component Development for WebSocket Features

When creating WebSocket-related Svelte components:

1. **Always use Svelte 5 Runes** - $state, $derived, $effect, $props
2. **Reference latest specification** - https://svelte.dev/docs/llms before coding
3. **Handle browser-only WebSocket creation** with proper SSR guards
4. **Use $derived for connection states** instead of reactive statements
5. **Handle all connection states** (connecting, connected, error, disconnected)
6. **Export reusable WebSocket types** from component files
7. **Use $effect for WebSocket lifecycle** and cleanup

### Mandatory Svelte 5 Checklist for WebSocket Components

Before submitting any WebSocket Svelte component, verify:

- ✅ Uses `$props()` instead of `export let`
- ✅ Uses `$state()` for WebSocket connection state
- ✅ Uses `$derived()` for computed connection properties
- ✅ Uses `$effect()` for WebSocket lifecycle management
- ✅ Handles browser-only WebSocket creation properly
- ✅ No legacy `onMount` for WebSocket setup
- ✅ Proper cleanup in $effect return function
- ✅ Type-safe WebSocket message handling

## Project Structure Context

### WebSocket Learning Progression

The project follows a carefully designed learning progression:

1. **memo/curriculum.md** - Main 50-60 hour curriculum
2. **memo/table-of-contents.md** - Complete resource index
3. **src/routes/phase[1-4]/** - Interactive learning components
4. **websocket-learning-apps/** - Separate repo for Phase 2-4 implementations

### Key Implementation Files

- `src/lib/stores/websocket.svelte.ts` - Svelte 5 WebSocket store
- `src/lib/components/WebSocketDemo.svelte` - Phase 1 demo components
- `src/lib/types/websocket.ts` - Comprehensive WebSocket type definitions
- `websocket-learning-apps/phase2-server/` - Local development servers
- `websocket-learning-apps/chat-app/` - Phase 4A Vercel deployment
- `websocket-learning-apps/collaborative-editor/` - Phase 4B Railway deployment

### Claude Code Best Practices Summary

#### ✅ Do This for WebSocket Features

1. **Phase-aware development** - Consider learning progression
2. **Environment-specific implementation** - Respect hosting constraints
3. **Type-safe WebSocket handling** - No any types allowed
4. **Svelte 5 compliance** - Use runes, not legacy patterns
5. **Production-ready error handling** - Comprehensive state management

#### ❌ Avoid This

1. **Phase mixing** - Don't implement Phase 4 complexity in Phase 1
2. **Server dependencies in Phase 1** - Keep GitHub Pages compatible
3. **Legacy Svelte patterns** - No export let or reactive statements
4. **Type shortcuts** - No any types or eslint-disable
5. **Environment assumptions** - Always check browser vs SSR context

Following these guidelines ensures efficient collaboration with Claude Code while maintaining the educational integrity and technical quality of the WebSocket learning project.

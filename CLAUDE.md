# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WebSocket learning project built with SvelteKit and TypeScript. The project focuses on mastering browser-standard WebSocket API before exploring advanced libraries like Socket.IO. It includes comprehensive documentation and aims to build PWA-compatible real-time web applications.

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

## Svelte 5 Specification Requirements

### **CRITICAL: Always Use Latest Svelte 5 Specification**

Before coding any Svelte components, **always reference the latest Svelte 5 documentation**:

- 📖 **Primary Reference**: https://svelte.dev/docs/llms
- 📄 **Full Specification**: https://svelte.dev/llms-full.txt
- 📄 **Medium Guide**: https://svelte.dev/llms-medium.txt
- 📄 **Quick Reference**: https://svelte.dev/llms-small.txt

### **Mandatory Svelte 5 Patterns**

#### **1. Use Runes Instead of Legacy Reactive Syntax**

```svelte
<!-- ❌ LEGACY (Svelte 3/4) - DO NOT USE -->
<script>
  export let count = 0;
  $: doubled = count * 2;

  let items = [];
  $: filteredItems = items.filter(item => item.active);
</script>

<!-- ✅ SVELTE 5 RUNES - ALWAYS USE THIS -->
<script>
  let { count = $bindable(0) } = $props();
  let doubled = $derived(count * 2);

  let items = $state([]);
  let filteredItems = $derived(items.filter(item => item.active));
</script>
```

#### **2. State Management with Runes**

```svelte
<!-- ✅ CORRECT: Use $state for local reactive state -->
<script>
  let user = $state({ name: '', email: '' });
  let isLoading = $state(false);
  let errors = $state([]);
</script>

<!-- ❌ INCORRECT: Don't use legacy let declarations for reactive state -->
<script>
  let user = { name: '', email: '' }; // This won't be reactive in Svelte 5
</script>
```

#### **3. Props with $props() and $bindable()**

```svelte
<!-- ✅ CORRECT: Svelte 5 props pattern -->
<script>
  let {
    title,
    count = $bindable(0),
    items = [],
    onUpdate = () => {}
  } = $props();
</script>

<!-- ❌ INCORRECT: Legacy export syntax -->
<script>
  export let title;
  export let count = 0;
  export let items = [];
</script>
```

#### **4. Effects with $effect()**

```svelte
<!-- ✅ CORRECT: Use $effect for side effects -->
<script>
  let count = $state(0);

  $effect(() => {
    console.log('Count changed:', count);
    document.title = `Count: ${count}`;
  });

  // Cleanup effects
  $effect(() => {
    const timer = setInterval(() => count++, 1000);
    return () => clearInterval(timer);
  });
</script>

<!-- ❌ INCORRECT: Legacy reactive statements -->
<script>
  $: console.log('Count changed:', count); // Don't use this pattern
</script>
```

#### **5. Derived State with $derived()**

```svelte
<script>
	let items = $state([]);
	let filter = $state('');

	// ✅ CORRECT: Use $derived for computed values
	let filteredItems = $derived(
		items.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()))
	);

	let itemCount = $derived(filteredItems.length);
	let isEmpty = $derived(itemCount === 0);
</script>
```

### **WebSocket Integration with Svelte 5 Runes**

#### **WebSocket Store Pattern (Svelte 5)**

```typescript
// ✅ CORRECT: src/lib/stores/websocket.svelte.ts
export function createWebSocketStore(url: string) {
	let socket = $state<WebSocket | null>(null);
	let connected = $state(false);
	let messages = $state<string[]>([]);
	let error = $state<string | null>(null);

	const connect = () => {
		socket = new WebSocket(url);

		socket.onopen = () => {
			connected = true;
			error = null;
		};

		socket.onmessage = (event) => {
			messages.push(event.data);
		};

		socket.onclose = () => {
			connected = false;
		};

		socket.onerror = () => {
			error = 'Connection failed';
		};
	};

	return {
		get connected() {
			return connected;
		},
		get messages() {
			return messages;
		},
		get error() {
			return error;
		},
		connect,
		send: (message: string) => socket?.send(message)
	};
}
```

#### **Component Usage of WebSocket Store**

```svelte
<!-- ✅ CORRECT: Using WebSocket store with Svelte 5 -->
<script>
	import { createWebSocketStore } from '$lib/stores/websocket.svelte.js';

	let { url = 'wss://echo.websocket.org' } = $props();

	const ws = createWebSocketStore(url);
	let messageInput = $state('');

	$effect(() => {
		ws.connect();
	});
</script>

<div>
	{#if ws.connected}
		<p>✅ Connected</p>
	{:else}
		<p>❌ Disconnected</p>
	{/if}

	<input bind:value={messageInput} />
	<button onclick={() => ws.send(messageInput)}>Send</button>

	{#each ws.messages as message}
		<p>{message}</p>
	{/each}
</div>
```

### **Component Creation Guidelines for Svelte 5**

#### **Template for Interactive Components**

```svelte
<!-- src/lib/components/example/InteractiveDemo.svelte -->
<script>
	// ✅ Props with proper types
	let {
		title,
		description,
		wsUrl = 'wss://echo.websocket.org',
		onConnect = () => {},
		onDisconnect = () => {}
	} = $props();

	// ✅ Local state with $state
	let connectionState = $state('disconnected');
	let messages = $state([]);
	let inputValue = $state('');

	// ✅ Derived state
	let canSend = $derived(connectionState === 'connected' && inputValue.trim());
	let messageCount = $derived(messages.length);

	// ✅ Effects for lifecycle management
	let socket = $state(null);

	$effect(() => {
		return () => {
			// Cleanup when component unmounts
			if (socket) {
				socket.close();
			}
		};
	});

	// ✅ Functions for actions
	const connect = () => {
		socket = new WebSocket(wsUrl);
		connectionState = 'connecting';

		socket.onopen = () => {
			connectionState = 'connected';
			onConnect();
		};

		socket.onmessage = (event) => {
			messages.push({
				id: Date.now(),
				content: event.data,
				timestamp: new Date()
			});
		};

		socket.onclose = () => {
			connectionState = 'disconnected';
			onDisconnect();
		};
	};
</script>

<div class="demo-container">
	<h3>{title}</h3>
	<p>{description}</p>

	<div class="status">
		Status: {connectionState} ({messageCount} messages)
	</div>

	{#if connectionState === 'disconnected'}
		<button onclick={connect}>Connect</button>
	{:else if connectionState === 'connected'}
		<input bind:value={inputValue} />
		<button onclick={() => socket?.send(inputValue)} disabled={!canSend}> Send </button>
	{/if}

	<div class="messages">
		{#each messages as message (message.id)}
			<div class="message">
				{message.content}
				<small>{message.timestamp.toLocaleTimeString()}</small>
			</div>
		{/each}
	</div>
</div>
```

### **Migration from Legacy Patterns**

When updating existing components, follow this migration checklist:

```svelte
<!-- BEFORE (Legacy Svelte 3/4) -->
<script>
  export let data;
  export let onUpdate = () => {};

  let processed = [];
  let loading = false;

  $: processed = data.map(item => ({ ...item, processed: true }));

  $: if (processed.length > 0) {
    onUpdate(processed);
  }
</script>

<!-- AFTER (Svelte 5 with Runes) -->
<script>
  let { data, onUpdate = () => {} } = $props();

  let loading = $state(false);
  let processed = $derived(data.map(item => ({ ...item, processed: true })));

  $effect(() => {
    if (processed.length > 0) {
      onUpdate(processed);
    }
  });
</script>
```

### **Common Svelte 5 Patterns for This Project**

#### **1. WebSocket Connection Management**

```svelte
<script>
	let { wsUrl } = $props();
	let socket = $state(null);
	let connected = $state(false);

	$effect(() => {
		socket = new WebSocket(wsUrl);
		// ... setup handlers

		return () => socket?.close();
	});
</script>
```

#### **2. Progress Tracking**

```svelte
<script>
	let { lessons } = $props();
	let completedCount = $state(0);
	let progress = $derived((completedCount / lessons.length) * 100);
</script>
```

#### **3. Form Handling**

```svelte
<script>
	let formData = $state({ name: '', email: '' });
	let errors = $state({});
	let isValid = $derived(formData.name.length > 0 && formData.email.includes('@'));
</script>
```

### **Forbidden Patterns in Svelte 5**

❌ **DO NOT USE THESE LEGACY PATTERNS:**

```svelte
<!-- ❌ Legacy reactive statements -->
$: computed = value * 2;

<!-- ❌ Legacy export props -->
export let prop;

<!-- ❌ Legacy store subscriptions -->
$: data = $store;

<!-- ❌ Legacy bind directives in some contexts -->
bind:this={element} // Use $effect instead for refs
```

### **Verification Commands**

After implementing Svelte 5 patterns, always verify:

```bash
npm run check    # Ensure no Svelte compilation errors
npm run lint     # Verify code follows Svelte 5 patterns
npm run dev      # Test in development mode
```

## Claude Code Collaboration Guidelines

### Effective Communication Patterns

When requesting work from Claude Code, follow these proven patterns for optimal results:

#### 1. **Single-Task Focus**

```markdown
✅ GOOD: Fix TypeScript errors in Mermaid component
❌ BAD: Fix TypeScript errors, update documentation, and refactor stores
```

#### 2. **Concrete File Specifications**

```markdown
✅ GOOD:
Create src/lib/types/mermaid.ts with MermaidConfig interface
Modify src/lib/components/Mermaid.svelte to remove 'as any'

❌ BAD:
Fix type issues in the codebase
```

#### 3. **Step-by-Step Instructions**

```markdown
✅ GOOD:
Step 1: Create type definition file
Step 2: Update component imports  
Step 3: Remove any type assertions
Step 4: Verify with npm run check

❌ BAD:
Make the types work properly
```

#### 4. **Clear Success Criteria**

```markdown
✅ GOOD:
Complete when:

- npm run lint shows 0 errors
- npm run check shows 0 errors
- No 'as any' usage remains

❌ BAD:
Make sure everything works
```

### Request Templates

#### **Type Safety Fix Template**

````markdown
# Task: Fix TypeScript Type Safety

## Target Files

- src/lib/components/[ComponentName].svelte
- src/lib/types/[type-definition].ts

## Specific Requirements

1. Remove all 'as any' usage
2. Remove all 'eslint-disable' comments
3. Create proper type definitions
4. Ensure npm run lint passes

## Success Criteria

```bash
npm run lint    # 0 errors
npm run check   # 0 errors
```
````

````

### **Svelte 5 Runes Component Template**

```markdown
# Task: Create [ComponentName] with Svelte 5 Runes

## Requirements
- **MANDATORY**: Use Svelte 5 Runes ($state, $derived, $effect, $props)
- **FORBIDDEN**: Legacy reactive syntax ($:, export let)
- TypeScript with strict typing
- Responsive design with TailwindCSS

## Svelte 5 Patterns to Use
```svelte
<script>
  // ✅ Props
  let { title, data = [] } = $props();

  // ✅ State
  let isLoading = $state(false);
  let error = $state(null);

  // ✅ Derived
  let processedData = $derived(data.filter(item => item.active));

  // ✅ Effects
  $effect(() => {
    // Side effects here
  });
</script>
````

## Reference Documentation

Before coding, check: https://svelte.dev/docs/llms

## Success Criteria

- Uses $state for reactive state
- Uses $derived for computed values
- Uses $props() for component props
- Uses $effect() for side effects
- No legacy $: reactive statements
- No export let declarations

````

#### **Refactoring Template**

```markdown
# Task: Refactor [Feature] for [Reason]

## Current State
[Describe current implementation]

## Target State
[Describe desired outcome]

## Constraints
- Maintain backward compatibility
- Follow Svelte 5 patterns
- Preserve existing functionality

## Verification Steps
1. npm run check
2. npm run lint
3. Manual testing of [specific features]
````

### Common Request Pitfalls to Avoid

#### **❌ Vague Requests**

```markdown
"Fix the issues in the code"
"Make it work better"
"Update to latest standards"
```

#### **❌ Multiple Unrelated Tasks**

```markdown
"Fix types AND add tests AND update documentation"
```

#### **❌ Missing Context**

```markdown
"Update the component" (which component? how? why?)
```

#### **❌ No Success Criteria**

```markdown
"Improve the code quality" (how do we know it's improved?)
```

### Debugging and Issue Resolution

#### **Error Reporting Format**

When reporting issues to Claude Code:

````markdown
# Issue: [Brief Description]

## Error Output

```bash
[Exact error message from terminal]
```
````

## Expected Behavior

[What should happen]

## Current File State

[Relevant code snippet or file path]

## Environment

- Node.js version: [version]
- npm version: [version]
- OS: [operating system]

````

#### **Progressive Problem Solving**

For complex issues, break down requests:

```markdown
# Phase 1: Identify root cause
Analyze error in [specific file]

# Phase 2: Create minimal fix
Fix only the immediate type error

# Phase 3: Verify solution
Ensure fix doesn't break existing functionality
````

## TypeScript & Code Quality Standards

### Type Safety Philosophy

This project prioritizes **complete type safety** and follows modern TypeScript best practices. All code should be 100% type-safe without compromising on developer experience.

### Critical TypeScript Guidelines

#### 1. **Avoid `any` Type at All Costs**

```typescript
// ❌ NEVER DO THIS
function processData(data: any) {}
const config = someLibrary.initialize(data as any);

// ✅ ALWAYS DO THIS - Create proper type definitions
interface ProcessedData {
	id: string;
	value: number;
	metadata?: Record<string, unknown>;
}

function processData(data: ProcessedData) {}
```

#### 2. **External Library Type Safety**

When working with external libraries that lack proper TypeScript definitions:

```typescript
// ❌ Don't use eslint-disable as a crutch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
mermaid.initialize(config as any);

// ✅ Create comprehensive type definitions
// src/lib/types/mermaid-module.d.ts
declare module 'mermaid' {
	export interface MermaidAPI {
		initialize(config: MermaidConfig): void;
		render(id: string, definition: string): Promise<{ svg: string }>;
	}
	const mermaid: MermaidAPI;
	export default mermaid;
}

// Usage becomes fully type-safe
mermaid.initialize(config); // No any, no eslint-disable needed
```

#### 3. **Svelte 5 Runes - Mandatory Usage**

**State Management with Runes:**

```svelte
<!-- ❌ Legacy patterns - NEVER USE -->
<script>
  export let data;
  let processed = [];
  $: processed = data.map(item => transform(item));
</script>

<!-- ✅ Svelte 5 Runes - ALWAYS USE -->
<script>
  let { data } = $props();
  let processed = $derived(data.map(item => transform(item)));
</script>
```

**Props and State:**

```svelte
<!-- ✅ Correct Svelte 5 patterns -->
<script>
	let { content = '', isEditable = $bindable(false) } = $props();

	let isLoading = $state(true);
	let errorMessage = $state('');

	let canEdit = $derived(isEditable && !isLoading);

	$effect(() => {
		if (content) {
			isLoading = false;
		}
	});
</script>

{#if isLoading}
	<div>Loading...</div>
{:else if errorMessage}
	<p class="error">{errorMessage}</p>
{:else if content}
	{@html content}
{/if}
```

**Effects for Side Effects:**

```svelte
<script>
	let { wsUrl } = $props();
	let socket = $state(null);
	let connected = $state(false);

	$effect(() => {
		socket = new WebSocket(wsUrl);
		socket.onopen = () => (connected = true);
		socket.onclose = () => (connected = false);

		return () => socket?.close();
	});
</script>
```

#### 4. **Type Definition Organization**

**File Structure:**

```
src/lib/types/
├── mermaid.ts              # Custom library types
├── mermaid-module.d.ts     # Module declarations
├── websocket.ts            # WebSocket-related types
└── common.ts               # Shared interfaces
```

**Export Strategy:**

```typescript
// src/lib/index.ts
export type { MermaidConfig, WebSocketMessage, WebSocketStore } from './types';
```

### ESLint Configuration Philosophy

The project uses strict ESLint rules to maintain code quality:

- **`@typescript-eslint/no-explicit-any`**: Enforces complete type safety
- **`svelte/no-dom-manipulating`**: Ensures Svelte-idiomatic code
- **`svelte/no-at-html-tags`**: Requires careful consideration of HTML injection

### Handling External Dependencies

When integrating external libraries (like Mermaid), follow this pattern:

1. **Check for official types**: `npm install @types/library-name`
2. **Create custom types**: If none exist, write comprehensive type definitions
3. **Module augmentation**: Use TypeScript's module augmentation when needed
4. **Never use `any`**: Always prefer properly typed interfaces

### MDsveX Typography Standards

All MDsveX content should maintain consistent typography:

```css
/* Unified text sizing across all pages */
:global(.prose p) {
	font-size: 0.875rem; /* 14px - optimized for learning content */
	line-height: 1.6;
	color: #374151;
}

/* Responsive typography */
@media (max-width: 640px) {
	:global(.prose p) {
		font-size: 0.8125rem; /* 13px on mobile */
	}
}
```

## Architecture & Learning Focus

### WebSocket-First Approach

This project emphasizes learning **browser-standard WebSocket API** first before exploring higher-level abstractions. The comprehensive curriculum in `memo/curriculum.md` covers:

- Native WebSocket API mastery (50-60 hour curriculum)
- Subprotocol design and implementation
- PWA integration with Service Workers
- Transition from RxJS patterns to Svelte stores
- 11 major WebSocket use case categories

### SvelteKit Integration

- Uses SvelteKit's SSR capabilities with client-side WebSocket connections
- Implements reactive WebSocket state management using Svelte stores
- MDSveX integration allows markdown documentation within Svelte components

### Key Implementation Patterns

**WebSocket Store Pattern:**

```typescript
interface WebSocketStore {
	connected: boolean;
	error: string | null;
	data: WebSocketMessage[];
}

interface WebSocketMessage<T = unknown> {
	type: string;
	id?: string;
	timestamp: number;
	payload: T;
}
```

**Subprotocol Design:**

```typescript
interface WebSocketSubprotocol {
	name: string;
	version: string;
	messageTypes: Record<string, MessageSchema>;
}
```

**Type-Safe Component Patterns:**

```typescript
// Proper prop typing
export let chart: string;
export let theme: 'light' | 'dark' = 'dark';
export let onError: (error: Error) => void = () => {};

// State management
let state: 'loading' | 'ready' | 'error' = 'loading';
let content: string = '';
```

## Project Structure

### Source Code

- `src/routes/` - SvelteKit pages and routes
- `src/lib/` - Reusable components and utilities (accessible via `$lib` alias)
- `src/lib/types/` - **TypeScript type definitions and module declarations**
- `src/app.html` - HTML template
- `src/app.d.ts` - TypeScript definitions

### Documentation (`memo/`)

Comprehensive WebSocket learning materials including:

- `table-of-contents.md` - Complete learning resource index and curriculum overview
- `curriculum.md` - 50-60 hour structured learning curriculum (4 phases: Basic → Implementation → Testing → Practice)
- Technical deep-dives: WebSocket protocols, End-to-End vs Hop-by-Hop communication, subprotocols
- Use cases covering 11 major categories from chat to IoT and PWA integration
- WebTransport comparison for future technology understanding

### Configuration

- `svelte.config.js` - SvelteKit configuration with MDSveX support
- `vite.config.ts` - Vite build configuration with SvelteKit plugin
- `tsconfig.json` - TypeScript configuration (includes custom type paths)
- `eslint.config.js` - ESLint configuration with strict TypeScript rules

## Learning Site Architecture

### MDSveX Integration

- `.svelte` files for interactive components
- `.svx` files for Markdown with embedded Svelte components
- File-based routing: `src/routes/` structure maps to URL paths
- Dynamic routes supported: `[slug]/+page.svelte` for lesson pages
- **Consistent 14px typography** across all learning content

### Content Management Strategy

- Learning content in `memo/` as pure Markdown for easy editing
- Interactive demos and exercises as Svelte components in `src/lib/`
- Gradual progression from theory (Markdown) to practice (interactive components)
- **Type-safe component integration** in MDsveX files

## Development Standards

### Pre-Commit Checklist

Always ensure these pass before committing:

```bash
npm run check    # TypeScript + Svelte type checking
npm run lint     # ESLint + Prettier (must pass without eslint-disable)
npm run format   # Code formatting
```

### Quality Gates

- **Zero `any` types**: All code must be properly typed
- **Zero eslint-disable comments**: Fix the root cause, don't suppress warnings
- **Svelte 5 compliance**: Use reactive patterns, avoid DOM manipulation
- **Type-safe external libraries**: Create proper type definitions

### Component Development

When creating Svelte components:

1. **Always use Svelte 5 Runes** - $state, $derived, $effect, $props
2. **Reference latest specification** - https://svelte.dev/docs/llms before coding
3. **Define clear prop interfaces** with $props()
4. **Use $derived for computed values** instead of $: reactive statements
5. **Handle all possible states** (loading, error, success) with $state
6. **Export reusable types** from component files
7. **Use $effect for side effects** and cleanup

### **Mandatory Svelte 5 Checklist**

Before submitting any Svelte component, verify:

- ✅ Uses `$props()` instead of `export let`
- ✅ Uses `$state()` for reactive local state
- ✅ Uses `$derived()` instead of `$:` reactive statements
- ✅ Uses `$effect()` for side effects and lifecycle
- ✅ No legacy `bind:this` - use `$effect` for refs
- ✅ No legacy store patterns - use Svelte 5 state management
- ✅ Follows latest specification from https://svelte.dev/docs/llms

## Development Notes

- Always run `npm run check` before committing to ensure type safety
- Start with `memo/table-of-contents.md` for complete learning resource overview
- The curriculum progresses through 4 phases: Basic understanding → Implementation → Testing → Practice projects
- Focus on native WebSocket API mastery before exploring Socket.IO (covered as optional in Phase 4)
- Project emphasizes PWA integration and Service Worker compatibility
- Reference technical deep-dive documents in `memo/` when implementing WebSocket features
- **Maintain 14px typography** in all `.svx` learning content for consistency
- **Never use `any` or eslint-disable** - create proper type definitions instead
- **Follow Svelte 5 Runes patterns** for all UI state management
- **Always reference https://svelte.dev/docs/llms** before coding Svelte components
- **Never use legacy $: reactive syntax** - use $derived() instead
- **Never use export let** - use $props() instead

## Claude Code Best Practices Summary

### ✅ Do This

1. **Single-task requests** with clear objectives
2. **Specific file paths** and code examples
3. **Step-by-step instructions** in logical order
4. **Measurable success criteria** (npm run commands)
5. **Include context** about project constraints

### ❌ Avoid This

1. **Multi-task requests** covering unrelated areas
2. **Vague descriptions** without specific targets
3. **Missing success criteria** or verification steps
4. **Requests without file structure** information
5. **Assumptions about current code state**

Following these guidelines ensures efficient collaboration with Claude Code and maintains high code quality throughout the project.

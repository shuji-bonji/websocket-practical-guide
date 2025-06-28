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
- **Documentation**: MDSveX (Markdown in Svelte)
- **Build Tool**: Vite
- **Testing**: Svelte-check for type checking
- **Code Quality**: ESLint + Prettier
- **Target**: PWA-enabled real-time applications using native WebSocket API

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

#### **Component Creation Template**

```markdown
# Task: Create [ComponentName] Component

## Requirements
- TypeScript with strict typing
- Svelte 5 patterns (no DOM manipulation)
- Props interface definition
- Responsive design with TailwindCSS

## File Structure
````

src/lib/components/[category]/
├── [ComponentName].svelte
└── types.ts (if complex props)

```

## Success Criteria
- Component renders without errors
- Props are fully typed
- Follows project style guidelines
```

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
```

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

#### 3. **Svelte 5 Best Practices**

**DOM Manipulation:**

```svelte
<!-- ❌ Direct DOM manipulation (causes lint errors) -->
<script>
  container.innerHTML = content; // svelte/no-dom-manipulating
</script>

<!-- ✅ Reactive approach with proper state management -->
<script>
  let content: string = '';
  let errorMessage: string = '';
  let isLoading: boolean = true;
</script>

{#if isLoading}
  <div>Loading...</div>
{:else if errorMessage}
  <p class="error">{errorMessage}</p>
{:else if content}
  {@html content}
{/if}
```

**State Management:**

```typescript
// ✅ Proper reactive state with TypeScript
let svgContent: string = '';
let errorMessage: string = '';
let isLoading: boolean = true;

// Reactive updates
$: if (inputData) {
	processData();
}
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

1. **Define clear prop interfaces**
2. **Use proper reactive statements**
3. **Handle all possible states** (loading, error, success)
4. **Export reusable types** from component files
5. **Follow Svelte 5 patterns** (avoid deprecated features)

## Development Notes

- Always run `npm run check` before committing to ensure type safety
- Start with `memo/table-of-contents.md` for complete learning resource overview
- The curriculum progresses through 4 phases: Basic understanding → Implementation → Testing → Practice projects
- Focus on native WebSocket API mastery before exploring Socket.IO (covered as optional in Phase 4)
- Project emphasizes PWA integration and Service Worker compatibility
- Reference technical deep-dive documents in `memo/` when implementing WebSocket features
- **Maintain 14px typography** in all `.svx` learning content for consistency
- **Never use `any` or eslint-disable** - create proper type definitions instead
- **Follow Svelte 5 reactive patterns** for all UI state management

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

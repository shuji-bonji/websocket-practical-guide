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
	data: any[];
}
```

**Subprotocol Design:**

```typescript
interface WebSocketMessage<T = any> {
	type: string;
	id?: string;
	timestamp: number;
	payload: T;
}
```

## Project Structure

### Source Code

- `src/routes/` - SvelteKit pages and routes
- `src/lib/` - Reusable components and utilities (accessible via `$lib` alias)
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
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - ESLint configuration with Svelte support

## Learning Site Architecture

### MDSveX Integration

- `.svelte` files for interactive components
- `.svx` files for Markdown with embedded Svelte components
- File-based routing: `src/routes/` structure maps to URL paths
- Dynamic routes supported: `[slug]/+page.svelte` for lesson pages

### Content Management Strategy

- Learning content in `memo/` as pure Markdown for easy editing
- Interactive demos and exercises as Svelte components in `src/lib/`
- Gradual progression from theory (Markdown) to practice (interactive components)

## Development Notes

- Always run `npm run check` before committing to ensure type safety
- Start with `memo/table-of-contents.md` for complete learning resource overview
- The curriculum progresses through 4 phases: Basic understanding → Implementation → Testing → Practice projects
- Focus on native WebSocket API mastery before exploring Socket.IO (covered as optional in Phase 4)
- Project emphasizes PWA integration and Service Worker compatibility
- Reference technical deep-dive documents in `memo/` when implementing WebSocket features

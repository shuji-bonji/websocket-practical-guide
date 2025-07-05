# WebSocket Chat App

A production-ready WebSocket chat application built with SvelteKit and TypeScript, demonstrating advanced WebSocket patterns including user authentication, message persistence, real-time typing indicators, and robust connection management.

## Features

- 🔐 **User Authentication** - JWT-based authentication with session management
- 💬 **Real-time Messaging** - Instant message delivery with WebSocket
- ⌨️ **Typing Indicators** - Real-time typing status updates
- 👥 **User Presence** - Online/offline status and member list
- 🔄 **Auto-reconnection** - Automatic reconnection with exponential backoff
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Clean, accessible interface with Tailwind CSS
- 🚀 **Production Ready** - Configured for Vercel deployment

## Tech Stack

- **Frontend**: SvelteKit + TypeScript + Tailwind CSS
- **Backend**: Node.js + WebSocket (ws library)
- **Authentication**: JWT tokens
- **State Management**: Svelte 5 runes
- **Deployment**: Vercel (frontend) + Railway/Heroku (backend)

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. **Clone and install dependencies**:

   ```bash
   cd websocket-learning-apps/chat-app
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the development servers**:

   **Terminal 1 - WebSocket Server**:

   ```bash
   npm run server:dev
   ```

   **Terminal 2 - SvelteKit App**:

   ```bash
   npm run dev
   ```

4. **Open your browser** to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start SvelteKit development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start WebSocket server
- `npm run server:dev` - Start WebSocket server with auto-reload
- `npm run check` - Type checking
- `npm run lint` - Code linting
- `npm run format` - Code formatting

## Architecture

### WebSocket Server (`server/index.js`)

The WebSocket server handles:

- JWT authentication
- Message broadcasting
- User presence management
- Typing indicators
- Connection health monitoring

### Frontend Architecture

#### Stores (Svelte 5 Runes)

- `AuthStore` - User authentication state
- `ChatStore` - WebSocket connection and message management

#### Components

- `ChatRoom` - Main chat interface
- `ChatMessage` - Individual message display
- `ChatInput` - Message input with typing indicators
- `ConnectionStatus` - Connection state indicator
- `TypingIndicator` - Real-time typing status
- `UserList` - Online users sidebar

### Message Types

The WebSocket protocol supports these message types:

```typescript
interface WebSocketMessage {
	type:
		| 'chat_message'
		| 'typing_start'
		| 'typing_stop'
		| 'user_joined'
		| 'user_left'
		| 'room_update'
		| 'error'
		| 'ping'
		| 'pong'
		| 'auth_success'
		| 'message_history';
	payload: any;
	timestamp: Date;
	id: string;
}
```

## Production Deployment

### Vercel (Frontend)

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Deploy**:

   ```bash
   vercel --prod
   ```

3. **Set environment variables** in Vercel dashboard:
   - `JWT_SECRET`
   - `WEBSOCKET_SECRET`
   - `REDIS_URL` (if using Redis)

### Railway/Heroku (Backend)

1. **Deploy WebSocket server** to Railway or Heroku
2. **Update frontend configuration** to point to production WebSocket URL
3. **Set up Redis** for scaling (optional)

## WebSocket Connection Flow

1. **Authentication**: Client sends JWT token in query parameter
2. **Connection**: Server verifies token and establishes WebSocket connection
3. **Room Join**: User automatically joins default room
4. **Message Exchange**: Real-time message broadcasting
5. **Presence Updates**: User join/leave notifications
6. **Heartbeat**: Ping/pong for connection health

## Security Features

- JWT token validation
- Message sanitization
- Rate limiting (planned)
- CORS configuration
- Input validation

## Performance Optimizations

- Message history limit (1000 messages)
- Efficient state updates with Svelte 5 runes
- Debounced typing indicators
- Connection pooling
- Automatic cleanup of inactive connections

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Mobile browsers with WebSocket support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the WebSocket learning curriculum and is provided for educational purposes.

## Phase 4 Learning Objectives

This chat application demonstrates:

- Production-ready WebSocket architecture
- Scalable real-time communication
- Professional UI/UX patterns
- Cloud deployment strategies
- Security best practices
- Performance optimization techniques

Perfect for learning advanced WebSocket concepts before moving to libraries like Socket.IO!

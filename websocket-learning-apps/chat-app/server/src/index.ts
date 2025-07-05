import { config } from 'dotenv';
import { ChatDatabase } from './database/Database.js';
import { AuthManager } from './auth/AuthManager.js';
import { ChatWebSocketServer } from './websocket/WebSocketServer.js';
import { ChatHttpServer } from './http/HttpServer.js';
import type { ServerConfig } from './types/index.js';

// Load environment variables
config();

// Server configuration
const serverConfig: ServerConfig = {
	port: parseInt(process.env.WS_PORT || '8080'),
	host: process.env.WS_HOST || '0.0.0.0',
	jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
	dbPath: process.env.DB_PATH || './chat.db',
	redis: process.env.REDIS_URL ? {
		host: process.env.REDIS_HOST || 'localhost',
		port: parseInt(process.env.REDIS_PORT || '6379'),
		password: process.env.REDIS_PASSWORD
	} : undefined,
	cors: {
		origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:4173'],
		credentials: true
	},
	rateLimit: {
		windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
		maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
	},
	messageHistory: {
		maxMessages: parseInt(process.env.MAX_MESSAGES || '1000'),
		retentionDays: parseInt(process.env.MESSAGE_RETENTION_DAYS || '30')
	}
};

class ChatApplication {
	private db!: ChatDatabase;
	private auth!: AuthManager;
	private wsServer!: ChatWebSocketServer;
	private httpServer!: ChatHttpServer;

	constructor() {
		this.initializeApplication();
	}

	private initializeApplication(): void {
		console.log('🚀 Starting WebSocket Chat Application...');
		
		try {
			// Initialize database
			console.log('📦 Initializing database...');
			this.db = new ChatDatabase(serverConfig.dbPath);
			console.log('✅ Database initialized');

			// Initialize authentication manager
			console.log('🔐 Initializing authentication...');
			this.auth = new AuthManager(serverConfig.jwtSecret, this.db);
			console.log('✅ Authentication initialized');

			// Initialize HTTP API server
			console.log('🌐 Starting HTTP API server...');
			this.httpServer = new ChatHttpServer(serverConfig, this.db, this.auth);
			this.httpServer.listen(3000);
			console.log('✅ HTTP API server started');

			// Initialize WebSocket server
			console.log('🔌 Starting WebSocket server...');
			this.wsServer = new ChatWebSocketServer(serverConfig, this.db, this.auth);
			console.log('✅ WebSocket server started');

			console.log(`🎉 Chat application is ready!`);
			console.log(`📍 HTTP API Server: http://${serverConfig.host}:3000`);
			console.log(`📍 WebSocket Server: ws://${serverConfig.host}:${serverConfig.port}`);
			console.log(`📊 Database: ${serverConfig.dbPath}`);
			console.log(`🔒 JWT Secret: ${serverConfig.jwtSecret.substring(0, 10)}...`);
			
			this.setupGracefulShutdown();
			
		} catch (error) {
			console.error('❌ Failed to initialize application:', error);
			process.exit(1);
		}
	}

	private setupGracefulShutdown(): void {
		const shutdown = async (signal: string) => {
			console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
			
			try {
				// Close HTTP server
				if (this.httpServer) {
					console.log('🌐 Closing HTTP server...');
					await this.httpServer.close();
					console.log('✅ HTTP server closed');
				}

				// Close WebSocket server
				if (this.wsServer) {
					console.log('🔌 Closing WebSocket server...');
					await this.wsServer.close();
					console.log('✅ WebSocket server closed');
				}

				// Close database
				if (this.db) {
					console.log('📦 Closing database...');
					this.db.close();
					console.log('✅ Database closed');
				}

				console.log('✨ Graceful shutdown complete');
				process.exit(0);
			} catch (error) {
				console.error('❌ Error during shutdown:', error);
				process.exit(1);
			}
		};

		// Handle various termination signals
		process.on('SIGTERM', () => shutdown('SIGTERM'));
		process.on('SIGINT', () => shutdown('SIGINT'));
		process.on('SIGUSR2', () => shutdown('SIGUSR2')); // nodemon restart

		// Handle uncaught exceptions
		process.on('uncaughtException', (error) => {
			console.error('💥 Uncaught Exception:', error);
			shutdown('uncaughtException');
		});

		process.on('unhandledRejection', (reason, promise) => {
			console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
			shutdown('unhandledRejection');
		});
	}

	// Health check endpoint data
	public getHealthStatus() {
		return {
			status: 'healthy',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			memory: process.memoryUsage(),
			wsStats: this.wsServer?.getStats() || null,
			config: {
				port: serverConfig.port,
				host: serverConfig.host,
				dbPath: serverConfig.dbPath
			}
		};
	}
}

// Start the application
const app = new ChatApplication();

// Export for potential health checks or testing
export default app;
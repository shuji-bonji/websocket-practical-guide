import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse } from 'url';
import { ChatDatabase } from '../database/Database.js';
import { AuthManager } from '../auth/AuthManager.js';
import type { 
	ApiResponse, 
	CreateUserRequest, 
	LoginRequest, 
	ServerConfig 
} from '../types/index.js';

export class ChatHttpServer {
	private server;
	private db: ChatDatabase;
	private auth: AuthManager;
	private config: ServerConfig;

	constructor(config: ServerConfig, db: ChatDatabase, auth: AuthManager) {
		this.config = config;
		this.db = db;
		this.auth = auth;
		
		this.server = createServer(this.handleRequest.bind(this));
	}

	public listen(port: number = 3000): void {
		this.server.listen(port, () => {
			console.log(`HTTP API server running on port ${port}`);
		});
	}

	private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
		// Set CORS headers
		this.setCorsHeaders(res);

		// Handle preflight requests
		if (req.method === 'OPTIONS') {
			res.writeHead(200);
			res.end();
			return;
		}

		const url = parse(req.url || '', true);
		const path = url.pathname || '';
		const method = req.method || 'GET';

		try {
			// Route requests
			if (path === '/api/auth/register' && method === 'POST') {
				await this.handleRegister(req, res);
			} else if (path === '/api/auth/login' && method === 'POST') {
				await this.handleLogin(req, res);
			} else if (path === '/api/auth/refresh' && method === 'POST') {
				await this.handleRefreshToken(req, res);
			} else if (path === '/api/auth/me' && method === 'GET') {
				await this.handleGetCurrentUser(req, res);
			} else if (path === '/api/health' && method === 'GET') {
				await this.handleHealthCheck(req, res);
			} else {
				this.sendNotFound(res);
			}
		} catch (error) {
			console.error('HTTP request error:', error);
			this.sendError(res, 'Internal server error', 500);
		}
	}

	private setCorsHeaders(res: ServerResponse): void {
		const allowedOrigins = Array.isArray(this.config.cors.origin) 
			? this.config.cors.origin 
			: [this.config.cors.origin];

		res.setHeader('Access-Control-Allow-Origin', allowedOrigins.join(','));
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
		res.setHeader('Access-Control-Allow-Credentials', 'true');
	}

	private async handleRegister(req: IncomingMessage, res: ServerResponse): Promise<void> {
		const body = await this.parseJsonBody(req);
		
		if (!this.validateRegisterRequest(body)) {
			this.sendError(res, 'Invalid request data', 400);
			return;
		}

		const userData: CreateUserRequest = {
			username: body.username,
			email: body.email,
			password: body.password
		};

		try {
			// Check if username/email already exists
			if (!this.auth.isUsernameAvailable(userData.username)) {
				this.sendError(res, 'Username already exists', 409);
				return;
			}

			if (!this.auth.isEmailAvailable(userData.email)) {
				this.sendError(res, 'Email already exists', 409);
				return;
			}

			const result = await this.auth.register(userData);
			
			this.sendSuccess(res, {
				user: {
					id: result.user.id,
					username: result.user.username,
					email: result.user.email,
					avatar: result.user.avatar,
					isOnline: result.user.isOnline,
					createdAt: result.user.createdAt
				},
				token: result.token
			}, 201);

		} catch (error) {
			const message = error instanceof Error ? error.message : 'Registration failed';
			this.sendError(res, message, 400);
		}
	}

	private async handleLogin(req: IncomingMessage, res: ServerResponse): Promise<void> {
		const body = await this.parseJsonBody(req);
		
		if (!this.validateLoginRequest(body)) {
			this.sendError(res, 'Invalid request data', 400);
			return;
		}

		const credentials: LoginRequest = {
			email: body.email,
			password: body.password
		};

		try {
			const result = await this.auth.login(credentials);
			
			this.sendSuccess(res, {
				user: {
					id: result.user.id,
					username: result.user.username,
					email: result.user.email,
					avatar: result.user.avatar,
					isOnline: result.user.isOnline,
					lastSeen: result.user.lastSeen,
					createdAt: result.user.createdAt
				},
				token: result.token
			});

		} catch (error) {
			const message = error instanceof Error ? error.message : 'Login failed';
			this.sendError(res, message, 401);
		}
	}

	private async handleRefreshToken(req: IncomingMessage, res: ServerResponse): Promise<void> {
		const authHeader = req.headers.authorization;
		const token = this.auth.extractToken(authHeader);

		if (!token) {
			this.sendError(res, 'No token provided', 401);
			return;
		}

		try {
			const newToken = this.auth.refreshToken(token);
			
			if (!newToken) {
				this.sendError(res, 'Invalid or expired token', 401);
				return;
			}

			this.sendSuccess(res, { token: newToken });

		} catch (error) {
			this.sendError(res, 'Token refresh failed', 401);
		}
	}

	private async handleGetCurrentUser(req: IncomingMessage, res: ServerResponse): Promise<void> {
		const authHeader = req.headers.authorization;
		const user = this.auth.authenticateRequest(authHeader);

		if (!user) {
			this.sendError(res, 'Unauthorized', 401);
			return;
		}

		this.sendSuccess(res, {
			user: {
				id: user.id,
				username: user.username,
				email: user.email,
				avatar: user.avatar,
				isOnline: user.isOnline,
				lastSeen: user.lastSeen,
				createdAt: user.createdAt
			}
		});
	}

	private async handleHealthCheck(req: IncomingMessage, res: ServerResponse): Promise<void> {
		this.sendSuccess(res, {
			status: 'healthy',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			memory: process.memoryUsage(),
			version: '1.0.0'
		});
	}

	private async parseJsonBody(req: IncomingMessage): Promise<any> {
		return new Promise((resolve, reject) => {
			let body = '';
			
			req.on('data', (chunk) => {
				body += chunk.toString();
			});
			
			req.on('end', () => {
				try {
					resolve(JSON.parse(body));
				} catch (error) {
					reject(new Error('Invalid JSON'));
				}
			});
			
			req.on('error', reject);
		});
	}

	private validateRegisterRequest(body: any): boolean {
		return (
			body &&
			typeof body.username === 'string' &&
			typeof body.email === 'string' &&
			typeof body.password === 'string' &&
			body.username.length >= 3 &&
			body.email.includes('@') &&
			body.password.length >= 6
		);
	}

	private validateLoginRequest(body: any): boolean {
		return (
			body &&
			typeof body.email === 'string' &&
			typeof body.password === 'string' &&
			body.email.includes('@')
		);
	}

	private sendSuccess<T>(res: ServerResponse, data: T, statusCode: number = 200): void {
		const response: ApiResponse<T> = {
			success: true,
			data
		};

		res.writeHead(statusCode, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(response));
	}

	private sendError(res: ServerResponse, error: string, statusCode: number = 400): void {
		const response: ApiResponse = {
			success: false,
			error
		};

		res.writeHead(statusCode, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify(response));
	}

	private sendNotFound(res: ServerResponse): void {
		this.sendError(res, 'Not found', 404);
	}

	public close(): Promise<void> {
		return new Promise((resolve) => {
			this.server.close(() => {
				console.log('HTTP server closed');
				resolve();
			});
		});
	}
}
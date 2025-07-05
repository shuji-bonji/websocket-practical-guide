import jwt from 'jsonwebtoken';
import type { 
	User, 
	AuthToken, 
	LoginRequest, 
	CreateUserRequest,
	AuthError,
	ValidationError 
} from '../types/index.js';
import { ChatDatabase } from '../database/Database.js';

export class AuthManager {
	private jwtSecret: string;
	private db: ChatDatabase;
	private tokenExpiry: string;

	constructor(jwtSecret: string, database: ChatDatabase, tokenExpiry: string = '7d') {
		this.jwtSecret = jwtSecret;
		this.db = database;
		this.tokenExpiry = tokenExpiry;
	}

	/**
	 * Register a new user
	 */
	async register(userData: CreateUserRequest): Promise<{ user: User; token: string }> {
		// Validate input
		this.validateUserData(userData);

		try {
			const user = await this.db.createUser(userData);
			const token = this.generateToken(user);

			return { user, token };
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(error.message);
			}
			throw new Error('Registration failed');
		}
	}

	/**
	 * Login existing user
	 */
	async login(credentials: LoginRequest): Promise<{ user: User; token: string }> {
		// Validate input
		this.validateLoginData(credentials);

		const user = await this.db.verifyPassword(credentials.email, credentials.password);
		
		if (!user) {
			throw new Error('Invalid email or password');
		}

		// Update user online status
		this.db.updateUserOnlineStatus(user.id, true);

		const token = this.generateToken(user);
		return { user, token };
	}

	/**
	 * Verify JWT token
	 */
	verifyToken(token: string): AuthToken | null {
		try {
			const decoded = jwt.verify(token, this.jwtSecret) as AuthToken;
			return decoded;
		} catch (error) {
			return null;
		}
	}

	/**
	 * Generate JWT token for user
	 */
	generateToken(user: User): string {
		const payload: Omit<AuthToken, 'iat' | 'exp'> = {
			userId: user.id,
			username: user.username,
			email: user.email
		};

		return jwt.sign(payload, this.jwtSecret, {
			expiresIn: this.tokenExpiry,
			issuer: 'websocket-chat-app',
			audience: 'chat-users'
		} as jwt.SignOptions);
	}

	/**
	 * Refresh token (extend expiry)
	 */
	refreshToken(token: string): string | null {
		const decoded = this.verifyToken(token);
		if (!decoded) return null;

		const user = this.db.getUserById(decoded.userId);
		if (!user) return null;

		return this.generateToken(user);
	}

	/**
	 * Logout user (mark as offline)
	 */
	logout(userId: string): void {
		this.db.updateUserOnlineStatus(userId, false);
	}

	/**
	 * Get user from token
	 */
	getUserFromToken(token: string): User | null {
		const decoded = this.verifyToken(token);
		if (!decoded) return null;

		return this.db.getUserById(decoded.userId);
	}

	/**
	 * Validate user registration data
	 */
	private validateUserData(userData: CreateUserRequest): void {
		const errors: string[] = [];

		// Username validation
		if (!userData.username || userData.username.trim().length === 0) {
			errors.push('Username is required');
		} else if (userData.username.length < 3) {
			errors.push('Username must be at least 3 characters long');
		} else if (userData.username.length > 20) {
			errors.push('Username must be less than 20 characters long');
		} else if (!/^[a-zA-Z0-9_-]+$/.test(userData.username)) {
			errors.push('Username can only contain letters, numbers, hyphens, and underscores');
		}

		// Email validation
		if (!userData.email || userData.email.trim().length === 0) {
			errors.push('Email is required');
		} else if (!this.isValidEmail(userData.email)) {
			errors.push('Invalid email format');
		}

		// Password validation
		if (!userData.password || userData.password.length === 0) {
			errors.push('Password is required');
		} else if (userData.password.length < 6) {
			errors.push('Password must be at least 6 characters long');
		} else if (userData.password.length > 128) {
			errors.push('Password must be less than 128 characters long');
		}

		if (errors.length > 0) {
			throw new Error(`Validation failed: ${errors.join(', ')}`);
		}
	}

	/**
	 * Validate login data
	 */
	private validateLoginData(credentials: LoginRequest): void {
		const errors: string[] = [];

		if (!credentials.email || credentials.email.trim().length === 0) {
			errors.push('Email is required');
		}

		if (!credentials.password || credentials.password.length === 0) {
			errors.push('Password is required');
		}

		if (errors.length > 0) {
			throw new Error(`Validation failed: ${errors.join(', ')}`);
		}
	}

	/**
	 * Email format validation
	 */
	private isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	/**
	 * Check if username exists
	 */
	isUsernameAvailable(username: string): boolean {
		return this.db.getUserByUsername(username) === null;
	}

	/**
	 * Check if email exists
	 */
	isEmailAvailable(email: string): boolean {
		return this.db.getUserByEmail(email) === null;
	}

	/**
	 * Extract token from various sources
	 */
	extractToken(authHeader?: string, queryToken?: string, cookieToken?: string): string | null {
		// Check Authorization header
		if (authHeader && authHeader.startsWith('Bearer ')) {
			return authHeader.substring(7);
		}

		// Check query parameter
		if (queryToken) {
			return queryToken;
		}

		// Check cookie
		if (cookieToken) {
			return cookieToken;
		}

		return null;
	}

	/**
	 * Validate token and get user data
	 */
	authenticateRequest(authHeader?: string, queryToken?: string, cookieToken?: string): User | null {
		const token = this.extractToken(authHeader, queryToken, cookieToken);
		if (!token) return null;

		return this.getUserFromToken(token);
	}
}
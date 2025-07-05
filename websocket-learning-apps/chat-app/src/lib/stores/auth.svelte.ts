import { browser } from '$app/environment';
import type { User, AuthState } from '$types/chat';

interface AuthResponse {
	user: User;
	token: string;
}

export class AuthStore {
	private _authState = $state<AuthState>({
		isAuthenticated: false
	});

	private apiUrl = 'http://localhost:3000/api';

	get authState() {
		return this._authState;
	}

	get isAuthenticated() {
		return this._authState.isAuthenticated;
	}

	get user() {
		return this._authState.user;
	}

	get token() {
		return this._authState.token;
	}

	// Initialize auth state from localStorage
	init() {
		if (!browser) return;

		const storedAuth = localStorage.getItem('chat-auth');
		if (storedAuth) {
			try {
				const parsed = JSON.parse(storedAuth);
				if (parsed.token && parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
					this._authState = {
						...parsed,
						expiresAt: new Date(parsed.expiresAt)
					};
				} else {
					this.logout();
				}
			} catch (error) {
				console.error('Error parsing stored auth:', error);
				this.logout();
			}
		}
	}

	// Login with email and password
	async login(email: string, password: string): Promise<boolean> {
		try {
			const response = await fetch(`${this.apiUrl}/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email: email.trim(), password })
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Login failed');
			}

			const data: { success: boolean; data: AuthResponse } = await response.json();

			if (!data.success) {
				throw new Error('Login failed');
			}

			const { user, token } = data.data;
			const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

			this._authState = {
				isAuthenticated: true,
				user,
				token,
				expiresAt
			};

			// Store in localStorage
			if (browser) {
				localStorage.setItem(
					'chat-auth',
					JSON.stringify({
						...this._authState,
						expiresAt: expiresAt.toISOString()
					})
				);
			}

			return true;
		} catch (error) {
			console.error('Login failed:', error);
			return false;
		}
	}

	// Register new user
	async register(username: string, email: string, password: string): Promise<boolean> {
		try {
			const response = await fetch(`${this.apiUrl}/auth/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: username.trim(),
					email: email.trim(),
					password
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Registration failed');
			}

			const data: { success: boolean; data: AuthResponse } = await response.json();

			if (!data.success) {
				throw new Error('Registration failed');
			}

			const { user, token } = data.data;
			const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

			this._authState = {
				isAuthenticated: true,
				user,
				token,
				expiresAt
			};

			// Store in localStorage
			if (browser) {
				localStorage.setItem(
					'chat-auth',
					JSON.stringify({
						...this._authState,
						expiresAt: expiresAt.toISOString()
					})
				);
			}

			return true;
		} catch (error) {
			console.error('Registration failed:', error);
			return false;
		}
	}

	// Logout
	logout() {
		this._authState = {
			isAuthenticated: false
		};

		if (browser) {
			localStorage.removeItem('chat-auth');
		}
	}

	// Check if token is expired
	isTokenExpired(): boolean {
		if (!this._authState.expiresAt) return true;
		return new Date() > this._authState.expiresAt;
	}

	// Refresh token
	async refreshToken(): Promise<boolean> {
		if (!this._authState.token) return false;

		try {
			const response = await fetch(`${this.apiUrl}/auth/refresh`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this._authState.token}`
				}
			});

			if (!response.ok) {
				this.logout();
				return false;
			}

			const data: { success: boolean; data: { token: string } } = await response.json();

			if (!data.success) {
				this.logout();
				return false;
			}

			const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

			this._authState = {
				...this._authState,
				token: data.data.token,
				expiresAt
			};

			if (browser) {
				localStorage.setItem(
					'chat-auth',
					JSON.stringify({
						...this._authState,
						expiresAt: expiresAt.toISOString()
					})
				);
			}

			return true;
		} catch (error) {
			console.error('Token refresh failed:', error);
			this.logout();
			return false;
		}
	}
}

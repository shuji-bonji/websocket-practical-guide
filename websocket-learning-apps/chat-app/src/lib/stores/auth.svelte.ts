import { browser } from '$app/environment';
import { nanoid } from 'nanoid';
import type { User, AuthState } from '$types/chat';

export class AuthStore {
	private _authState = $state<AuthState>({
		isAuthenticated: false
	});

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

	// Login with username and email
	async login(username: string, email: string): Promise<boolean> {
		try {
			// For demo purposes, create a simple JWT-like token
			const user: User = {
				id: nanoid(),
				username: username.trim(),
				email: email.trim(),
				lastSeen: new Date(),
				isOnline: true
			};

			// Create a simple token (in production, this would come from your backend)
			const token = this.createDemoToken(user);
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

	// Logout
	logout() {
		this._authState = {
			isAuthenticated: false
		};

		if (browser) {
			localStorage.removeItem('chat-auth');
		}
	}

	// Create a demo token (in production, use proper JWT with server-side signing)
	private createDemoToken(user: User): string {
		const payload = {
			id: user.id,
			username: user.username,
			email: user.email,
			iat: Math.floor(Date.now() / 1000),
			exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 hours
		};

		// Base64 encode the payload (NOT secure for production!)
		return btoa(JSON.stringify(payload));
	}

	// Check if token is expired
	isTokenExpired(): boolean {
		if (!this._authState.expiresAt) return true;
		return new Date() > this._authState.expiresAt;
	}

	// Refresh token (in production, this would call your backend)
	async refreshToken(): Promise<boolean> {
		if (!this._authState.user) return false;

		try {
			const newToken = this.createDemoToken(this._authState.user);
			const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

			this._authState = {
				...this._authState,
				token: newToken,
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
			return false;
		}
	}
}

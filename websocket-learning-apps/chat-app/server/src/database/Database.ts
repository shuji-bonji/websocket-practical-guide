import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import type {
	User,
	CreateUserRequest,
	ChatMessage,
	ChatRoom,
	CreateRoomRequest,
	DatabaseUser,
	DatabaseMessage,
	DatabaseRoom,
	PaginationOptions,
	PaginatedResult
} from '../types/index.js';

export class ChatDatabase {
	private db: Database.Database;

	constructor(dbPath: string = 'chat.db') {
		this.db = new Database(dbPath);
		this.db.pragma('journal_mode = WAL');
		this.db.pragma('foreign_keys = ON');
		this.initializeSchema();
		this.createDefaultData();
	}

	private initializeSchema(): void {
		// Users table
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS users (
				id TEXT PRIMARY KEY,
				username TEXT UNIQUE NOT NULL,
				email TEXT UNIQUE NOT NULL,
				password_hash TEXT NOT NULL,
				avatar TEXT,
				is_online BOOLEAN DEFAULT FALSE,
				last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
			)
		`);

		// Rooms table
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS rooms (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				description TEXT,
				is_private BOOLEAN DEFAULT FALSE,
				owner_id TEXT NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
			)
		`);

		// Messages table
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS messages (
				id TEXT PRIMARY KEY,
				type TEXT NOT NULL DEFAULT 'message',
				content TEXT NOT NULL,
				user_id TEXT NOT NULL,
				room_id TEXT NOT NULL,
				reply_to_id TEXT,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				edited_at DATETIME,
				FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
				FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
				FOREIGN KEY (reply_to_id) REFERENCES messages (id) ON DELETE SET NULL
			)
		`);

		// Room members table (many-to-many relationship)
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS room_members (
				room_id TEXT NOT NULL,
				user_id TEXT NOT NULL,
				joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				is_admin BOOLEAN DEFAULT FALSE,
				PRIMARY KEY (room_id, user_id),
				FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
				FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
			)
		`);

		// Message reactions table
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS message_reactions (
				id TEXT PRIMARY KEY,
				message_id TEXT NOT NULL,
				user_id TEXT NOT NULL,
				emoji TEXT NOT NULL,
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
				UNIQUE(message_id, user_id, emoji),
				FOREIGN KEY (message_id) REFERENCES messages (id) ON DELETE CASCADE,
				FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
			)
		`);

		// Indexes for performance
		this.db.exec(`
			CREATE INDEX IF NOT EXISTS idx_messages_room_created 
			ON messages (room_id, created_at DESC);
			
			CREATE INDEX IF NOT EXISTS idx_messages_user_created 
			ON messages (user_id, created_at DESC);
			
			CREATE INDEX IF NOT EXISTS idx_users_email 
			ON users (email);
			
			CREATE INDEX IF NOT EXISTS idx_users_username 
			ON users (username);
		`);
	}

	private createDefaultData(): void {
		const defaultRoomExists = this.db
			.prepare('SELECT COUNT(*) as count FROM rooms WHERE id = ?')
			.get('general') as { count: number };

		if (defaultRoomExists.count === 0) {
			// Create default admin user
			const adminId = nanoid();
			const adminPasswordHash = bcrypt.hashSync('admin123', 10);

			this.db
				.prepare(`
					INSERT INTO users (id, username, email, password_hash, is_online)
					VALUES (?, ?, ?, ?, ?)
				`)
				.run(adminId, 'admin', 'admin@chatapp.local', adminPasswordHash, false);

			// Create default general room
			this.db
				.prepare(`
					INSERT INTO rooms (id, name, description, is_private, owner_id)
					VALUES (?, ?, ?, ?, ?)
				`)
				.run('general', 'General', 'General chat room for everyone', false, adminId);

			// Add admin to the general room
			this.db
				.prepare(`
					INSERT INTO room_members (room_id, user_id, is_admin)
					VALUES (?, ?, ?)
				`)
				.run('general', adminId, true);

			console.log('Default data created: admin user and general room');
		}
	}

	// User operations
	async createUser(userData: CreateUserRequest): Promise<User> {
		const userId = nanoid();
		const passwordHash = await bcrypt.hash(userData.password, 10);

		try {
			this.db
				.prepare(`
					INSERT INTO users (id, username, email, password_hash)
					VALUES (?, ?, ?, ?)
				`)
				.run(userId, userData.username, userData.email, passwordHash);

			// Add user to general room
			this.db
				.prepare(`
					INSERT INTO room_members (room_id, user_id)
					VALUES (?, ?)
				`)
				.run('general', userId);

			return this.getUserById(userId)!;
		} catch (error) {
			if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
				if (error.message.includes('username')) {
					throw new Error('Username already exists');
				}
				if (error.message.includes('email')) {
					throw new Error('Email already exists');
				}
			}
			throw error;
		}
	}

	getUserById(userId: string): User | null {
		const dbUser = this.db
			.prepare('SELECT * FROM users WHERE id = ?')
			.get(userId) as DatabaseUser | undefined;

		return dbUser ? this.mapDatabaseUserToUser(dbUser) : null;
	}

	getUserByEmail(email: string): User | null {
		const dbUser = this.db
			.prepare('SELECT * FROM users WHERE email = ?')
			.get(email) as DatabaseUser | undefined;

		return dbUser ? this.mapDatabaseUserToUser(dbUser) : null;
	}

	getUserByUsername(username: string): User | null {
		const dbUser = this.db
			.prepare('SELECT * FROM users WHERE username = ?')
			.get(username) as DatabaseUser | undefined;

		return dbUser ? this.mapDatabaseUserToUser(dbUser) : null;
	}

	async verifyPassword(email: string, password: string): Promise<User | null> {
		const dbUser = this.db
			.prepare('SELECT * FROM users WHERE email = ?')
			.get(email) as DatabaseUser | undefined;

		if (!dbUser) return null;

		const isValid = await bcrypt.compare(password, dbUser.password_hash);
		return isValid ? this.mapDatabaseUserToUser(dbUser) : null;
	}

	updateUserOnlineStatus(userId: string, isOnline: boolean): void {
		this.db
			.prepare(`
				UPDATE users 
				SET is_online = ?, last_seen = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
				WHERE id = ?
			`)
			.run(isOnline, userId);
	}

	// Room operations
	createRoom(roomData: CreateRoomRequest, ownerId: string): ChatRoom {
		const roomId = nanoid();

		this.db
			.prepare(`
				INSERT INTO rooms (id, name, description, is_private, owner_id)
				VALUES (?, ?, ?, ?, ?)
			`)
			.run(roomId, roomData.name, roomData.description || '', roomData.isPrivate || false, ownerId);

		// Add owner to the room
		this.db
			.prepare(`
				INSERT INTO room_members (room_id, user_id, is_admin)
				VALUES (?, ?, ?)
			`)
			.run(roomId, ownerId, true);

		return this.getRoomById(roomId)!;
	}

	getRoomById(roomId: string): ChatRoom | null {
		const dbRoom = this.db
			.prepare('SELECT * FROM rooms WHERE id = ?')
			.get(roomId) as DatabaseRoom | undefined;

		if (!dbRoom) return null;

		const members = this.db
			.prepare('SELECT user_id FROM room_members WHERE room_id = ?')
			.all(roomId) as { user_id: string }[];

		return {
			id: dbRoom.id,
			name: dbRoom.name,
			description: dbRoom.description || '',
			isPrivate: Boolean(dbRoom.is_private),
			ownerId: dbRoom.owner_id,
			members: new Set(members.map(m => m.user_id)),
			typingUsers: new Map(),
			createdAt: new Date(dbRoom.created_at),
			lastActivity: new Date(dbRoom.updated_at)
		};
	}

	getRoomsByUserId(userId: string): ChatRoom[] {
		const dbRooms = this.db
			.prepare(`
				SELECT r.* FROM rooms r
				JOIN room_members rm ON r.id = rm.room_id
				WHERE rm.user_id = ?
				ORDER BY r.updated_at DESC
			`)
			.all(userId) as DatabaseRoom[];

		return dbRooms.map(dbRoom => {
			const members = this.db
				.prepare('SELECT user_id FROM room_members WHERE room_id = ?')
				.all(dbRoom.id) as { user_id: string }[];

			return {
				id: dbRoom.id,
				name: dbRoom.name,
				description: dbRoom.description || '',
				isPrivate: Boolean(dbRoom.is_private),
				ownerId: dbRoom.owner_id,
				members: new Set(members.map(m => m.user_id)),
				typingUsers: new Map(),
				createdAt: new Date(dbRoom.created_at),
				lastActivity: new Date(dbRoom.updated_at)
			};
		});
	}

	joinRoom(roomId: string, userId: string): void {
		this.db
			.prepare(`
				INSERT OR IGNORE INTO room_members (room_id, user_id)
				VALUES (?, ?)
			`)
			.run(roomId, userId);
	}

	leaveRoom(roomId: string, userId: string): void {
		this.db
			.prepare('DELETE FROM room_members WHERE room_id = ? AND user_id = ?')
			.run(roomId, userId);
	}

	// Message operations
	createMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'reactions'>): ChatMessage {
		const messageId = nanoid();

		this.db
			.prepare(`
				INSERT INTO messages (id, type, content, user_id, room_id, reply_to_id)
				VALUES (?, ?, ?, ?, ?, ?)
			`)
			.run(
				messageId,
				message.type,
				message.content,
				message.userId,
				message.roomId,
				message.replyToId || null
			);

		// Update room activity
		this.db
			.prepare('UPDATE rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = ?')
			.run(message.roomId);

		return this.getMessageById(messageId)!;
	}

	getMessageById(messageId: string): ChatMessage | null {
		const dbMessage = this.db
			.prepare(`
				SELECT m.*, u.username 
				FROM messages m
				JOIN users u ON m.user_id = u.id
				WHERE m.id = ?
			`)
			.get(messageId) as (DatabaseMessage & { username: string }) | undefined;

		return dbMessage ? this.mapDatabaseMessageToChatMessage(dbMessage) : null;
	}

	getMessagesByRoom(
		roomId: string, 
		options: PaginationOptions = { page: 1, limit: 50 }
	): PaginatedResult<ChatMessage> {
		const offset = (options.page - 1) * options.limit;
		const orderBy = options.orderBy || 'created_at';
		const orderDirection = options.orderDirection || 'DESC';

		const totalQuery = this.db.prepare('SELECT COUNT(*) as count FROM messages WHERE room_id = ?');
		const total = (totalQuery.get(roomId) as { count: number }).count;

		const messagesQuery = this.db.prepare(`
			SELECT m.*, u.username 
			FROM messages m
			JOIN users u ON m.user_id = u.id
			WHERE m.room_id = ?
			ORDER BY ${orderBy} ${orderDirection}
			LIMIT ? OFFSET ?
		`);

		const dbMessages = messagesQuery.all(roomId, options.limit, offset) as (DatabaseMessage & { username: string })[];

		const messages = dbMessages.map(msg => this.mapDatabaseMessageToChatMessage(msg));

		return {
			data: messages,
			total,
			page: options.page,
			limit: options.limit,
			totalPages: Math.ceil(total / options.limit)
		};
	}

	// Helper methods
	private mapDatabaseUserToUser(dbUser: DatabaseUser): User {
		return {
			id: dbUser.id,
			username: dbUser.username,
			email: dbUser.email,
			avatar: dbUser.avatar || undefined,
			isOnline: Boolean(dbUser.is_online),
			lastSeen: new Date(dbUser.last_seen),
			createdAt: new Date(dbUser.created_at),
			updatedAt: new Date(dbUser.updated_at)
		};
	}

	private mapDatabaseMessageToChatMessage(dbMessage: DatabaseMessage & { username: string }): ChatMessage {
		return {
			id: dbMessage.id,
			type: dbMessage.type as 'message' | 'system' | 'join' | 'leave',
			content: dbMessage.content,
			userId: dbMessage.user_id,
			username: dbMessage.username,
			roomId: dbMessage.room_id,
			replyToId: dbMessage.reply_to_id || undefined,
			timestamp: new Date(dbMessage.created_at),
			editedAt: dbMessage.edited_at ? new Date(dbMessage.edited_at) : undefined,
			reactions: [] // TODO: Implement reactions
		};
	}

	// Cleanup operations
	cleanup(): void {
		// Clean up old messages (older than 30 days)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		this.db
			.prepare('DELETE FROM messages WHERE created_at < ?')
			.run(thirtyDaysAgo.toISOString());

		// Set all users as offline
		this.db
			.prepare('UPDATE users SET is_online = FALSE')
			.run();
	}

	close(): void {
		this.cleanup();
		this.db.close();
	}
}
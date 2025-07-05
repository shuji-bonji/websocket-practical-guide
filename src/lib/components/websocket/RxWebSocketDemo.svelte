<script lang="ts">
	import { createWebSocketStore } from '../../stores/websocket.svelte.js';
	import { map, filter } from 'rxjs/operators';
	import type { Subscription } from 'rxjs';

	interface Props {
		url: string;
		protocols?: string[];
		autoConnect?: boolean;
		showAdvanced?: boolean;
	}

	let {
		url = 'wss://echo.websocket.org',
		protocols = [],
		autoConnect = true,
		showAdvanced = false
	}: Props = $props();

	// Create WebSocket store
	const wsStore = createWebSocketStore();

	// Local state
	let messageInput = '';
	let connectionConfig = {
		url,
		protocols,
		enableAutoReconnect: true,
		maxReconnectAttempts: 5,
		reconnectDelay: 3000
	};

	// RxJS subscriptions
	let subscriptions: Subscription[] = [];

	// Reactive values from store
	let state = $derived(wsStore.state);
	let messages = $derived(wsStore.messages);
	let isConnected = $derived(wsStore.isConnected);

	// Connection statistics
	let stats = {
		totalMessages: 0,
		messagesPerSecond: 0,
		averageLatency: 0,
		connectionUptime: 0
	};

	$effect(() => {
		if (autoConnect) {
			connect();
		}

		// Set up RxJS streams for advanced features
		setupRxStreams();

		// Update statistics every second
		const statsInterval = setInterval(updateStats, 1000);

		return () => {
			clearInterval(statsInterval);
			// Clean up subscriptions
			subscriptions.forEach((sub) => sub.unsubscribe());
			wsStore.destroy();
		};
	});

	function setupRxStreams(): void {
		// Filter specific message types
		const echoMessages$ = wsStore
			.ofType<string>('echo')
			.pipe(map((message) => `Filtered echo: ${message}`));

		// Subscribe to filtered messages
		const echoSub = echoMessages$.subscribe((message) => {
			console.log('Echo message received:', message);
		});
		subscriptions.push(echoSub);

		// Monitor connection state changes
		const connectionSub = wsStore.messages$
			.pipe(filter((msg) => msg.type === 'connection'))
			.subscribe((msg) => {
				console.log('Connection event:', msg);
			});
		subscriptions.push(connectionSub);
	}

	function connect(): void {
		try {
			wsStore.connect(connectionConfig);
		} catch (error) {
			console.error('Connection error:', error);
		}
	}

	function disconnect(): void {
		wsStore.disconnect();
	}

	function sendMessage(): void {
		if (!messageInput.trim() || !isConnected) return;

		try {
			wsStore.sendJSON({
				type: 'message',
				content: messageInput,
				timestamp: Date.now()
			});
			messageInput = '';
		} catch (error) {
			console.error('Send error:', error);
		}
	}

	function sendPing(): void {
		if (!isConnected) return;

		wsStore.sendJSON({
			type: 'ping',
			timestamp: Date.now()
		});
	}

	function clearMessages(): void {
		wsStore.clearMessages();
	}

	function updateStats(): void {
		if (state.connectedAt) {
			stats = { ...stats, connectionUptime: Date.now() - state.connectedAt };
		}

		stats = { ...stats, totalMessages: messages.length };

		// Calculate messages per second (last 10 seconds)
		const tenSecondsAgo = Date.now() - 10000;
		const recentMessages = messages.filter((msg) => msg.timestamp > tenSecondsAgo);
		stats = { ...stats, messagesPerSecond: recentMessages.length / 10 };
	}

	function formatUptime(uptime: number): string {
		const seconds = Math.floor(uptime / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);

		if (hours > 0) {
			return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
		} else if (minutes > 0) {
			return `${minutes}m ${seconds % 60}s`;
		} else {
			return `${seconds}s`;
		}
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'connected':
				return '#28a745';
			case 'connecting':
				return '#ffc107';
			case 'disconnected':
				return '#6c757d';
			case 'error':
				return '#dc3545';
			default:
				return '#6c757d';
		}
	}
</script>

<div class="rx-websocket-demo">
	<div class="demo-header">
		<h2>RxJS WebSocket Demo</h2>
		<p>Advanced WebSocket management with reactive programming</p>
	</div>

	<div class="demo-layout">
		<div class="control-panel">
			<div class="connection-controls">
				<h3>Connection</h3>

				<div class="input-group">
					<label for="url">WebSocket URL:</label>
					<input id="url" type="text" bind:value={connectionConfig.url} disabled={isConnected} />
				</div>

				<div class="connection-actions">
					{#if isConnected}
						<button class="btn btn-danger" onclick={disconnect}> Disconnect </button>
					{:else}
						<button class="btn btn-primary" onclick={connect}> Connect </button>
					{/if}

					<button class="btn btn-outline" onclick={sendPing} disabled={!isConnected}>
						Send Ping
					</button>
				</div>
			</div>

			<div class="connection-status">
				<h3>Status</h3>
				<div class="status-grid">
					<div class="status-item">
						<span class="status-label">Connection:</span>
						<span class="status-value" style="color: {getStatusColor(state.status)}">
							{state.status}
						</span>
					</div>
					<div class="status-item">
						<span class="status-label">Messages:</span>
						<span class="status-value">{state.messageCount}</span>
					</div>
					<div class="status-item">
						<span class="status-label">Reconnects:</span>
						<span class="status-value">{state.reconnectAttempts}</span>
					</div>
					{#if state.connectedAt}
						<div class="status-item">
							<span class="status-label">Uptime:</span>
							<span class="status-value">{formatUptime(stats.connectionUptime)}</span>
						</div>
					{/if}
				</div>
			</div>

			{#if showAdvanced}
				<div class="advanced-config">
					<h3>Advanced Configuration</h3>

					<div class="input-group">
						<label for="reconnect">Auto Reconnect:</label>
						<input
							id="reconnect"
							type="checkbox"
							bind:checked={connectionConfig.enableAutoReconnect}
							disabled={isConnected}
						/>
					</div>

					<div class="input-group">
						<label for="max-attempts">Max Reconnect Attempts:</label>
						<input
							id="max-attempts"
							type="number"
							bind:value={connectionConfig.maxReconnectAttempts}
							min="1"
							max="10"
							disabled={isConnected}
						/>
					</div>

					<div class="input-group">
						<label for="reconnect-delay">Reconnect Delay (ms):</label>
						<input
							id="reconnect-delay"
							type="number"
							bind:value={connectionConfig.reconnectDelay}
							min="1000"
							step="1000"
							disabled={isConnected}
						/>
					</div>
				</div>
			{/if}

			<div class="statistics">
				<h3>Statistics</h3>
				<div class="stats-grid">
					<div class="stat-item">
						<span class="stat-label">Total Messages:</span>
						<span class="stat-value">{stats.totalMessages}</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">Messages/sec:</span>
						<span class="stat-value">{stats.messagesPerSecond.toFixed(1)}</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">Avg Latency:</span>
						<span class="stat-value">{stats.averageLatency}ms</span>
					</div>
				</div>
			</div>
		</div>

		<div class="message-panel">
			<div class="message-input">
				<h3>Send Message</h3>
				<div class="input-actions">
					<input
						type="text"
						bind:value={messageInput}
						placeholder="Enter message..."
						disabled={!isConnected}
						onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && sendMessage()}
					/>
					<button
						class="btn btn-primary"
						onclick={sendMessage}
						disabled={!isConnected || !messageInput.trim()}
					>
						Send
					</button>
				</div>
			</div>

			<div class="message-display">
				<div class="display-header">
					<h3>Messages ({messages.length})</h3>
					<button class="btn btn-sm btn-outline" onclick={clearMessages}> Clear </button>
				</div>

				<div class="message-list">
					{#each messages as message (message.timestamp)}
						<div class="message-item">
							<div class="message-meta">
								<span class="message-time">
									{new Date(message.timestamp).toLocaleTimeString()}
								</span>
								<span class="message-type">{message.type}</span>
							</div>
							<div class="message-content">
								{JSON.stringify(message.payload, null, 2)}
							</div>
						</div>
					{/each}

					{#if messages.length === 0}
						<div class="empty-state">
							<p>No messages yet. Send a message to see it here.</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	{#if state.errorMessage}
		<div class="error-message">
			<strong>Error:</strong>
			{state.errorMessage}
		</div>
	{/if}
</div>

<style>
	.rx-websocket-demo {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1rem;
	}

	.demo-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.demo-header h2 {
		margin: 0 0 0.5rem 0;
		color: #1a1a1a;
	}

	.demo-header p {
		margin: 0;
		color: #666;
	}

	.demo-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	.control-panel,
	.message-panel {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.connection-controls,
	.connection-status,
	.advanced-config,
	.statistics,
	.message-input,
	.message-display {
		background: white;
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.connection-controls h3,
	.connection-status h3,
	.advanced-config h3,
	.statistics h3,
	.message-input h3,
	.message-display h3 {
		margin: 0 0 1rem 0;
		color: #1a1a1a;
		font-size: 1.1rem;
	}

	.input-group {
		margin-bottom: 1rem;
	}

	.input-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #333;
	}

	.input-group input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 0.25rem;
		font-size: 1rem;
	}

	.input-group input[type='checkbox'] {
		width: auto;
	}

	.connection-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		min-height: 44px;
		border: none;
		border-radius: 0.25rem;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: #667eea;
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: #5a67d8;
	}

	.btn-danger {
		background: #dc3545;
		color: white;
	}

	.btn-danger:hover:not(:disabled) {
		background: #c82333;
	}

	.btn-outline {
		background: transparent;
		color: #667eea;
		border: 1px solid #667eea;
	}

	.btn-outline:hover:not(:disabled) {
		background: #667eea;
		color: white;
	}

	.btn-sm {
		padding: 0.25rem 0.5rem;
		font-size: 0.8rem;
	}

	.status-grid,
	.stats-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.5rem;
	}

	.status-item,
	.stat-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background: #f8f9fa;
		border-radius: 0.25rem;
	}

	.status-label,
	.stat-label {
		font-weight: 600;
		color: #333;
	}

	.status-value,
	.stat-value {
		font-weight: 500;
		color: #666;
	}

	.input-actions {
		display: flex;
		gap: 0.5rem;
	}

	.input-actions input {
		flex: 1;
	}

	.display-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.display-header h3 {
		margin: 0;
	}

	.message-list {
		max-height: 400px;
		overflow-y: auto;
		border: 1px solid #ddd;
		border-radius: 0.25rem;
		padding: 0.5rem;
		background: #f8f9fa;
	}

	.message-item {
		margin-bottom: 1rem;
		padding: 0.75rem;
		background: white;
		border-radius: 0.25rem;
		border-left: 3px solid #667eea;
	}

	.message-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		font-size: 0.8rem;
		color: #666;
	}

	.message-type {
		background: #e9ecef;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-weight: 600;
	}

	.message-content {
		font-family: monospace;
		font-size: 0.9rem;
		background: #f8f9fa;
		padding: 0.5rem;
		border-radius: 0.25rem;
		white-space: pre-wrap;
		overflow-wrap: break-word;
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: #666;
	}

	.error-message {
		background: #f8d7da;
		color: #721c24;
		padding: 1rem;
		border-radius: 0.25rem;
		margin-top: 1rem;
		border: 1px solid #f5c6cb;
	}

	@media (max-width: 768px) {
		.demo-layout {
			grid-template-columns: 1fr;
		}

		.connection-actions {
			flex-direction: column;
		}

		.input-actions {
			flex-direction: column;
		}
	}
</style>

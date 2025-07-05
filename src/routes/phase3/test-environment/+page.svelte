<script lang="ts">
	import { onMount } from 'svelte';

	let serverStatus = $state('stopped');
	let serverPort = $state(9999);
	let serverProtocol = $state('echo');
	let serverLogs = $state([] as Array<{ timestamp: string; message: string }>);
	let connectionCount = $state(0);
	let testWebSocket = $state(null as WebSocket | null);
	let testConnectionStatus = $state('disconnected');
	let testMessages = $state([] as Array<{ type: string; content: string; timestamp: string }>);
	let testMessage = $state('');

	const protocols = [
		{ id: 'echo', name: 'Echo Server', description: 'Simple echo server for basic testing' },
		{ id: 'chat', name: 'Chat Server', description: 'Multi-client chat server simulation' },
		{ id: 'graphql', name: 'GraphQL-WS', description: 'GraphQL WebSocket subprotocol' },
		{ id: 'mqtt', name: 'MQTT over WebSocket', description: 'MQTT protocol over WebSocket' }
	];

	let selectedProtocol = $derived(protocols.find((p) => p.id === serverProtocol));

	onMount(() => {
		// Initialize server status
		addLog('Test environment initialized');
	});

	function addLog(message: string) {
		const timestamp = new Date().toLocaleTimeString();
		serverLogs = [...serverLogs, { timestamp, message }];
	}

	function startServer() {
		if (serverStatus === 'running') return;

		serverStatus = 'starting';
		addLog(`Starting ${selectedProtocol?.name} on port ${serverPort}`);

		// Simulate server startup
		setTimeout(() => {
			serverStatus = 'running';
			addLog(`Server started successfully on ws://localhost:${serverPort}`);
			connectionCount = 0;
		}, 1000);
	}

	function stopServer() {
		if (serverStatus !== 'running') return;

		serverStatus = 'stopping';
		addLog('Stopping server...');

		// Disconnect test connection if active
		if (testWebSocket) {
			testWebSocket.close();
			testWebSocket = null;
			testConnectionStatus = 'disconnected';
		}

		setTimeout(() => {
			serverStatus = 'stopped';
			addLog('Server stopped');
			connectionCount = 0;
		}, 500);
	}

	function restartServer() {
		if (serverStatus === 'running') {
			stopServer();
			setTimeout(startServer, 1000);
		} else {
			startServer();
		}
	}

	function connectTestClient() {
		if (serverStatus !== 'running') {
			addLog('Cannot connect: Server not running');
			return;
		}

		if (testConnectionStatus === 'connected') {
			disconnectTestClient();
			return;
		}

		testConnectionStatus = 'connecting';
		addLog('Test client connecting...');

		// Simulate WebSocket connection
		setTimeout(() => {
			testConnectionStatus = 'connected';
			connectionCount += 1;
			addLog('Test client connected');

			// Simulate receiving a welcome message
			testMessages = [
				...testMessages,
				{
					type: 'received',
					content: `Welcome to ${selectedProtocol?.name}`,
					timestamp: new Date().toLocaleTimeString()
				}
			];
		}, 500);
	}

	function disconnectTestClient() {
		if (testConnectionStatus !== 'connected') return;

		testConnectionStatus = 'disconnecting';
		addLog('Test client disconnecting...');

		setTimeout(() => {
			testConnectionStatus = 'disconnected';
			connectionCount = Math.max(0, connectionCount - 1);
			addLog('Test client disconnected');
		}, 300);
	}

	function sendTestMessage() {
		if (testConnectionStatus !== 'connected' || !testMessage.trim()) return;

		const message = {
			type: 'sent',
			content: testMessage,
			timestamp: new Date().toLocaleTimeString()
		};

		testMessages = [...testMessages, message];
		addLog(`Test message sent: ${testMessage}`);

		// Simulate echo response
		setTimeout(() => {
			const echoMessage = {
				type: 'received',
				content: `Echo: ${testMessage}`,
				timestamp: new Date().toLocaleTimeString()
			};
			testMessages = [...testMessages, echoMessage];
			addLog(`Echo received: ${testMessage}`);
		}, 200);

		testMessage = '';
	}

	function clearLogs() {
		serverLogs = [];
		addLog('Logs cleared');
	}

	function clearMessages() {
		testMessages = [];
	}
</script>

<svelte:head>
	<title>Test Environment - Phase 3 WebSocket Learning</title>
	<meta
		name="description"
		content="Configure and manage WebSocket test servers and testing environment"
	/>
</svelte:head>

<div class="test-environment">
	<header class="environment-header">
		<h1>Test Environment Setup</h1>
		<p>Configure mock WebSocket servers and test your WebSocket implementations</p>
	</header>

	<div class="environment-layout">
		<div class="server-panel">
			<section class="server-config">
				<h2>Server Configuration</h2>

				<div class="config-group">
					<label for="protocol">Protocol:</label>
					<select id="protocol" bind:value={serverProtocol} disabled={serverStatus === 'running'}>
						{#each protocols as protocol (protocol.id)}
							<option value={protocol.id}>{protocol.name}</option>
						{/each}
					</select>
					{#if selectedProtocol}
						<small class="protocol-description">{selectedProtocol.description}</small>
					{/if}
				</div>

				<div class="config-group">
					<label for="port">Port:</label>
					<input
						id="port"
						type="number"
						bind:value={serverPort}
						min="1024"
						max="65535"
						disabled={serverStatus === 'running'}
					/>
				</div>

				<div class="server-controls">
					<button
						class="btn btn-primary"
						onclick={startServer}
						disabled={serverStatus === 'running' || serverStatus === 'starting'}
					>
						{serverStatus === 'starting' ? 'Starting...' : 'Start Server'}
					</button>
					<button
						class="btn btn-secondary"
						onclick={stopServer}
						disabled={serverStatus !== 'running'}
					>
						{serverStatus === 'stopping' ? 'Stopping...' : 'Stop Server'}
					</button>
					<button
						class="btn btn-outline"
						onclick={restartServer}
						disabled={serverStatus === 'starting' || serverStatus === 'stopping'}
					>
						Restart
					</button>
				</div>
			</section>

			<section class="server-status">
				<h2>Server Status</h2>
				<div class="status-grid">
					<div class="status-item">
						<span class="status-label">Status:</span>
						<span class="status-value status-{serverStatus}">{serverStatus}</span>
					</div>
					<div class="status-item">
						<span class="status-label">Port:</span>
						<span class="status-value">{serverPort}</span>
					</div>
					<div class="status-item">
						<span class="status-label">Protocol:</span>
						<span class="status-value">{selectedProtocol?.name || 'None'}</span>
					</div>
					<div class="status-item">
						<span class="status-label">Connections:</span>
						<span class="status-value">{connectionCount}</span>
					</div>
				</div>
			</section>

			<section class="server-logs">
				<div class="logs-header">
					<h2>Server Logs</h2>
					<button class="btn btn-sm btn-outline" onclick={clearLogs}>Clear</button>
				</div>
				<div class="logs-container">
					{#each serverLogs as log (log.timestamp + log.message)}
						<div class="log-entry">
							<span class="log-timestamp">{log.timestamp}</span>
							<span class="log-message">{log.message}</span>
						</div>
					{/each}
				</div>
			</section>
		</div>

		<div class="test-panel">
			<section class="test-client">
				<h2>Test Client</h2>

				<div class="test-controls">
					<button
						class="btn btn-primary"
						onclick={connectTestClient}
						disabled={serverStatus !== 'running'}
					>
						{testConnectionStatus === 'connected'
							? 'Disconnect'
							: testConnectionStatus === 'connecting'
								? 'Connecting...'
								: testConnectionStatus === 'disconnecting'
									? 'Disconnecting...'
									: 'Connect'}
					</button>
					<span class="connection-status status-{testConnectionStatus}">
						{testConnectionStatus}
					</span>
				</div>

				{#if testConnectionStatus === 'connected'}
					<div class="message-input">
						<input
							type="text"
							bind:value={testMessage}
							placeholder="Enter test message..."
							onkeydown={(e) => e.key === 'Enter' && sendTestMessage()}
						/>
						<button
							class="btn btn-primary"
							onclick={sendTestMessage}
							disabled={!testMessage.trim()}
						>
							Send
						</button>
					</div>
				{/if}
			</section>

			<section class="test-messages">
				<div class="messages-header">
					<h2>Test Messages</h2>
					<button class="btn btn-sm btn-outline" onclick={clearMessages}>Clear</button>
				</div>
				<div class="messages-container">
					{#each testMessages as message (message.timestamp + message.content)}
						<div class="message message-{message.type}">
							<span class="message-timestamp">{message.timestamp}</span>
							<span class="message-content">{message.content}</span>
						</div>
					{/each}
				</div>
			</section>

			<section class="quick-actions">
				<h2>Quick Actions</h2>
				<div class="actions-grid">
					<a href="/phase3/test-environment/mock-servers" class="action-card">
						<div class="action-icon">🖥️</div>
						<h3>Mock Servers</h3>
						<p>Configure advanced mock server behaviors</p>
					</a>
					<a href="/phase3/test-environment/protocol-testing" class="action-card">
						<div class="action-icon">📡</div>
						<h3>Protocol Testing</h3>
						<p>Test different WebSocket subprotocols</p>
					</a>
				</div>
			</section>
		</div>
	</div>
</div>

<style>
	.test-environment {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.environment-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.environment-header h1 {
		font-size: 2.5rem;
		margin: 0 0 0.5rem 0;
		color: #1a1a1a;
	}

	.environment-header p {
		font-size: 1.1rem;
		color: #666;
		margin: 0;
	}

	.environment-layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	.server-panel,
	.test-panel {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	section {
		background: white;
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	section h2 {
		margin: 0 0 1rem 0;
		color: #1a1a1a;
		font-size: 1.25rem;
	}

	.config-group {
		margin-bottom: 1rem;
	}

	.config-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #333;
	}

	.config-group select,
	.config-group input {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 0.25rem;
		font-size: 1rem;
	}

	.protocol-description {
		display: block;
		margin-top: 0.25rem;
		color: #666;
		font-size: 0.9rem;
	}

	.server-controls {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.btn {
		padding: 0.5rem 1rem;
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

	.btn-secondary {
		background: #718096;
		color: white;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #4a5568;
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

	.status-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.status-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background: #f8f9fa;
		border-radius: 0.25rem;
	}

	.status-label {
		font-weight: 600;
		color: #333;
	}

	.status-value {
		font-weight: 500;
	}

	.status-running {
		color: #28a745;
	}

	.status-stopped {
		color: #dc3545;
	}

	.status-starting,
	.status-stopping {
		color: #ffc107;
	}

	.status-connected {
		color: #28a745;
	}

	.status-disconnected {
		color: #dc3545;
	}

	.status-connecting,
	.status-disconnecting {
		color: #ffc107;
	}

	.logs-header,
	.messages-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.logs-header h2,
	.messages-header h2 {
		margin: 0;
	}

	.logs-container,
	.messages-container {
		height: 200px;
		overflow-y: auto;
		border: 1px solid #ddd;
		border-radius: 0.25rem;
		padding: 0.5rem;
		background: #f8f9fa;
		font-family: monospace;
		font-size: 0.9rem;
	}

	.log-entry {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.log-timestamp {
		color: #666;
		white-space: nowrap;
	}

	.log-message {
		flex: 1;
	}

	.test-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.connection-status {
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.message-input {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.message-input input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 0.25rem;
	}

	.message {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
		padding: 0.25rem;
		border-radius: 0.25rem;
	}

	.message-sent {
		background: #e3f2fd;
		justify-content: flex-end;
	}

	.message-received {
		background: #f1f8e9;
	}

	.message-timestamp {
		color: #666;
		white-space: nowrap;
		font-size: 0.8rem;
	}

	.message-content {
		flex: 1;
	}

	.actions-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.action-card {
		display: block;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 0.5rem;
		text-decoration: none;
		text-align: center;
		transition: transform 0.2s;
	}

	.action-card:hover {
		transform: translateY(-2px);
	}

	.action-icon {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.action-card h3 {
		margin: 0 0 0.5rem 0;
		color: #1a1a1a;
		font-size: 1rem;
	}

	.action-card p {
		margin: 0;
		color: #666;
		font-size: 0.9rem;
	}

	@media (max-width: 768px) {
		.test-environment {
			padding: 1rem;
		}

		.environment-layout {
			grid-template-columns: 1fr;
		}

		.server-controls {
			flex-direction: column;
		}

		.status-grid {
			grid-template-columns: 1fr;
		}

		.actions-grid {
			grid-template-columns: 1fr;
		}
	}
</style>

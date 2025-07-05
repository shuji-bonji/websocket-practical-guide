<script lang="ts">
	import { testServerManager } from '$lib/test-infrastructure/websocket-test-server-manager.js';
	import type { ServerInstance } from '$lib/test-infrastructure/websocket-test-server-manager.js';

	let servers = $state([] as ServerInstance[]);
	let serverStats = $state({} as Record<string, unknown>);
	let showCreateModal = $state(false);
	let statsInterval: NodeJS.Timeout | null = null;

	// New server form
	let newServerForm = $state({
		id: '',
		name: '',
		port: 9999,
		protocol: 'echo',
		latency: 50,
		errorRate: 0,
		maxConnections: 100
	});

	const protocolOptions = [
		{ value: 'echo', label: 'Echo Server', description: 'Simple echo server for basic testing' },
		{ value: 'chat', label: 'Chat Server', description: 'Multi-client chat server simulation' },
		{ value: 'unreliable', label: 'Unreliable Server', description: 'Server with random failures' },
		{ value: 'slow', label: 'Slow Server', description: 'Server with high latency' },
		{ value: 'performance', label: 'Performance Server', description: 'High-throughput server' }
	];

	$effect(() => {
		loadServers();
		setupEventHandlers();
		startStatsPolling();

		return () => {
			if (statsInterval) {
				clearInterval(statsInterval);
			}
		};
	});

	function loadServers() {
		servers = testServerManager.getServers();
	}

	function setupEventHandlers() {
		testServerManager.on('serverCreated', () => {
			loadServers();
		});

		testServerManager.on('serverRemoved', () => {
			loadServers();
		});

		testServerManager.on('serverStatusChanged', () => {
			loadServers();
		});
	}

	function startStatsPolling() {
		statsInterval = setInterval(() => {
			serverStats = testServerManager.getAllServerStats();
		}, 1000);
	}

	async function createServer() {
		try {
			testServerManager.createServer(newServerForm.id, newServerForm.name, {
				port: newServerForm.port,
				protocol: newServerForm.protocol,
				latency: newServerForm.latency,
				errorRate: newServerForm.errorRate / 100, // Convert percentage to decimal
				maxConnections: newServerForm.maxConnections
			});

			showCreateModal = false;
			resetForm();
		} catch (error) {
			alert(`Error creating server: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async function startServer(serverId: string) {
		try {
			await testServerManager.startServer(serverId);
		} catch (error) {
			alert(`Error starting server: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async function stopServer(serverId: string) {
		try {
			await testServerManager.stopServer(serverId);
		} catch (error) {
			alert(`Error stopping server: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	async function restartServer(serverId: string) {
		try {
			await testServerManager.restartServer(serverId);
		} catch (error) {
			alert(`Error restarting server: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	function removeServer(serverId: string) {
		if (confirm('Are you sure you want to remove this server?')) {
			try {
				testServerManager.removeServer(serverId);
			} catch (error) {
				alert(`Error removing server: ${error instanceof Error ? error.message : 'Unknown error'}`);
			}
		}
	}

	function simulateNetworkIssue(serverId: string) {
		testServerManager.simulateNetworkIssue(serverId, 5000);
	}

	function simulateServerOverload(serverId: string) {
		testServerManager.simulateServerOverload(serverId);
	}

	function createQuickEnvironment(type: string) {
		try {
			switch (type) {
				case 'echo':
					testServerManager.createEchoTestEnvironment();
					break;
				case 'chat':
					testServerManager.createChatTestEnvironment();
					break;
				case 'reliability':
					testServerManager.createReliabilityTestEnvironment();
					break;
				case 'performance':
					testServerManager.createPerformanceTestEnvironment();
					break;
				case 'comprehensive':
					testServerManager.createComprehensiveTestEnvironment();
					break;
			}
		} catch (error) {
			alert(
				`Error creating environment: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	function resetForm() {
		newServerForm = {
			id: '',
			name: '',
			port: 9999,
			protocol: 'echo',
			latency: 50,
			errorRate: 0,
			maxConnections: 100
		};
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'running':
				return '#28a745';
			case 'stopped':
				return '#dc3545';
			case 'starting':
			case 'stopping':
				return '#ffc107';
			case 'error':
				return '#dc3545';
			default:
				return '#6c757d';
		}
	}

	function formatUptime(uptime: number) {
		const seconds = Math.floor(uptime / 1000);
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;

		if (hours > 0) {
			return `${hours}h ${minutes}m ${remainingSeconds}s`;
		} else if (minutes > 0) {
			return `${minutes}m ${remainingSeconds}s`;
		} else {
			return `${remainingSeconds}s`;
		}
	}
</script>

<svelte:head>
	<title>Mock Servers - Phase 3 WebSocket Learning</title>
	<meta name="description" content="Configure and manage mock WebSocket servers for testing" />
</svelte:head>

<div class="mock-servers">
	<header class="servers-header">
		<h1>Mock WebSocket Servers</h1>
		<p>Configure and manage mock servers for comprehensive WebSocket testing</p>
	</header>

	<div class="actions-bar">
		<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
			+ Create Server
		</button>

		<div class="quick-environments">
			<span class="quick-label">Quick Environments:</span>
			<button class="btn btn-sm btn-outline" onclick={() => createQuickEnvironment('echo')}>
				Echo
			</button>
			<button class="btn btn-sm btn-outline" onclick={() => createQuickEnvironment('chat')}>
				Chat
			</button>
			<button class="btn btn-sm btn-outline" onclick={() => createQuickEnvironment('reliability')}>
				Reliability
			</button>
			<button class="btn btn-sm btn-outline" onclick={() => createQuickEnvironment('performance')}>
				Performance
			</button>
			<button
				class="btn btn-sm btn-outline"
				onclick={() => createQuickEnvironment('comprehensive')}
			>
				All
			</button>
		</div>
	</div>

	<div class="servers-grid">
		{#each servers as server (server.id)}
			{@const stats = serverStats[server.id as keyof typeof serverStats] as
				| {
						connections: number;
						messagesReceived: number;
						messagesSent: number;
						errors: number;
						uptime: number;
				  }
				| undefined}
			<div class="server-card">
				<div class="server-header">
					<h3>{server.name}</h3>
					<div class="server-status" style="color: {getStatusColor(server.status)}">
						{server.status}
					</div>
				</div>

				<div class="server-info">
					<div class="info-row">
						<span class="info-label">Port:</span>
						<span class="info-value">{server.config.port}</span>
					</div>
					<div class="info-row">
						<span class="info-label">Protocol:</span>
						<span class="info-value">{server.config.protocol}</span>
					</div>
					<div class="info-row">
						<span class="info-label">Latency:</span>
						<span class="info-value">{server.config.latency || 0}ms</span>
					</div>
					<div class="info-row">
						<span class="info-label">Error Rate:</span>
						<span class="info-value">{((server.config.errorRate || 0) * 100).toFixed(1)}%</span>
					</div>
				</div>

				{#if stats}
					<div class="server-stats">
						<div class="stats-row">
							<span class="stat-label">Connections:</span>
							<span class="stat-value">{stats.connections}</span>
						</div>
						<div class="stats-row">
							<span class="stat-label">Messages:</span>
							<span class="stat-value">{stats.messagesReceived}/{stats.messagesSent}</span>
						</div>
						<div class="stats-row">
							<span class="stat-label">Errors:</span>
							<span class="stat-value">{stats.errors}</span>
						</div>
						{#if stats.uptime > 0}
							<div class="stats-row">
								<span class="stat-label">Uptime:</span>
								<span class="stat-value">{formatUptime(stats.uptime)}</span>
							</div>
						{/if}
					</div>
				{/if}

				<div class="server-actions">
					<div class="primary-actions">
						{#if server.status === 'stopped'}
							<button class="btn btn-sm btn-primary" onclick={() => startServer(server.id)}>
								Start
							</button>
						{:else if server.status === 'running'}
							<button class="btn btn-sm btn-secondary" onclick={() => stopServer(server.id)}>
								Stop
							</button>
						{:else}
							<button class="btn btn-sm btn-outline" disabled>
								{server.status}...
							</button>
						{/if}

						<button
							class="btn btn-sm btn-outline"
							onclick={() => restartServer(server.id)}
							disabled={server.status === 'starting' || server.status === 'stopping'}
						>
							Restart
						</button>
					</div>

					<div class="test-actions">
						<button
							class="btn btn-sm btn-warning"
							onclick={() => simulateNetworkIssue(server.id)}
							disabled={server.status !== 'running'}
						>
							Network Issue
						</button>
						<button
							class="btn btn-sm btn-warning"
							onclick={() => simulateServerOverload(server.id)}
							disabled={server.status !== 'running'}
						>
							Overload
						</button>
					</div>

					<div class="danger-actions">
						<button
							class="btn btn-sm btn-danger"
							onclick={() => removeServer(server.id)}
							disabled={server.status === 'running'}
						>
							Remove
						</button>
					</div>
				</div>

				{#if server.error}
					<div class="server-error">
						<strong>Error:</strong>
						{server.error}
					</div>
				{/if}
			</div>
		{/each}

		{#if servers.length === 0}
			<div class="empty-state">
				<h3>No Mock Servers</h3>
				<p>Create your first mock server to start testing WebSocket implementations</p>
				<button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
					Create Server
				</button>
			</div>
		{/if}
	</div>
</div>

{#if showCreateModal}
	<div class="modal-overlay" onclick={() => (showCreateModal = false)}>
		<div class="modal-content" onclick={(e: MouseEvent) => e.stopPropagation()}>
			<div class="modal-header">
				<h2>Create Mock Server</h2>
				<button class="modal-close" onclick={() => (showCreateModal = false)}>×</button>
			</div>

			<form
				class="server-form"
				onsubmit={(e: Event) => {
					e.preventDefault();
					createServer();
				}}
			>
				<div class="form-group">
					<label for="server-id">Server ID:</label>
					<input
						id="server-id"
						type="text"
						bind:value={newServerForm.id}
						placeholder="e.g., echo-server-1"
						required
					/>
				</div>

				<div class="form-group">
					<label for="server-name">Server Name:</label>
					<input
						id="server-name"
						type="text"
						bind:value={newServerForm.name}
						placeholder="e.g., Echo Test Server"
						required
					/>
				</div>

				<div class="form-group">
					<label for="server-port">Port:</label>
					<input
						id="server-port"
						type="number"
						bind:value={newServerForm.port}
						min="1024"
						max="65535"
						required
					/>
				</div>

				<div class="form-group">
					<label for="server-protocol">Protocol:</label>
					<select id="server-protocol" bind:value={newServerForm.protocol}>
						{#each protocolOptions as option (option.value)}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
					{#if protocolOptions.find((p) => p.value === newServerForm.protocol)}
						{@const selectedProtocol = protocolOptions.find(
							(p) => p.value === newServerForm.protocol
						)}
						<small class="form-help">{selectedProtocol?.description}</small>
					{/if}
				</div>

				<div class="form-group">
					<label for="server-latency">Latency (ms):</label>
					<input
						id="server-latency"
						type="number"
						bind:value={newServerForm.latency}
						min="0"
						max="10000"
					/>
				</div>

				<div class="form-group">
					<label for="server-error-rate">Error Rate (%):</label>
					<input
						id="server-error-rate"
						type="number"
						bind:value={newServerForm.errorRate}
						min="0"
						max="100"
						step="0.1"
					/>
				</div>

				<div class="form-group">
					<label for="server-max-connections">Max Connections:</label>
					<input
						id="server-max-connections"
						type="number"
						bind:value={newServerForm.maxConnections}
						min="1"
						max="10000"
					/>
				</div>

				<div class="form-actions">
					<button type="button" class="btn btn-outline" onclick={() => (showCreateModal = false)}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary"> Create Server </button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.mock-servers {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.servers-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.servers-header h1 {
		font-size: 2.5rem;
		margin: 0 0 0.5rem 0;
		color: #1a1a1a;
	}

	.servers-header p {
		font-size: 1.1rem;
		color: #666;
		margin: 0;
	}

	.actions-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding: 1rem;
		background: #f8f9fa;
		border-radius: 0.5rem;
	}

	.quick-environments {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.quick-label {
		font-size: 0.9rem;
		color: #666;
		margin-right: 0.5rem;
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

	.btn-warning {
		background: #ffc107;
		color: #856404;
	}

	.btn-warning:hover:not(:disabled) {
		background: #e0a800;
	}

	.btn-danger {
		background: #dc3545;
		color: white;
	}

	.btn-danger:hover:not(:disabled) {
		background: #c82333;
	}

	.btn-sm {
		padding: 0.25rem 0.5rem;
		font-size: 0.8rem;
	}

	.servers-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	.server-card {
		background: white;
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s;
	}

	.server-card:hover {
		transform: translateY(-2px);
	}

	.server-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.server-header h3 {
		margin: 0;
		color: #1a1a1a;
		font-size: 1.1rem;
	}

	.server-status {
		font-size: 0.9rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.server-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.info-label {
		font-size: 0.9rem;
		color: #666;
	}

	.info-value {
		font-size: 0.9rem;
		font-weight: 600;
		color: #333;
	}

	.server-stats {
		background: #f8f9fa;
		border-radius: 0.25rem;
		padding: 0.75rem;
		margin-bottom: 1rem;
	}

	.stats-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.25rem;
	}

	.stats-row:last-child {
		margin-bottom: 0;
	}

	.stat-label {
		font-size: 0.8rem;
		color: #666;
	}

	.stat-value {
		font-size: 0.8rem;
		font-weight: 600;
		color: #333;
	}

	.server-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.primary-actions,
	.test-actions,
	.danger-actions {
		display: flex;
		gap: 0.5rem;
	}

	.server-error {
		background: #f8d7da;
		color: #721c24;
		padding: 0.5rem;
		border-radius: 0.25rem;
		margin-top: 1rem;
		font-size: 0.9rem;
	}

	.empty-state {
		grid-column: 1 / -1;
		text-align: center;
		padding: 3rem;
		background: #f8f9fa;
		border-radius: 0.5rem;
	}

	.empty-state h3 {
		margin: 0 0 1rem 0;
		color: #1a1a1a;
	}

	.empty-state p {
		color: #666;
		margin-bottom: 1.5rem;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background: white;
		border-radius: 0.5rem;
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		border-bottom: 1px solid #e9ecef;
	}

	.modal-header h2 {
		margin: 0;
		color: #1a1a1a;
	}

	.modal-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		color: #666;
	}

	.modal-close:hover {
		color: #333;
	}

	.server-form {
		padding: 1.5rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #333;
	}

	.form-group input,
	.form-group select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 0.25rem;
		font-size: 1rem;
	}

	.form-help {
		display: block;
		margin-top: 0.25rem;
		color: #666;
		font-size: 0.85rem;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.form-actions .btn {
		flex: 1;
	}

	@media (max-width: 768px) {
		.mock-servers {
			padding: 1rem;
		}

		.servers-header h1 {
			font-size: 2rem;
		}

		.actions-bar {
			flex-direction: column;
			gap: 1rem;
		}

		.quick-environments {
			flex-wrap: wrap;
			justify-content: center;
		}

		.servers-grid {
			grid-template-columns: 1fr;
		}

		.server-actions {
			flex-direction: column;
		}

		.primary-actions,
		.test-actions,
		.danger-actions {
			flex-wrap: wrap;
		}
	}
</style>

<script lang="ts">
	import { createWebSocketStore } from '$lib/stores/websocket.svelte.js';
	import type { RxWebSocketConfig } from '$lib/websocket/rx-websocket.js';

	let selectedProtocol = $state('echo');
	let protocolConfig = $state({
		echo: {
			url: 'wss://echo.websocket.org',
			protocols: [],
			description: 'Simple echo protocol for basic testing'
		},
		graphql: {
			url: 'ws://localhost:8081',
			protocols: ['graphql-ws'],
			description: 'GraphQL subscription protocol'
		},
		mqtt: {
			url: 'ws://localhost:8082',
			protocols: ['mqtt'],
			description: 'MQTT over WebSocket protocol'
		},
		stomp: {
			url: 'ws://localhost:8083',
			protocols: ['stomp'],
			description: 'STOMP messaging protocol'
		}
	});

	let wsStore = createWebSocketStore();
	let testResults = $state(new Map());
	let currentTest = $state<{
		id: string;
		name: string;
		description: string;
		steps: string[];
	} | null>(null);

	// Protocol-specific test scenarios
	const protocolTests = {
		echo: [
			{
				id: 'echo-basic',
				name: 'Basic Echo Test',
				description: 'Send a message and verify echo response',
				steps: ['Connect to server', 'Send test message', 'Verify echo response']
			},
			{
				id: 'echo-binary',
				name: 'Binary Echo Test',
				description: 'Test binary data transmission',
				steps: ['Connect to server', 'Send binary data', 'Verify binary echo']
			}
		],
		graphql: [
			{
				id: 'graphql-connection-init',
				name: 'Connection Init',
				description: 'Test GraphQL-WS connection initialization',
				steps: ['Connect with graphql-ws protocol', 'Send connection_init', 'Verify connection_ack']
			},
			{
				id: 'graphql-subscription',
				name: 'Basic Subscription',
				description: 'Test GraphQL subscription flow',
				steps: [
					'Initialize connection',
					'Start subscription',
					'Verify data stream',
					'Complete subscription'
				]
			}
		],
		mqtt: [
			{
				id: 'mqtt-connect',
				name: 'MQTT Connect',
				description: 'Test MQTT connection handshake',
				steps: ['Send CONNECT packet', 'Verify CONNACK response', 'Check connection status']
			},
			{
				id: 'mqtt-publish-subscribe',
				name: 'Pub/Sub Test',
				description: 'Test MQTT publish/subscribe pattern',
				steps: [
					'Connect to broker',
					'Subscribe to topic',
					'Publish message',
					'Verify message delivery'
				]
			}
		],
		stomp: [
			{
				id: 'stomp-connect',
				name: 'STOMP Connect',
				description: 'Test STOMP connection frame',
				steps: ['Send CONNECT frame', 'Verify CONNECTED response', 'Check session']
			},
			{
				id: 'stomp-send-subscribe',
				name: 'Send/Subscribe Test',
				description: 'Test STOMP messaging',
				steps: ['Connect to server', 'Subscribe to destination', 'Send message', 'Verify receipt']
			}
		]
	};

	let currentTests = $derived(protocolTests[selectedProtocol as keyof typeof protocolTests] || []);
	let currentConfig = $derived(protocolConfig[selectedProtocol as keyof typeof protocolConfig]);

	async function runTest(test: { id: string; name: string; description: string; steps: string[] }) {
		currentTest = test;
		testResults.set(test.id, { status: 'running', startTime: Date.now() });

		try {
			const config: RxWebSocketConfig = {
				url: currentConfig.url,
				protocols: currentConfig.protocols,
				enableAutoReconnect: false
			};

			wsStore.connect(config);

			// Wait for connection
			await waitForConnection();

			// Run protocol-specific test
			await runProtocolTest(test);

			testResults.set(test.id, {
				status: 'passed',
				startTime: testResults.get(test.id)?.startTime,
				endTime: Date.now(),
				details: 'Test completed successfully'
			});
		} catch (error) {
			testResults.set(test.id, {
				status: 'failed',
				startTime: testResults.get(test.id)?.startTime,
				endTime: Date.now(),
				error: error instanceof Error ? error.message : 'Unknown error'
			});
		} finally {
			wsStore.disconnect();
			currentTest = null;
		}
	}

	async function waitForConnection(): Promise<void> {
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => reject(new Error('Connection timeout')), 10000);

			const checkConnection = () => {
				if (wsStore.isConnected) {
					clearTimeout(timeout);
					resolve();
				} else if (wsStore.state.status === 'error') {
					clearTimeout(timeout);
					reject(new Error(wsStore.state.errorMessage || 'Connection failed'));
				} else {
					setTimeout(checkConnection, 100);
				}
			};

			checkConnection();
		});
	}

	async function runProtocolTest(test: {
		id: string;
		name: string;
		description: string;
		steps: string[];
	}): Promise<void> {
		switch (selectedProtocol) {
			case 'echo':
				await runEchoTest(test);
				break;
			case 'graphql':
				await runGraphQLTest(test);
				break;
			case 'mqtt':
				await runMQTTTest(test);
				break;
			case 'stomp':
				await runSTOMPTest(test);
				break;
		}
	}

	async function runEchoTest(test: {
		id: string;
		name: string;
		description: string;
		steps: string[];
	}): Promise<void> {
		if (test.id === 'echo-basic') {
			const testMessage = 'Hello WebSocket';
			wsStore.sendJSON({ type: 'echo', message: testMessage });

			// Wait for echo response
			await waitForMessage(
				(msg) =>
					typeof msg.payload === 'object' &&
					msg.payload !== null &&
					'message' in msg.payload &&
					msg.payload.message === testMessage
			);
		} else if (test.id === 'echo-binary') {
			const binaryData = new Uint8Array([1, 2, 3, 4, 5]);
			wsStore.send(binaryData);

			await waitForMessage((msg) => msg.payload instanceof ArrayBuffer);
		}
	}

	async function runGraphQLTest(test: {
		id: string;
		name: string;
		description: string;
		steps: string[];
	}): Promise<void> {
		if (test.id === 'graphql-connection-init') {
			wsStore.sendJSON({ type: 'connection_init' });

			await waitForMessage(
				(msg) =>
					typeof msg.payload === 'object' &&
					msg.payload !== null &&
					'type' in msg.payload &&
					msg.payload.type === 'connection_ack'
			);
		} else if (test.id === 'graphql-subscription') {
			// First initialize connection
			wsStore.sendJSON({ type: 'connection_init' });
			await waitForMessage(
				(msg) =>
					typeof msg.payload === 'object' &&
					msg.payload !== null &&
					'type' in msg.payload &&
					msg.payload.type === 'connection_ack'
			);

			// Start subscription
			wsStore.sendJSON({
				type: 'start',
				id: 'sub1',
				payload: {
					query: 'subscription { messageAdded { id content } }'
				}
			});

			await waitForMessage(
				(msg) =>
					typeof msg.payload === 'object' &&
					msg.payload !== null &&
					'type' in msg.payload &&
					msg.payload.type === 'data'
			);
		}
	}

	async function runMQTTTest(test: {
		id: string;
		name: string;
		description: string;
		steps: string[];
	}): Promise<void> {
		if (test.id === 'mqtt-connect') {
			// MQTT CONNECT packet (simplified)
			const connectPacket = {
				type: 'CONNECT',
				clientId: 'test-client-' + Date.now(),
				keepAlive: 60
			};

			wsStore.sendJSON(connectPacket);

			await waitForMessage(
				(msg) =>
					typeof msg.payload === 'object' &&
					msg.payload !== null &&
					'type' in msg.payload &&
					msg.payload.type === 'CONNACK'
			);
		}
	}

	async function runSTOMPTest(test: {
		id: string;
		name: string;
		description: string;
		steps: string[];
	}): Promise<void> {
		if (test.id === 'stomp-connect') {
			const connectFrame = 'CONNECT\naccept-version:1.2\nhost:localhost\n\n\0';
			wsStore.send(connectFrame);

			await waitForMessage(
				(msg) => typeof msg.payload === 'string' && msg.payload.startsWith('CONNECTED')
			);
		}
	}

	async function waitForMessage(predicate: (msg: { payload: unknown }) => boolean): Promise<void> {
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => reject(new Error('Message timeout')), 5000);

			const subscription = wsStore.messages$.subscribe((message) => {
				if (predicate(message)) {
					clearTimeout(timeout);
					subscription.unsubscribe();
					resolve();
				}
			});
		});
	}

	function getTestStatus(testId: string) {
		return testResults.get(testId);
	}

	function formatDuration(result: {
		duration?: number;
		endTime?: number;
		startTime?: number;
	}): string {
		if (!result || !result.endTime || !result.startTime) return '';
		const duration = result.endTime - result.startTime;
		return `${duration}ms`;
	}

	function clearResults() {
		testResults.clear();
		testResults = new Map(testResults);
	}
</script>

<svelte:head>
	<title>Protocol Testing - Phase 3 WebSocket Learning</title>
	<meta name="description" content="Test different WebSocket protocols and subprotocols" />
</svelte:head>

<div class="protocol-testing">
	<header class="testing-header">
		<h1>WebSocket Protocol Testing</h1>
		<p>Test and validate different WebSocket protocols and subprotocols</p>
	</header>

	<div class="testing-layout">
		<div class="protocol-selector">
			<h2>Protocol Selection</h2>

			<div class="protocol-tabs">
				{#each Object.keys(protocolConfig) as protocol (protocol)}
					<button
						class="protocol-tab"
						class:active={selectedProtocol === protocol}
						onclick={() => (selectedProtocol = protocol)}
					>
						{protocol.toUpperCase()}
					</button>
				{/each}
			</div>

			<div class="protocol-info">
				<h3>{selectedProtocol.toUpperCase()} Protocol</h3>
				<p>{currentConfig?.description}</p>
				<div class="config-details">
					<div class="config-item">
						<span class="config-label">URL:</span>
						<span class="config-value">{currentConfig?.url}</span>
					</div>
					<div class="config-item">
						<span class="config-label">Protocols:</span>
						<span class="config-value">
							{currentConfig?.protocols.length ? currentConfig.protocols.join(', ') : 'None'}
						</span>
					</div>
				</div>
			</div>

			<div class="test-actions">
				<button
					class="btn btn-primary"
					onclick={() => {
						currentTests.forEach((test) => runTest(test));
					}}
				>
					Run All Tests
				</button>
				<button class="btn btn-outline" onclick={clearResults}> Clear Results </button>
			</div>
		</div>

		<div class="test-scenarios">
			<h2>Test Scenarios</h2>

			<div class="scenarios-list">
				{#each currentTests as test (test.id)}
					{@const result = getTestStatus(test.id)}
					<div class="scenario-card">
						<div class="scenario-header">
							<h3>{test.name}</h3>
							{#if result}
								<span class="test-status status-{result.status}">
									{result.status}
								</span>
							{/if}
						</div>

						<p class="scenario-description">{test.description}</p>

						<div class="scenario-steps">
							<h4>Test Steps:</h4>
							<ol>
								{#each test.steps as step, index (index)}
									<li>{step}</li>
								{/each}
							</ol>
						</div>

						<div class="scenario-actions">
							<button
								class="btn btn-primary btn-sm"
								onclick={() => runTest(test)}
								disabled={currentTest?.id === test.id}
							>
								{currentTest?.id === test.id ? 'Running...' : 'Run Test'}
							</button>

							{#if result && result.status !== 'running'}
								<span class="test-duration">{formatDuration(result)}</span>
							{/if}
						</div>

						{#if result && result.error}
							<div class="test-error">
								<strong>Error:</strong>
								{result.error}
							</div>
						{/if}

						{#if result && result.details}
							<div class="test-details">
								{result.details}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		<div class="connection-monitor">
			<h2>Connection Monitor</h2>

			<div class="monitor-status">
				<div class="status-item">
					<span class="status-label">Status:</span>
					<span class="status-value status-{wsStore.state.status}">
						{wsStore.state.status}
					</span>
				</div>
				<div class="status-item">
					<span class="status-label">Protocol:</span>
					<span class="status-value">{currentConfig?.protocols[0] || 'None'}</span>
				</div>
				<div class="status-item">
					<span class="status-label">Messages:</span>
					<span class="status-value">{wsStore.state.messageCount}</span>
				</div>
			</div>

			<div class="message-log">
				<h3>Message Log</h3>
				<div class="log-container">
					{#each wsStore.messages.slice(-10) as message (message.timestamp)}
						<div class="log-entry">
							<span class="log-time">{new Date(message.timestamp).toLocaleTimeString()}</span>
							<span class="log-type">{message.type}</span>
							<span class="log-content">{JSON.stringify(message.payload).slice(0, 100)}...</span>
						</div>
					{/each}

					{#if wsStore.messages.length === 0}
						<div class="log-empty">No messages yet</div>
					{/if}
				</div>
			</div>

			{#if currentTest}
				<div class="current-test">
					<h3>Current Test</h3>
					<div class="test-info">
						<div class="test-name">{currentTest.name}</div>
						<div class="test-spinner">Running...</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.protocol-testing {
		max-width: 1400px;
		margin: 0 auto;
		padding: 2rem;
	}

	.testing-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.testing-header h1 {
		font-size: 2.5rem;
		margin: 0 0 0.5rem 0;
		color: #1a1a1a;
	}

	.testing-header p {
		font-size: 1.1rem;
		color: #666;
		margin: 0;
	}

	.testing-layout {
		display: grid;
		grid-template-columns: 1fr 2fr 1fr;
		gap: 2rem;
	}

	.protocol-selector,
	.test-scenarios,
	.connection-monitor {
		background: white;
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		height: fit-content;
	}

	.protocol-selector h2,
	.test-scenarios h2,
	.connection-monitor h2 {
		margin: 0 0 1rem 0;
		color: #1a1a1a;
		font-size: 1.25rem;
	}

	.protocol-tabs {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.protocol-tab {
		padding: 0.75rem 1rem;
		border: 1px solid #ddd;
		background: white;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: all 0.2s;
		font-weight: 500;
		text-transform: uppercase;
	}

	.protocol-tab:hover {
		background: #f8f9fa;
		border-color: #667eea;
	}

	.protocol-tab.active {
		background: #667eea;
		color: white;
		border-color: #667eea;
	}

	.protocol-info {
		margin-bottom: 1.5rem;
	}

	.protocol-info h3 {
		margin: 0 0 0.5rem 0;
		color: #1a1a1a;
		font-size: 1.1rem;
	}

	.protocol-info p {
		color: #666;
		margin-bottom: 1rem;
		line-height: 1.5;
	}

	.config-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.config-item {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem;
		background: #f8f9fa;
		border-radius: 0.25rem;
	}

	.config-label {
		font-weight: 600;
		color: #333;
	}

	.config-value {
		color: #666;
		font-family: monospace;
		font-size: 0.9rem;
	}

	.test-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
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

	.scenarios-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.scenario-card {
		background: #f8f9fa;
		border-radius: 0.5rem;
		padding: 1rem;
		position: relative;
	}

	.scenario-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.scenario-header h3 {
		margin: 0;
		color: #1a1a1a;
		font-size: 1rem;
	}

	.test-status {
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.status-running {
		background: #fff3cd;
		color: #856404;
	}

	.status-passed {
		background: #d4edda;
		color: #155724;
	}

	.status-failed {
		background: #f8d7da;
		color: #721c24;
	}

	.scenario-description {
		color: #666;
		margin-bottom: 1rem;
		line-height: 1.5;
	}

	.scenario-steps {
		margin-bottom: 1rem;
	}

	.scenario-steps h4 {
		margin: 0 0 0.5rem 0;
		font-size: 0.9rem;
		color: #333;
	}

	.scenario-steps ol {
		margin: 0;
		padding-left: 1.5rem;
	}

	.scenario-steps li {
		color: #666;
		font-size: 0.9rem;
		margin-bottom: 0.25rem;
	}

	.scenario-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.test-duration {
		font-size: 0.8rem;
		color: #666;
		font-weight: 600;
	}

	.test-error {
		background: #f8d7da;
		color: #721c24;
		padding: 0.5rem;
		border-radius: 0.25rem;
		margin-top: 0.5rem;
		font-size: 0.9rem;
	}

	.test-details {
		background: #d4edda;
		color: #155724;
		padding: 0.5rem;
		border-radius: 0.25rem;
		margin-top: 0.5rem;
		font-size: 0.9rem;
	}

	.monitor-status {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
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
		color: #666;
	}

	.status-connected {
		color: #28a745;
	}

	.status-connecting {
		color: #ffc107;
	}

	.status-disconnected {
		color: #6c757d;
	}

	.status-error {
		color: #dc3545;
	}

	.message-log {
		margin-bottom: 1.5rem;
	}

	.message-log h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
		color: #1a1a1a;
	}

	.log-container {
		max-height: 200px;
		overflow-y: auto;
		border: 1px solid #ddd;
		border-radius: 0.25rem;
		background: #f8f9fa;
	}

	.log-entry {
		display: grid;
		grid-template-columns: auto auto 1fr;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem;
		border-bottom: 1px solid #e9ecef;
		font-size: 0.8rem;
		font-family: monospace;
	}

	.log-time {
		color: #666;
	}

	.log-type {
		color: #667eea;
		font-weight: 600;
	}

	.log-content {
		color: #333;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.log-empty {
		padding: 1rem;
		text-align: center;
		color: #666;
		font-style: italic;
	}

	.current-test {
		background: #fff3cd;
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.current-test h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1rem;
		color: #856404;
	}

	.test-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.test-name {
		font-weight: 600;
		color: #856404;
	}

	.test-spinner {
		font-size: 0.9rem;
		color: #856404;
	}

	@media (max-width: 1024px) {
		.testing-layout {
			grid-template-columns: 1fr;
		}

		.protocol-tabs {
			flex-direction: row;
			flex-wrap: wrap;
		}
	}

	@media (max-width: 768px) {
		.protocol-testing {
			padding: 1rem;
		}

		.testing-header h1 {
			font-size: 2rem;
		}

		.scenario-actions {
			flex-direction: column;
			gap: 0.5rem;
			align-items: stretch;
		}
	}
</style>

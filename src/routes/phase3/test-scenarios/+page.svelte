<script lang="ts">
	let selectedCategory = $state('connection');
	let runningTests = $state(new Set());
	let testResults = $state(new Map());

	const categories = [
		{ id: 'connection', name: 'Connection Tests', icon: '🔗' },
		{ id: 'protocol', name: 'Protocol Tests', icon: '📡' },
		{ id: 'performance', name: 'Performance Tests', icon: '⚡' },
		{ id: 'reliability', name: 'Reliability Tests', icon: '🛡️' },
		{ id: 'security', name: 'Security Tests', icon: '🔒' }
	];

	const testScenarios = {
		connection: [
			{
				id: 'basic-connection',
				name: 'Basic Connection',
				description: 'Test basic WebSocket connection establishment',
				difficulty: 'beginner',
				estimatedTime: '2 min',
				steps: [
					'Create WebSocket connection',
					'Verify connection state',
					'Send ping message',
					'Verify pong response'
				]
			},
			{
				id: 'connection-retry',
				name: 'Connection Retry Logic',
				description: 'Test automatic reconnection after connection loss',
				difficulty: 'intermediate',
				estimatedTime: '5 min',
				steps: [
					'Establish connection',
					'Simulate server shutdown',
					'Verify retry attempts',
					'Confirm successful reconnection'
				]
			},
			{
				id: 'connection-timeout',
				name: 'Connection Timeout',
				description: 'Test connection timeout handling',
				difficulty: 'intermediate',
				estimatedTime: '3 min',
				steps: [
					'Configure short timeout',
					'Attempt connection to invalid endpoint',
					'Verify timeout error',
					'Test error handling'
				]
			}
		],
		protocol: [
			{
				id: 'subprotocol-negotiation',
				name: 'Subprotocol Negotiation',
				description: 'Test WebSocket subprotocol selection',
				difficulty: 'intermediate',
				estimatedTime: '4 min',
				steps: [
					'Request multiple subprotocols',
					'Verify server selection',
					'Test protocol-specific messages',
					'Validate protocol compliance'
				]
			},
			{
				id: 'binary-data',
				name: 'Binary Data Handling',
				description: 'Test sending and receiving binary data',
				difficulty: 'intermediate',
				estimatedTime: '3 min',
				steps: [
					'Send ArrayBuffer data',
					'Verify binary message type',
					'Test data integrity',
					'Handle large binary payloads'
				]
			},
			{
				id: 'json-messages',
				name: 'JSON Message Format',
				description: 'Test structured JSON message handling',
				difficulty: 'beginner',
				estimatedTime: '2 min',
				steps: [
					'Send JSON message',
					'Verify message structure',
					'Test nested objects',
					'Handle invalid JSON'
				]
			}
		],
		performance: [
			{
				id: 'message-throughput',
				name: 'Message Throughput',
				description: 'Test maximum message sending rate',
				difficulty: 'advanced',
				estimatedTime: '10 min',
				steps: [
					'Send burst of messages',
					'Measure send rate',
					'Monitor queue depth',
					'Test backpressure handling'
				]
			},
			{
				id: 'concurrent-connections',
				name: 'Concurrent Connections',
				description: 'Test multiple simultaneous connections',
				difficulty: 'advanced',
				estimatedTime: '8 min',
				steps: [
					'Create multiple connections',
					'Monitor resource usage',
					'Test connection limits',
					'Verify connection isolation'
				]
			},
			{
				id: 'large-messages',
				name: 'Large Message Handling',
				description: 'Test handling of large message payloads',
				difficulty: 'intermediate',
				estimatedTime: '5 min',
				steps: [
					'Send large text message',
					'Test message fragmentation',
					'Verify complete delivery',
					'Monitor memory usage'
				]
			}
		],
		reliability: [
			{
				id: 'network-interruption',
				name: 'Network Interruption',
				description: 'Test behavior during network interruptions',
				difficulty: 'advanced',
				estimatedTime: '7 min',
				steps: [
					'Establish stable connection',
					'Simulate network interruption',
					'Test connection detection',
					'Verify reconnection logic'
				]
			},
			{
				id: 'server-restart',
				name: 'Server Restart Handling',
				description: 'Test client behavior during server restarts',
				difficulty: 'intermediate',
				estimatedTime: '6 min',
				steps: [
					'Connect to server',
					'Simulate server restart',
					'Test connection state',
					'Verify graceful recovery'
				]
			},
			{
				id: 'message-ordering',
				name: 'Message Ordering',
				description: 'Test message delivery order guarantees',
				difficulty: 'intermediate',
				estimatedTime: '4 min',
				steps: [
					'Send numbered messages',
					'Verify order preservation',
					'Test rapid message sequence',
					'Check for message loss'
				]
			}
		],
		security: [
			{
				id: 'wss-connection',
				name: 'Secure WebSocket (WSS)',
				description: 'Test secure WebSocket connection establishment',
				difficulty: 'intermediate',
				estimatedTime: '3 min',
				steps: [
					'Connect using WSS protocol',
					'Verify TLS negotiation',
					'Test certificate validation',
					'Confirm encrypted communication'
				]
			},
			{
				id: 'origin-validation',
				name: 'Origin Header Validation',
				description: 'Test origin header validation',
				difficulty: 'advanced',
				estimatedTime: '5 min',
				steps: [
					'Send valid origin header',
					'Test invalid origin rejection',
					'Verify CORS compliance',
					'Test origin spoofing protection'
				]
			},
			{
				id: 'message-validation',
				name: 'Message Validation',
				description: 'Test input validation and sanitization',
				difficulty: 'intermediate',
				estimatedTime: '4 min',
				steps: [
					'Send malformed messages',
					'Test input sanitization',
					'Verify error handling',
					'Test injection protection'
				]
			}
		]
	};

	let currentScenarios = $derived(
		testScenarios[selectedCategory as keyof typeof testScenarios] || []
	);

	function runTest(testId: string) {
		if (runningTests.has(testId)) return;

		runningTests.add(testId);
		runningTests = new Set(runningTests);

		// Simulate test execution
		setTimeout(
			() => {
				const success = Math.random() > 0.2; // 80% success rate
				const result = {
					status: success ? 'passed' : 'failed',
					timestamp: new Date().toISOString(),
					duration: Math.floor(Math.random() * 5000) + 1000,
					details: success
						? 'All test steps completed successfully'
						: 'Test failed at step ' + (Math.floor(Math.random() * 4) + 1)
				};

				testResults.set(testId, result);
				testResults = new Map(testResults);

				runningTests.delete(testId);
				runningTests = new Set(runningTests);
			},
			2000 + Math.random() * 3000
		);
	}

	function runAllTests() {
		currentScenarios.forEach((test) => {
			if (!runningTests.has(test.id)) {
				runTest(test.id);
			}
		});
	}

	function clearResults() {
		testResults.clear();
		testResults = new Map(testResults);
	}

	function getTestResult(testId: string) {
		return testResults.get(testId);
	}

	function getDifficultyColor(difficulty: string) {
		switch (difficulty) {
			case 'beginner':
				return '#28a745';
			case 'intermediate':
				return '#ffc107';
			case 'advanced':
				return '#dc3545';
			default:
				return '#6c757d';
		}
	}
</script>

<svelte:head>
	<title>Test Scenarios - Phase 3 WebSocket Learning</title>
	<meta
		name="description"
		content="Comprehensive WebSocket test scenarios for connection, protocol, performance, reliability, and security testing"
	/>
</svelte:head>

<div class="test-scenarios">
	<header class="scenarios-header">
		<h1>WebSocket Test Scenarios</h1>
		<p>Comprehensive test suite for WebSocket implementations</p>
	</header>

	<nav class="category-nav">
		{#each categories as category (category.id)}
			<button
				class="category-tab"
				class:active={selectedCategory === category.id}
				onclick={() => (selectedCategory = category.id)}
			>
				<span class="category-icon">{category.icon}</span>
				<span class="category-name">{category.name}</span>
			</button>
		{/each}
	</nav>

	<div class="scenarios-actions">
		<button class="btn btn-primary" onclick={runAllTests}>
			Run All {categories.find((c) => c.id === selectedCategory)?.name}
		</button>
		<button class="btn btn-outline" onclick={clearResults}> Clear Results </button>
	</div>

	<div class="scenarios-grid">
		{#each currentScenarios as scenario (scenario.id)}
			{@const isRunning = runningTests.has(scenario.id)}
			{@const result = getTestResult(scenario.id)}

			<div class="scenario-card" class:running={isRunning}>
				<div class="scenario-header">
					<h3>{scenario.name}</h3>
					<div class="scenario-meta">
						<span
							class="difficulty-badge"
							style="background-color: {getDifficultyColor(scenario.difficulty)}"
						>
							{scenario.difficulty}
						</span>
						<span class="time-estimate">⏱️ {scenario.estimatedTime}</span>
					</div>
				</div>

				<p class="scenario-description">{scenario.description}</p>

				<div class="scenario-steps">
					<h4>Test Steps:</h4>
					<ol>
						{#each scenario.steps as step (step)}
							<li>{step}</li>
						{/each}
					</ol>
				</div>

				<div class="scenario-actions">
					<button class="btn btn-primary" onclick={() => runTest(scenario.id)} disabled={isRunning}>
						{isRunning ? 'Running...' : 'Run Test'}
					</button>

					{#if result}
						<div class="test-result result-{result.status}">
							<span class="result-status">{result.status}</span>
							<span class="result-duration">{result.duration}ms</span>
						</div>
					{/if}
				</div>

				{#if result && result.details}
					<div class="test-details">
						<p>{result.details}</p>
						<small>Completed: {new Date(result.timestamp).toLocaleString()}</small>
					</div>
				{/if}

				{#if isRunning}
					<div class="running-indicator">
						<div class="spinner"></div>
						<span>Running test...</span>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<div class="test-summary">
		<h2>Test Results Summary</h2>
		<div class="summary-stats">
			{#snippet summaryStats()}
				{@const totalTests = currentScenarios.length}
				{@const completedTests = currentScenarios.filter((s) => testResults.has(s.id)).length}
				{@const passedTests = currentScenarios.filter((s) => {
					const result = testResults.get(s.id);
					return result && result.status === 'passed';
				}).length}
				{@const failedTests = currentScenarios.filter((s) => {
					const result = testResults.get(s.id);
					return result && result.status === 'failed';
				}).length}
				{@const runningTestsCount = runningTests.size}

				<div class="stat-item">
					<span class="stat-label">Total Tests:</span>
					<span class="stat-value">{totalTests}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Completed:</span>
					<span class="stat-value">{completedTests}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Passed:</span>
					<span class="stat-value stat-passed">{passedTests}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Failed:</span>
					<span class="stat-value stat-failed">{failedTests}</span>
				</div>
				<div class="stat-item">
					<span class="stat-label">Running:</span>
					<span class="stat-value stat-running">{runningTestsCount}</span>
				</div>
			{/snippet}
			{@render summaryStats()}
		</div>
	</div>
</div>

<style>
	.test-scenarios {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.scenarios-header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.scenarios-header h1 {
		font-size: 2.5rem;
		margin: 0 0 0.5rem 0;
		color: #1a1a1a;
	}

	.scenarios-header p {
		font-size: 1.1rem;
		color: #666;
		margin: 0;
	}

	.category-nav {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
		padding: 0.5rem;
		background: #f8f9fa;
		border-radius: 0.5rem;
	}

	.category-tab {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border: none;
		background: transparent;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: all 0.2s;
		color: #666;
		font-weight: 500;
	}

	.category-tab:hover {
		background: rgba(102, 126, 234, 0.1);
		color: #667eea;
	}

	.category-tab.active {
		background: #667eea;
		color: white;
	}

	.category-icon {
		font-size: 1.2rem;
	}

	.scenarios-actions {
		display: flex;
		gap: 1rem;
		margin-bottom: 2rem;
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

	.scenarios-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.scenario-card {
		background: white;
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s;
		position: relative;
	}

	.scenario-card:hover {
		transform: translateY(-2px);
	}

	.scenario-card.running {
		border-left: 4px solid #ffc107;
	}

	.scenario-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.scenario-header h3 {
		margin: 0;
		color: #1a1a1a;
		font-size: 1.1rem;
	}

	.scenario-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-left: 1rem;
	}

	.difficulty-badge {
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		color: white;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
	}

	.time-estimate {
		font-size: 0.9rem;
		color: #666;
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
		color: #333;
		font-size: 0.9rem;
	}

	.scenario-steps ol {
		margin: 0;
		padding-left: 1.5rem;
	}

	.scenario-steps li {
		margin-bottom: 0.25rem;
		color: #666;
		font-size: 0.9rem;
	}

	.scenario-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.test-result {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		font-size: 0.8rem;
		font-weight: 600;
	}

	.result-passed {
		background: #d4edda;
		color: #155724;
	}

	.result-failed {
		background: #f8d7da;
		color: #721c24;
	}

	.test-details {
		background: #f8f9fa;
		border-radius: 0.25rem;
		padding: 0.75rem;
		margin-top: 1rem;
	}

	.test-details p {
		margin: 0 0 0.5rem 0;
		color: #333;
		font-size: 0.9rem;
	}

	.test-details small {
		color: #666;
		font-size: 0.8rem;
	}

	.running-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		position: absolute;
		top: 1rem;
		right: 1rem;
		background: rgba(255, 193, 7, 0.1);
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		color: #856404;
		font-size: 0.8rem;
	}

	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid #856404;
		border-top: 2px solid transparent;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.test-summary {
		background: white;
		border-radius: 0.5rem;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.test-summary h2 {
		margin: 0 0 1rem 0;
		color: #1a1a1a;
	}

	.summary-stats {
		display: flex;
		gap: 2rem;
		flex-wrap: wrap;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.stat-label {
		font-size: 0.9rem;
		color: #666;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1a1a1a;
	}

	.stat-passed {
		color: #28a745;
	}

	.stat-failed {
		color: #dc3545;
	}

	.stat-running {
		color: #ffc107;
	}

	@media (max-width: 768px) {
		.test-scenarios {
			padding: 1rem;
		}

		.scenarios-header h1 {
			font-size: 2rem;
		}

		.category-nav {
			flex-direction: column;
		}

		.scenarios-grid {
			grid-template-columns: 1fr;
		}

		.scenario-header {
			flex-direction: column;
			gap: 0.5rem;
		}

		.scenario-meta {
			margin-left: 0;
		}

		.summary-stats {
			justify-content: center;
		}
	}
</style>

<script lang="ts">
	import Phase2ServerSelector from '$lib/components/phase2/Phase2ServerSelector.svelte';
	import Phase2ProtocolAnalyzer from '$lib/components/phase2/Phase2ProtocolAnalyzer.svelte';
	import Phase2FrameInspector from '$lib/components/phase2/Phase2FrameInspector.svelte';
	import type {
		Phase2LocalServer,
		Phase2ConnectionState,
		WebSocketFrame
	} from '$lib/types/websocket';
	import { browser } from '$lib/utils/environment';

	// Connection state
	let selectedServer = $state<Phase2LocalServer | null>(null);
	let connectionState = $state<Phase2ConnectionState>({
		status: 'disconnected',
		service: null,
		server: null,
		subprotocol: null,
		protocolState: null,
		frameCaptureEnabled: true,
		analysisMode: 'basic'
	});
	let socket = $state<WebSocket | null>(null);
	let selectedFrame = $state<WebSocketFrame | null>(null);

	// Message input
	let messageInput = $state('');
	let messageType = $state<'text' | 'binary'>('text');

	// Derived states
	let isConnected = $derived(
		connectionState.status === 'connected' && socket?.readyState === WebSocket.OPEN
	);
	let canSend = $derived(isConnected && messageInput.trim().length > 0);

	function handleServerSelect(server: Phase2LocalServer) {
		if (isConnected) {
			disconnect();
		}
		selectedServer = server;
		connectionState.server = server;
	}

	async function connect() {
		if (!selectedServer || !browser) return;

		try {
			connectionState.status = 'connecting';

			// Create WebSocket connection with subprotocols
			const protocols =
				selectedServer.subprotocols.length > 0 ? selectedServer.subprotocols : undefined;
			socket = new WebSocket(selectedServer.url, protocols);

			// Setup event handlers
			socket.onopen = () => {
				connectionState.status = 'connected';
				connectionState.subprotocol = socket?.protocol || null;
				console.log('Connected to:', selectedServer?.name);
				console.log('Negotiated protocol:', socket?.protocol);
			};

			socket.onmessage = (event) => {
				console.log('Received message:', event.data);
				// Frame capture would be handled by Protocol Analyzer
			};

			socket.onerror = (event) => {
				console.error('WebSocket error:', event);
				connectionState.status = 'error';
				connectionState.lastError = 'Connection failed';
			};

			socket.onclose = (event) => {
				console.log('Connection closed:', event.code, event.reason);
				connectionState.status = 'disconnected';
				connectionState.subprotocol = null;
				socket = null;
			};
		} catch (error) {
			console.error('Connection error:', error);
			connectionState.status = 'error';
			connectionState.lastError = error instanceof Error ? error.message : 'Unknown error';
		}
	}

	function disconnect() {
		if (socket) {
			socket.close(1000, 'User disconnect');
		}
	}

	function sendMessage() {
		if (!canSend || !socket) return;

		try {
			if (messageType === 'text') {
				socket.send(messageInput);
			} else {
				// Convert hex string to binary for demo
				const encoder = new TextEncoder();
				const data = encoder.encode(messageInput);
				socket.send(data);
			}

			messageInput = '';
		} catch (error) {
			console.error('Send error:', error);
		}
	}

	function sendProtocolMessage(messageData: unknown) {
		if (!socket || !isConnected) return;

		try {
			if (selectedServer?.protocol === 'graphql-ws') {
				socket.send(JSON.stringify(messageData));
			} else if (selectedServer?.protocol === 'mqtt') {
				// MQTT binary message handling would go here
				console.log('MQTT message sending not implemented in demo');
			} else {
				socket.send(JSON.stringify(messageData));
			}
		} catch (error) {
			console.error('Protocol message error:', error);
		}
	}

	// Example protocol messages
	function sendGraphQLInit() {
		sendProtocolMessage({
			type: 'connection_init',
			payload: {}
		});
	}

	function sendGraphQLSubscription() {
		sendProtocolMessage({
			id: 'sub_' + Date.now(),
			type: 'start',
			payload: {
				query: 'subscription { currentTime }'
			}
		});
	}

	function sendPingTest() {
		sendProtocolMessage({
			type: 'ping_test',
			timestamp: Date.now(),
			message: 'Educational ping test'
		});
	}
</script>

<svelte:head>
	<title>Phase 2: Implementation Technology | WebSocket学習</title>
	<meta name="description" content="Phase 2 - ローカル開発環境でのWebSocketプロトコル詳細学習" />
</svelte:head>

<div class="max-w-7xl mx-auto py-8 px-4">
	<!-- Header -->
	<div class="mb-8">
		<nav class="text-sm text-gray-500 mb-4">
			<a href="/" class="hover:text-gray-700">Home</a>
			<span class="mx-2">›</span>
			<span class="text-gray-900">Phase 2: Implementation Technology</span>
		</nav>

		<h1 class="text-3xl font-bold text-gray-900 mb-4">🔧 Phase 2: Implementation Technology</h1>
		<p class="text-lg text-gray-600 max-w-3xl">
			ローカル開発環境でWebSocketプロトコルの詳細を学習します。フレーム構造の解析、サブプロトコル実装、プロトコルデバッグ機能を提供します。
		</p>
	</div>

	<!-- Phase 2 Features -->
	<div class="grid md:grid-cols-3 gap-6 mb-8">
		<div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
			<h3 class="text-lg font-semibold text-blue-900 mb-2">🔍 プロトコル解析</h3>
			<p class="text-blue-800 text-sm">WebSocketフレーム構造の詳細解析とリアルタイム可視化</p>
		</div>
		<div class="bg-purple-50 border border-purple-200 rounded-lg p-6">
			<h3 class="text-lg font-semibold text-purple-900 mb-2">🔧 サブプロトコル</h3>
			<p class="text-purple-800 text-sm">GraphQL-WS、MQTT over WebSocketの実装学習</p>
		</div>
		<div class="bg-green-50 border border-green-200 rounded-lg p-6">
			<h3 class="text-lg font-semibold text-green-900 mb-2">🐳 Docker環境</h3>
			<p class="text-green-800 text-sm">完全にコントロール可能なローカル開発環境</p>
		</div>
	</div>

	<div class="grid lg:grid-cols-2 gap-8">
		<!-- Left Column: Server Selection & Connection -->
		<div class="space-y-6">
			<!-- Server Selection -->
			<Phase2ServerSelector bind:selectedServer onServerSelect={handleServerSelect} />

			<!-- Connection Control -->
			{#if selectedServer}
				<div class="bg-white border border-gray-200 rounded-lg p-6">
					<h3 class="text-lg font-semibold text-gray-900 mb-4">🔌 Connection Control</h3>

					<!-- Connection Status -->
					<div class="mb-4">
						<div class="flex items-center space-x-2 mb-2">
							<span class="text-sm font-medium text-gray-600">Status:</span>
							<span
								class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full
								{connectionState.status === 'connected'
									? 'bg-green-100 text-green-800'
									: connectionState.status === 'connecting'
										? 'bg-yellow-100 text-yellow-800'
										: connectionState.status === 'error'
											? 'bg-red-100 text-red-800'
											: 'bg-gray-100 text-gray-800'}"
							>
								{connectionState.status.toUpperCase()}
							</span>
						</div>

						{#if connectionState.subprotocol}
							<div class="text-sm text-gray-600">
								<strong>Negotiated Protocol:</strong>
								{connectionState.subprotocol}
							</div>
						{/if}

						{#if connectionState.lastError}
							<div class="text-sm text-red-600 mt-1">
								<strong>Error:</strong>
								{connectionState.lastError}
							</div>
						{/if}
					</div>

					<!-- Connection Buttons -->
					<div class="flex space-x-3 mb-6">
						<button
							type="button"
							onclick={connect}
							disabled={connectionState.status === 'connecting' || isConnected}
							class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{connectionState.status === 'connecting' ? 'Connecting...' : 'Connect'}
						</button>

						<button
							type="button"
							onclick={disconnect}
							disabled={!isConnected}
							class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Disconnect
						</button>
					</div>

					<!-- Message Sending -->
					{#if isConnected}
						<div class="border-t border-gray-200 pt-4">
							<h4 class="font-medium text-gray-900 mb-3">📤 Send Message</h4>

							<div class="space-y-3">
								<!-- Message Type Selection -->
								<div class="flex space-x-4">
									<label class="flex items-center">
										<input type="radio" bind:group={messageType} value="text" class="mr-2" />
										Text
									</label>
									<label class="flex items-center">
										<input type="radio" bind:group={messageType} value="binary" class="mr-2" />
										Binary
									</label>
								</div>

								<!-- Message Input -->
								<div class="flex space-x-2">
									<input
										type="text"
										bind:value={messageInput}
										placeholder={messageType === 'text'
											? 'Enter text message...'
											: 'Enter hex data...'}
										class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										onkeydown={(e) => {
											if (e.key === 'Enter') {
												sendMessage();
											}
										}}
									/>
									<button
										type="button"
										onclick={sendMessage}
										disabled={!canSend}
										class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Send
									</button>
								</div>

								<!-- Protocol-specific buttons -->
								{#if selectedServer.protocol === 'graphql-ws'}
									<div class="flex space-x-2 pt-2">
										<button
											type="button"
											onclick={sendGraphQLInit}
											class="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
										>
											Connection Init
										</button>
										<button
											type="button"
											onclick={sendGraphQLSubscription}
											class="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
										>
											Start Subscription
										</button>
									</div>
								{:else if selectedServer.protocol === 'basic'}
									<div class="flex space-x-2 pt-2">
										<button
											type="button"
											onclick={sendPingTest}
											class="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
										>
											Ping Test
										</button>
									</div>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Protocol Analyzer -->
			<Phase2ProtocolAnalyzer server={selectedServer} {isConnected} />
		</div>

		<!-- Right Column: Frame Inspector -->
		<div class="space-y-6">
			<Phase2FrameInspector frame={selectedFrame} />
		</div>
	</div>

	<!-- Docker Setup Instructions -->
	<div class="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-4">🐳 Docker Environment Setup</h3>

		<div class="grid md:grid-cols-2 gap-6">
			<div>
				<h4 class="font-medium text-gray-900 mb-2">Quick Start</h4>
				<div class="bg-gray-800 text-green-400 p-3 rounded font-mono text-sm">
					<div>cd ../websocket-learning-apps</div>
					<div>docker-compose up -d</div>
				</div>
				<p class="text-sm text-gray-600 mt-2">
					This starts all three WebSocket servers on localhost ports 8080, 8081, and 8082.
				</p>
			</div>

			<div>
				<h4 class="font-medium text-gray-900 mb-2">Service URLs</h4>
				<div class="space-y-1 text-sm">
					<div class="flex justify-between">
						<span class="text-gray-600">Basic WebSocket:</span>
						<code class="text-blue-600">ws://localhost:8080</code>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">GraphQL-WS:</span>
						<code class="text-purple-600">ws://localhost:8081</code>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">MQTT over WS:</span>
						<code class="text-green-600">ws://localhost:8082</code>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

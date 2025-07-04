<script lang="ts">
	import type {
		Phase2LocalServer,
		WebSocketFrame,
		ProtocolEvent,
		ProtocolAnalyzerConfig,
		GraphQLWSFrameInfo,
		MQTTFrameInfo
	} from '$lib/types/websocket';
	import { browser } from '$lib/utils/environment';

	interface Props {
		server: Phase2LocalServer | null;
		isConnected: boolean;
		analyzerConfig?: ProtocolAnalyzerConfig;
	}

	let {
		server,
		isConnected,
		analyzerConfig = {
			captureFrames: true,
			maxFrames: 100,
			parseProtocol: true,
			visualizeBinary: true,
			realTimeAnalysis: true
		}
	}: Props = $props();

	// Analysis state
	let capturedFrames = $state<WebSocketFrame[]>([]);
	let protocolEvents = $state<ProtocolEvent[]>([]);
	let analysisStats = $state({
		totalFrames: 0,
		textFrames: 0,
		binaryFrames: 0,
		pingFrames: 0,
		pongFrames: 0,
		totalBytes: 0,
		averageFrameSize: 0,
		protocolCompliance: 0
	});

	// UI state
	let selectedFrame = $state<WebSocketFrame | null>(null);
	let activeTab = $state<'frames' | 'events' | 'stats' | 'protocol'>('frames');
	let autoScroll = $state(true);

	// Mock frame data for demonstration
	$effect(() => {
		if (isConnected && server && analyzerConfig.captureFrames) {
			// Simulate frame capture for educational purposes
			startFrameSimulation();
		}
	});

	function startFrameSimulation() {
		if (!browser) return;

		// Simulate frames based on server type
		const interval = setInterval(() => {
			if (!isConnected) {
				clearInterval(interval);
				return;
			}

			generateMockFrame();
		}, 2000);
	}

	function generateMockFrame() {
		if (!server) return;

		const now = Date.now();
		const isOutbound = Math.random() > 0.5;

		let frame: WebSocketFrame;

		switch (server.protocol) {
			case 'basic':
				frame = generateBasicFrame(now, isOutbound);
				break;
			case 'graphql-ws':
				frame = generateGraphQLFrame(now, isOutbound);
				break;
			case 'mqtt':
				frame = generateMQTTFrame(now, isOutbound);
				break;
			default:
				frame = generateBasicFrame(now, isOutbound);
		}

		addFrame(frame);
	}

	function generateBasicFrame(timestamp: number, isOutbound: boolean): WebSocketFrame {
		const messages = [
			'Hello from client!',
			'Echo response from server',
			'Frame analysis test message',
			'WebSocket educational demo'
		];

		const content = messages[Math.floor(Math.random() * messages.length)];
		const data = content;

		return {
			timestamp,
			direction: isOutbound ? 'outbound' : 'inbound',
			type: 'text',
			size: content.length,
			data,
			details: {
				fin: true,
				rsv1: false,
				rsv2: false,
				rsv3: false,
				opcode: 1, // Text frame
				masked: isOutbound,
				payloadLength: content.length,
				maskingKey: isOutbound ? [0x12, 0x34, 0x56, 0x78] : undefined
			}
		};
	}

	function generateGraphQLFrame(timestamp: number, isOutbound: boolean): WebSocketFrame {
		const messages = isOutbound
			? [
					{ type: 'connection_init', payload: {} },
					{ type: 'start', id: 'sub1', payload: { query: 'subscription { currentTime }' } },
					{ type: 'stop', id: 'sub1' }
				]
			: [
					{ type: 'connection_ack' },
					{
						type: 'data',
						id: 'sub1',
						payload: { data: { currentTime: new Date().toISOString() } }
					},
					{ type: 'complete', id: 'sub1' }
				];

		const message = messages[Math.floor(Math.random() * messages.length)];
		const content = JSON.stringify(message);

		return {
			timestamp,
			direction: isOutbound ? 'outbound' : 'inbound',
			type: 'text',
			size: content.length,
			data: content,
			details: {
				fin: true,
				rsv1: false,
				rsv2: false,
				rsv3: false,
				opcode: 1,
				masked: isOutbound,
				payloadLength: content.length,
				maskingKey: isOutbound ? [0x12, 0x34, 0x56, 0x78] : undefined
			},
			protocolInfo: {
				messageType: message.type,
				subscriptionId: 'id' in message ? message.id : undefined,
				payload: 'payload' in message ? message.payload : undefined
			} as GraphQLWSFrameInfo
		};
	}

	function generateMQTTFrame(timestamp: number, isOutbound: boolean): WebSocketFrame {
		// Simplified MQTT packet simulation
		const packets = isOutbound
			? [
					new Uint8Array([0x10, 0x0a, 0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, 0x04, 0x00, 0x00, 0x3c]), // CONNECT
					new Uint8Array([0x82, 0x08, 0x00, 0x01, 0x00, 0x04, 0x74, 0x65, 0x73, 0x74]), // SUBSCRIBE
					new Uint8Array([
						0x30, 0x0e, 0x00, 0x04, 0x74, 0x65, 0x73, 0x74, 0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x21
					]) // PUBLISH
				]
			: [
					new Uint8Array([0x20, 0x02, 0x00, 0x00]), // CONNACK
					new Uint8Array([0x90, 0x03, 0x00, 0x01, 0x00]), // SUBACK
					new Uint8Array([0x40, 0x02, 0x00, 0x01]) // PUBACK
				];

		const packet = packets[Math.floor(Math.random() * packets.length)];
		const messageType = getMQTTMessageType(packet[0]);

		return {
			timestamp,
			direction: isOutbound ? 'outbound' : 'inbound',
			type: 'binary',
			size: packet.length,
			data: packet.buffer,
			details: {
				fin: true,
				rsv1: false,
				rsv2: false,
				rsv3: false,
				opcode: 2, // Binary frame
				masked: isOutbound,
				payloadLength: packet.length,
				maskingKey: isOutbound ? [0x12, 0x34, 0x56, 0x78] : undefined
			},
			protocolInfo: {
				messageType: messageType,
				packetId: packet.length > 2 ? (packet[2] << 8) | packet[3] : undefined
			} as MQTTFrameInfo
		};
	}

	function getMQTTMessageType(firstByte: number): string {
		const messageType = (firstByte >> 4) & 0x0f;
		const types = {
			1: 'CONNECT',
			2: 'CONNACK',
			3: 'PUBLISH',
			4: 'PUBACK',
			8: 'SUBSCRIBE',
			9: 'SUBACK',
			10: 'UNSUBSCRIBE',
			11: 'UNSUBACK',
			12: 'PINGREQ',
			13: 'PINGRESP',
			14: 'DISCONNECT'
		};
		return types[messageType as keyof typeof types] || 'UNKNOWN';
	}

	function addFrame(frame: WebSocketFrame) {
		capturedFrames = [...capturedFrames.slice(-(analyzerConfig.maxFrames - 1)), frame];

		// Update stats
		analysisStats.totalFrames++;
		analysisStats.totalBytes += frame.size;
		analysisStats.averageFrameSize = analysisStats.totalBytes / analysisStats.totalFrames;

		switch (frame.type) {
			case 'text':
				analysisStats.textFrames++;
				break;
			case 'binary':
				analysisStats.binaryFrames++;
				break;
			case 'ping':
				analysisStats.pingFrames++;
				break;
			case 'pong':
				analysisStats.pongFrames++;
				break;
		}

		// Add protocol event
		if (analyzerConfig.parseProtocol) {
			addProtocolEvent(frame);
		}
	}

	function addProtocolEvent(frame: WebSocketFrame) {
		if (!server) return;

		const event: ProtocolEvent = {
			timestamp: frame.timestamp,
			protocol: server.protocol,
			eventType: `${frame.direction}_${frame.type}`,
			data: frame.protocolInfo || { size: frame.size },
			description: `${frame.direction === 'outbound' ? 'Sent' : 'Received'} ${frame.type} frame${frame.protocolInfo ? ` (${JSON.stringify(frame.protocolInfo)})` : ''}`
		};

		protocolEvents = [...protocolEvents.slice(-49), event];
	}

	function clearFrames() {
		capturedFrames = [];
		protocolEvents = [];
		analysisStats = {
			totalFrames: 0,
			textFrames: 0,
			binaryFrames: 0,
			pingFrames: 0,
			pongFrames: 0,
			totalBytes: 0,
			averageFrameSize: 0,
			protocolCompliance: 0
		};
		selectedFrame = null;
	}

	function formatTimestamp(timestamp: number): string {
		return new Date(timestamp).toLocaleTimeString();
	}

	function formatFrameData(frame: WebSocketFrame): string {
		if (frame.type === 'binary') {
			const array = new Uint8Array(frame.data as ArrayBuffer);
			return Array.from(array)
				.map((b) => b.toString(16).padStart(2, '0'))
				.join(' ')
				.toUpperCase();
		}
		return frame.data as string;
	}

	function getFrameIcon(frame: WebSocketFrame): string {
		const directionIcon = frame.direction === 'outbound' ? '📤' : '📥';
		const typeIcon = frame.type === 'binary' ? '📦' : frame.type === 'ping' ? '🏓' : '📝';
		return `${directionIcon} ${typeIcon}`;
	}

	function getProtocolIcon(protocol: string): string {
		switch (protocol) {
			case 'basic':
				return '🔧';
			case 'graphql-ws':
				return '🔍';
			case 'mqtt':
				return '📡';
			default:
				return '❓';
		}
	}
</script>

<div class="bg-white border border-gray-200 rounded-lg">
	<!-- Header -->
	<div class="border-b border-gray-200 p-4">
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold text-gray-900">
				{getProtocolIcon(server?.protocol || 'basic')} Protocol Analyzer
				{#if server}
					<span class="text-sm font-normal text-gray-600">({server.name})</span>
				{/if}
			</h3>

			<div class="flex items-center space-x-2">
				<button
					type="button"
					onclick={clearFrames}
					disabled={capturedFrames.length === 0}
					class="px-3 py-1 text-xs font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Clear Frames
				</button>

				<label class="flex items-center text-xs text-gray-600">
					<input type="checkbox" bind:checked={autoScroll} class="mr-1 rounded border-gray-300" />
					Auto Scroll
				</label>
			</div>
		</div>
	</div>

	<!-- Tabs -->
	<div class="border-b border-gray-200">
		<nav class="flex space-x-8 px-4" aria-label="Tabs">
			{#each [{ id: 'frames', label: 'Frames', count: capturedFrames.length }, { id: 'events', label: 'Events', count: protocolEvents.length }, { id: 'stats', label: 'Statistics', count: null }, { id: 'protocol', label: 'Protocol', count: null }] as tab (tab.id)}
				<button
					type="button"
					onclick={() => (activeTab = tab.id as 'frames' | 'events' | 'stats' | 'protocol')}
					class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === tab.id
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
				>
					{tab.label}
					{#if tab.count !== null}
						<span class="ml-1 bg-gray-100 text-gray-900 py-0.5 px-1.5 rounded-full text-xs">
							{tab.count}
						</span>
					{/if}
				</button>
			{/each}
		</nav>
	</div>

	<!-- Tab Content -->
	<div class="p-4">
		{#if activeTab === 'frames'}
			<div class="space-y-2 max-h-96 overflow-y-auto">
				{#if capturedFrames.length === 0}
					<div class="text-center text-gray-500 py-8">
						<p>No frames captured yet.</p>
						<p class="text-sm">Connect to a server to start capturing WebSocket frames.</p>
					</div>
				{:else}
					{#each capturedFrames as frame, index (frame.timestamp + index)}
						<div
							class="border rounded-lg p-3 cursor-pointer transition-colors {selectedFrame === frame
								? 'border-blue-500 bg-blue-50'
								: 'border-gray-200 hover:border-gray-300'}"
							onclick={() => (selectedFrame = frame)}
							role="button"
							tabindex="0"
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									selectedFrame = frame;
								}
							}}
						>
							<div class="flex items-center justify-between mb-2">
								<div class="flex items-center space-x-2">
									<span class="text-lg">{getFrameIcon(frame)}</span>
									<span class="font-mono text-sm text-gray-600">
										{formatTimestamp(frame.timestamp)}
									</span>
									<span
										class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full
										{frame.type === 'text'
											? 'bg-green-100 text-green-800'
											: frame.type === 'binary'
												? 'bg-blue-100 text-blue-800'
												: 'bg-gray-100 text-gray-800'}"
									>
										{frame.type.toUpperCase()}
									</span>
								</div>
								<span class="text-xs text-gray-500">{frame.size} bytes</span>
							</div>

							<div class="text-sm text-gray-700 font-mono bg-gray-50 p-2 rounded truncate">
								{formatFrameData(frame)}
							</div>

							{#if frame.protocolInfo}
								<div class="mt-2 text-xs text-gray-600">
									Protocol: {JSON.stringify(frame.protocolInfo)}
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		{:else if activeTab === 'events'}
			<div class="space-y-2 max-h-96 overflow-y-auto">
				{#if protocolEvents.length === 0}
					<div class="text-center text-gray-500 py-8">
						<p>No protocol events recorded yet.</p>
					</div>
				{:else}
					{#each protocolEvents as event (event.timestamp)}
						<div class="border border-gray-200 rounded-lg p-3">
							<div class="flex items-center justify-between mb-1">
								<span class="font-mono text-sm text-gray-600">
									{formatTimestamp(event.timestamp)}
								</span>
								<span
									class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800"
								>
									{event.eventType}
								</span>
							</div>
							<p class="text-sm text-gray-700">{event.description}</p>
						</div>
					{/each}
				{/if}
			</div>
		{:else if activeTab === 'stats'}
			<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
				<div class="bg-gray-50 rounded-lg p-4">
					<div class="text-2xl font-bold text-gray-900">{analysisStats.totalFrames}</div>
					<div class="text-sm text-gray-600">Total Frames</div>
				</div>
				<div class="bg-green-50 rounded-lg p-4">
					<div class="text-2xl font-bold text-green-700">{analysisStats.textFrames}</div>
					<div class="text-sm text-gray-600">Text Frames</div>
				</div>
				<div class="bg-blue-50 rounded-lg p-4">
					<div class="text-2xl font-bold text-blue-700">{analysisStats.binaryFrames}</div>
					<div class="text-sm text-gray-600">Binary Frames</div>
				</div>
				<div class="bg-yellow-50 rounded-lg p-4">
					<div class="text-2xl font-bold text-yellow-700">
						{analysisStats.pingFrames + analysisStats.pongFrames}
					</div>
					<div class="text-sm text-gray-600">Ping/Pong</div>
				</div>
				<div class="bg-purple-50 rounded-lg p-4">
					<div class="text-2xl font-bold text-purple-700">
						{Math.round(analysisStats.averageFrameSize)}
					</div>
					<div class="text-sm text-gray-600">Avg Frame Size</div>
				</div>
				<div class="bg-red-50 rounded-lg p-4">
					<div class="text-2xl font-bold text-red-700">{analysisStats.totalBytes}</div>
					<div class="text-sm text-gray-600">Total Bytes</div>
				</div>
			</div>
		{:else if activeTab === 'protocol'}
			<div class="space-y-4">
				{#if server}
					<div class="bg-gray-50 rounded-lg p-4">
						<h4 class="font-medium text-gray-900 mb-2">Protocol Information</h4>
						<dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
							<dt class="font-medium text-gray-600">Protocol Type:</dt>
							<dd class="text-gray-900">{server.protocol}</dd>

							{#if server.subprotocols.length > 0}
								<dt class="font-medium text-gray-600">Subprotocols:</dt>
								<dd class="text-gray-900">{server.subprotocols.join(', ')}</dd>
							{/if}

							<dt class="font-medium text-gray-600">Server URL:</dt>
							<dd class="text-gray-900 font-mono">{server.url}</dd>
						</dl>
					</div>

					{#if server.protocol === 'graphql-ws'}
						<div class="bg-purple-50 rounded-lg p-4">
							<h4 class="font-medium text-purple-900 mb-2">GraphQL-WS Protocol</h4>
							<p class="text-sm text-purple-800">
								Subprotocol for GraphQL subscriptions over WebSocket. Message types:
								connection_init, connection_ack, start, data, error, complete, stop.
							</p>
						</div>
					{:else if server.protocol === 'mqtt'}
						<div class="bg-green-50 rounded-lg p-4">
							<h4 class="font-medium text-green-900 mb-2">MQTT over WebSocket</h4>
							<p class="text-sm text-green-800">
								MQTT messaging protocol transported over WebSocket. Binary protocol with topic-based
								publish/subscribe messaging.
							</p>
						</div>
					{:else}
						<div class="bg-blue-50 rounded-lg p-4">
							<h4 class="font-medium text-blue-900 mb-2">Basic WebSocket</h4>
							<p class="text-sm text-blue-800">
								Standard WebSocket protocol without subprotocols. Supports text and binary frames
								with ping/pong keepalive.
							</p>
						</div>
					{/if}
				{:else}
					<div class="text-center text-gray-500 py-8">
						<p>Select a server to view protocol information.</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Selected Frame Details -->
	{#if selectedFrame}
		<div class="border-t border-gray-200 p-4 bg-gray-50">
			<h4 class="font-medium text-gray-900 mb-3">Frame Details</h4>
			<div class="grid grid-cols-2 gap-4 text-sm">
				<div>
					<strong>Timestamp:</strong>
					{new Date(selectedFrame.timestamp).toLocaleString()}
				</div>
				<div>
					<strong>Direction:</strong>
					{selectedFrame.direction}
				</div>
				<div>
					<strong>Type:</strong>
					{selectedFrame.type}
				</div>
				<div>
					<strong>Size:</strong>
					{selectedFrame.size} bytes
				</div>
				<div>
					<strong>Opcode:</strong>
					{selectedFrame.details.opcode}
				</div>
				<div>
					<strong>Masked:</strong>
					{selectedFrame.details.masked ? 'Yes' : 'No'}
				</div>
			</div>

			<div class="mt-3">
				<strong>Payload:</strong>
				<div class="mt-1 p-2 bg-white border rounded font-mono text-xs overflow-x-auto">
					{formatFrameData(selectedFrame)}
				</div>
			</div>
		</div>
	{/if}
</div>

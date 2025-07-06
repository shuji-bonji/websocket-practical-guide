<script lang="ts">
	// import { browser } from '$lib/utils/environment'; // Not used

	interface Props {
		title?: string;
	}

	let { title = 'TCP接続とWebSocketフレーミングデモ' }: Props = $props();

	let currentStep = $state(0);
	let animationActive = $state(false);
	let connectionMetrics = $state({
		handshakeTime: 0,
		totalLatency: 0,
		framesSent: 0,
		framesReceived: 0,
		tcpSegments: 0,
		websocketFrames: 0
	});
	let simulationLogs = $state<
		Array<{
			time: number;
			layer: 'TCP' | 'WebSocket' | 'Application';
			type: 'handshake' | 'data' | 'control' | 'close';
			description: string;
			details?: unknown;
		}>
	>([]);

	// TCP 3-wayハンドシェイクのステップ
	const tcpHandshakeSteps = [
		{
			step: 1,
			name: 'SYN',
			description: 'クライアントがSYNパケットを送信',
			tcpFlags: 'SYN=1, ACK=0',
			sequence: 'seq=100',
			acknowledgment: '-',
			windowSize: '65535'
		},
		{
			step: 2,
			name: 'SYN-ACK',
			description: 'サーバーがSYN-ACKで応答',
			tcpFlags: 'SYN=1, ACK=1',
			sequence: 'seq=200',
			acknowledgment: 'ack=101',
			windowSize: '65535'
		},
		{
			step: 3,
			name: 'ACK',
			description: 'クライアントがACKで確認',
			tcpFlags: 'SYN=0, ACK=1',
			sequence: 'seq=101',
			acknowledgment: 'ack=201',
			windowSize: '65535'
		},
		{
			step: 4,
			name: 'Established',
			description: 'TCP接続確立完了',
			tcpFlags: '-',
			sequence: '-',
			acknowledgment: '-',
			windowSize: '-'
		}
	];

	// WebSocketフレーム構造の例
	const websocketFrameTypes = [
		{
			opcode: '0x1',
			name: 'Text Frame',
			description: 'テキストデータフレーム',
			example: 'Hello WebSocket!',
			fin: 1,
			masked: true
		},
		{
			opcode: '0x2',
			name: 'Binary Frame',
			description: 'バイナリデータフレーム',
			example: '[Binary Data]',
			fin: 1,
			masked: true
		},
		{
			opcode: '0x8',
			name: 'Close Frame',
			description: '接続終了フレーム',
			example: 'Code: 1000',
			fin: 1,
			masked: true
		},
		{
			opcode: '0x9',
			name: 'Ping Frame',
			description: 'Ping制御フレーム',
			example: 'ping payload',
			fin: 1,
			masked: true
		},
		{
			opcode: '0xA',
			name: 'Pong Frame',
			description: 'Pong応答フレーム',
			example: 'pong payload',
			fin: 1,
			masked: false
		}
	];

	function addLog(
		layer: 'TCP' | 'WebSocket' | 'Application',
		type: 'handshake' | 'data' | 'control' | 'close',
		description: string,
		details?: unknown
	) {
		simulationLogs = [
			...simulationLogs.slice(-19),
			{
				time: Date.now(),
				layer,
				type,
				description,
				details
			}
		];
	}

	// TCP接続確立シミュレーション
	async function simulateTCPHandshake() {
		animationActive = true;
		currentStep = 0;
		simulationLogs = [];

		const startTime = Date.now();

		for (let i = 0; i < tcpHandshakeSteps.length; i++) {
			const step = tcpHandshakeSteps[i];
			currentStep = i + 1;

			addLog('TCP', 'handshake', step.description, {
				flags: step.tcpFlags,
				sequence: step.sequence,
				acknowledgment: step.acknowledgment
			});

			connectionMetrics.tcpSegments++;

			// 各ステップの待機時間をシミュレート（実際のネットワーク遅延）
			await new Promise((resolve) => setTimeout(resolve, 800));
		}

		connectionMetrics.handshakeTime = Date.now() - startTime;
		addLog('TCP', 'handshake', `TCP接続確立完了 (${connectionMetrics.handshakeTime}ms)`);

		animationActive = false;
	}

	// WebSocketフレーム送信シミュレーション
	async function simulateWebSocketFrames() {
		if (currentStep < 4) {
			addLog('WebSocket', 'control', 'TCP接続が必要です');
			return;
		}

		animationActive = true;

		// WebSocketアップグレード
		addLog('WebSocket', 'control', 'HTTP → WebSocketアップグレード開始');
		await new Promise((resolve) => setTimeout(resolve, 500));

		addLog('WebSocket', 'control', 'WebSocketフレーミング開始');

		// 各種フレームタイプの送信をシミュレート
		for (const frameType of websocketFrameTypes.slice(0, 3)) {
			addLog('WebSocket', 'data', `${frameType.name}送信: ${frameType.example}`, {
				opcode: frameType.opcode,
				fin: frameType.fin,
				masked: frameType.masked,
				payloadLength: frameType.example.length
			});

			connectionMetrics.websocketFrames++;
			connectionMetrics.framesSent++;

			await new Promise((resolve) => setTimeout(resolve, 600));

			// 応答フレーム（エコー）
			addLog('WebSocket', 'data', `${frameType.name}受信: Echo - ${frameType.example}`, {
				opcode: frameType.opcode,
				fin: frameType.fin,
				masked: false
			});

			connectionMetrics.framesReceived++;

			await new Promise((resolve) => setTimeout(resolve, 400));
		}

		animationActive = false;
	}

	// Ping/Pongシミュレーション
	async function simulatePingPong() {
		if (currentStep < 4) {
			addLog('WebSocket', 'control', 'TCP接続が必要です');
			return;
		}

		const pingFrame = websocketFrameTypes.find((f) => f.name === 'Ping Frame');
		const pongFrame = websocketFrameTypes.find((f) => f.name === 'Pong Frame');

		if (pingFrame && pongFrame) {
			const pingStart = Date.now();

			addLog('WebSocket', 'control', `Pingフレーム送信: ${pingFrame.example}`, {
				opcode: pingFrame.opcode,
				purpose: 'Keep-alive / Latency check'
			});

			await new Promise((resolve) => setTimeout(resolve, Math.random() * 100 + 50));

			const latency = Date.now() - pingStart;
			connectionMetrics.totalLatency = latency;

			addLog('WebSocket', 'control', `Pongフレーム受信: ${pongFrame.example}`, {
				opcode: pongFrame.opcode,
				latency: `${latency}ms`
			});
		}
	}

	// 接続情報のリセット
	function resetSimulation() {
		currentStep = 0;
		animationActive = false;
		simulationLogs = [];
		connectionMetrics = {
			handshakeTime: 0,
			totalLatency: 0,
			framesSent: 0,
			framesReceived: 0,
			tcpSegments: 0,
			websocketFrames: 0
		};
	}

	function getLayerColor(layer: string): string {
		switch (layer) {
			case 'TCP':
				return 'text-green-600';
			case 'WebSocket':
				return 'text-blue-600';
			case 'Application':
				return 'text-purple-600';
			default:
				return 'text-gray-600';
		}
	}

	function getLayerIcon(layer: string): string {
		switch (layer) {
			case 'TCP':
				return '🔗';
			case 'WebSocket':
				return '⚡';
			case 'Application':
				return '💬';
			default:
				return '📝';
		}
	}

	function getStepColor(stepIndex: number): string {
		if (currentStep > stepIndex) return 'bg-green-100 border-green-300';
		if (currentStep === stepIndex + 1) return 'bg-blue-100 border-blue-300';
		return 'bg-gray-50 border-gray-200';
	}
</script>

<div class="bg-white border border-gray-200 rounded-lg p-6" data-testid="tcp-websocket-demo">
	<!-- Header -->
	<div class="mb-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-2">🔗 {title}</h3>
		<p class="text-gray-600 text-sm">
			TCP接続の確立からWebSocketフレーミングまでの流れを可視化します。
		</p>
	</div>

	<!-- Connection Metrics -->
	<div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
		<h4 class="font-medium text-gray-700 mb-3">📊 接続メトリクス</h4>
		<div class="grid md:grid-cols-3 gap-4 text-sm">
			<div class="text-center">
				<div class="font-bold text-green-600">{connectionMetrics.handshakeTime}ms</div>
				<div class="text-gray-600">TCP ハンドシェイク時間</div>
			</div>
			<div class="text-center">
				<div class="font-bold text-blue-600">{connectionMetrics.websocketFrames}</div>
				<div class="text-gray-600">WebSocket フレーム</div>
			</div>
			<div class="text-center">
				<div class="font-bold text-purple-600">{connectionMetrics.totalLatency}ms</div>
				<div class="text-gray-600">Ping レイテンシ</div>
			</div>
		</div>
	</div>

	<!-- TCP Handshake Visualization -->
	<div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
		<h4 class="font-medium text-green-900 mb-3">🤝 TCP 3-Wayハンドシェイク</h4>
		<div class="space-y-3">
			{#each tcpHandshakeSteps as step, index (step.step)}
				<div class="p-3 rounded border transition-all duration-300 {getStepColor(index)}">
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-3">
							<span
								class="w-8 h-8 rounded-full bg-white border-2 border-green-300 flex items-center justify-center text-sm font-bold"
							>
								{step.step}
							</span>
							<div>
								<div class="font-medium">{step.name}</div>
								<div class="text-sm text-gray-600">{step.description}</div>
							</div>
						</div>
						{#if step.tcpFlags !== '-'}
							<div class="text-xs font-mono bg-white px-2 py-1 rounded border">
								{step.tcpFlags}
							</div>
						{/if}
					</div>
					{#if step.sequence !== '-'}
						<div class="mt-2 flex gap-4 text-xs font-mono text-gray-600">
							<span>SEQ: {step.sequence}</span>
							{#if step.acknowledgment !== '-'}
								<span>ACK: {step.acknowledgment}</span>
							{/if}
							<span>WIN: {step.windowSize}</span>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

	<!-- WebSocket Frame Types -->
	<div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
		<h4 class="font-medium text-blue-900 mb-3">📦 WebSocketフレーム構造</h4>
		<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
			{#each websocketFrameTypes as frame (frame.opcode)}
				<div class="p-3 bg-white rounded border">
					<div class="flex items-center justify-between mb-2">
						<span class="font-medium text-sm">{frame.name}</span>
						<span class="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
							{frame.opcode}
						</span>
					</div>
					<div class="text-xs text-gray-600 space-y-1">
						<div>FIN: {frame.fin}</div>
						<div>Masked: {frame.masked ? 'Yes' : 'No'}</div>
						<div class="font-mono bg-gray-50 p-1 rounded text-xs">
							{frame.example}
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Control Buttons -->
	<div class="mb-6 flex flex-wrap gap-3">
		<button
			type="button"
			onclick={simulateTCPHandshake}
			disabled={animationActive}
			class="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
		>
			{animationActive && currentStep < 4 ? '🔄 接続中...' : '🤝 TCP接続確立'}
		</button>
		<button
			type="button"
			onclick={simulateWebSocketFrames}
			disabled={animationActive || currentStep < 4}
			class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
		>
			{animationActive && currentStep >= 4 ? '🔄 送信中...' : '📦 WebSocketフレーム送信'}
		</button>
		<button
			type="button"
			onclick={simulatePingPong}
			disabled={animationActive || currentStep < 4}
			class="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
		>
			🏓 Ping/Pong測定
		</button>
		<button
			type="button"
			onclick={resetSimulation}
			class="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
		>
			🔄 リセット
		</button>
	</div>

	<!-- Protocol Stack Visualization -->
	<div class="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-md">
		<h4 class="font-medium text-purple-900 mb-3">🏗️ プロトコルスタック</h4>
		<div class="space-y-2">
			<div class="p-2 bg-purple-100 border border-purple-300 rounded text-center">
				<span class="font-medium">Application Layer</span>
				<span class="text-sm text-purple-700 ml-2">JSON messages, Business logic</span>
			</div>
			<div class="p-2 bg-blue-100 border border-blue-300 rounded text-center">
				<span class="font-medium">WebSocket Protocol</span>
				<span class="text-sm text-blue-700 ml-2">Frame-based messaging, Multiplexing</span>
			</div>
			<div class="p-2 bg-green-100 border border-green-300 rounded text-center">
				<span class="font-medium">TCP (Transmission Control Protocol)</span>
				<span class="text-sm text-green-700 ml-2">Reliable delivery, Flow control, Ordering</span>
			</div>
			<div class="p-2 bg-gray-100 border border-gray-300 rounded text-center">
				<span class="font-medium">IP (Internet Protocol)</span>
				<span class="text-sm text-gray-700 ml-2">Packet routing, Addressing</span>
			</div>
		</div>
	</div>

	<!-- Simulation Log -->
	<div class="p-4 bg-gray-50 border border-gray-200 rounded-md">
		<h4 class="font-medium text-gray-700 mb-3">📜 シミュレーションログ</h4>
		<div class="max-h-48 overflow-y-auto space-y-1">
			{#if simulationLogs.length === 0}
				<div class="text-center text-gray-500 text-sm py-4">
					TCP接続確立ボタンをクリックしてシミュレーションを開始してください
				</div>
			{:else}
				{#each simulationLogs.slice().reverse() as log (log.time)}
					<div class="flex items-start space-x-2 text-sm p-2 bg-white rounded">
						<span class="text-lg flex-shrink-0">{getLayerIcon(log.layer)}</span>
						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								<span class="font-medium {getLayerColor(log.layer)}">{log.layer}</span>
								<span class="text-xs text-gray-500">
									{new Date(log.time).toLocaleTimeString('ja-JP', {
										hour: '2-digit',
										minute: '2-digit',
										second: '2-digit',
										fractionalSecondDigits: 3
									})}
								</span>
							</div>
							<div class="text-gray-700">{log.description}</div>
							{#if log.details}
								<div class="text-xs font-mono text-gray-500 mt-1">
									{JSON.stringify(log.details)}
								</div>
							{/if}
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<!-- Educational Notes -->
	<div class="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-md">
		<div class="text-sm text-indigo-800">
			<span class="font-medium">📚 学習ポイント：</span>
			<ul class="mt-2 space-y-1 ml-4">
				<li>• TCP 3-wayハンドシェイクによる信頼性のある接続確立</li>
				<li>• WebSocketフレームがTCP上でメッセージ境界を管理</li>
				<li>• Ping/Pongフレームによる接続維持とレイテンシ測定</li>
				<li>• 各層での責任分担：TCP（信頼性）+ WebSocket（アプリケーション機能）</li>
			</ul>
		</div>
	</div>
</div>

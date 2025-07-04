<script lang="ts">
	import {
		WEBSOCKET_READY_STATE_LABELS,
		WEBSOCKET_CLOSE_CODES,
		PUBLIC_WEBSOCKET_SERVICES
	} from '$lib/types/websocket';
	import type {
		PublicWebSocketService,
		WebSocketEducationalEvent,
		Phase1ConnectionMetrics
	} from '$lib/types/websocket';
	import { browser } from '$lib/utils/environment';

	// Safe WebSocket constants for SSR
	const WS_CONNECTING = typeof WebSocket !== 'undefined' ? WebSocket.CONNECTING : 0;
	const WS_OPEN = typeof WebSocket !== 'undefined' ? WebSocket.OPEN : 1;
	const WS_CLOSING = typeof WebSocket !== 'undefined' ? WebSocket.CLOSING : 2;
	const WS_CLOSED = typeof WebSocket !== 'undefined' ? WebSocket.CLOSED : 3;

	interface Props {
		title?: string;
		showLifecycle?: boolean;
		showReadyStates?: boolean;
		showCloseCodes?: boolean;
		showConnectionFlow?: boolean;
		autoDemo?: boolean;
		selectedService?: PublicWebSocketService;
	}

	let {
		title = 'WebSocket状態可視化',
		showLifecycle = true,
		showReadyStates = true,
		showCloseCodes = true,
		showConnectionFlow = true,
		autoDemo = false,
		selectedService = PUBLIC_WEBSOCKET_SERVICES[0]
	}: Props = $props();

	// WebSocket state visualization
	let websocket = $state<WebSocket | null>(null);
	let currentState = $state<number>(WS_CLOSED);
	let stateHistory = $state<Array<{ state: number; timestamp: number; description: string }>>([]);
	let connectionEvents = $state<WebSocketEducationalEvent[]>([]);
	let isAutoDemo = $state(autoDemo);
	let demoStep = $state(0);
	let demoInterval = $state<ReturnType<typeof setTimeout> | null>(null);

	// Connection metrics for visualization
	let connectionMetrics = $state<Phase1ConnectionMetrics>({
		messagesSent: 0,
		messagesReceived: 0,
		uptime: 0,
		averageLatency: 0,
		stabilityScore: 100
	});

	// State transitions data for educational purposes
	const STATE_TRANSITIONS = [
		{
			from: WS_CLOSED,
			to: WS_CONNECTING,
			action: 'new WebSocket(url)',
			description: 'WebSocketコンストラクタを呼び出し'
		},
		{
			from: WS_CONNECTING,
			to: WS_OPEN,
			action: 'onopen event',
			description: 'ハンドシェイク成功、接続確立'
		},
		{
			from: WS_CONNECTING,
			to: WS_CLOSED,
			action: 'onerror event',
			description: 'ハンドシェイク失敗'
		},
		{
			from: WS_OPEN,
			to: WS_CLOSING,
			action: 'close() or server close',
			description: 'クローズハンドシェイク開始'
		},
		{
			from: WS_CLOSING,
			to: WS_CLOSED,
			action: 'onclose event',
			description: 'クローズハンドシェイク完了'
		},
		{
			from: WS_OPEN,
			to: WS_CLOSED,
			action: 'Abnormal closure',
			description: '異常切断（ネットワークエラー等）'
		}
	];

	// Demo sequence for automatic demonstration
	const DEMO_SEQUENCE = [
		{ action: 'connect', delay: 1000, description: 'WebSocket接続を開始' },
		{ action: 'send', delay: 2000, description: 'メッセージを送信' },
		{ action: 'send', delay: 1000, description: '追加メッセージを送信' },
		{ action: 'disconnect', delay: 2000, description: '接続を切断' },
		{ action: 'reset', delay: 2000, description: 'デモをリセット' }
	];

	// Cleanup on component destroy
	$effect(() => {
		return () => {
			cleanup();
		};
	});

	// Auto demo effect
	$effect(() => {
		if (isAutoDemo && browser) {
			startAutoDemo();
		} else {
			stopAutoDemo();
		}
	});

	function addStateChange(newState: number, description: string) {
		currentState = newState;
		stateHistory = [
			...stateHistory.slice(-9), // Keep last 10 states
			{
				state: newState,
				timestamp: Date.now(),
				description
			}
		];
	}

	function addConnectionEvent(
		type: WebSocketEducationalEvent['type'],
		description: string,
		details?: WebSocketEducationalEvent['details']
	) {
		const event: WebSocketEducationalEvent = {
			id: crypto.randomUUID(),
			timestamp: Date.now(),
			type,
			description,
			details
		};

		connectionEvents = [...connectionEvents.slice(-19), event]; // Keep last 20 events
	}

	function connect() {
		if (!browser || !selectedService) return;

		cleanup();
		addStateChange(WS_CONNECTING, 'WebSocket接続を開始...');
		addConnectionEvent('handshake', `${selectedService.name}への接続を開始`);

		try {
			websocket = new WebSocket(selectedService.url);

			websocket.onopen = () => {
				addStateChange(WS_OPEN, '接続が確立されました');
				addConnectionEvent('open', 'WebSocket接続が正常に確立されました', {
					protocol: websocket?.protocol || 'none'
				});
				connectionMetrics.stabilityScore = 100;
			};

			websocket.onmessage = (event) => {
				connectionMetrics.messagesReceived++;
				addConnectionEvent(
					'message',
					`メッセージを受信: ${event.data.substring(0, 50)}${event.data.length > 50 ? '...' : ''}`
				);
			};

			websocket.onclose = (event) => {
				addStateChange(WS_CLOSED, `接続が切断されました (${event.code})`);
				const closeReason = WEBSOCKET_CLOSE_CODES[event.code] || '不明な理由';
				addConnectionEvent('close', `接続が切断されました: ${closeReason}`, {
					code: event.code,
					reason: event.reason || closeReason
				});
			};

			websocket.onerror = () => {
				addConnectionEvent('error', 'WebSocket接続でエラーが発生しました');
				connectionMetrics.stabilityScore = Math.max(0, connectionMetrics.stabilityScore - 20);
			};
		} catch (error) {
			addStateChange(WS_CLOSED, `接続に失敗: ${error}`);
			addConnectionEvent('error', `接続エラー: ${error}`);
		}
	}

	function disconnect() {
		if (websocket && websocket.readyState === WS_OPEN) {
			addStateChange(WS_CLOSING, 'クローズハンドシェイクを開始...');
			addConnectionEvent('close', 'ユーザーによる切断要求');
			websocket.close(1000, 'User requested disconnect');
		}
	}

	function sendTestMessage() {
		if (websocket && websocket.readyState === WS_OPEN) {
			const message = `テストメッセージ ${Date.now()}`;
			websocket.send(message);
			connectionMetrics.messagesSent++;
			addConnectionEvent('message', `メッセージを送信: ${message}`);
		}
	}

	function cleanup() {
		if (websocket) {
			websocket.close();
			websocket = null;
		}
		currentState = WS_CLOSED;
	}

	function clearHistory() {
		stateHistory = [];
		connectionEvents = [];
		connectionMetrics = {
			messagesSent: 0,
			messagesReceived: 0,
			uptime: 0,
			averageLatency: 0,
			stabilityScore: 100
		};
	}

	function startAutoDemo() {
		if (!browser) return;

		clearHistory();
		demoStep = 0;
		runDemoStep();
	}

	function stopAutoDemo() {
		if (demoInterval) {
			clearTimeout(demoInterval);
			demoInterval = null;
		}
		isAutoDemo = false;
	}

	function runDemoStep() {
		if (demoStep >= DEMO_SEQUENCE.length) {
			demoStep = 0;
		}

		const step = DEMO_SEQUENCE[demoStep];
		addConnectionEvent('system', step.description);

		switch (step.action) {
			case 'connect':
				connect();
				break;
			case 'send':
				sendTestMessage();
				break;
			case 'disconnect':
				disconnect();
				break;
			case 'reset':
				cleanup();
				clearHistory();
				break;
		}

		demoStep++;

		if (isAutoDemo) {
			demoInterval = setTimeout(() => {
				runDemoStep();
			}, step.delay);
		}
	}

	function getStateColor(state: number): string {
		switch (state) {
			case WS_CONNECTING:
				return 'bg-yellow-100 text-yellow-800 border-yellow-300';
			case WS_OPEN:
				return 'bg-green-100 text-green-800 border-green-300';
			case WS_CLOSING:
				return 'bg-orange-100 text-orange-800 border-orange-300';
			case WS_CLOSED:
				return 'bg-gray-100 text-gray-800 border-gray-300';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-300';
		}
	}

	function getStateIcon(state: number): string {
		switch (state) {
			case WS_CONNECTING:
				return '🔄';
			case WS_OPEN:
				return '✅';
			case WS_CLOSING:
				return '⏳';
			case WS_CLOSED:
				return '❌';
			default:
				return '❓';
		}
	}

	function getEventIcon(type: WebSocketEducationalEvent['type']): string {
		switch (type) {
			case 'handshake':
				return '🤝';
			case 'open':
				return '🔓';
			case 'message':
				return '💬';
			case 'close':
				return '🔒';
			case 'error':
				return '⚠️';
			case 'ping':
				return '🏓';
			case 'pong':
				return '🏓';
			default:
				return '📝';
		}
	}

	function formatTime(timestamp: number): string {
		return new Date(timestamp).toLocaleTimeString('ja-JP', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			fractionalSecondDigits: 3
		});
	}

	// Derived state for UI
	let canConnect = $derived(currentState === WS_CLOSED);
	let canDisconnect = $derived(currentState === WS_OPEN);
	let canSend = $derived(currentState === WS_OPEN);
</script>

<div
	class="bg-white border border-gray-200 rounded-lg p-6"
	data-testid="websocket-state-visualizer"
>
	<!-- Header -->
	<div class="mb-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-2">🔍 {title}</h3>
		<p class="text-gray-600 text-sm">
			WebSocketの状態変化とライフサイクルをリアルタイムで可視化します。
		</p>
	</div>

	<!-- Current State Display -->
	<div class="mb-6">
		<div class="flex items-center justify-between mb-4">
			<h4 class="text-md font-medium text-gray-900">📊 現在の状態</h4>
			<div class="flex items-center space-x-2">
				<button
					type="button"
					onclick={() => (isAutoDemo = !isAutoDemo)}
					class="px-3 py-1 text-xs font-medium rounded-full transition-colors
						{isAutoDemo
						? 'bg-red-100 text-red-800 border border-red-300'
						: 'bg-blue-100 text-blue-800 border border-blue-300'}"
					data-testid="auto-demo-toggle"
				>
					{isAutoDemo ? '🛑 自動デモ停止' : '▶️ 自動デモ開始'}
				</button>
			</div>
		</div>

		<div class="grid md:grid-cols-2 gap-4">
			<!-- Current ReadyState -->
			<div class="p-4 border rounded-lg {getStateColor(currentState)}">
				<div class="flex items-center justify-between mb-2">
					<span class="text-sm font-medium">ReadyState</span>
					<span class="text-2xl">{getStateIcon(currentState)}</span>
				</div>
				<div class="text-xl font-bold">{currentState}</div>
				<div class="text-sm">{WEBSOCKET_READY_STATE_LABELS[currentState]}</div>
			</div>

			<!-- Connection Metrics -->
			<div class="p-4 border border-gray-200 rounded-lg bg-gray-50">
				<div class="text-sm font-medium text-gray-700 mb-2">接続メトリクス</div>
				<div class="grid grid-cols-2 gap-2 text-xs">
					<div class="text-center">
						<div class="font-bold text-blue-600">{connectionMetrics.messagesSent}</div>
						<div class="text-gray-600">送信</div>
					</div>
					<div class="text-center">
						<div class="font-bold text-green-600">{connectionMetrics.messagesReceived}</div>
						<div class="text-gray-600">受信</div>
					</div>
				</div>
				<div class="mt-2 text-center">
					<div class="font-bold text-purple-600">{connectionMetrics.stabilityScore}%</div>
					<div class="text-xs text-gray-600">安定性</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Control Buttons -->
	<div class="mb-6 flex flex-wrap gap-3">
		<button
			type="button"
			onclick={connect}
			disabled={!canConnect || isAutoDemo}
			class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
			data-testid="connect-button"
		>
			🔗 接続
		</button>

		<button
			type="button"
			onclick={sendTestMessage}
			disabled={!canSend || isAutoDemo}
			class="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
			data-testid="send-test-message-button"
		>
			📤 テストメッセージ送信
		</button>

		<button
			type="button"
			onclick={disconnect}
			disabled={!canDisconnect || isAutoDemo}
			class="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
			data-testid="disconnect-button"
		>
			🔌 切断
		</button>

		<button
			type="button"
			onclick={clearHistory}
			disabled={isAutoDemo}
			class="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
		>
			🧹 履歴クリア
		</button>
	</div>

	<!-- State Transition Diagram -->
	{#if showLifecycle}
		<div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
			<h4 class="font-medium text-blue-900 mb-3">🔄 WebSocketライフサイクル</h4>
			<div class="grid md:grid-cols-2 gap-4">
				<!-- State Diagram -->
				<div class="bg-white p-3 rounded border">
					<div class="text-sm font-medium text-gray-700 mb-2">状態遷移図</div>
					<div class="space-y-2 text-xs">
						{#each STATE_TRANSITIONS as transition (transition.from + '-' + transition.to)}
							<div
								class="flex items-center space-x-2 p-2 rounded
								{transition.from === currentState || transition.to === currentState
									? 'bg-yellow-100 border border-yellow-300'
									: 'bg-gray-50'}"
							>
								<span class={getStateColor(transition.from).split(' ')[1]}
									>{getStateIcon(transition.from)}</span
								>
								<span>→</span>
								<span class={getStateColor(transition.to).split(' ')[1]}
									>{getStateIcon(transition.to)}</span
								>
								<span class="text-gray-600 flex-1">{transition.action}</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- State History -->
				<div class="bg-white p-3 rounded border">
					<div class="text-sm font-medium text-gray-700 mb-2">状態履歴</div>
					<div class="max-h-40 overflow-y-auto space-y-1">
						{#if stateHistory.length === 0}
							<div class="text-center text-gray-500 text-xs py-4">
								接続を開始すると状態変化が記録されます
							</div>
						{:else}
							{#each stateHistory.slice().reverse() as history (history.timestamp)}
								<div class="flex items-center space-x-2 text-xs p-2 rounded bg-gray-50">
									<span class="text-lg">{getStateIcon(history.state)}</span>
									<div class="flex-1">
										<div class="font-medium">{WEBSOCKET_READY_STATE_LABELS[history.state]}</div>
										<div class="text-gray-600">{history.description}</div>
									</div>
									<div class="text-gray-500 text-xs">{formatTime(history.timestamp)}</div>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}

	<!-- ReadyState Reference -->
	{#if showReadyStates}
		<div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
			<h4 class="font-medium text-green-900 mb-3">📋 ReadyState一覧</h4>
			<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
				{#each Object.entries(WEBSOCKET_READY_STATE_LABELS) as [state, label] (state)}
					<div
						class="p-3 rounded border {getStateColor(parseInt(state))}
						{currentState === parseInt(state) ? 'ring-2 ring-blue-400' : ''}"
					>
						<div class="flex items-center justify-between mb-1">
							<span class="font-bold">{state}</span>
							<span class="text-lg">{getStateIcon(parseInt(state))}</span>
						</div>
						<div class="text-sm font-medium">{label}</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Close Codes Reference -->
	{#if showCloseCodes}
		<div class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
			<h4 class="font-medium text-yellow-900 mb-3">🔒 主要なClose Code</h4>
			<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
				{#each Object.entries(WEBSOCKET_CLOSE_CODES).slice(0, 9) as [code, description] (code)}
					<div class="flex items-center space-x-2 p-2 bg-white rounded border">
						<span class="font-mono font-bold text-yellow-700">{code}</span>
						<span class="text-gray-700">{description}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Connection Events -->
	{#if showConnectionFlow && connectionEvents.length > 0}
		<div class="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
			<h4 class="font-medium text-purple-900 mb-3">📜 接続イベント</h4>
			<div class="max-h-48 overflow-y-auto space-y-2">
				{#each connectionEvents.slice().reverse() as event (event.id)}
					<div class="flex items-start space-x-3 p-2 bg-white rounded border">
						<span class="text-lg flex-shrink-0">{getEventIcon(event.type)}</span>
						<div class="flex-1 min-w-0">
							<div class="flex items-center justify-between">
								<span class="font-medium text-purple-700 text-sm">{event.type.toUpperCase()}</span>
								<span class="text-xs text-gray-500">{formatTime(event.timestamp)}</span>
							</div>
							<div class="text-sm text-gray-700 mt-1">{event.description}</div>
							{#if event.details}
								<div class="text-xs text-gray-600 font-mono mt-1 p-1 bg-gray-50 rounded">
									{JSON.stringify(event.details)}
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Educational Notes -->
	<div class="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
		<div class="text-sm text-indigo-800">
			<span class="font-medium">📚 学習ポイント：</span>
			<ul class="mt-2 space-y-1 ml-4">
				<li>• WebSocketの4つの状態（CONNECTING → OPEN → CLOSING → CLOSED）</li>
				<li>• 状態遷移のタイミングとイベントハンドラの関係</li>
				<li>• 正常なクローズハンドシェイクと異常切断の違い</li>
				<li>• Close Codeによる切断理由の識別</li>
				<li>• onopen, onmessage, onclose, onerrorイベントの役割</li>
			</ul>
		</div>
	</div>
</div>

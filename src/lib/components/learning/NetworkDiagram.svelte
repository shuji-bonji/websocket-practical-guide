<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$lib/utils/environment';

	interface Props {
		diagramType: 'osi-model' | 'tcp-handshake' | 'http-connection' | 'websocket-upgrade';
		interactive?: boolean;
		showAnimation?: boolean;
		title?: string;
	}

	let { diagramType, interactive = true, showAnimation = true, title }: Props = $props();

	let currentStep = $state(0);
	let animationActive = $state(false);
	let diagramContainer = $state<HTMLElement>();

	// OSI 7層モデルの定義
	const osiLayers = [
		{
			layer: 7,
			name: 'アプリケーション層',
			protocol: 'HTTP, WebSocket',
			color: 'bg-red-100 border-red-300 text-red-800'
		},
		{
			layer: 6,
			name: 'プレゼンテーション層',
			protocol: 'TLS/SSL',
			color: 'bg-orange-100 border-orange-300 text-orange-800'
		},
		{
			layer: 5,
			name: 'セッション層',
			protocol: 'WebSocket Session',
			color: 'bg-yellow-100 border-yellow-300 text-yellow-800'
		},
		{
			layer: 4,
			name: 'トランスポート層',
			protocol: 'TCP',
			color: 'bg-green-100 border-green-300 text-green-800'
		},
		{
			layer: 3,
			name: 'ネットワーク層',
			protocol: 'IP',
			color: 'bg-blue-100 border-blue-300 text-blue-800'
		},
		{
			layer: 2,
			name: 'データリンク層',
			protocol: 'Ethernet',
			color: 'bg-indigo-100 border-indigo-300 text-indigo-800'
		},
		{
			layer: 1,
			name: '物理層',
			protocol: 'Cable, WiFi',
			color: 'bg-purple-100 border-purple-300 text-purple-800'
		}
	];

	// TCP 3ウェイハンドシェイクの定義
	const tcpHandshakeSteps = [
		{
			step: 1,
			name: 'SYN',
			description: 'クライアントが接続要求を送信',
			from: 'client',
			to: 'server'
		},
		{
			step: 2,
			name: 'SYN-ACK',
			description: 'サーバーが応答と接続許可を送信',
			from: 'server',
			to: 'client'
		},
		{
			step: 3,
			name: 'ACK',
			description: 'クライアントが確認応答を送信',
			from: 'client',
			to: 'server'
		},
		{ step: 4, name: 'Established', description: 'TCP接続が確立完了', from: 'both', to: 'both' }
	];

	// HTTP接続パターンの定義
	const httpConnectionSteps = [
		{ step: 1, version: 'HTTP/1.0', action: 'Connect', description: 'TCP接続確立' },
		{
			step: 2,
			version: 'HTTP/1.0',
			action: 'Request/Response',
			description: '1つのリクエスト・レスポンス'
		},
		{ step: 3, version: 'HTTP/1.0', action: 'Disconnect', description: '接続切断' },
		{ step: 4, version: 'HTTP/1.1', action: 'Connect', description: 'TCP接続確立' },
		{
			step: 5,
			version: 'HTTP/1.1',
			action: 'Multiple R/R',
			description: '複数のリクエスト・レスポンス'
		},
		{ step: 6, version: 'HTTP/1.1', action: 'Keep-Alive', description: '接続維持' }
	];

	// WebSocketアップグレードの定義
	const websocketUpgradeSteps = [
		{ step: 1, type: 'HTTP', action: 'GET /chat', description: 'HTTPリクエスト' },
		{ step: 2, type: 'HTTP', action: 'Upgrade: websocket', description: 'アップグレード要求' },
		{
			step: 3,
			type: 'HTTP',
			action: '101 Switching Protocols',
			description: 'プロトコル切り替え応答'
		},
		{
			step: 4,
			type: 'WebSocket',
			action: 'Frame-based communication',
			description: 'WebSocketフレーム通信開始'
		}
	];

	function startAnimation() {
		if (!showAnimation) return;

		animationActive = true;
		currentStep = 0;

		const maxSteps = getMaxSteps();
		const interval = setInterval(() => {
			currentStep++;
			if (currentStep >= maxSteps) {
				clearInterval(interval);
				animationActive = false;
			}
		}, 1500);
	}

	function getMaxSteps(): number {
		switch (diagramType) {
			case 'tcp-handshake':
				return tcpHandshakeSteps.length;
			case 'http-connection':
				return httpConnectionSteps.length;
			case 'websocket-upgrade':
				return websocketUpgradeSteps.length;
			default:
				return 0;
		}
	}

	function resetAnimation() {
		currentStep = 0;
		animationActive = false;
	}

	onMount(() => {
		if (browser && showAnimation) {
			// Auto-start animation after a brief delay
			setTimeout(() => startAnimation(), 1000);
		}
	});
</script>

<div class="bg-white border border-gray-200 rounded-lg p-6" data-testid="network-diagram">
	<!-- Header -->
	<div class="mb-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-2">
			🌐 {title || 'ネットワーク図'}
		</h3>

		{#if interactive && showAnimation}
			<div class="flex gap-3">
				<button
					type="button"
					onclick={startAnimation}
					disabled={animationActive}
					class="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 disabled:opacity-50"
				>
					▶️ アニメーション開始
				</button>
				<button
					type="button"
					onclick={resetAnimation}
					class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
				>
					🔄 リセット
				</button>
			</div>
		{/if}
	</div>

	<!-- Diagram Content -->
	<div bind:this={diagramContainer} class="relative">
		{#if diagramType === 'osi-model'}
			<!-- OSI 7層モデル -->
			<div class="space-y-2">
				{#each osiLayers.slice().reverse() as layer (layer.layer)}
					<div
						class="p-4 rounded-md border-2 transition-all duration-300 {layer.color}"
						class:ring-2={currentStep === layer.layer}
						class:ring-blue-400={currentStep === layer.layer}
					>
						<div class="flex justify-between items-center">
							<div>
								<span class="font-bold">Layer {layer.layer}</span>
								<span class="ml-2">{layer.name}</span>
							</div>
							<div class="text-sm font-mono">{layer.protocol}</div>
						</div>
					</div>
				{/each}
			</div>
		{:else if diagramType === 'tcp-handshake'}
			<!-- TCP 3ウェイハンドシェイク -->
			<div class="flex justify-between items-start mb-6">
				<div class="text-center">
					<div
						class="w-20 h-20 bg-blue-100 border-2 border-blue-300 rounded-full flex items-center justify-center mb-2"
					>
						💻
					</div>
					<div class="font-medium">クライアント</div>
				</div>
				<div class="text-center">
					<div
						class="w-20 h-20 bg-green-100 border-2 border-green-300 rounded-full flex items-center justify-center mb-2"
					>
						🖥️
					</div>
					<div class="font-medium">サーバー</div>
				</div>
			</div>

			<div class="space-y-4">
				{#each tcpHandshakeSteps as step (step.step)}
					<div
						class="p-3 rounded-md border transition-all duration-300"
						class:bg-blue-50={currentStep >= step.step}
						class:border-blue-300={currentStep >= step.step}
						class:bg-gray-50={currentStep < step.step}
						class:border-gray-200={currentStep < step.step}
					>
						<div class="flex items-center justify-between">
							<span class="font-medium">{step.step}. {step.name}</span>
							<span class="text-sm text-gray-600">{step.description}</span>
						</div>
					</div>
				{/each}
			</div>
		{:else if diagramType === 'http-connection'}
			<!-- HTTP接続パターン -->
			<div class="grid md:grid-cols-2 gap-6">
				<!-- HTTP/1.0 -->
				<div class="p-4 bg-red-50 border border-red-200 rounded-md">
					<h4 class="font-medium text-red-800 mb-3">HTTP/1.0 パターン</h4>
					<div class="space-y-2">
						{#each httpConnectionSteps.filter((s) => s.version === 'HTTP/1.0') as step (step.step)}
							<div
								class="p-2 rounded text-sm"
								class:bg-red-100={currentStep >= step.step}
								class:bg-white={currentStep < step.step}
							>
								{step.action}: {step.description}
							</div>
						{/each}
					</div>
				</div>

				<!-- HTTP/1.1 -->
				<div class="p-4 bg-green-50 border border-green-200 rounded-md">
					<h4 class="font-medium text-green-800 mb-3">HTTP/1.1 パターン</h4>
					<div class="space-y-2">
						{#each httpConnectionSteps.filter((s) => s.version === 'HTTP/1.1') as step (step.step)}
							<div
								class="p-2 rounded text-sm"
								class:bg-green-100={currentStep >= step.step}
								class:bg-white={currentStep < step.step}
							>
								{step.action}: {step.description}
							</div>
						{/each}
					</div>
				</div>
			</div>
		{:else if diagramType === 'websocket-upgrade'}
			<!-- WebSocketアップグレード -->
			<div class="space-y-4">
				{#each websocketUpgradeSteps as step (step.step)}
					<div
						class="p-4 rounded-md border transition-all duration-300"
						class:bg-blue-50={step.type === 'HTTP' && currentStep >= step.step}
						class:border-blue-300={step.type === 'HTTP' && currentStep >= step.step}
						class:bg-purple-50={step.type === 'WebSocket' && currentStep >= step.step}
						class:border-purple-300={step.type === 'WebSocket' && currentStep >= step.step}
						class:bg-gray-50={currentStep < step.step}
						class:border-gray-200={currentStep < step.step}
					>
						<div class="flex items-center justify-between">
							<span class="font-medium">
								<span
									class="px-2 py-1 rounded text-xs font-mono {step.type === 'HTTP'
										? 'bg-blue-100 text-blue-800'
										: 'bg-purple-100 text-purple-800'}"
								>
									{step.type}
								</span>
								{step.action}
							</span>
							<span class="text-sm text-gray-600">{step.description}</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Status Information -->
	{#if showAnimation}
		<div class="mt-6 p-3 bg-gray-50 border border-gray-200 rounded-md">
			<div class="text-sm">
				<span class="font-medium">現在のステップ:</span>
				<span class="ml-2">{currentStep} / {getMaxSteps()}</span>
				{#if animationActive}
					<span class="ml-4 text-blue-600">🔄 アニメーション実行中...</span>
				{/if}
			</div>
		</div>
	{/if}
</div>

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	// Browser detection without SvelteKit dependency
	const browser = typeof window !== 'undefined';

	export let title: string;
	export let description: string;
	export let demoType: 'basic-connection' | 'echo-test' | 'message-exchange' = 'basic-connection';
	export let wsUrl: string = 'wss://echo.websocket.org';

	let websocket: WebSocket | null = null;
	let connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
	let messages: Array<{ type: 'sent' | 'received' | 'system'; content: string; timestamp: Date }> =
		[];
	let messageInput = '';
	let connectionTime: Date | null = null;

	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	onDestroy(() => {
		if (websocket) {
			websocket.close();
		}
	});

	function addMessage(type: 'sent' | 'received' | 'system', content: string) {
		messages = [
			...messages,
			{
				type,
				content,
				timestamp: new Date()
			}
		];
	}

	function connect() {
		if (!browser) return;

		connectionState = 'connecting';
		addMessage('system', 'WebSocket接続を開始しています...');

		try {
			websocket = new WebSocket(wsUrl);

			websocket.onopen = () => {
				connectionState = 'connected';
				connectionTime = new Date();
				addMessage('system', `✅ WebSocket接続が確立されました (${wsUrl})`);
			};

			websocket.onmessage = (event) => {
				addMessage('received', event.data);
			};

			websocket.onclose = (event) => {
				connectionState = 'disconnected';
				connectionTime = null;
				addMessage(
					'system',
					`🔌 WebSocket接続が切断されました (コード: ${event.code}, 理由: ${event.reason || '不明'})`
				);
			};

			websocket.onerror = () => {
				connectionState = 'error';
				addMessage('system', '❌ WebSocket接続でエラーが発生しました');
			};
		} catch (error) {
			connectionState = 'error';
			addMessage('system', `❌ WebSocket接続に失敗: ${error}`);
		}
	}

	function disconnect() {
		if (websocket) {
			websocket.close();
		}
	}

	function sendMessage() {
		if (websocket && websocket.readyState === WebSocket.OPEN && messageInput.trim()) {
			const message = messageInput.trim();
			websocket.send(message);
			addMessage('sent', message);
			messageInput = '';
		}
	}

	function clearMessages() {
		messages = [];
	}

	function formatTime(date: Date): string {
		return date.toLocaleTimeString('ja-JP', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	$: stateColor = {
		disconnected: 'text-gray-600',
		connecting: 'text-yellow-600',
		connected: 'text-green-600',
		error: 'text-red-600'
	}[connectionState];

	$: stateText = {
		disconnected: '切断',
		connecting: '接続中...',
		connected: '接続済み',
		error: 'エラー'
	}[connectionState];
</script>

<div class="bg-white border border-gray-200 rounded-lg p-6 my-8">
	<div class="mb-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
		<p class="text-gray-600 text-sm">{description}</p>
	</div>

	<!-- 接続状態表示 -->
	<div class="mb-6 p-4 bg-gray-50 rounded-lg">
		<div class="flex items-center justify-between mb-3">
			<div class="flex items-center space-x-3">
				<span class="text-sm font-medium text-gray-700">接続状態:</span>
				<span class="font-medium {stateColor}">{stateText}</span>
				{#if connectionState === 'connected'}
					<div
						class="w-3 h-3 bg-green-500 rounded-full animate-pulse"
						title="接続中"
						aria-label="接続中"
					></div>
				{/if}
			</div>
			{#if connectionTime}
				<span class="text-xs text-gray-500">
					接続時刻: {formatTime(connectionTime)}
				</span>
			{/if}
		</div>

		<div class="flex space-x-3">
			{#if connectionState === 'disconnected' || connectionState === 'error'}
				<button
					type="button"
					on:click={connect}
					class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
					disabled={!mounted}
				>
					WebSocket接続
				</button>
			{:else if connectionState === 'connected'}
				<button
					type="button"
					on:click={disconnect}
					class="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
				>
					切断
				</button>
			{/if}

			{#if messages.length > 0}
				<button
					type="button"
					on:click={clearMessages}
					class="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
				>
					ログクリア
				</button>
			{/if}
		</div>
	</div>

	<!-- メッセージ送信 (エコーテスト用) -->
	{#if demoType === 'echo-test' || demoType === 'message-exchange'}
		<div class="mb-6">
			<label for="message-input" class="block text-sm font-medium text-gray-700 mb-2">
				メッセージ送信
			</label>
			<div class="flex space-x-3">
				<input
					id="message-input"
					type="text"
					bind:value={messageInput}
					on:keydown={(e) => e.key === 'Enter' && sendMessage()}
					placeholder="メッセージを入力してください"
					class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
					disabled={connectionState !== 'connected'}
				/>
				<button
					type="button"
					on:click={sendMessage}
					disabled={connectionState !== 'connected' || !messageInput.trim()}
					class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
				>
					送信
				</button>
			</div>
		</div>
	{/if}

	<!-- メッセージログ -->
	<div class="border border-gray-200 rounded-md">
		<div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
			<h4 class="text-sm font-medium text-gray-700">通信ログ</h4>
		</div>
		<div class="h-64 overflow-y-auto p-4 space-y-2">
			{#if messages.length === 0}
				<div class="text-center text-gray-500 text-sm py-8">
					WebSocketに接続すると通信ログが表示されます
				</div>
			{:else}
				{#each messages as message (message.timestamp.getTime())}
					<div
						class="flex items-start space-x-3 {message.type === 'sent'
							? 'justify-end'
							: 'justify-start'}"
					>
						<div
							class="max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm {message.type === 'sent'
								? 'bg-blue-500 text-white'
								: message.type === 'received'
									? 'bg-green-100 text-green-800 border border-green-200'
									: 'bg-yellow-100 text-yellow-800 border border-yellow-200'}"
						>
							<div class="font-medium">
								{message.type === 'sent'
									? '送信'
									: message.type === 'received'
										? '受信'
										: 'システム'}
							</div>
							<div class="mt-1">{message.content}</div>
							<div class="text-xs opacity-75 mt-1">
								{formatTime(message.timestamp)}
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<!-- 学習ポイント -->
	<div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
		<div class="text-sm text-blue-800">
			<span class="font-medium">🔍 観察ポイント：</span>
			<ul class="mt-2 space-y-1 ml-4">
				<li>• WebSocket接続の確立プロセス</li>
				<li>• 双方向通信の実現</li>
				<li>• 接続の持続性</li>
				{#if demoType === 'echo-test'}
					<li>• エコーサーバーによる即座のレスポンス</li>
				{/if}
			</ul>
		</div>
	</div>
</div>

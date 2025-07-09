<script lang="ts">
  // import { browser } from '$lib/utils/environment'; // Not used

  interface Props {
    title?: string;
  }

  let { title = 'HTTP接続モデル比較デモ' }: Props = $props();

  let selectedVersion = $state<'http1.0' | 'http1.1' | 'websocket'>('http1.0');
  let connectionState = $state<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');
  let requestCount = $state(0);
  let totalTime = $state(0);
  let connectionOverhead = $state(0);
  let keepAliveActive = $state(false);
  let messages = $state<
    Array<{
      time: number;
      type: 'request' | 'response' | 'connection' | 'websocket';
      content: string;
    }>
  >([]);

  // パフォーマンス測定結果（シミュレーション）
  let performanceResults = $state({
    'http1.0': { avgTime: 150, connectionTime: 50, overhead: 'High' },
    'http1.1': { avgTime: 80, connectionTime: 50, overhead: 'Medium' },
    websocket: { avgTime: 5, connectionTime: 50, overhead: 'Low' }
  });

  function addMessage(type: 'request' | 'response' | 'connection' | 'websocket', content: string) {
    messages = [
      ...messages.slice(-19),
      {
        time: Date.now(),
        type,
        content
      }
    ];
  }

  function simulateHTTP10Request() {
    return new Promise<void>((resolve) => {
      connectionState = 'connecting';
      addMessage('connection', 'TCP接続を確立中...');

      setTimeout(() => {
        connectionState = 'connected';
        addMessage('connection', 'TCP接続確立完了');

        setTimeout(() => {
          addMessage('request', `GET /api/data HTTP/1.0`);

          setTimeout(() => {
            addMessage('response', 'HTTP/1.0 200 OK + データ');
            requestCount++;

            setTimeout(() => {
              connectionState = 'disconnected';
              addMessage('connection', 'TCP接続を切断');
              resolve();
            }, 100);
          }, 200);
        }, 100);
      }, 200);
    });
  }

  // Unused function - commented out to fix ESLint warning
  // function simulateHTTP11Request() {
  // 	return new Promise<void>((resolve) => {
  // 		if (connectionState === 'idle') {
  // 			connectionState = 'connecting';
  // 			addMessage('connection', 'TCP接続を確立中...');

  // 			setTimeout(() => {
  // 				connectionState = 'connected';
  // 				keepAliveActive = true;
  // 				addMessage('connection', 'TCP接続確立完了 (Keep-Alive)');
  // 				makeHTTP11Request(resolve);
  // 			}, 200);
  // 		} else {
  // 			makeHTTP11Request(resolve);
  // 		}
  // 	});
  // }

  // Unused function - commented out to fix ESLint warning
  // function makeHTTP11Request(resolve: () => void) {
  // 	addMessage('request', `GET /api/data HTTP/1.1`);

  // 	setTimeout(() => {
  // 		addMessage('response', 'HTTP/1.1 200 OK + データ');
  // 		requestCount++;
  // 		resolve();
  // 	}, 100);
  // }

  function simulateWebSocketMessage() {
    return new Promise<void>((resolve) => {
      if (connectionState === 'idle') {
        connectionState = 'connecting';
        addMessage('connection', 'HTTP → WebSocketアップグレード中...');

        setTimeout(() => {
          connectionState = 'connected';
          addMessage('connection', 'WebSocket接続確立完了');
          sendWebSocketMessage(resolve);
        }, 200);
      } else {
        sendWebSocketMessage(resolve);
      }
    });
  }

  function sendWebSocketMessage(resolve: () => void) {
    addMessage('websocket', `WebSocketフレーム送信: データ${requestCount + 1}`);

    setTimeout(() => {
      addMessage('websocket', `WebSocketフレーム受信: 応答${requestCount + 1}`);
      requestCount++;
      resolve();
    }, 50);
  }

  async function performBenchmark() {
    requestCount = 0;
    totalTime = 0;
    connectionOverhead = 0;
    messages = [];
    connectionState = 'idle';
    keepAliveActive = false;

    const startTime = Date.now();
    const numRequests = 5;

    for (let i = 0; i < numRequests; i++) {
      switch (selectedVersion) {
        case 'http1.0':
          await simulateHTTP10Request();
          connectionOverhead += 200; // 接続確立・切断時間
          break;
        case 'http1.1':
          await simulateWebSocketMessage();
          if (i === 0) connectionOverhead += 200; // 初回のみ
          break;
        case 'websocket':
          await simulateWebSocketMessage();
          if (i === 0) connectionOverhead += 200; // 初回のみ
          break;
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    totalTime = Date.now() - startTime;

    // HTTP/1.1とWebSocketは最後に接続を明示的に切断
    if (selectedVersion === 'http1.1' || selectedVersion === 'websocket') {
      setTimeout(() => {
        if (connectionState === 'connected') {
          connectionState = 'disconnected';
        }
        keepAliveActive = false;
        addMessage('connection', 'TCP接続を切断');
      }, 1000);
    }
  }

  function getVersionName(version: string): string {
    switch (version) {
      case 'http1.0':
        return 'HTTP/1.0';
      case 'http1.1':
        return 'HTTP/1.1';
      case 'websocket':
        return 'WebSocket';
      default:
        return version;
    }
  }

  function getConnectionStateColor(state: string): string {
    switch (state) {
      case 'connecting':
        return 'text-yellow-600';
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
        return 'text-gray-600';
      default:
        return 'text-gray-500';
    }
  }

  function getMessageIcon(type: string): string {
    switch (type) {
      case 'request':
        return '📤';
      case 'response':
        return '📥';
      case 'connection':
        return '🔗';
      case 'websocket':
        return '⚡';
      default:
        return '📝';
    }
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg p-6" data-testid="http-connection-demo">
  <!-- Header -->
  <div class="mb-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-2">🌐 {title}</h3>
    <p class="text-gray-600 text-sm">
      HTTP/1.0、HTTP/1.1、WebSocketの接続モデルの違いを体験してみましょう。
    </p>
  </div>

  <!-- Version Selection -->
  <div class="mb-6">
    <span class="block text-sm font-medium text-gray-700 mb-2">プロトコルを選択:</span>
    <div class="flex gap-3">
      <label class="flex items-center">
        <input type="radio" bind:group={selectedVersion} value="http1.0" class="mr-2" />
        <span class="text-sm">HTTP/1.0 (接続毎切断)</span>
      </label>
      <label class="flex items-center">
        <input type="radio" bind:group={selectedVersion} value="http1.1" class="mr-2" />
        <span class="text-sm">HTTP/1.1 (Keep-Alive)</span>
      </label>
      <label class="flex items-center">
        <input type="radio" bind:group={selectedVersion} value="websocket" class="mr-2" />
        <span class="text-sm">WebSocket</span>
      </label>
    </div>
  </div>

  <!-- Connection Status -->
  <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
    <div class="grid md:grid-cols-3 gap-4">
      <div>
        <span class="text-sm font-medium text-gray-700">プロトコル:</span>
        <span class="ml-2 font-mono text-blue-600">{getVersionName(selectedVersion)}</span>
      </div>
      <div>
        <span class="text-sm font-medium text-gray-700">接続状態:</span>
        <span class="ml-2 font-medium {getConnectionStateColor(connectionState)}">
          {connectionState === 'idle'
            ? ' 待機中'
            : connectionState === 'connecting'
              ? '接続中...'
              : connectionState === 'connected'
                ? '接続済み'
                : '切断済み'}
        </span>
        {#if keepAliveActive}
          <span class="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Keep-Alive</span>
        {/if}
      </div>
      <div>
        <span class="text-sm font-medium text-gray-700">リクエスト数:</span>
        <span class="ml-2 font-bold text-purple-600">{requestCount}</span>
      </div>
    </div>
  </div>

  <!-- Control Buttons -->
  <div class="mb-6 flex gap-3">
    <button
      type="button"
      onclick={performBenchmark}
      class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      🚀 5回リクエストベンチマーク実行
    </button>
    <button
      type="button"
      onclick={() => {
        messages = [];
        requestCount = 0;
        totalTime = 0;
        connectionOverhead = 0;
        connectionState = 'idle';
        keepAliveActive = false;
      }}
      class="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
    >
      🧹 リセット
    </button>
  </div>

  <!-- Performance Results -->
  {#if totalTime > 0}
    <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <h4 class="font-medium text-blue-900 mb-3">📊 パフォーマンス結果</h4>
      <div class="grid md:grid-cols-3 gap-4 text-sm">
        <div>
          <span class="font-medium">総実行時間:</span>
          <span class="ml-2 font-bold text-blue-600">{totalTime}ms</span>
        </div>
        <div>
          <span class="font-medium">接続オーバーヘッド:</span>
          <span class="ml-2 font-bold text-orange-600">{connectionOverhead}ms</span>
        </div>
        <div>
          <span class="font-medium">1リクエスト平均:</span>
          <span class="ml-2 font-bold text-green-600">{Math.round(totalTime / requestCount)}ms</span
          >
        </div>
      </div>
    </div>
  {/if}

  <!-- Protocol Comparison -->
  <div class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
    <h4 class="font-medium text-yellow-900 mb-3">⚡ プロトコル比較</h4>
    <div class="grid md:grid-cols-3 gap-4 text-sm">
      {#each Object.entries(performanceResults) as [version, result] (version)}
        <div
          class="p-3 bg-white rounded border {selectedVersion === version
            ? 'ring-2 ring-blue-400'
            : ''}"
        >
          <div class="font-medium">{getVersionName(version)}</div>
          <div class="text-xs text-gray-600 mt-1">
            <div>平均: {result.avgTime}ms</div>
            <div>接続: {result.connectionTime}ms</div>
            <div>オーバーヘッド: {result.overhead}</div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Message Log -->
  <div class="p-4 bg-gray-50 border border-gray-200 rounded-md">
    <h4 class="font-medium text-gray-700 mb-3">📜 通信ログ</h4>
    <div class="max-h-48 overflow-y-auto space-y-1">
      {#if messages.length === 0}
        <div class="text-center text-gray-500 text-sm py-4">
          ベンチマークを実行すると通信ログが表示されます
        </div>
      {:else}
        {#each messages.slice().reverse() as message (message.time)}
          <div class="flex items-start space-x-2 text-sm p-2 bg-white rounded">
            <span class="text-lg flex-shrink-0">{getMessageIcon(message.type)}</span>
            <div class="flex-1 min-w-0">
              <span class="font-mono text-xs text-gray-500">
                {new Date(message.time).toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  fractionalSecondDigits: 3
                })}
              </span>
              <div class="text-gray-700">{message.content}</div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Educational Notes -->
  <div class="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-md">
    <div class="text-sm text-indigo-800">
      <span class="font-medium">📚 学習ポイント</span>
      <ul class="mt-2 space-y-1 ml-4">
        <li>• HTTP/1.0では毎回TCP接続の確立・切断が必要（高オーバーヘッド）</li>
        <li>• HTTP/1.1のKeep-Aliveで接続再利用が可能に（中オーバーヘッド）</li>
        <li>• WebSocketは一度の接続でリアルタイム双方向通信（低オーバーヘッド）</li>
        <li>• 接続確立コストとメッセージングコストの違いを理解しよう</li>
      </ul>
    </div>
  </div>
</div>

<script lang="ts">
  import { browser } from '$lib/utils/environment';

  interface Props {
    title?: string;
  }

  let { title = 'HTTPバージョン別WebSocket対応デモ' }: Props = $props();

  let selectedVersion = $state<'http1.1' | 'http2' | 'http3'>('http1.1');
  let testResults = $state<{ [key: string]: unknown }>({});
  let testing = $state(false);
  let browserSupport = $state<{ [key: string]: unknown }>({});

  // HTTPバージョン情報
  const httpVersions = {
    'http1.1': {
      name: 'HTTP/1.1',
      year: '1997',
      websocketSupport: 'Native',
      multiplexing: false,
      headerCompression: false,
      serverPush: false,
      description: 'WebSocketの標準実装基盤'
    },
    http2: {
      name: 'HTTP/2',
      year: '2015',
      websocketSupport: 'RFC 8441 (Limited)',
      multiplexing: true,
      headerCompression: true,
      serverPush: true,
      description: 'WebSocket over HTTP/2は限定的サポート'
    },
    http3: {
      name: 'HTTP/3 (QUIC)',
      year: '2022',
      websocketSupport: 'WebTransport (Alternative)',
      multiplexing: true,
      headerCompression: true,
      serverPush: false,
      description: 'WebTransportが次世代代替技術'
    }
  };

  // ブラウザサポート検出
  function detectBrowserSupport() {
    if (!browser) return;

    browserSupport = {
      websocket: typeof WebSocket !== 'undefined',
      http2: 'serviceWorker' in navigator, // 簡易検出
      webrtc: 'RTCPeerConnection' in window,
      webtransport: 'WebTransport' in window,
      streams: 'ReadableStream' in window,
      modules: 'importmap' in HTMLScriptElement.prototype
    };
  }

  // WebSocket接続テスト
  async function testWebSocketConnection() {
    testing = true;
    const startTime = Date.now();

    try {
      // 実際のWebSocket接続テスト（エラーハンドリング付き）
      const testSocket = new WebSocket('wss://echo.websocket.org');

      const result = await new Promise((resolve) => {
        let resolved = false;

        testSocket.onopen = () => {
          if (!resolved) {
            resolved = true;
            const latency = Date.now() - startTime;
            testSocket.close();
            resolve({
              success: true,
              latency,
              protocol: testSocket.protocol || 'none',
              readyState: testSocket.readyState
            });
          }
        };

        testSocket.onerror = testSocket.onclose = () => {
          if (!resolved) {
            resolved = true;
            resolve({
              success: false,
              latency: Date.now() - startTime,
              error: 'Connection failed'
            });
          }
        };

        // タイムアウト設定
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            testSocket.close();
            resolve({
              success: false,
              latency: Date.now() - startTime,
              error: 'Timeout'
            });
          }
        }, 5000);
      });

      testResults = {
        ...testResults,
        [selectedVersion]: result
      };
    } catch (error) {
      testResults = {
        ...testResults,
        [selectedVersion]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }

    testing = false;
  }

  // HTTP/2サポート検出（簡易版）
  async function detectHTTP2Support() {
    try {
      // Service Worker を使ったHTTP/2検出（簡易）
      const response = await fetch(window.location.href, {
        method: 'HEAD'
      });

      // HTTP/2の場合、通常は特定のヘッダーが存在
      return {
        http2Likely: response.headers.has('server') || response.headers.has('alt-svc'),
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch {
      return { http2Likely: false, error: 'Detection failed' };
    }
  }

  // WebTransportサポートテスト
  async function testWebTransport() {
    if (!('WebTransport' in window)) {
      return { supported: false, reason: 'WebTransport not available' };
    }

    try {
      // WebTransport接続テスト（模擬）
      // Note: This is a mock test for demonstration purposes
      if (typeof window !== 'undefined' && 'WebTransport' in window) {
        return {
          supported: true,
          note: 'WebTransport API available (actual connection not tested)'
        };
      } else {
        throw new Error('WebTransport API not available');
      }
    } catch (error) {
      console.error('HTTP/3 test error:', error);
      return {
        supported: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 総合テスト実行
  async function runFullTest() {
    testing = true;

    // WebSocket基本テスト
    await testWebSocketConnection();

    // HTTP/2検出
    const http2Result = await detectHTTP2Support();

    // WebTransportテスト
    const webTransportResult = await testWebTransport();

    testResults = {
      ...testResults,
      http2Detection: http2Result,
      webTransportTest: webTransportResult,
      timestamp: new Date().toISOString()
    };

    testing = false;
  }

  // コンポーネント初期化
  if (browser) {
    detectBrowserSupport();
  }

  function getVersionColor(version: string): string {
    switch (version) {
      case 'http1.1':
        return 'border-blue-300 bg-blue-50';
      case 'http2':
        return 'border-green-300 bg-green-50';
      case 'http3':
        return 'border-purple-300 bg-purple-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  }

  function getSupportBadge(support: string): string {
    if (support.includes('Native')) return 'bg-green-100 text-green-800';
    if (support.includes('Limited')) return 'bg-yellow-100 text-yellow-800';
    if (support.includes('Alternative')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg p-6" data-testid="protocol-version-demo">
  <!-- Header -->
  <div class="mb-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-2">🌐 {title}</h3>
    <p class="text-gray-600 text-sm">
      HTTP/1.1から HTTP/3まで、各バージョンでのWebSocket対応状況を確認できます。
    </p>
  </div>

  <!-- HTTP Version Selection -->
  <div class="mb-6">
    <span class="block text-sm font-medium text-gray-700 mb-3">HTTPバージョンを選択:</span>
    <div class="grid md:grid-cols-3 gap-4">
      {#each Object.entries(httpVersions) as [version, info] (version)}
        <label class="cursor-pointer">
          <input type="radio" bind:group={selectedVersion} value={version} class="sr-only" />
          <div
            class="p-4 border-2 rounded-lg transition-all {getVersionColor(version)} 
						{selectedVersion === version ? 'ring-2 ring-blue-400' : ''}"
          >
            <div class="font-medium text-gray-900">{info.name}</div>
            <div class="text-xs text-gray-600 mt-1">
              <div>Year: {info.year}</div>
              <div class="mt-2">
                <span
                  class="px-2 py-1 rounded text-xs font-medium {getSupportBadge(
                    info.websocketSupport
                  )}"
                >
                  {info.websocketSupport}
                </span>
              </div>
            </div>
          </div>
        </label>
      {/each}
    </div>
  </div>

  <!-- Selected Version Details -->
  <div class="mb-6 p-4 {getVersionColor(selectedVersion)} border rounded-lg">
    <h4 class="font-medium text-gray-900 mb-3">
      {httpVersions[selectedVersion].name} の詳細
    </h4>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <div>
        <div class="font-medium text-gray-700">基本機能</div>
        <ul class="mt-2 space-y-1 text-gray-600">
          <li>• Multiplexing: {httpVersions[selectedVersion].multiplexing ? '✅' : '❌'}</li>
          <li>
            • Header Compression: {httpVersions[selectedVersion].headerCompression ? '✅' : '❌'}
          </li>
          <li>• Server Push: {httpVersions[selectedVersion].serverPush ? '✅' : '❌'}</li>
        </ul>
      </div>
      <div>
        <div class="font-medium text-gray-700">WebSocket対応</div>
        <div class="mt-2 text-gray-600">
          <div class="font-medium">{httpVersions[selectedVersion].websocketSupport}</div>
          <div class="text-xs mt-1">{httpVersions[selectedVersion].description}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Browser Support Status -->
  <div class="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
    <h4 class="font-medium text-gray-700 mb-3">🌐 ブラウザサポート状況</h4>
    <div class="grid md:grid-cols-3 gap-4 text-sm">
      {#each Object.entries(browserSupport) as [feature, supported] (feature)}
        <div class="flex items-center justify-between">
          <span class="text-gray-700">{feature}:</span>
          <span class={supported ? 'text-green-600' : 'text-red-600'}>
            {supported ? '✅ Yes' : '❌ No'}
          </span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Test Controls -->
  <div class="mb-6 flex gap-3">
    <button
      type="button"
      onclick={testWebSocketConnection}
      disabled={testing}
      class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
    >
      {testing ? '🔄 テスト中...' : '🧪 WebSocket接続テスト'}
    </button>
    <button
      type="button"
      onclick={runFullTest}
      disabled={testing}
      class="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
    >
      {testing ? '🔄 実行中...' : '📊 総合テスト実行'}
    </button>
  </div>

  <!-- Test Results -->
  {#if Object.keys(testResults).length > 0}
    <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 class="font-medium text-blue-900 mb-3">📊 テスト結果</h4>
      <div class="space-y-3 text-sm">
        {#each Object.entries(testResults) as [key, result] (key)}
          <div class="p-3 bg-white rounded border">
            <div class="font-medium text-gray-900">{key}:</div>
            <div class="mt-1 text-gray-600">
              <pre class="text-xs overflow-x-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Educational Notes -->
  <div class="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
    <div class="text-sm text-indigo-800">
      <span class="font-medium">📚 学習ポイント</span>
      <ul class="mt-2 space-y-1 ml-4">
        <li>• HTTP/1.1は現在もWebSocketの主要基盤</li>
        <li>• HTTP/2でのWebSocket対応は限定的（RFC 8441）</li>
        <li>• HTTP/3時代はWebTransportが有力な代替技術</li>
        <li>• 実際の実装ではフォールバック戦略が重要</li>
      </ul>
    </div>
  </div>
</div>

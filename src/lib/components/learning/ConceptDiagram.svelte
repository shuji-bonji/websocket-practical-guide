<script lang="ts">
  export let title: string;
  export let type: 'comparison' | 'flow' | 'structure' = 'comparison';
  // Note: data prop will be used for future diagram types
  export let data: Record<string, unknown> = {};

  // Suppress unused export warning - this will be used for different diagram types
  $: void data;
</script>

<div class="bg-white border border-gray-200 rounded-lg p-6 my-8">
  <h3 class="text-lg font-semibold text-gray-900 mb-6 text-center">{title}</h3>

  {#if type === 'comparison'}
    <!-- WebSocket vs HTTP比較図 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- HTTP通信 -->
      <div class="text-center">
        <h4 class="text-md font-medium text-gray-700 mb-4">従来のHTTP通信</h4>
        <div class="space-y-4">
          <!-- クライアント -->
          <div class="bg-blue-100 border border-blue-300 rounded-lg p-3">
            <div class="text-sm font-medium text-blue-800">クライアント（ブラウザ）</div>
          </div>

          <!-- リクエスト矢印 -->
          <div class="flex items-center justify-center">
            <div class="flex-1 border-t-2 border-gray-300 border-dashed"></div>
            <span class="px-2 text-xs text-gray-500">リクエスト →</span>
            <div class="flex-1 border-t-2 border-gray-300 border-dashed"></div>
          </div>

          <!-- サーバー -->
          <div class="bg-gray-100 border border-gray-300 rounded-lg p-3">
            <div class="text-sm font-medium text-gray-700">サーバー</div>
          </div>

          <!-- レスポンス矢印 -->
          <div class="flex items-center justify-center">
            <div class="flex-1 border-t-2 border-gray-300 border-dashed"></div>
            <span class="px-2 text-xs text-gray-500">← レスポンス</span>
            <div class="flex-1 border-t-2 border-gray-300 border-dashed"></div>
          </div>

          <!-- 接続終了 -->
          <div class="bg-red-100 border border-red-300 rounded-lg p-2">
            <div class="text-xs text-red-700">接続終了</div>
          </div>
        </div>

        <div class="mt-4 text-xs text-gray-600">
          <div>❌ 毎回接続の確立・切断</div>
          <div>❌ サーバーからの能動的通信不可</div>
          <div>❌ オーバーヘッドが大きい</div>
        </div>
      </div>

      <!-- WebSocket通信 -->
      <div class="text-center">
        <h4 class="text-md font-medium text-gray-700 mb-4">WebSocket通信</h4>
        <div class="space-y-4">
          <!-- クライアント -->
          <div class="bg-green-100 border border-green-300 rounded-lg p-3">
            <div class="text-sm font-medium text-green-800">クライアント（ブラウザ）</div>
          </div>

          <!-- 初回ハンドシェイク -->
          <div class="flex items-center justify-center">
            <div class="flex-1 border-t-2 border-green-400"></div>
            <span class="px-2 text-xs text-green-600">ハンドシェイク</span>
            <div class="flex-1 border-t-2 border-green-400"></div>
          </div>

          <!-- サーバー -->
          <div class="bg-green-100 border border-green-300 rounded-lg p-3">
            <div class="text-sm font-medium text-green-800">サーバー</div>
          </div>

          <!-- 双方向通信 -->
          <div class="bg-green-50 border-2 border-green-300 border-dashed rounded-lg p-3">
            <div class="text-xs text-green-700 space-y-1">
              <div>↕️ 双方向リアルタイム通信</div>
              <div>🔄 持続的接続</div>
              <div>⚡ 低遅延</div>
            </div>
          </div>
        </div>

        <div class="mt-4 text-xs text-gray-600">
          <div>✅ 一度の接続確立</div>
          <div>✅ 双方向リアルタイム通信</div>
          <div>✅ 低オーバーヘッド</div>
        </div>
      </div>
    </div>
  {:else if type === 'flow'}
    <!-- フロー図 (将来の拡張用) -->
    <div class="text-center text-gray-500">
      <div class="text-sm">フロー図コンポーネント（今後実装予定）</div>
    </div>
  {:else if type === 'structure'}
    <!-- 構造図 (将来の拡張用) -->
    <div class="text-center text-gray-500">
      <div class="text-sm">構造図コンポーネント（今後実装予定）</div>
    </div>
  {/if}

  <!-- 補足説明 -->
  <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <div class="text-sm text-blue-800">
      <span class="font-medium">💡 ポイント：</span>
      WebSocketは初回のHTTPハンドシェイク後、プロトコルを「アップグレード」して持続的な双方向通信を実現します。
      これにより、リアルタイムなデータ交換が可能になります。
    </div>
  </div>
</div>

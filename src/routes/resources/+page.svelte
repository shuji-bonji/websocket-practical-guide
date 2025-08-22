<script lang="ts">
</script>

<svelte:head>
  <title>学習リソース - WebSocket 実践ガイド</title>
  <meta
    name="description"
    content="WebSocket学習のための参考資料、ドキュメント、ツールのリソース集"
  />
</svelte:head>

<div class="max-w-4xl mx-auto">
  <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">学習リソース</h1>

  <div class="prose prose-lg dark:prose-invert max-w-none">
    <p class="text-gray-600 dark:text-gray-400">
      WebSocket技術を深く学ぶための厳選されたリソース集です。公式ドキュメント、実装ガイド、デバッグツールなど、実践的な学習に役立つ資料をまとめています。
    </p>
  </div>

  <div class="mt-12 space-y-8">
    <!-- 公式ドキュメント -->
    <section>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        📚 公式ドキュメント
      </h2>
      <div class="space-y-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/API/WebSocket"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 dark:text-blue-400 hover:underline"
            >
              MDN WebSocket API
            </a>
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Mozillaによる包括的なWebSocket APIリファレンス。ブラウザ互換性情報も充実。
          </p>
        </div>

        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            <a
              href="https://datatracker.ietf.org/doc/html/rfc6455"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 dark:text-blue-400 hover:underline"
            >
              RFC 6455 - The WebSocket Protocol
            </a>
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            WebSocketプロトコルの公式仕様書。プロトコルの詳細を理解するための必読資料。
          </p>
        </div>
      </div>
    </section>

    <!-- 実装ライブラリ -->
    <section>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        🛠️ 実装ライブラリ
      </h2>
      <div class="space-y-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            <a
              href="https://github.com/websockets/ws"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ws - Node.js WebSocketライブラリ
            </a>
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Node.jsで最も人気のあるWebSocketライブラリ。シンプルで高性能。
          </p>
        </div>

        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            <a
              href="https://socket.io/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Socket.IO
            </a>
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            リアルタイム通信のための高レベルライブラリ。自動再接続、フォールバック機能付き。
          </p>
        </div>
      </div>
    </section>

    <!-- デバッグツール -->
    <section>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        🔍 デバッグツール
      </h2>
      <div class="space-y-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Chrome DevTools WebSocket Inspector
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            Chrome開発者ツールのNetworkタブでWebSocketフレームを詳細に確認可能。
          </p>
        </div>

        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            <a
              href="https://www.websocket.org/echo.html"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 dark:text-blue-400 hover:underline"
            >
              WebSocket.org Echo Test
            </a>
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            WebSocket接続をテストするための公開エコーサーバー。
          </p>
        </div>
      </div>
    </section>

    <!-- 学習資料 -->
    <section>
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">📖 学習資料</h2>
      <div class="space-y-4">
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            <a
              href="https://javascript.info/websocket"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 dark:text-blue-400 hover:underline"
            >
              JavaScript.info - WebSocket
            </a>
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            WebSocketの基礎から実装まで、わかりやすく解説された入門ガイド。
          </p>
        </div>

        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            <a
              href="https://www.html5rocks.com/en/tutorials/websockets/basics/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 dark:text-blue-400 hover:underline"
            >
              HTML5 Rocks - WebSocket入門
            </a>
          </h3>
          <p class="text-gray-600 dark:text-gray-400">
            WebSocketの基本概念と実装例を含む包括的なチュートリアル。
          </p>
        </div>
      </div>
    </section>
  </div>

  <div
    class="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700"
  >
    <p class="text-sm text-blue-800 dark:text-blue-200">
      💡 <strong>ヒント：</strong>まずは基本的なWebSocket
      APIの理解から始め、徐々に高度なライブラリやフレームワークに進むことをお勧めします。
    </p>
  </div>
</div>

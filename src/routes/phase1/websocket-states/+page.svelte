<script lang="ts">
  import { WebSocketStateVisualizer, LessonIntro, NextLesson } from '$lib/components/learning';
  import { PUBLIC_WEBSOCKET_SERVICES } from '$lib/types/websocket';
  import type { PublicWebSocketService } from '$lib/types/websocket';

  // Lesson configuration
  const lessonConfig = {
    id: 'phase1-websocket-states',
    title: 'WebSocket状態とライフサイクル',
    description: 'WebSocketの4つの状態と状態遷移を実際の接続で学習します',
    duration: '30分',
    difficulty: 'beginner',
    phase: 1,
    section: 'WebSocket API の基本構造',
    objectives: [
      'WebSocketの4つのReadyState（CONNECTING, OPEN, CLOSING, CLOSED）を理解する',
      '状態遷移のタイミングとイベントハンドラの関係を把握する',
      '正常なクローズハンドシェイクと異常切断の違いを学ぶ',
      'Close Codeによる切断理由の識別方法を習得する',
      'リアルタイムでWebSocket接続の可視化を体験する'
    ]
  };

  // Selected service for demonstration
  let selectedService = $state<PublicWebSocketService>(PUBLIC_WEBSOCKET_SERVICES[0]);
</script>

<svelte:head>
  <title>{lessonConfig.title} - Phase 1: WebSocket Learning</title>
  <meta name="description" content={lessonConfig.description} />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  <!-- Lesson Introduction -->
  <LessonIntro
    lessonId={lessonConfig.id}
    title={lessonConfig.title}
    duration={lessonConfig.duration}
    difficulty="初級"
    prerequisites={['WebSocket基本概念', 'ブラウザ開発者ツールの使用']}
  />

  <!-- Main Content -->
  <div class="space-y-8">
    <!-- Theoretical Overview -->
    <section class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">📚 WebSocket状態の基礎知識</h2>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- ReadyState Overview -->
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-3">ReadyState の4つの状態</h3>
          <div class="space-y-3">
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span class="text-2xl">🔄</span>
              <div>
                <div class="font-medium">0: CONNECTING</div>
                <div class="text-sm text-gray-600">接続確立中（ハンドシェイク中）</div>
              </div>
            </div>
            <div class="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <span class="text-2xl">✅</span>
              <div>
                <div class="font-medium">1: OPEN</div>
                <div class="text-sm text-gray-600">接続が確立され、通信可能</div>
              </div>
            </div>
            <div class="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
              <span class="text-2xl">⏳</span>
              <div>
                <div class="font-medium">2: CLOSING</div>
                <div class="text-sm text-gray-600">切断処理中（クローズハンドシェイク中）</div>
              </div>
            </div>
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <span class="text-2xl">❌</span>
              <div>
                <div class="font-medium">3: CLOSED</div>
                <div class="text-sm text-gray-600">接続が切断済み</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Event Handlers -->
        <div>
          <h3 class="text-lg font-semibold text-gray-800 mb-3">イベントハンドラとの関係</h3>
          <div class="space-y-3">
            <div class="p-3 bg-blue-50 rounded-lg">
              <div class="font-medium text-blue-800">onopen イベント</div>
              <div class="text-sm text-blue-600">CONNECTING → OPEN 時に発火</div>
            </div>
            <div class="p-3 bg-green-50 rounded-lg">
              <div class="font-medium text-green-800">onmessage イベント</div>
              <div class="text-sm text-green-600">OPEN 状態でのみメッセージ受信</div>
            </div>
            <div class="p-3 bg-orange-50 rounded-lg">
              <div class="font-medium text-orange-800">onclose イベント</div>
              <div class="text-sm text-orange-600">CLOSING → CLOSED 時に発火</div>
            </div>
            <div class="p-3 bg-red-50 rounded-lg">
              <div class="font-medium text-red-800">onerror イベント</div>
              <div class="text-sm text-red-600">エラー発生時、状態遷移前に発火</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Service Selection -->
    <section class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">🌐 接続先サービスの選択</h2>
      <p class="text-gray-600 mb-4">
        Phase 1では公開WebSocketサービスを使用します。異なるサービスで状態遷移を比較してみましょう。
      </p>

      <div class="grid md:grid-cols-3 gap-4">
        {#each PUBLIC_WEBSOCKET_SERVICES as service (service.name)}
          <button
            type="button"
            onclick={() => (selectedService = service)}
            class="p-4 border rounded-lg text-left transition-all hover:shadow-md
							{selectedService.name === service.name
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
              : 'border-gray-200 hover:border-gray-300'}"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="font-medium text-gray-900">{service.name}</div>
              <div
                class="px-2 py-1 text-xs rounded-full
								{service.reliability === 'high'
                  ? 'bg-green-100 text-green-800'
                  : service.reliability === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'}"
              >
                {service.reliability}
              </div>
            </div>
            <div class="text-sm text-gray-600 mb-2">{service.description}</div>
            <div class="text-xs font-mono text-gray-500">{service.url}</div>
          </button>
        {/each}
      </div>
    </section>

    <!-- Interactive State Visualizer -->
    <section class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">🔍 リアルタイム状態可視化</h2>
      <p class="text-gray-600 mb-6">
        実際のWebSocket接続で状態変化を観察しましょう。ボタンをクリックして接続・通信・切断の流れを体験できます。
      </p>

      <WebSocketStateVisualizer
        title="WebSocket状態ライフサイクル"
        {selectedService}
        showLifecycle={true}
        showReadyStates={true}
        showCloseCodes={true}
        showConnectionFlow={true}
        autoDemo={false}
      />
    </section>

    <!-- Key Learning Points -->
    <section class="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
      <h2 class="text-xl font-bold text-indigo-900 mb-4">🎯 重要な学習ポイント</h2>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h3 class="font-semibold text-indigo-800 mb-2">状態遷移の理解</h3>
          <ul class="space-y-1 text-sm text-indigo-700">
            <li>• CLOSED → CONNECTING: new WebSocket() 呼び出し時</li>
            <li>• CONNECTING → OPEN: ハンドシェイク成功時</li>
            <li>• OPEN → CLOSING: close() 呼び出しまたはサーバー側切断</li>
            <li>• CLOSING → CLOSED: クローズハンドシェイク完了時</li>
            <li>• 任意状態 → CLOSED: エラーまたは異常切断時</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-indigo-800 mb-2">実装時の注意点</h3>
          <ul class="space-y-1 text-sm text-indigo-700">
            <li>• readyState を確認してからメッセージ送信</li>
            <li>• エラーハンドリングの重要性</li>
            <li>• 再接続ロジックの実装戦略</li>
            <li>• Close Code による適切な処理分岐</li>
            <li>• ユーザーへの状態フィードバック</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Code Example -->
    <section class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">💻 実装例</h2>
      <p class="text-gray-600 mb-4">WebSocket状態を管理する基本的なパターンを学習しましょう。</p>

      <div class="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
        <pre class="text-gray-800"><code
            >{`// WebSocket状態管理の基本パターン
class WebSocketManager {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('Already connected');
      return;
    }

    this.ws = new WebSocket(this.url);
    
    this.ws.onopen = () => {
      console.log('Connected (ReadyState: 1)');
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      console.log('Message received:', event.data);
    };
    
    this.ws.onclose = (event) => {
      console.log(\`Closed (Code: \${event.code}, ReadyState: 3)\`);
      this.handleReconnect(event.code);
    };
    
    this.ws.onerror = () => {
      console.log('Error occurred');
    };
  }

  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      console.log('Cannot send: WebSocket not open');
    }
  }

  handleReconnect(closeCode) {
    // Close code による再接続判断
    if (closeCode === 1000 || closeCode === 1001) {
      return; // 正常終了、再接続不要
    }
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        console.log('Attempting reconnect...');
        this.reconnectAttempts++;
        this.connect();
      }, 1000 * Math.pow(2, this.reconnectAttempts)); // 指数バックオフ
    }
  }
}`}</code
          ></pre>
      </div>
    </section>

    <!-- Exercise Section -->
    <section class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <h2 class="text-xl font-bold text-yellow-900 mb-4">📝 実習課題</h2>
      <div class="space-y-4">
        <div>
          <h3 class="font-semibold text-yellow-800 mb-2">基本課題</h3>
          <ol class="list-decimal list-inside space-y-2 text-sm text-yellow-700">
            <li>
              上記の可視化ツールで手動接続→メッセージ送信→切断の流れを3回実行し、状態遷移を観察する
            </li>
            <li>
              両方の公開サービス（Echo WebSocket、Postman
              Echo）で接続テストを行い、応答の違いを比較する
            </li>
            <li>自動デモ機能を有効にして、完全なライフサイクルを5回観察する</li>
          </ol>
        </div>
        <div>
          <h3 class="font-semibold text-yellow-800 mb-2">発展課題</h3>
          <ol class="list-decimal list-inside space-y-2 text-sm text-yellow-700">
            <li>ブラウザ開発者ツールのNetworkタブでWebSocketのハンドシェイクヘッダーを確認する</li>
            <li>意図的にネットワークを切断して異常終了時のClose Codeを観察する</li>
            <li>同時に複数の接続を開いて、各接続の独立性を確認する</li>
          </ol>
        </div>
      </div>
    </section>

    <!-- Navigation -->
    <NextLesson
      nextLessonId="3.2"
      nextLessonTitle="イベントベース通信モデル"
      nextLessonPath="/phase1/api-structure/event-model"
    />
  </div>
</div>

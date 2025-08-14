<script lang="ts">
  import {
    PUBLIC_WEBSOCKET_SERVICES,
    WEBSOCKET_READY_STATE_LABELS,
    WEBSOCKET_CLOSE_CODES
  } from '$lib/types/websocket';
  import type {
    PublicWebSocketService,
    Phase1WebSocketMessage,
    Phase1ConnectionMetrics,
    WebSocketEducationalEvent,
    Phase1DemoConfig
  } from '$lib/types/websocket';
  import { browser } from '$lib/utils/environment';

  // Safe WebSocket constants for SSR
  const WS_OPEN = typeof WebSocket !== 'undefined' ? WebSocket.OPEN : 1;
  const WS_CLOSED = typeof WebSocket !== 'undefined' ? WebSocket.CLOSED : 3;

  interface Props {
    title: string;
    description: string;
    demoConfig?: Partial<Phase1DemoConfig>;
    serviceFilter?: PublicWebSocketService['reliability'][];
  }

  let {
    title,
    description,
    demoConfig = {
      demoType: 'echo',
      autoReconnect: true,
      maxReconnectAttempts: 3,
      reconnectDelay: 2000,
      showEducationalHints: true
    },
    serviceFilter = ['high', 'medium']
  }: Props = $props();

  // WebSocket management
  let websocket = $state<WebSocket | null>(null);
  let connectionState = $state<
    'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting'
  >('disconnected');
  let currentService = $state<PublicWebSocketService | null>(null);
  let serviceIndex = $state(0);
  let reconnectAttempts = $state(0);

  // Messages and events
  let messages = $state<Phase1WebSocketMessage[]>([]);
  let educationalEvents = $state<WebSocketEducationalEvent[]>([]);
  let messageInput = $state('');

  // Connection metrics
  let connectionMetrics = $state<Phase1ConnectionMetrics>({
    messagesSent: 0,
    messagesReceived: 0,
    uptime: 0,
    averageLatency: 0,
    stabilityScore: 100
  });
  let connectionStartTime = $state<number | null>(null);
  let lastPingTime = $state<number | null>(null);

  // UI state
  let mounted = $state(false);
  let showMetrics = $state(false);
  let showEvents = $state(false);
  let isComposing = $state(false);

  // Available services based on filter
  let availableServices = $derived(
    PUBLIC_WEBSOCKET_SERVICES.filter((service) => serviceFilter.includes(service.reliability))
  );

  // Current WebSocket ready state
  let readyState = $derived(websocket ? websocket.readyState : WS_CLOSED);

  // Connection quality indicator
  let connectionQuality = $derived(() => {
    if (!currentService) return 'unknown';
    if (connectionMetrics.stabilityScore >= 90) return 'excellent';
    if (connectionMetrics.stabilityScore >= 70) return 'good';
    if (connectionMetrics.stabilityScore >= 50) return 'fair';
    return 'poor';
  });

  $effect(() => {
    mounted = true;
    // Initialize first service
    if (availableServices.length > 0) {
      currentService = availableServices[0];
    }

    return () => {
      cleanupConnection();
    };
  });

  // Update connection metrics periodically
  $effect(() => {
    if (connectionStartTime && connectionState === 'connected') {
      const interval = setInterval(() => {
        connectionMetrics.uptime = Date.now() - (connectionStartTime || 0);
      }, 1000);

      return () => clearInterval(interval);
    }
  });

  function addMessage(
    type: Phase1WebSocketMessage['type'],
    content: string,
    metadata?: Phase1WebSocketMessage['metadata']
  ) {
    const message: Phase1WebSocketMessage = {
      id: crypto.randomUUID(),
      type,
      content,
      timestamp: Date.now(),
      service: currentService?.name,
      metadata
    };

    messages = [...messages.slice(-99), message]; // Keep last 100 messages

    // Update metrics
    if (type === 'sent') {
      connectionMetrics.messagesSent++;
      lastPingTime = Date.now();
    } else if (type === 'received') {
      connectionMetrics.messagesReceived++;
      // Calculate latency if this is a response to our ping
      if (lastPingTime) {
        const latency = Date.now() - lastPingTime;
        connectionMetrics.averageLatency = (connectionMetrics.averageLatency + latency) / 2;
        lastPingTime = null;
      }
    }
  }

  function addEducationalEvent(
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

    educationalEvents = [...educationalEvents.slice(-49), event]; // Keep last 50 events
  }

  function cleanupConnection() {
    if (websocket) {
      websocket.close();
      websocket = null;
    }
    reconnectAttempts = 0;
    connectionStartTime = null;
    lastPingTime = null;
  }

  function connect() {
    if (!browser || !currentService) return;

    connectionState = 'connecting';
    addMessage('system', `🔄 ${currentService.name}への接続を開始しています...`);
    addEducationalEvent('handshake', `WebSocket handshake initiated to ${currentService.url}`);

    try {
      websocket = new WebSocket(currentService.url);
      connectionStartTime = Date.now();

      websocket.onopen = () => {
        connectionState = 'connected';
        reconnectAttempts = 0;
        addMessage('system', `✅ ${currentService?.name}に接続されました`, {
          size: 0,
          latency: Date.now() - (connectionStartTime || 0),
          frameType: 'text'
        });
        addEducationalEvent('open', 'WebSocket connection established', {
          protocol: websocket?.protocol || 'none'
        });
      };

      websocket.onmessage = (event) => {
        const size = typeof event.data === 'string' ? event.data.length : event.data.byteLength;
        addMessage('received', event.data, {
          size,
          frameType: typeof event.data === 'string' ? 'text' : 'binary'
        });
        addEducationalEvent('message', `Received ${typeof event.data} message (${size} bytes)`);
      };

      websocket.onclose = (event) => {
        const wasConnected = connectionState === 'connected';
        connectionState = 'disconnected';
        connectionStartTime = null;

        const closeReason = WEBSOCKET_CLOSE_CODES[event.code] || '不明';
        addMessage('system', `🔌 接続が切断されました (${event.code}: ${closeReason})`);
        addEducationalEvent('close', `Connection closed with code ${event.code}`, {
          code: event.code,
          reason: event.reason || closeReason
        });

        // Auto-reconnect with fallback
        if (
          wasConnected &&
          demoConfig.autoReconnect &&
          reconnectAttempts < (demoConfig.maxReconnectAttempts || 3)
        ) {
          attemptReconnect();
        }
      };

      websocket.onerror = () => {
        connectionState = 'error';
        connectionMetrics.stabilityScore = Math.max(0, connectionMetrics.stabilityScore - 10);
        addMessage('error', `❌ ${currentService?.name}への接続でエラーが発生しました`);
        addEducationalEvent('error', 'WebSocket connection error occurred');
      };
    } catch (error) {
      connectionState = 'error';
      addMessage('error', `❌ WebSocket接続に失敗: ${error}`);
      addEducationalEvent('error', `Connection failed: ${error}`);
    }
  }

  function attemptReconnect() {
    if (reconnectAttempts >= (demoConfig.maxReconnectAttempts || 3)) {
      // Try next service
      if (serviceIndex < availableServices.length - 1) {
        serviceIndex++;
        currentService = availableServices[serviceIndex];
        reconnectAttempts = 0;
        addMessage('system', `🔄 フォールバック: ${currentService.name}に切り替えています...`);
      } else {
        addMessage('system', '❌ 全てのサービスへの接続に失敗しました');
        return;
      }
    }

    reconnectAttempts++;
    connectionState = 'reconnecting';
    addMessage(
      'system',
      `🔄 再接続を試行しています... (${reconnectAttempts}/${demoConfig.maxReconnectAttempts})`
    );

    setTimeout(() => {
      connect();
    }, demoConfig.reconnectDelay || 2000);
  }

  function disconnect() {
    cleanupConnection();
    connectionState = 'disconnected';
    addMessage('system', '🔌 接続を手動で切断しました');
    addEducationalEvent('close', 'Manual disconnection requested by user');
  }

  function sendMessage() {
    if (websocket && websocket.readyState === WS_OPEN && messageInput.trim()) {
      const message = messageInput.trim();

      websocket.send(message);
      addMessage('sent', message, {
        size: message.length,
        frameType: 'text'
      });
      addEducationalEvent('message', `Sent text message (${message.length} bytes)`);
      messageInput = ''; // Clear input after sending
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    // 日本語入力中（変換中）はEnterキーでの送信を無効化
    if (event.key === 'Enter' && !isComposing && canSend) {
      event.preventDefault();
      sendMessage();
    }
  }

  function switchService(service: PublicWebSocketService) {
    if (connectionState === 'connected' || connectionState === 'connecting') {
      disconnect();
    }
    currentService = service;
    serviceIndex = availableServices.indexOf(service);
    reconnectAttempts = 0;
    addMessage('system', `🔄 サービスを${service.name}に切り替えました`);
  }

  function clearMessages() {
    messages = [];
    educationalEvents = [];
    connectionMetrics = {
      messagesSent: 0,
      messagesReceived: 0,
      uptime: 0,
      averageLatency: 0,
      stabilityScore: 100
    };
  }

  function testPing() {
    if (websocket && websocket.readyState === WS_OPEN) {
      const pingMessage = `ping-${Date.now()}`;
      messageInput = pingMessage;
      sendMessage();
    }
  }

  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  function formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  function getQualityColor(quality: string): string {
    switch (quality) {
      case 'excellent':
        return 'text-green-600 dark:text-green-400';
      case 'good':
        return 'text-blue-600 dark:text-blue-400';
      case 'fair':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'poor':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  }

  function getServiceIcon(service: PublicWebSocketService): string {
    if (service.name.includes('Echo')) return '🔊';
    if (service.name.includes('Postman')) return '📦';
    if (service.name.includes('SocketsBay')) return '🏗️';
    return '🌐';
  }

  let stateColor = $derived(
    {
      disconnected: 'text-gray-600 dark:text-gray-400',
      connecting: 'text-yellow-600 dark:text-yellow-400',
      connected: 'text-green-600 dark:text-green-400',
      reconnecting: 'text-blue-600 dark:text-blue-400',
      error: 'text-red-600 dark:text-red-400'
    }[connectionState]
  );

  let stateText = $derived(
    {
      disconnected: '切断',
      connecting: '接続中...',
      connected: '接続済み',
      reconnecting: '再接続中...',
      error: 'エラー'
    }[connectionState]
  );

  let isConnected = $derived(connectionState === 'connected' && websocket?.readyState === WS_OPEN);
  let canConnect = $derived(connectionState === 'disconnected' || connectionState === 'error');
  let canSend = $derived(isConnected && messageInput.trim().length > 0);
</script>

<div
  class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 my-8"
  data-testid="websocket-demo"
>
  <div class="mb-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
    <p class="text-gray-600 dark:text-gray-400 text-sm mb-4">{description}</p>

    <!-- Service Selection -->
    {#if availableServices.length > 1}
      <div class="mb-4">
        <div class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          🌐 WebSocketサービス選択
        </div>
        <div class="flex flex-wrap gap-2">
          {#each availableServices as service (service.url)}
            <button
              type="button"
              onclick={() => switchService(service)}
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors
								{currentService?.url === service.url
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'}"
              disabled={connectionState === 'connecting' || connectionState === 'reconnecting'}
            >
              <span class="mr-1">{getServiceIcon(service)}</span>
              {service.name}
              <span class="ml-1 text-xs opacity-75">({service.reliability})</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- 接続状態表示 -->
  <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center space-x-3">
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">接続状態:</span>
        <span class="font-medium {stateColor}" data-connection-state={connectionState}
          >{stateText}</span
        >
        {#if isConnected}
          <div
            class="w-3 h-3 bg-green-500 rounded-full animate-pulse"
            title="接続中"
            aria-label="接続中"
          ></div>
        {/if}
        {#if currentService && isConnected}
          <span
            class="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full"
          >
            {currentService.name}
          </span>
        {/if}
      </div>

      <div class="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
        {#if connectionStartTime && isConnected}
          <span>接続時間: {formatUptime(connectionMetrics.uptime)}</span>
        {/if}
        {#if websocket}
          <span>ReadyState: {WEBSOCKET_READY_STATE_LABELS[readyState]}</span>
        {/if}
        {#if isConnected}
          <span class={getQualityColor(connectionQuality())}>
            接続品質: {connectionQuality()}
          </span>
        {/if}
      </div>
    </div>

    <div class="flex flex-wrap gap-3">
      {#if canConnect}
        <button
          type="button"
          onclick={connect}
          class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={!mounted || !currentService}
          data-testid="connect-button"
        >
          🔗 接続
        </button>
      {:else if isConnected}
        <button
          type="button"
          onclick={disconnect}
          class="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
          data-testid="disconnect-button"
        >
          🔌 切断
        </button>
      {/if}

      {#if messages.length > 0}
        <button
          type="button"
          onclick={clearMessages}
          class="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          🧹 クリア
        </button>
      {/if}

      <button
        type="button"
        onclick={() => (showMetrics = !showMetrics)}
        class="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
      >
        📊 {showMetrics ? 'メトリクス非表示' : 'メトリクス表示'}
      </button>

      <button
        type="button"
        onclick={() => (showEvents = !showEvents)}
        class="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        📜 {showEvents ? 'イベント非表示' : 'イベント表示'}
      </button>
    </div>
  </div>

  <!-- メトリクス表示 -->
  {#if showMetrics}
    <div
      class="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg"
    >
      <h4 class="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">📊 接続メトリクス</h4>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div
          class="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600"
        >
          <div class="text-lg font-bold text-blue-600 dark:text-blue-400">
            {connectionMetrics.messagesSent}
          </div>
          <div class="text-gray-600 dark:text-gray-400">送信メッセージ</div>
        </div>
        <div
          class="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600"
        >
          <div class="text-lg font-bold text-green-600 dark:text-green-400">
            {connectionMetrics.messagesReceived}
          </div>
          <div class="text-gray-600 dark:text-gray-400">受信メッセージ</div>
        </div>
        <div
          class="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600"
        >
          <div class="text-lg font-bold text-purple-600 dark:text-purple-400">
            {Math.round(connectionMetrics.averageLatency)}ms
          </div>
          <div class="text-gray-600 dark:text-gray-400">平均レイテンシ</div>
        </div>
        <div
          class="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600"
        >
          <div class="text-lg font-bold {getQualityColor(connectionQuality())}">
            {connectionMetrics.stabilityScore}%
          </div>
          <div class="text-gray-600 dark:text-gray-400">安定性スコア</div>
        </div>
      </div>
    </div>
  {/if}

  <!-- 教育イベント -->
  {#if showEvents && educationalEvents.length > 0}
    <div
      class="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg"
    >
      <h4 class="text-sm font-semibold text-indigo-900 dark:text-indigo-200 mb-3">
        📜 WebSocketイベント
      </h4>
      <div class="max-h-32 overflow-y-auto space-y-2">
        {#each educationalEvents.slice(-5) as event (event.id)}
          <div
            class="text-xs bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium text-indigo-700 dark:text-indigo-300"
                >{event.type.toUpperCase()}</span
              >
              <span class="text-gray-500 dark:text-gray-400">{formatTime(event.timestamp)}</span>
            </div>
            <div class="text-gray-700 dark:text-gray-300 mt-1">{event.description}</div>
            {#if event.details}
              <div class="text-gray-500 dark:text-gray-400 mt-1 font-mono text-xs">
                {JSON.stringify(event.details)}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- メッセージ送信 -->
  {#if demoConfig.demoType === 'echo' || demoConfig.demoType === 'broadcast'}
    <div class="mb-6">
      <label
        for="message-input"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        💬 メッセージ送信
      </label>
      <div class="flex space-x-2">
        <input
          id="message-input"
          type="text"
          bind:value={messageInput}
          onkeydown={handleKeydown}
          oncompositionstart={() => (isComposing = true)}
          oncompositionend={() => (isComposing = false)}
          placeholder="メッセージを入力してください"
          class="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800"
          disabled={!isConnected}
          data-testid="message-input"
        />
        <button
          type="button"
          onclick={sendMessage}
          disabled={!canSend}
          class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          data-testid="send-button"
        >
          🚀 送信
        </button>
        {#if demoConfig.demoType === 'echo'}
          <button
            type="button"
            onclick={testPing}
            disabled={!isConnected}
            class="bg-yellow-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            title="レイテンシテスト用のpingメッセージを送信"
          >
            🏓 Ping
          </button>
        {/if}
      </div>
    </div>
  {/if}

  <!-- メッセージログ -->
  <div class="border border-gray-200 dark:border-gray-700 rounded-md">
    <div
      class="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between"
    >
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">📝 通信ログ</h4>
      <div class="text-xs text-gray-500 dark:text-gray-400">
        {messages.length}件 | 送信: {connectionMetrics.messagesSent} | 受信: {connectionMetrics.messagesReceived}
      </div>
    </div>
    <div class="h-64 overflow-y-auto p-4 space-y-2 bg-white dark:bg-gray-800">
      {#if messages.length === 0}
        <div class="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
          <div class="text-4xl mb-2">🔗</div>
          <p>WebSocketに接続すると通信ログが表示されます</p>
          {#if currentService}
            <p class="text-xs mt-2">接続先: {currentService.name}</p>
          {/if}
        </div>
      {:else}
        {#each messages as message (message.id)}
          <div
            class="flex items-start space-x-3 {message.type === 'sent'
              ? 'justify-end'
              : 'justify-start'}"
          >
            <div
              class="max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm {message.type === 'sent'
                ? 'bg-blue-500 text-white'
                : message.type === 'received'
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700'
                  : message.type === 'error'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700'}"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium text-xs">
                  {message.type === 'sent'
                    ? '🚀 送信'
                    : message.type === 'received'
                      ? '📨 受信'
                      : message.type === 'error'
                        ? '❌ エラー'
                        : '💻 システム'}
                </span>
                {#if message.metadata?.size}
                  <span class="text-xs opacity-75">{message.metadata.size}B</span>
                {/if}
              </div>
              <div class="break-words">{message.content}</div>
              <div class="flex items-center justify-between mt-1 text-xs opacity-75">
                <span>{formatTime(message.timestamp)}</span>
                {#if message.metadata?.latency}
                  <span>{message.metadata.latency}ms</span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <!-- 学習ポイント -->
  <div
    class="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg"
  >
    <div class="text-sm text-blue-800 dark:text-blue-200">
      <span class="font-medium">📚 学習ポイント</span>
      <ul class="mt-2 space-y-1 ml-4">
        <li>• 🌐 パブリックWebSocketサービスの利用</li>
        <li>• 🔄 自動フォールバック機能</li>
        <li>• 📊 接続メトリクスの監視</li>
        <li>• 📡 WebSocket ReadyStateの理解</li>
        {#if demoConfig.demoType === 'echo'}
          <li>• 📢 エコーサーバーでの即座レスポンス</li>
          <li>• ⏱️ レイテンシ測定とパフォーマンス解析</li>
        {:else if demoConfig.demoType === 'broadcast'}
          <li>• 📡 ブロードキャスト通信の体験</li>
          <li>• 👥 マルチクライアント環境の理解</li>
        {:else}
          <li>• 🔗 WebSocketライフサイクルの観察</li>
          <li>• 🔌 接続切断パターンの学習</li>
        {/if}
      </ul>

      {#if demoConfig.showEducationalHints && currentService}
        <div
          class="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-blue-300 dark:border-blue-600"
        >
          <div class="font-medium text-blue-900 dark:text-blue-200 mb-1">💡 サービス情報:</div>
          <div class="text-xs space-y-1">
            <div><strong>名前:</strong> {currentService.name}</div>
            <div><strong>信頼性:</strong> {currentService.reliability}</div>
            <div><strong>レイテンシ:</strong> {currentService.latency}</div>
            <div><strong>機能:</strong> {currentService.features.join(', ')}</div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

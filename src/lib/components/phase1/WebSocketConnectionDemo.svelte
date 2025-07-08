<script lang="ts">
  import { Phase1WebSocketManager } from '$lib/utils/phase1-websocket-manager';
  import { PUBLIC_WEBSOCKET_SERVICES } from '$lib/types/websocket';
  import type {
    PublicWebSocketService,
    Phase1ConnectionState,
    Phase1WebSocketMessage,
    WebSocketEducationalEvent,
    Phase1ConnectionMetrics
  } from '$lib/types/websocket';

  interface Props {
    title?: string;
    description?: string;
    showMetrics?: boolean;
    showEducationalEvents?: boolean;
    autoConnect?: boolean;
  }

  let {
    title = 'WebSocket接続デモ',
    description = 'パブリックWebSocketサービスへの接続を学習します',
    showMetrics = true,
    showEducationalEvents = true,
    autoConnect = false
  }: Props = $props();

  // State management with Svelte 5 runes
  let manager: Phase1WebSocketManager | null = $state(null);
  let selectedService = $state<PublicWebSocketService>(PUBLIC_WEBSOCKET_SERVICES[0]);
  let connectionState = $state<Phase1ConnectionState>({ status: 'disconnected', service: null });
  let messageInput = $state('');
  let messages = $state<Phase1WebSocketMessage[]>([]);
  let educationalEvents = $state<WebSocketEducationalEvent[]>([]);
  let metrics = $state<Phase1ConnectionMetrics>({
    messagesSent: 0,
    messagesReceived: 0,
    uptime: 0,
    averageLatency: 0,
    stabilityScore: 100
  });
  let readyState = $state<{ state: number; label: string } | null>(null);

  // Derived states
  let isConnected = $derived(connectionState.status === 'connected');
  let canConnect = $derived(
    connectionState.status === 'disconnected' || connectionState.status === 'error'
  );
  let canSend = $derived(isConnected && messageInput.trim().length > 0);
  let connectionStatusColor = $derived(
    {
      disconnected: 'bg-gray-100 text-gray-700',
      connecting: 'bg-yellow-100 text-yellow-700',
      connected: 'bg-green-100 text-green-700',
      error: 'bg-red-100 text-red-700',
      reconnecting: 'bg-orange-100 text-orange-700'
    }[connectionState.status] || 'bg-gray-100 text-gray-700'
  );

  // Browser environment check
  let mounted = $state(false);

  $effect(() => {
    if (typeof window !== 'undefined') {
      mounted = true;
      manager = new Phase1WebSocketManager({
        debug: true,
        collectMetrics: showMetrics,
        enableFallback: true,
        connectionTimeout: 10000,
        visualIndicators: true
      });

      // Auto-connect if requested
      if (autoConnect) {
        connect();
      }
    }

    // Cleanup on unmount
    return () => {
      if (manager) {
        manager.disconnect();
      }
    };
  });

  // Update states from manager
  $effect(() => {
    if (!manager) return;

    const interval = setInterval(() => {
      if (manager) {
        connectionState = manager.getConnectionState();
        messages = manager.getMessageHistory();
        metrics = manager.getMetrics();
        readyState = manager.getReadyState();
      }
    }, 100);

    return () => clearInterval(interval);
  });

  async function connect() {
    if (!manager || !mounted) return;

    educationalEvents = [];

    try {
      await manager.connect({
        service: selectedService,
        onEducationalEvent: (event) => {
          if (showEducationalEvents) {
            educationalEvents = [...educationalEvents, event];
          }
        }
      });
    } catch (error) {
      console.error('Connection failed:', error);
    }
  }

  function disconnect() {
    if (!manager) return;
    manager.disconnect();
  }

  function sendMessage() {
    if (!manager || !canSend) return;

    try {
      manager.send(messageInput);
      messageInput = '';
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  function clearMessages() {
    if (!manager) return;
    manager.clearMessageHistory();
    messages = [];
  }

  function formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  }

  function formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
</script>

<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
  <!-- Header -->
  <div>
    <h3 class="text-xl font-semibold text-gray-900">{title}</h3>
    <p class="text-gray-600 mt-1">{description}</p>
  </div>

  <!-- Connection Controls -->
  <div class="space-y-4">
    <div>
      <label for="service-select" class="block text-sm font-medium text-gray-700 mb-2">
        WebSocketサービス選択
      </label>
      <select
        id="service-select"
        bind:value={selectedService}
        disabled={isConnected}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {#each PUBLIC_WEBSOCKET_SERVICES as service (service.url)}
          <option value={service}>
            {service.name} - {service.description}
          </option>
        {/each}
      </select>
      <p class="mt-1 text-xs text-gray-500">
        信頼性: {selectedService.reliability} | レイテンシー: {selectedService.latency}
      </p>
    </div>

    <div class="flex items-center space-x-4">
      {#if canConnect}
        <button
          onclick={connect}
          disabled={!mounted}
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          接続
        </button>
      {:else if isConnected}
        <button
          onclick={disconnect}
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          切断
        </button>
      {/if}

      <div class="flex-1">
        <div class="flex items-center space-x-2">
          <span class="text-sm font-medium text-gray-700">接続状態:</span>
          <span class="px-3 py-1 rounded-full text-sm font-medium {connectionStatusColor}">
            {connectionState.status}
            {#if connectionState.status === 'connected' && connectionState.service}
              ({connectionState.service.name})
            {/if}
          </span>
          {#if readyState}
            <span class="text-xs text-gray-500">
              ReadyState: {readyState.state} ({readyState.label})
            </span>
          {/if}
        </div>
        {#if connectionState.lastError}
          <p class="text-xs text-red-600 mt-1">{connectionState.lastError}</p>
        {/if}
      </div>
    </div>
  </div>

  <!-- Message Input -->
  {#if isConnected}
    <div class="space-y-2">
      <label for="message-input" class="block text-sm font-medium text-gray-700">
        メッセージ送信 (Echo Test)
      </label>
      <div class="flex space-x-2">
        <input
          id="message-input"
          type="text"
          bind:value={messageInput}
          onkeydown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="メッセージを入力..."
          class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onclick={sendMessage}
          disabled={!canSend}
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          送信
        </button>
      </div>
    </div>
  {/if}

  <!-- Message History -->
  <div class="border border-gray-200 rounded-md">
    <div class="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
      <h4 class="text-sm font-medium text-gray-700">メッセージ履歴</h4>
      {#if messages.length > 0}
        <button onclick={clearMessages} class="text-xs text-gray-500 hover:text-gray-700">
          クリア
        </button>
      {/if}
    </div>
    <div class="h-64 overflow-y-auto p-4">
      {#if messages.length === 0}
        <p class="text-center text-gray-500 text-sm">メッセージがありません</p>
      {:else}
        <div class="space-y-2">
          {#each messages as message (message.id)}
            <div class="flex items-start space-x-2 text-sm">
              <span class="text-xs text-gray-500 font-mono">
                {formatTimestamp(message.timestamp)}
              </span>
              <span
                class="px-2 py-1 rounded text-xs font-medium {message.type === 'sent'
                  ? 'bg-blue-100 text-blue-700'
                  : message.type === 'received'
                    ? 'bg-green-100 text-green-700'
                    : message.type === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'}"
              >
                {message.type}
              </span>
              <span class="flex-1 font-mono text-gray-800">{message.content}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- Connection Metrics -->
  {#if showMetrics && isConnected}
    <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
      <h4 class="text-sm font-medium text-blue-900 mb-3">接続メトリクス</h4>
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
        <div>
          <span class="text-blue-700">送信:</span>
          <span class="font-mono font-medium">{metrics.messagesSent}</span>
        </div>
        <div>
          <span class="text-blue-700">受信:</span>
          <span class="font-mono font-medium">{metrics.messagesReceived}</span>
        </div>
        <div>
          <span class="text-blue-700">接続時間:</span>
          <span class="font-mono font-medium">{formatUptime(metrics.uptime)}</span>
        </div>
        <div>
          <span class="text-blue-700">平均遅延:</span>
          <span class="font-mono font-medium">{metrics.averageLatency.toFixed(0)}ms</span>
        </div>
        <div>
          <span class="text-blue-700">安定性:</span>
          <span class="font-mono font-medium">{metrics.stabilityScore}%</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Educational Events -->
  {#if showEducationalEvents && educationalEvents.length > 0}
    <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
      <h4 class="text-sm font-medium text-yellow-900 mb-3">🎓 WebSocketイベント学習ログ</h4>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        {#each educationalEvents as event (event.timestamp)}
          <div class="text-xs space-y-1 pb-2 border-b border-yellow-200 last:border-0">
            <div class="flex items-center space-x-2">
              <span class="font-mono text-gray-500">
                {formatTimestamp(event.timestamp)}
              </span>
              <span class="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded font-medium">
                {event.type}
              </span>
            </div>
            <p class="text-gray-700">{event.description}</p>
            {#if event.details && Object.keys(event.details).length > 0}
              <pre class="text-xs bg-white p-2 rounded font-mono overflow-x-auto">{JSON.stringify(
                  event.details,
                  null,
                  2
                )}</pre>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

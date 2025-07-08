<script lang="ts">
  import { PHASE2_LOCAL_SERVERS, type Phase2LocalServer } from '$lib/types/websocket';
  import { browser } from '$lib/utils/environment';

  interface Props {
    selectedServer?: Phase2LocalServer | null;
    onServerSelect?: (server: Phase2LocalServer) => void;
    showStatus?: boolean;
  }

  let { selectedServer = $bindable(null), onServerSelect, showStatus = true }: Props = $props();

  // Server status checking
  let serverStatuses = $state(new Map<string, 'checking' | 'running' | 'stopped' | 'error'>());

  // Check server status on mount
  $effect(() => {
    if (browser && showStatus) {
      checkAllServerStatuses();
    }
  });

  async function checkServerStatus(
    server: Phase2LocalServer
  ): Promise<'running' | 'stopped' | 'error'> {
    if (!browser) return 'stopped';

    try {
      serverStatuses.set(server.url, 'checking');

      // Try to connect to the WebSocket server
      const ws = new WebSocket(server.url, server.subprotocols);

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          ws.close();
          resolve('stopped');
        }, 3000);

        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          resolve('running');
        };

        ws.onerror = () => {
          clearTimeout(timeout);
          resolve('error');
        };
      });
    } catch {
      return 'error';
    }
  }

  async function checkAllServerStatuses() {
    for (const server of PHASE2_LOCAL_SERVERS) {
      const status = await checkServerStatus(server);
      serverStatuses.set(server.url, status);
    }
  }

  function handleServerSelect(server: Phase2LocalServer) {
    selectedServer = server;
    onServerSelect?.(server);
  }

  function getStatusIcon(server: Phase2LocalServer) {
    const status = serverStatuses.get(server.url);
    switch (status) {
      case 'checking':
        return '⏳';
      case 'running':
        return '🟢';
      case 'stopped':
        return '🔴';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  }

  function getStatusText(server: Phase2LocalServer) {
    const status = serverStatuses.get(server.url);
    switch (status) {
      case 'checking':
        return 'Checking...';
      case 'running':
        return 'Running';
      case 'stopped':
        return 'Stopped';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  }

  function getStatusClass(server: Phase2LocalServer) {
    const status = serverStatuses.get(server.url);
    switch (status) {
      case 'running':
        return 'text-green-600';
      case 'stopped':
        return 'text-red-600';
      case 'error':
        return 'text-red-500';
      case 'checking':
        return 'text-yellow-600';
      default:
        return 'text-gray-500';
    }
  }

  function getProtocolBadgeColor(protocol: string) {
    switch (protocol) {
      case 'basic':
        return 'bg-blue-100 text-blue-800';
      case 'graphql-ws':
        return 'bg-purple-100 text-purple-800';
      case 'mqtt':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<div class="bg-white border border-gray-200 rounded-lg p-6">
  <div class="flex items-center justify-between mb-6">
    <h3 class="text-lg font-semibold text-gray-900">Phase 2 Server Selection</h3>

    {#if showStatus}
      <button
        type="button"
        onclick={checkAllServerStatuses}
        class="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
      >
        🔄 Check Status
      </button>
    {/if}
  </div>

  <div class="space-y-4">
    {#each PHASE2_LOCAL_SERVERS as server (server.url)}
      <div
        class="border rounded-lg p-4 cursor-pointer transition-all {selectedServer?.url ===
        server.url
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}"
        onclick={() => handleServerSelect(server)}
        role="button"
        tabindex="0"
        onkeydown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleServerSelect(server);
          }
        }}
      >
        <!-- Server Header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <h4 class="font-medium text-gray-900">{server.name}</h4>
            <span
              class="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full {getProtocolBadgeColor(
                server.protocol
              )}"
            >
              {server.protocol.toUpperCase()}
            </span>
          </div>

          {#if showStatus}
            <div class="flex items-center space-x-2 text-sm {getStatusClass(server)}">
              <span>{getStatusIcon(server)}</span>
              <span>{getStatusText(server)}</span>
            </div>
          {/if}
        </div>

        <!-- Server URL -->
        <div class="mb-2">
          <code class="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
            {server.url}
          </code>
        </div>

        <!-- Server Description -->
        <p class="text-sm text-gray-600 mb-3">{server.description}</p>

        <!-- Subprotocols -->
        {#if server.subprotocols.length > 0}
          <div class="mb-3">
            <span class="text-xs font-medium text-gray-500 mb-1 block">Supported Subprotocols:</span
            >
            <div class="flex flex-wrap gap-1">
              {#each server.subprotocols as subprotocol (subprotocol)}
                <span
                  class="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
                >
                  {subprotocol}
                </span>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Features -->
        <div>
          <span class="text-xs font-medium text-gray-500 mb-1 block">Educational Features:</span>
          <div class="flex flex-wrap gap-1">
            {#each server.features as feature (feature)}
              <span
                class="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
              >
                {feature}
              </span>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Selected Server Info -->
  {#if selectedServer}
    <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 class="font-medium text-blue-900 mb-2">🎯 Selected Server</h4>
      <div class="text-sm text-blue-800">
        <p><strong>Name:</strong> {selectedServer.name}</p>
        <p><strong>URL:</strong> <code>{selectedServer.url}</code></p>
        <p><strong>Protocol:</strong> {selectedServer.protocol}</p>
        {#if selectedServer.subprotocols.length > 0}
          <p><strong>Subprotocols:</strong> {selectedServer.subprotocols.join(', ')}</p>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Docker Instructions -->
  <div class="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
    <h4 class="font-medium text-gray-900 mb-2">🐳 Docker Setup Instructions</h4>
    <div class="text-sm text-gray-700 space-y-1">
      <p>To start Phase 2 servers locally:</p>
      <code class="block bg-gray-800 text-green-400 p-2 rounded font-mono text-xs mt-2">
        cd ../websocket-learning-apps && docker-compose up -d
      </code>
      <p class="text-xs text-gray-600 mt-1">
        This will start all three WebSocket servers on ports 8080, 8081, and 8082
      </p>
    </div>
  </div>
</div>

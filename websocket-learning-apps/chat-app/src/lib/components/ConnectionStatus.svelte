<!-- Connection status indicator -->
<script lang="ts">
  import type { ConnectionState } from '$types/chat';

  let { connectionState }: { connectionState: ConnectionState } = $props();

  function getStatusColor(status: ConnectionState['status']) {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
      case 'reconnecting':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  function getStatusText(status: ConnectionState['status']) {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return `Reconnecting... (${connectionState.reconnectAttempts})`;
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
    }
  }

  function shouldPulse(status: ConnectionState['status']) {
    return status === 'connecting' || status === 'reconnecting';
  }
</script>

<div class="connection-status flex items-center space-x-2">
  <!-- Status dot -->
  <div
    class="w-3 h-3 rounded-full {getStatusColor(connectionState.status)} {shouldPulse(
      connectionState.status
    )
      ? 'animate-pulse'
      : ''}"
  ></div>

  <!-- Status text -->
  <span class="text-sm text-gray-600">
    {getStatusText(connectionState.status)}
  </span>

  <!-- Latency indicator -->
  {#if connectionState.status === 'connected' && connectionState.latency !== undefined}
    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
      {connectionState.latency}ms
    </span>
  {/if}

  <!-- Error message -->
  {#if connectionState.error}
    <div class="text-xs text-red-600 max-w-xs truncate" title={connectionState.error}>
      {connectionState.error}
    </div>
  {/if}
</div>

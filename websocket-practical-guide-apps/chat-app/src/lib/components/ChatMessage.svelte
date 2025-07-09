<!-- Individual chat message component -->
<script lang="ts">
  import type { ChatMessage } from '$types/chat';

  let { message, isOwn }: { message: ChatMessage; isOwn: boolean } = $props();

  function formatTime(timestamp: Date) {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatSystemMessage(content: string) {
    return content;
  }
</script>

<div
  class="message {isOwn ? 'message-own' : 'message-other'} {message.type === 'system'
    ? 'message-system'
    : ''}"
>
  {#if message.type === 'system'}
    <!-- System message -->
    <div class="text-center text-sm text-gray-500 py-2">
      <span class="bg-gray-100 px-3 py-1 rounded-full">
        {formatSystemMessage(message.content)}
      </span>
    </div>
  {:else}
    <!-- Regular message -->
    <div class="flex {isOwn ? 'justify-end' : 'justify-start'} mb-2">
      <div class="max-w-xs lg:max-w-md">
        {#if !isOwn}
          <div class="text-xs text-gray-600 mb-1 px-1">
            {message.username}
          </div>
        {/if}

        <div class="message-bubble {isOwn ? 'message-bubble-own' : 'message-bubble-other'}">
          <!-- Reply indicator -->
          {#if message.replyToId}
            <div class="text-xs text-gray-500 mb-1 pl-2 border-l-2 border-gray-300">
              Replying to message
            </div>
          {/if}

          <!-- Message content -->
          <div class="break-words">
            {message.content}
          </div>

          <!-- Timestamp and status -->
          <div class="flex items-center justify-between mt-1 text-xs opacity-75">
            <span>{formatTime(message.timestamp)}</span>
            {#if message.editedAt}
              <span class="text-gray-500">edited</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .message-bubble {
    @apply px-3 py-2 rounded-lg shadow-sm;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .message-bubble-own {
    @apply bg-blue-500 text-white;
  }

  .message-bubble-other {
    @apply bg-white text-gray-900 border border-gray-200;
  }

  .message-system {
    @apply my-2;
  }
</style>

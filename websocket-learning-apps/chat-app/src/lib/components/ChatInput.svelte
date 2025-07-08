<!-- Chat input component with typing indicators -->
<script lang="ts">
  let {
    onSendMessage,
    onStartTyping,
    onStopTyping,
    disabled = false
  }: {
    onSendMessage: (content: string) => void;
    onStartTyping: () => void;
    onStopTyping: () => void;
    disabled?: boolean;
  } = $props();

  let message = $state('');
  let inputElement: HTMLTextAreaElement;
  let typingTimer: NodeJS.Timeout | null = null;
  let isTyping = $state(false);

  // Auto-resize textarea
  $effect(() => {
    if (inputElement) {
      inputElement.style.height = 'auto';
      inputElement.style.height = inputElement.scrollHeight + 'px';
    }
  });

  function handleInput() {
    if (!disabled && message.trim()) {
      // Start typing indicator
      if (!isTyping) {
        isTyping = true;
        onStartTyping();
      }

      // Reset typing timer
      if (typingTimer) {
        clearTimeout(typingTimer);
      }

      typingTimer = setTimeout(() => {
        isTyping = false;
        onStopTyping();
      }, 1000);
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  function sendMessage() {
    if (disabled || !message.trim()) return;

    onSendMessage(message.trim());
    message = '';

    // Stop typing indicator
    if (isTyping) {
      isTyping = false;
      onStopTyping();
    }

    if (typingTimer) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }

    // Focus back on input
    inputElement?.focus();
  }

  function handlePaste(event: ClipboardEvent) {
    // Handle potential image paste or other rich content
    const items = event.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          event.preventDefault();
          // TODO: Handle image upload
          console.log('Image paste detected - not implemented yet');
          return;
        }
      }
    }
  }
</script>

<div class="chat-input flex items-end space-x-3">
  <!-- Message input -->
  <div class="flex-1 relative">
    <textarea
      bind:this={inputElement}
      bind:value={message}
      oninput={handleInput}
      onkeydown={handleKeyDown}
      onpaste={handlePaste}
      placeholder={disabled ? 'Connecting...' : 'Type a message...'}
      {disabled}
      class="w-full resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32 disabled:bg-gray-100 disabled:cursor-not-allowed"
      rows="1"
    ></textarea>

    <!-- Character count (optional) -->
    {#if message.length > 500}
      <div class="absolute -top-6 right-2 text-xs text-gray-500">
        {message.length}/1000
      </div>
    {/if}
  </div>

  <!-- Send button -->
  <button
    onclick={sendMessage}
    disabled={disabled || !message.trim()}
    aria-label="Send message"
    class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
    </svg>
  </button>
</div>

<style>
  .chat-input textarea {
    min-height: 40px;
    line-height: 1.5;
  }
</style>

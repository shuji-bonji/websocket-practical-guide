<!-- Typing indicator component -->
<script lang="ts">
  import type { TypingIndicator } from '$types/chat';

  let { users }: { users: TypingIndicator[] } = $props();

  function formatTypingText(typingUsers: TypingIndicator[]) {
    if (typingUsers.length === 0) return '';

    if (typingUsers.length === 1) {
      return `${typingUsers[0].username} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`;
    } else {
      return `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing...`;
    }
  }
</script>

{#if users.length > 0}
  <div class="typing-indicator flex items-center space-x-2 text-sm text-gray-500 px-4 py-2">
    <!-- Animated dots -->
    <div class="flex space-x-1">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>

    <!-- Typing text -->
    <span>{formatTypingText(users)}</span>
  </div>
{/if}

<style>
  .typing-dot {
    @apply w-2 h-2 bg-gray-400 rounded-full;
    animation: typing 1.4s infinite ease-in-out;
  }

  .typing-dot:nth-child(1) {
    animation-delay: -0.32s;
  }

  .typing-dot:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes typing {
    0%,
    80%,
    100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
</style>

<!-- User list sidebar component -->
<script lang="ts">
  import type { User } from '$types/chat';

  let {
    members,
    currentUser,
    onClose
  }: {
    members: User[];
    currentUser: User | null;
    onClose: () => void;
  } = $props();

  function formatLastSeen(lastSeen: Date) {
    const now = new Date();
    const diff = now.getTime() - new Date(lastSeen).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function getInitials(username: string) {
    return username.substring(0, 2).toUpperCase();
  }
</script>

<div class="user-list h-full flex flex-col">
  <!-- Header -->
  <div class="flex items-center justify-between p-4 border-b border-gray-200">
    <h3 class="text-lg font-semibold text-gray-900">
      Members ({members.length})
    </h3>
    <button
      onclick={onClose}
      aria-label="Close user list"
      class="text-gray-500 hover:text-gray-700 focus:outline-none"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>

  <!-- Members list -->
  <div class="flex-1 overflow-y-auto">
    {#each members as member (member.id)}
      <div
        class="user-item p-3 hover:bg-gray-50 {member.id === currentUser?.id ? 'bg-blue-50' : ''}"
      >
        <div class="flex items-center space-x-3">
          <!-- Avatar -->
          <div class="relative">
            {#if member.avatar}
              <img
                src={member.avatar}
                alt={member.username}
                class="w-8 h-8 rounded-full object-cover"
              />
            {:else}
              <div
                class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700"
              >
                {getInitials(member.username)}
              </div>
            {/if}

            <!-- Online status -->
            <div
              class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white {member.isOnline
                ? 'bg-green-500'
                : 'bg-gray-400'}"
            ></div>
          </div>

          <!-- User info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium text-gray-900 truncate">
                {member.username}
              </span>
              {#if member.id === currentUser?.id}
                <span class="text-xs text-blue-600 font-medium">You</span>
              {/if}
            </div>

            <div class="text-xs text-gray-500">
              {#if member.isOnline}
                <span class="text-green-600">Online</span>
              {:else}
                Last seen {formatLastSeen(member.lastSeen)}
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/each}

    <!-- Empty state -->
    {#if members.length === 0}
      <div class="p-8 text-center text-gray-500">
        <svg
          class="w-12 h-12 mx-auto mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
        <p class="text-sm">No members online</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .user-item {
    transition: background-color 0.2s ease;
  }
</style>

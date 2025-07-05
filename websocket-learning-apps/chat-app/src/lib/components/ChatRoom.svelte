<!-- Main chat room component -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { ChatStore } from '$stores/chat.svelte';
	import ChatMessage from './ChatMessage.svelte';
	import ChatInput from './ChatInput.svelte';
	import TypingIndicator from './TypingIndicator.svelte';
	import ConnectionStatus from './ConnectionStatus.svelte';
	import UserList from './UserList.svelte';
	// import type { User } from '$types/chat'; // Type not used in this component

	let { token, wsUrl }: { token: string; wsUrl?: string } = $props();

	const chatStore = new ChatStore();
	let messagesContainer: HTMLElement;
	let showUserList = $state(false);

	// Auto-scroll to bottom when new messages arrive
	$effect(() => {
		if (chatStore.messages.length > 0 && messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	});

	// Connect to chat when component mounts
	onMount(() => {
		chatStore.connect(token, wsUrl);

		// Cleanup on unmount
		return () => {
			chatStore.destroy();
		};
	});

	function handleSendMessage(content: string) {
		chatStore.sendMessage(content);
	}

	function handleStartTyping() {
		chatStore.startTyping();
	}

	function handleStopTyping() {
		chatStore.stopTyping();
	}

	function toggleUserList() {
		showUserList = !showUserList;
	}
</script>

<div class="chat-room h-screen flex flex-col bg-gray-50">
	<!-- Header -->
	<header class="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
		<div class="flex items-center space-x-3">
			<h1 class="text-xl font-semibold text-gray-900">General Chat</h1>
			<ConnectionStatus connectionState={chatStore.connectionState} />
		</div>

		<div class="flex items-center space-x-3">
			<button
				onclick={toggleUserList}
				class="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
					/>
				</svg>
				<span>{chatStore.memberCount} members</span>
			</button>

			<div class="text-xs text-gray-500">
				{#if chatStore.connectionState.latency}
					{chatStore.connectionState.latency}ms
				{/if}
			</div>
		</div>
	</header>

	<!-- Main content -->
	<div class="flex-1 flex overflow-hidden">
		<!-- Messages area -->
		<div class="flex-1 flex flex-col">
			<!-- Messages container -->
			<div bind:this={messagesContainer} class="flex-1 overflow-y-auto p-4 space-y-4">
				{#each chatStore.messages as message (message.id)}
					<ChatMessage {message} isOwn={message.userId === chatStore.currentUser?.id} />
				{/each}

				<!-- Typing indicator -->
				{#if chatStore.typingUsers.length > 0}
					<TypingIndicator users={chatStore.typingUsers} />
				{/if}
			</div>

			<!-- Input area -->
			<div class="border-t border-gray-200 p-4">
				<ChatInput
					onSendMessage={handleSendMessage}
					onStartTyping={handleStartTyping}
					onStopTyping={handleStopTyping}
					disabled={!chatStore.canSend}
				/>
			</div>
		</div>

		<!-- User list sidebar -->
		{#if showUserList}
			<div class="w-64 bg-white border-l border-gray-200">
				<UserList
					members={chatStore.roomMembers}
					currentUser={chatStore.currentUser}
					onClose={() => (showUserList = false)}
				/>
			</div>
		{/if}
	</div>

	<!-- Error display -->
	{#if chatStore.error}
		<div class="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg">
			{chatStore.error}
		</div>
	{/if}
</div>

<style>
	.chat-room {
		max-height: 100vh;
	}
</style>

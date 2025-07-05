<!-- Root layout component -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { AuthStore } from '$lib/stores/auth.svelte';

	const authStore = new AuthStore();

	// Make auth store available globally
	if (typeof window !== 'undefined') {
		// @ts-expect-error - Global authStore assignment for debugging
		window.authStore = authStore;
	}

	onMount(() => {
		authStore.init();
	});
</script>

<main class="min-h-screen bg-gray-50">
	<slot />
</main>

<style>
	@import 'tailwindcss/base';
	@import 'tailwindcss/components';
	@import 'tailwindcss/utilities';

	:global(html) {
		font-family:
			-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(*, *::before, *::after) {
		box-sizing: inherit;
	}
</style>

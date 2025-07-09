<!-- Root layout component -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { AuthStore } from '$lib/stores/auth.svelte';
  import {
    registerServiceWorker,
    listenForInstallPrompt,
    requestNotificationPermission
  } from '$lib/pwa/service-worker';
  import PWAInstallPrompt from '$lib/components/PWAInstallPrompt.svelte';
  import PWAUpdateNotification from '$lib/components/PWAUpdateNotification.svelte';
  import OfflineIndicator from '$lib/components/OfflineIndicator.svelte';

  const authStore = new AuthStore();

  // Make auth store available globally
  if (typeof window !== 'undefined') {
    // @ts-expect-error - Global authStore assignment for debugging
    window.authStore = authStore;
  }

  onMount(async () => {
    // Initialize auth store
    authStore.init();

    // Initialize PWA features
    try {
      // Register service worker
      await registerServiceWorker();

      // Listen for install prompt
      listenForInstallPrompt();

      // Request notification permission for chat notifications
      // (Only if user is authenticated)
      if (authStore.isAuthenticated) {
        await requestNotificationPermission();
      }
    } catch (error) {
      console.error('[PWA] Initialization failed:', error);
    }
  });
</script>

<main class="min-h-screen bg-gray-50">
  <slot />

  <!-- PWA Components -->
  <PWAInstallPrompt />
  <PWAUpdateNotification />
  <OfflineIndicator />
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

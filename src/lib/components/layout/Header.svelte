<script lang="ts">
  import { progressStore } from '$lib/stores/progress';
  import { themeStore } from '$lib/stores/theme.svelte';
  import { href } from '$lib/utils/paths';

  interface Props {
    sidebarOpen?: boolean;
  }

  let { sidebarOpen = $bindable(false) }: Props = $props();

  let progress = $derived($progressStore);
  let overallPercentage = $derived(
    Math.round((progress.completedHours / progress.totalHours) * 100)
  );

  let theme = $derived(themeStore.theme);
  let isDark = $derived(themeStore.isDark);
</script>

<header
  class="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors"
>
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Left side: Logo + Mobile Menu Button -->
      <div class="flex items-center">
        <!-- Mobile menu button -->
        <button
          type="button"
          class="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden transition-colors"
          aria-controls="mobile-menu"
          aria-expanded="false"
          onclick={() => (sidebarOpen = !sidebarOpen)}
        >
          <span class="sr-only">メニューを開く</span>
          <!-- Hamburger icon -->
          <svg
            class="block h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        <!-- Logo -->
        <div class="flex items-center ml-4 lg:ml-0">
          <a href={href('/')} class="flex items-center">
            <div class="flex items-center space-x-2">
              <!-- WebSocket icon -->
              <div
                class="w-8 h-8 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div class="hidden sm:block">
                <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">
                  WebSocket 実践ガイド
                </h1>
                <p class="text-xs text-gray-500 dark:text-gray-400">リアルタイムWeb開発マスター</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      <!-- Right side: Progress + Actions -->
      <div class="flex items-center space-x-4">
        <!-- Progress indicator -->
        <div class="hidden md:flex items-center space-x-3">
          <div class="text-right">
            <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
              {progress.completedHours}h / {progress.totalHours}h
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              Phase {progress.completedPhases + 1}/4
            </div>
          </div>

          <!-- Progress bar -->
          <div class="w-24 progress-bar">
            <div class="progress-fill" style="width: {overallPercentage}%"></div>
          </div>

          <div class="text-sm font-medium text-primary-600 dark:text-primary-400">
            {overallPercentage}%
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center space-x-2">
          <!-- GitHub link -->
          <a
            href="https://github.com/shuji-bonji/websocket-practical-guide"
            target="_blank"
            rel="noopener noreferrer"
            class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            title="GitHub"
            aria-label="GitHubリポジトリを開く"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"
              />
            </svg>
          </a>

          <!-- Dark Mode Toggle -->
          <button
            type="button"
            class="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
            title={theme === 'system' ? 'システム設定' : isDark ? 'ダークモード' : 'ライトモード'}
            aria-label="テーマを切り替える"
            onclick={() => themeStore.toggle()}
          >
            {#if theme === 'system'}
              <!-- System icon -->
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            {:else if isDark}
              <!-- Moon icon -->
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            {:else}
              <!-- Sun icon -->
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            {/if}
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile progress bar -->
    <div class="md:hidden pb-3">
      <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
        <span>学習進捗</span>
        <span>{progress.completedHours}h / {progress.totalHours}h ({overallPercentage}%)</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: {overallPercentage}%"></div>
      </div>
    </div>
  </div>
</header>

<style>
  /* カスタムスタイル（必要に応じて） */
</style>

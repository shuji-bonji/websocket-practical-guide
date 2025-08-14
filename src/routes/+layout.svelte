<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/layout/Header.svelte';
  import Sidebar from '$lib/components/layout/Sidebar.svelte';
  import { highlightAll } from '$lib/utils/prism';
  import { href } from '$lib/utils/paths';
  import { onMount } from 'svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
  let sidebarOpen = $state(false);

  // ページ変更時にモバイルサイドバーを閉じる
  $effect(() => {
    const handleRouteChange = () => {
      sidebarOpen = false;
    };

    // SvelteKit の navigation API を利用
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleRouteChange);
      return () => window.removeEventListener('popstate', handleRouteChange);
    }
  });

  // GitHub Pages SPA fallback handling
  onMount(() => {
    // Handle redirect from 404.html
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    if (redirect) {
      const redirectPath = decodeURIComponent(redirect);
      window.history.replaceState({}, '', redirectPath);
    }
  });

  // Prism.js syntax highlighting initialization
  onMount(() => {
    // Highlight all code blocks on initial load
    highlightAll();

    // Re-highlight on route changes
    const observer = new MutationObserver(() => {
      setTimeout(() => highlightAll(), 100);
    });

    const mainContent = document.querySelector('main');
    if (mainContent) {
      observer.observe(mainContent, {
        childList: true,
        subtree: true
      });
    }

    return () => observer.disconnect();
  });
</script>

<svelte:head>
  <meta name="theme-color" content="#2563eb" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="WebSocket 実践ガイド" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950">
  <!-- Header -->
  <Header bind:sidebarOpen />

  <!-- Sidebar -->
  <Sidebar bind:open={sidebarOpen} />

  <!-- Main content -->
  <div class="lg:pl-80">
    <main class="flex-1 relative z-0 overflow-y-auto focus:outline-none">
      <!-- Page content -->
      <div class="py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Layout content for page content -->
          {@render children?.()}
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- About -->
          <div>
            <h3
              class="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wide uppercase"
            >
              WebSocket 実践ガイド について
            </h3>
            <p class="mt-4 text-base text-gray-600 dark:text-gray-400">
              ブラウザ標準WebSocket APIを中心とした リアルタイムWebアプリケーション実践ガイドです。
              TypeScript/JavaScript中級者を対象とした 50-60時間の構造化カリキュラムを提供します。
            </p>
          </div>

          <!-- Quick Links -->
          <div>
            <h3
              class="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wide uppercase"
            >
              クイックリンク
            </h3>
            <div class="mt-4 space-y-4">
              <a
                href={href('/')}
                class="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 block"
              >
                ホーム
              </a>
              <a
                href={href('/curriculum')}
                class="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 block"
              >
                カリキュラム概要
              </a>
              <a
                href={href('/table-of-contents')}
                class="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 block"
              >
                学習目次
              </a>
              <a
                href={href('/resources')}
                class="text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 block"
              >
                学習リソース
              </a>
            </div>
          </div>

          <!-- Technology -->
          <div>
            <h3
              class="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-wide uppercase"
            >
              技術スタック
            </h3>
            <div class="mt-4 space-y-4">
              <div class="text-base text-gray-600 dark:text-gray-400">
                <strong>フロントエンド:</strong> SvelteKit + TypeScript
              </div>
              <div class="text-base text-gray-600 dark:text-gray-400">
                <strong>スタイリング:</strong> TailwindCSS
              </div>
              <div class="text-base text-gray-600 dark:text-gray-400">
                <strong>ドキュメント:</strong> MDsveX
              </div>
              <div class="text-base text-gray-600 dark:text-gray-400">
                <strong>ターゲット:</strong> PWA対応のリアルタイムアプリ
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom bar -->
        <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <div class="flex items-center space-x-4">
              <p class="text-base text-gray-600">
                © WebSocket 実践ガイド. 学習目的で作成されました。
              </p>
            </div>

            <div class="mt-4 md:mt-0 flex items-center space-x-6">
              <a
                href="https://github.com/shuji-bonji/websocket-practical-guide"
                target="_blank"
                rel="noopener noreferrer"
                class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <span class="sr-only">GitHub</span>
                <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"
                  />
                </svg>
              </a>

              <div class="text-sm text-gray-500 dark:text-gray-400">
                Made with SvelteKit & TailwindCSS
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</div>

<style>
  /* Global styles for the learning site */
  :global(body) {
    font-family:
      'Inter',
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      'Segoe UI',
      Roboto,
      sans-serif;
  }

  /* Smooth scrolling for anchor links */
  :global(html) {
    scroll-behavior: smooth;
  }

  /* Focus styles for accessibility */
  :global(a:focus),
  :global(button:focus) {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }

  /* Print styles */
  @media print {
    :global(.no-print) {
      display: none !important;
    }
  }
</style>

<script>
  import { page } from '$app/stores';

  let { children } = $props();

  const examples = [
    {
      path: '/phase1/introduction/use-cases',
      title: '概要・全体像',
      icon: '🗺️',
      description: '11カテゴリーの俯瞰図'
    },
    {
      path: '/phase1/introduction/use-cases/examples/chat',
      title: 'リアルタイム通信',
      icon: '💬',
      description: 'チャット・メッセージング'
    },
    {
      path: '/phase1/introduction/use-cases/examples/collaboration',
      title: '協働作業',
      icon: '🤝',
      description: 'ドキュメント共同編集'
    },
    {
      path: '/phase1/introduction/use-cases/examples/data-streaming',
      title: 'データ配信',
      icon: '📊',
      description: 'ストリーミング・配信'
    },
    {
      path: '/phase1/introduction/use-cases/examples/finance-medical',
      title: '金融・医療',
      icon: '💹',
      description: '高可用性システム'
    },
    {
      path: '/phase1/introduction/use-cases/examples/iot',
      title: 'IoT・産業',
      icon: '🏭',
      description: 'センサーネットワーク'
    },
    {
      path: '/phase1/introduction/use-cases/examples/notifications',
      title: '通知システム',
      icon: '🔔',
      description: 'プッシュ通知・アラート'
    },
    {
      path: '/phase1/introduction/use-cases/examples/vr-metaverse',
      title: 'VR・ゲーム',
      icon: '🎮',
      description: 'エンターテイメント'
    },
    {
      path: '/phase1/introduction/use-cases/examples/pwa',
      title: 'PWA統合',
      icon: '📱',
      description: 'モバイル・オフライン対応'
    },
    {
      path: '/phase1/introduction/use-cases/examples/security',
      title: 'セキュリティ',
      icon: '🔐',
      description: '認証・暗号化'
    },
    {
      path: '/phase1/introduction/use-cases/examples/backend',
      title: 'バックエンド',
      icon: '⚙️',
      description: 'サーバーサイド実装'
    },
    {
      path: '/phase1/introduction/use-cases/examples/simulation',
      title: 'シミュレーション',
      icon: '🔄',
      description: 'リアルタイム計算'
    }
  ];

  let currentPath = $state($page.url.pathname);
  let sidebarOpen = $state(false);

  // パスに基づいて現在のセクションを判定
  let isExamplePage = $derived(currentPath.includes('/examples/'));

  // ページ変更時にサイドバーを閉じる
  $effect(() => {
    currentPath = $page.url.pathname;
    sidebarOpen = false;
  });
</script>

<!-- フローティング付箋アイコン -->
<button
  class="fixed top-20 right-4 z-50 bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-4 py-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 flex items-center gap-2"
  onclick={() => (sidebarOpen = !sidebarOpen)}
  title="WebSocket利用例一覧"
>
  <span class="text-lg">📋</span>
  <span class="text-sm font-medium">WebSocket利用例一覧</span>
</button>

<!-- オーバーレイ -->
{#if sidebarOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
    role="button"
    tabindex="0"
    onclick={() => (sidebarOpen = false)}
    onkeydown={(e) => e.key === 'Escape' && (sidebarOpen = false)}
    aria-label="サイドバーを閉じる"
  ></div>
{/if}

<!-- スライド式サイドバー -->
<aside
  class="fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 bg-white shadow-xl border-l border-gray-200 overflow-y-auto z-50 transform transition-transform duration-300 {sidebarOpen
    ? 'translate-x-0'
    : 'translate-x-full'}"
>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900">📋 WebSocket利用例</h2>
      <button
        class="text-gray-500 hover:text-gray-700 p-1"
        onclick={() => (sidebarOpen = false)}
        aria-label="サイドバーを閉じる"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>

    <nav class="space-y-2">
      {#each examples as example (example.path)}
        <a
          href={example.path}
          class="block px-4 py-3 rounded-lg transition-colors duration-200 {currentPath ===
          example.path
            ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-700'
            : 'hover:bg-gray-50 text-gray-700'}"
        >
          <div class="flex items-start">
            <span class="text-xl mr-3 mt-0.5">{example.icon}</span>
            <div>
              <div class="font-medium">{example.title}</div>
              <div class="text-sm text-gray-500 mt-1">{example.description}</div>
            </div>
          </div>
        </a>
      {/each}
    </nav>

    {#if isExamplePage}
      <div class="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 class="font-semibold text-blue-900 mb-2">💡 学習のヒント</h3>
        <p class="text-sm text-blue-800">
          各実装例には詳細なアーキテクチャ図とコード例が含まれています。概要ページと合わせて学習することで、より深い理解が得られます。
        </p>
      </div>
    {/if}
  </div>
</aside>

<!-- メインコンテンツ -->
<main class="w-full overflow-y-auto">
  <div class="mx-auto">
    {@render children()}
  </div>
</main>

<style>
  /* スクロールバーのスタイリング */
  aside {
    scrollbar-width: thin;
    scrollbar-color: #d1d5db #f9fafb;
  }

  aside::-webkit-scrollbar {
    width: 6px;
  }

  aside::-webkit-scrollbar-track {
    background: #f9fafb;
  }

  aside::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
  }

  aside::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }

  /* メインコンテンツのオーバーフロー設定 */
  main {
    overflow: visible !important;
  }

  /* メインコンテンツ内のセクションカードのシャドウを確実に表示 */
  :global(.lesson-content section.floating-card) {
    position: relative;
    z-index: 1;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
  }

  /* lesson-contentのオーバーフロー設定のみ（幅は変更しない） */
  :global(.lesson-content) {
    overflow: visible !important;
  }
</style>

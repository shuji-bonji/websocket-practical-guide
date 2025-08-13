<script lang="ts">
  import type { MermaidConfig } from '$lib/types/mermaid';
  import { onMount } from 'svelte';
  import Portal from './Portal.svelte';

  interface Props {
    chart: string;
    id?: string;
  }

  let { chart, id = `mermaid-${Math.random().toString(36).substring(2, 11)}` }: Props = $props();

  // リアクティブな状態管理
  let svgContent = $state<string>('');
  let errorMessage = $state<string>('');
  let isLoading = $state<boolean>(true);
  let mermaid = $state<{
    initialize: (config: Record<string, unknown>) => void;
    render: (id: string, chart: string) => Promise<{ svg: string }>;
  } | null>(null);
  let isBrowser = $state(false);

  // Lightbox状態管理
  let isLightboxOpen = $state(false);
  let lightboxContainer = $state<HTMLDivElement>();

  onMount(async () => {
    // TypeScript型安全なMermaid設定
    const config: MermaidConfig = {
      startOnLoad: false,
      theme: 'dark',
      fontSize: 16,
      themeVariables: {
        darkMode: true,
        background: '#1f2937',
        primaryColor: '#60a5fa',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#ffffff',
        lineColor: '#ffffff',
        secondaryColor: '#374151',
        tertiaryColor: '#4b5563',
        mainBkg: '#1f2937',
        secondBkg: '#374151',
        tertiaryBkg: '#4b5563',
        fontSize: '16px'
      },
      mindmap: {
        useMaxWidth: true,
        padding: 20
      },
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        rankSpacing: 80,
        nodeSpacing: 50
      },
      graph: {
        useMaxWidth: false,
        rankdir: 'TB'
      },
      sequence: {
        useMaxWidth: false,
        diagramMarginX: 50,
        diagramMarginY: 30,
        actorBorder: '#6b7280',
        actorTextColor: '#f9fafb',
        actorLineColor: '#9ca3af',
        signalColor: '#f9fafb',
        signalTextColor: '#f9fafb',
        labelBoxBkgColor: '#4b5563',
        labelBoxBorderColor: '#6b7280',
        labelTextColor: '#f9fafb',
        loopTextColor: '#f9fafb',
        noteBorderColor: '#6b7280',
        noteBkgColor: '#374151',
        noteTextColor: '#f9fafb'
      }
    };

    // ブラウザ環境を確認
    isBrowser = typeof window !== 'undefined';
    if (!isBrowser) {
      isLoading = false;
      return;
    }

    try {
      // 動的インポートでSSRエラーを回避
      const mermaidModule = await import('mermaid');
      mermaid = mermaidModule.default;

      // ✅ 型安全なMermaid初期化（eslint-disableもas anyも不要）
      mermaid.initialize(config);

      // チャートをレンダリング
      const { svg } = await mermaid.render(id, chart);
      svgContent = svg;
      errorMessage = '';
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      svgContent = '';
      errorMessage = `図表の表示に失敗しました: ${error}`;
    } finally {
      isLoading = false;
    }
  });

  // チャートが変更された時の再レンダリング (無限ループ防止)
  $effect(() => {
    if (chart && isBrowser && mermaid) {
      renderChart();
    }
  });

  async function renderChart() {
    if (!isBrowser || !mermaid) return;

    try {
      isLoading = true;
      const { svg } = await mermaid.render(`${id}-${Date.now()}`, chart);
      svgContent = svg;
      errorMessage = '';
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      svgContent = '';
      errorMessage = `図表の表示に失敗しました: ${error}`;
    } finally {
      isLoading = false;
    }
  }

  // Lightbox関数
  function openLightbox() {
    isLightboxOpen = true;
    // bodyのスクロールを無効化
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    isLightboxOpen = false;
    // bodyのスクロールを復元
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  function handleLightboxClick(event: MouseEvent) {
    // 背景クリックで閉じる
    if (event.target === lightboxContainer) {
      closeLightbox();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isLightboxOpen) {
      closeLightbox();
    }
  }

  // ESCキーで閉じる
  $effect(() => {
    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeydown);
      return () => window.removeEventListener('keydown', handleKeydown);
    }
  });
</script>

<!-- ✅ Svelte 5推奨：条件分岐とディレクティブ使用 -->
<div class="mermaid-container my-6 flex justify-center relative">
  {#if isLoading}
    <div class="flex items-center justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span class="ml-2 text-gray-600">図表を生成中...</span>
    </div>
  {:else if errorMessage}
    <p class="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
      {errorMessage}
    </p>
  {:else if svgContent}
    <div class="relative group">
      <!-- {@html} ディレクティブでSVGを安全にレンダリング -->
      <div class="mermaid-svg-content">
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html svgContent}
      </div>

      <!-- 拡大ボタン -->
      <button
        onclick={openLightbox}
        class="absolute top-3 right-3 bg-gray-600 bg-opacity-70 text-gray-200 p-1 rounded
               opacity-50 hover:opacity-90 transition-opacity duration-200
               hover:bg-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
        style="width: 28px; height: 28px;"
        title="図表を拡大"
        aria-label="図表を拡大表示"
      >
        <svg
          style="width: 20px; height: 20px;"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
          />
        </svg>
      </button>
    </div>
  {/if}
</div>

<!-- Lightbox with Portal -->
{#if isLightboxOpen}
  <Portal target="body">
    <div
      bind:this={lightboxContainer}
      onclick={handleLightboxClick}
      onkeydown={handleKeydown}
      class="mermaid-lightbox-fullscreen"
      role="dialog"
      aria-modal="true"
      aria-label="拡大表示された図表"
      tabindex="-1"
    >
      <!-- コンテンツコンテナ -->
      <div class="mermaid-lightbox-container">
        <div class="mermaid-lightbox-content">
          <!-- 閉じるボタン -->
          <button
            onclick={closeLightbox}
            class="mermaid-lightbox-close"
            title="閉じる"
            aria-label="ライトボックスを閉じる"
          >
            <svg
              style="width: 24px; height: 24px;"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- 拡大されたMermaid図 -->
          <div class="lightbox-mermaid-svg">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html svgContent}
          </div>
        </div>
      </div>
    </div>
  </Portal>
{/if}

<style>
  /* Mermaid図のみにスタイルを適用 */
  :global(.mermaid-svg-content svg) {
    width: auto;
    max-width: 100%;
    height: auto;
    min-height: 400px;
    background-color: #1f2937;
    border-radius: 8px;
    padding: 24px;
    display: block;
    margin: 0 auto;
  }

  /* Lightbox フルスクリーンオーバーレイ */
  :global(.mermaid-lightbox-fullscreen) {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background-color: rgba(0, 0, 0, 0.9) !important;
    z-index: 10000 !important;
    overflow-y: auto !important;
  }

  /* Lightbox コンテナ */
  :global(.mermaid-lightbox-container) {
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 4rem 1rem;
  }

  /* Lightbox コンテンツボックス */
  :global(.mermaid-lightbox-content) {
    position: relative;
    width: 90vw;
    max-width: 90vw;
    background-color: #1f2937;
    border-radius: 0.5rem;
    padding: 1.5rem;
  }

  /* 閉じるボタン */
  :global(.mermaid-lightbox-close) {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 40px;
    height: 40px;
    padding: 0.5rem;
    background-color: rgba(55, 65, 81, 0.8);
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s;
    z-index: 10;
  }

  :global(.mermaid-lightbox-close:hover) {
    background-color: rgba(75, 85, 99, 1);
  }

  :global(.mermaid-lightbox-close:focus) {
    outline: none;
    box-shadow: 0 0 0 2px #3b82f6;
  }

  /* Lightbox内のMermaid図のスタイル */
  :global(.lightbox-mermaid-svg) {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  :global(.lightbox-mermaid-svg svg) {
    max-width: none;
    width: auto;
    height: auto;
    background-color: #1f2937;
    border-radius: 8px;
    padding: 24px;
    min-width: 600px;
  }

  /* スモールスクリーンでの最小幅調整 */
  @media (max-width: 768px) {
    :global(.lightbox-mermaid-svg svg) {
      min-width: auto;
      width: 100%;
    }
  }

  /* Mindmapのフォントウェイトのみを調整（色は触らない） */
  :global(.mermaid-container .mindmap-node text) {
    font-weight: 400 !important;
  }

  /* ルートノードは少し太めに */
  :global(.mermaid-container .section-root text) {
    font-weight: 500 !important;
  }

  :global(.mermaid-container .node rect) {
    fill: #374151;
    stroke: #6b7280;
    stroke-width: 2px;
  }

  :global(.mermaid-container .node .label) {
    color: #f9fafb;
    font-family: 'Inter', sans-serif;
  }

  :global(.mermaid-container .edgePath .path) {
    stroke: #9ca3af;
    stroke-width: 2px;
  }

  :global(.mermaid-container .edgeLabel) {
    background-color: #4b5563;
    color: #f9fafb;
  }

  :global(.mermaid-container .actor) {
    fill: #374151;
    stroke: #6b7280;
  }

  :global(.mermaid-container .actor-line) {
    stroke: #9ca3af;
  }

  :global(.mermaid-container .messageLine0) {
    stroke: #60a5fa;
    stroke-width: 2px;
  }

  :global(.mermaid-container .messageLine1) {
    stroke: #10b981;
    stroke-width: 2px;
  }

  :global(.mermaid-container .messageText) {
    fill: #f9fafb;
    font-family: 'Inter', sans-serif;
  }

  :global(.mermaid-container .loopText) {
    fill: #f9fafb;
  }

  :global(.mermaid-container .noteText) {
    fill: #f9fafb;
  }

  /* ローディングアニメーション */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>

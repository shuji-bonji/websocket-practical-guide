<script lang="ts">
  import { onMount } from 'svelte';
  import Portal from './Portal.svelte';
  import type { MermaidConfig } from '$lib/types/mermaid';

  interface Props {
    chart: string;
    id?: string;
    priority?: 'high' | 'normal' | 'low';
  }

  let {
    chart,
    id = `mermaid-${Math.random().toString(36).substring(2, 11)}`,
    priority = 'normal'
  }: Props = $props();

  let svgContent = $state<string>('');
  let errorMessage = $state<string>('');
  let isLoading = $state<boolean>(true);
  let isVisible = $state<boolean>(false);
  let container = $state<HTMLDivElement>();

  // Lightbox状態管理
  let isLightboxOpen = $state(false);
  let lightboxContainer = $state<HTMLDivElement>();

  // Shared mermaid instance
  let mermaidInstance = $state<{
    initialize: (config: Record<string, unknown>) => void;
    render: (id: string, chart: string) => Promise<{ svg: string }>;
  } | null>(null);

  // Global initialization promise for Safari optimization
  if (typeof window !== 'undefined' && !window.__mermaidInitPromise) {
    window.__mermaidInitPromise = import('mermaid').then((module) => {
      const mermaid = module.default;

      const config: MermaidConfig = {
        startOnLoad: false,
        theme: 'dark',
        fontSize: 16,
        securityLevel: 'loose',
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
          htmlLabels: false, // Disable for better Safari performance
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
          diagramMarginY: 30
        }
      };

      mermaid.initialize(config);
      return mermaid;
    });
  }

  async function renderChart() {
    if (!isVisible || !chart) return;

    try {
      // Use shared initialization promise
      if (typeof window !== 'undefined' && window.__mermaidInitPromise) {
        mermaidInstance = await window.__mermaidInitPromise;
      } else {
        isLoading = false;
        return;
      }

      // Render with delay based on priority for Safari optimization
      const delay = priority === 'high' ? 0 : priority === 'normal' ? 100 : 200;

      await new Promise((resolve) => setTimeout(resolve, delay));

      const { svg } = await mermaidInstance.render(`${id}-${Date.now()}`, chart);
      svgContent = svg;
      errorMessage = '';
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      errorMessage = `図表の表示に失敗しました`;
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    if (typeof window === 'undefined') {
      isLoading = false;
      return;
    }

    // Use Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            isVisible = true;
            observer.disconnect();
            renderChart();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before visible
        threshold: 0.01
      }
    );

    if (container) {
      observer.observe(container);
    }

    // Render immediately for high priority items
    if (priority === 'high') {
      isVisible = true;
      renderChart();
    }

    return () => {
      observer.disconnect();
    };
  });

  // Lightbox関数
  function openLightbox() {
    isLightboxOpen = true;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    isLightboxOpen = false;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  function handleLightboxClick(event: MouseEvent) {
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

<div bind:this={container} class="mermaid-container my-6 flex justify-center relative">
  {#if isLoading}
    <div class="flex items-center justify-center p-8 min-h-[400px]">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span class="ml-2 text-gray-600 dark:text-gray-400">図表を準備中...</span>
    </div>
  {:else if errorMessage}
    <p
      class="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
    >
      {errorMessage}
    </p>
  {:else if svgContent}
    <div class="relative group">
      <div class="mermaid-svg-content fade-in">
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

  .fade-in {
    animation: fadeIn 0.3s ease-in;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
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
    width: 100%;
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
</style>

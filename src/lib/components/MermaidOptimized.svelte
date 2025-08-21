<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    chart: string;
    id?: string;
  }

  let { chart, id = `mermaid-${Math.random().toString(36).substring(2, 11)}` }: Props = $props();

  let svgContent = $state<string>('');
  let errorMessage = $state<string>('');
  let isLoading = $state<boolean>(true);
  let renderTimeout: ReturnType<typeof setTimeout>;

  onMount(() => {
    if (typeof window === 'undefined') {
      isLoading = false;
      return;
    }

    // Debounce rendering for Safari
    renderTimeout = setTimeout(async () => {
      try {
        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default;

        // Simplified configuration for better performance
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          fontSize: 16,
          securityLevel: 'loose',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: false // Disable HTML labels for better performance
          }
        });

        const { svg } = await mermaid.render(id, chart);
        svgContent = svg;
        errorMessage = '';
      } catch (error) {
        console.error('Mermaid rendering error:', error);
        errorMessage = `図表の表示に失敗しました: ${error}`;
      } finally {
        isLoading = false;
      }
    }, 10); // Small delay to prevent blocking

    return () => {
      if (renderTimeout) {
        clearTimeout(renderTimeout);
      }
    };
  });
</script>

<div class="mermaid-container my-6 flex justify-center">
  {#if isLoading}
    <div class="flex items-center justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span class="ml-2 text-gray-600 dark:text-gray-400">図表を生成中...</span>
    </div>
  {:else if errorMessage}
    <p
      class="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
    >
      {errorMessage}
    </p>
  {:else if svgContent}
    <div class="mermaid-svg-content">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html svgContent}
    </div>
  {/if}
</div>

<style>
  :global(.mermaid-svg-content svg) {
    width: auto;
    max-width: 100%;
    height: auto;
    min-height: 200px;
    background-color: #1f2937;
    border-radius: 8px;
    padding: 24px;
    display: block;
    margin: 0 auto;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>

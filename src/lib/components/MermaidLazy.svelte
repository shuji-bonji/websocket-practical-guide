<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    chart: string;
    id?: string;
  }

  let { chart, id = `mermaid-${Math.random().toString(36).substring(2, 11)}` }: Props = $props();

  let container = $state<HTMLDivElement>();
  let isIntersecting = $state(false);
  let MermaidComponent = $state<typeof import('./Mermaid.svelte').default | null>(null);

  onMount(() => {
    if (!container) return;

    // Intersection Observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isIntersecting) {
            isIntersecting = true;
            loadMermaid();
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  });

  async function loadMermaid() {
    if (MermaidComponent) return;

    try {
      const module = await import('./Mermaid.svelte');
      MermaidComponent = module.default;
    } catch (error) {
      console.error('Failed to load Mermaid component:', error);
    }
  }
</script>

<div bind:this={container} class="min-h-[400px]">
  {#if isIntersecting && MermaidComponent}
    <MermaidComponent {chart} {id} />
  {:else}
    <div class="flex items-center justify-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <div class="text-gray-600 dark:text-gray-400">図表を読み込み中...</div>
    </div>
  {/if}
</div>

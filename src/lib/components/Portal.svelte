<script lang="ts">
  import { onMount, type Snippet } from 'svelte';

  interface Props {
    target?: string;
    children: Snippet;
  }

  let { target = 'body', children }: Props = $props();

  let targetElement = $state<HTMLElement | null>(null);
  let portalElement = $state<HTMLDivElement>();

  onMount(() => {
    if (typeof document !== 'undefined') {
      targetElement = document.querySelector(target) || document.body;

      if (targetElement && portalElement) {
        targetElement.appendChild(portalElement);
      }
    }

    return () => {
      if (portalElement && portalElement.parentNode) {
        portalElement.parentNode.removeChild(portalElement);
      }
    };
  });
</script>

<div bind:this={portalElement} style="display: contents;">
  {@render children()}
</div>

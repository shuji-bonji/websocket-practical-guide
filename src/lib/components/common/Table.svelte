<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    headers: string[];
    class?: string;
    children: Snippet;
  }

  let { headers, class: className = '', children }: Props = $props();
</script>

<div class="theme-table {className}">
  <table class="w-full">
    <thead class="theme-table-header">
      <tr>
        {#each headers as header, index (index)}
          <th
            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider theme-text-secondary"
          >
            {header}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody class="divide-y theme-border-primary">
      {@render children()}
    </tbody>
  </table>
</div>

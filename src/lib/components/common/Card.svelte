<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    icon?: string;
    accentColor?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
    class?: string;
    children: Snippet;
  }

  let { title, icon, accentColor = 'blue', class: className = '', children }: Props = $props();

  const colorClasses = {
    blue: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700',
    green:
      'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700',
    purple:
      'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700',
    orange:
      'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700',
    red: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700',
    gray: 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
  };

  const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400',
    red: 'text-red-600 dark:text-red-400',
    gray: 'text-gray-600 dark:text-gray-400'
  };

  function getIcon(iconName: string) {
    const icons: Record<string, string> = {
      info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      check: 'M5 13l4 4L19 7',
      warning:
        'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.624 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z',
      book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      code: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
      terminal:
        'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      lightning: 'M13 10V3L4 14h7v7l9-11h-7z'
    };
    return icons[iconName] || icons.info;
  }
</script>

<div
  class="card overflow-hidden rounded-lg border-2 transition-all duration-200 hover:shadow-md mb-6 {colorClasses[
    accentColor
  ]} {className}"
>
  {#if title || icon}
    <div class="card-header border-b border-current/10 px-6 py-3">
      <div class="flex items-center gap-3">
        {#if icon}
          <div class="flex-shrink-0">
            <svg
              class="h-6 w-6 {iconColorClasses[accentColor]}"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d={getIcon(icon)}
              />
            </svg>
          </div>
        {/if}
        {#if title}
          <h3 class="text-lg font-semibold theme-text-primary">{title}</h3>
        {/if}
      </div>
    </div>
  {/if}

  <div class="card-content prose prose-sm dark:prose-invert max-w-none p-6">
    {@render children()}
  </div>
</div>

<style>
  .card {
    background: linear-gradient(135deg, var(--tw-bg-opacity) 0%, rgba(255, 255, 255, 0.8) 100%);
  }

  :global(.dark) .card {
    background: linear-gradient(135deg, var(--tw-bg-opacity) 0%, rgba(31, 41, 55, 0.8) 100%);
  }
</style>

<script lang="ts">
  import { progressStore, progressActions } from '$lib/stores/progress';

  interface Props {
    lessonId: string;
    title: string;
    duration: string;
    difficulty?: '初級' | '中級' | '上級';
    prerequisites?: string[];
  }

  let { lessonId, title, duration, difficulty = '初級', prerequisites = [] }: Props = $props();

  let progress = $derived($progressStore);
  let currentLesson = $derived(
    progress.phases.flatMap((p) => p.lessons).find((l) => l.id === lessonId)
  );
  let isCompleted = $derived(currentLesson?.completed || false);

  let mounted = $derived(typeof window !== 'undefined');

  const difficultyColors = {
    初級: 'bg-green-100 text-green-800',
    中級: 'bg-yellow-100 text-yellow-800',
    上級: 'bg-red-100 text-red-800'
  };

  function toggleCompletion() {
    if (isCompleted) {
      progressActions.uncompleteLesson(lessonId);
    } else {
      progressActions.completeLesson(lessonId);
    }
  }
</script>

<div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
  <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
    <div class="flex-1">
      <!-- レッスン情報 -->
      <div class="flex items-center mb-4">
        <div class="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium mr-3">
          レッスン {lessonId}
        </div>
        <span
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {difficultyColors[
            difficulty
          ]}"
        >
          {difficulty}
        </span>
        <span class="ml-3 text-sm text-gray-500">{duration}</span>
      </div>

      <h1 class="text-3xl font-bold text-gray-900 mb-4">{title}</h1>

      <!-- 前提知識 -->
      {#if prerequisites.length > 0}
        <div class="mb-4">
          <h3 class="text-sm font-medium text-gray-700 mb-2">📋 前提知識</h3>
          <div class="flex flex-wrap gap-2">
            {#each prerequisites as prerequisite (prerequisite)}
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
              >
                {prerequisite}
              </span>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- 完了ボタン -->
    <div class="mt-4 lg:mt-0 lg:ml-6">
      {#if mounted}
        {#key isCompleted}
          <button
            type="button"
            onclick={toggleCompletion}
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md {isCompleted
              ? 'text-green-700 bg-green-100 hover:bg-green-200'
              : 'text-blue-700 bg-blue-100 hover:bg-blue-200'} transition-colors duration-200"
          >
            {#if isCompleted}
              <svg class="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
              完了済み
            {:else}
              <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4"
                />
              </svg>
              完了としてマーク
            {/if}
          </button>
        {/key}
      {/if}
    </div>
  </div>
</div>

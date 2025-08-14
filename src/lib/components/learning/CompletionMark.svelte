<script lang="ts">
  import { progressStore, progressActions } from '$lib/stores/progress';

  interface Props {
    lessonId: string;
  }

  let { lessonId }: Props = $props();

  let progress = $derived($progressStore);

  // レッスンの完了状態を取得
  let isCompleted = $derived(
    progress.phases.some((phase) =>
      phase.lessons.some((lesson) => lesson.id === lessonId && lesson.completed)
    )
  );

  function toggleCompletion() {
    if (isCompleted) {
      progressActions.uncompleteLesson(lessonId);
    } else {
      progressActions.completeLesson(lessonId);
    }
  }
</script>

<div
  class="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg {isCompleted
    ? 'border-green-400 dark:border-green-600 bg-gradient-to-r from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/20'
    : ''}"
>
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {isCompleted ? '✅ レッスン完了済み' : '🎉 レッスン完了'}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-300">
        {isCompleted
          ? 'このレッスンは完了済みです。未完了に戻す場合は右のボタンをクリックしてください。'
          : 'このレッスンの内容を理解できましたら、完了マークをつけて次のレッスンに進みましょう。'}
      </p>
    </div>
    <button
      type="button"
      onclick={toggleCompletion}
      class="px-6 py-3 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 {isCompleted
        ? 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500'
        : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'}"
    >
      <div class="flex items-center space-x-2">
        {#if isCompleted}
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span>完了を取り消す</span>
        {:else}
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          <span>完了にする</span>
        {/if}
      </div>
    </button>
  </div>
</div>

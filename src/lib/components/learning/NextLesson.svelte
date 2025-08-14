<script lang="ts">
  import { href } from '$lib/utils/paths';
  export let nextLessonId: string;
  export let nextLessonTitle: string;
  export let nextLessonPath: string;
  export let completionMessage: string = 'このレッスンを完了しました！';
  export let showCompletion: boolean = false;
</script>

<div
  class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 my-8"
>
  {#if showCompletion}
    <!-- 完了メッセージ -->
    <div class="text-center mb-6">
      <div
        class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <svg
          class="w-8 h-8 text-green-600 dark:text-green-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
        🎉 お疲れ様でした！
      </h3>
      <p class="text-green-700 dark:text-green-400">{completionMessage}</p>
    </div>
  {/if}

  <!-- 次のレッスンへの案内 -->
  <div class="text-center">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
      {showCompletion ? '次の学習に進みましょう' : '学習を継続しましょう'}
    </h3>

    <div
      class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
    >
      <div class="text-sm text-blue-700 dark:text-blue-400 mb-2">次のレッスン</div>
      <div class="font-medium text-blue-900 dark:text-blue-200">
        {nextLessonId}: {nextLessonTitle}
      </div>
    </div>

    <div class="space-y-3">
      <a href={href(nextLessonPath)} class="btn-primary inline-flex items-center">
        次のレッスンに進む
        <svg class="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>

      <div class="text-sm text-gray-500 dark:text-gray-400">
        または
        <a
          href={href('/phase1')}
          class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >Phase 1 概要</a
        >
        に戻って他のレッスンを確認する
      </div>
    </div>
  </div>

  <!-- 学習のコツ -->
  <div
    class="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
  >
    <div class="text-sm text-yellow-800 dark:text-yellow-300">
      <span class="font-medium">💡 学習のコツ</span>
      <ul class="mt-2 space-y-1 ml-4">
        <li>• 理解できない部分があれば、前のレッスンに戻って復習しましょう</li>
        <li>• 実際に手を動かして、コードを書いて確認することが重要です</li>
        <li>• インタラクティブデモは何度でも試してみてください</li>
        <li>• 疑問点があれば、参考資料やドキュメントを確認しましょう</li>
      </ul>
    </div>
  </div>
</div>

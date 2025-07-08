<script lang="ts">
  import { progressStore } from '$lib/stores/progress';

  interface Props {
    lessonId: string;
    sectionTitle?: string;
    showNavigation?: boolean;
  }

  let { lessonId, sectionTitle = '', showNavigation = true }: Props = $props();

  let progress = $derived($progressStore);
  let currentLesson = $derived(
    progress.phases.flatMap((p) => p.lessons).find((l) => l.id === lessonId)
  );
  let isCompleted = $derived(currentLesson?.completed || false);

  let mounted = $derived(typeof window !== 'undefined');

  // セクション内のレッスン進捗を取得
  let sectionProgress = $derived(
    (() => {
      if (!lessonId) return null;

      // レッスンIDからセクションを特定
      let phaseNumber: number;
      let sectionName: string;

      if (lessonId.startsWith('phase')) {
        // 新しい形式: "phase1-introduction-what-is-websocket"
        const parts = lessonId.split('-');
        phaseNumber = parseInt(parts[0].replace('phase', ''));
        sectionName = parts[1]; // "introduction"
      } else {
        // 古い形式: "1.1"
        const [phaseStr, sectionStr] = lessonId.split('.');
        phaseNumber = parseInt(phaseStr);
        sectionName = `section${sectionStr ? sectionStr[0] : '1'}`;
      }

      const currentPhase = progress.phases[phaseNumber - 1];
      if (!currentPhase) return null;

      // セクション内のレッスンを取得
      const sectionLessons = currentPhase.lessons.filter((lesson) => {
        if (lesson.id.startsWith('phase')) {
          // 新しい形式のレッスン
          const parts = lesson.id.split('-');
          return parts.length > 1 && parts[1] === sectionName;
        } else {
          // 古い形式のレッスン
          const [, lessonSectionStr] = lesson.id.split('.');
          return lessonSectionStr && lessonSectionStr[0] === sectionName.replace('section', '');
        }
      });

      const completedCount = sectionLessons.filter((l) => l.completed).length;

      return {
        total: sectionLessons.length,
        completed: completedCount,
        percentage: Math.round((completedCount / sectionLessons.length) * 100)
      };
    })()
  );
</script>

{#if mounted}
  <div class="bg-white border border-gray-200 rounded-lg p-4 my-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-medium text-gray-700">📊 学習進捗</h3>
      {#if isCompleted}
        <div class="flex items-center text-green-600 text-sm">
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          完了済み
        </div>
      {/if}
    </div>

    <!-- 現在のレッスン情報 -->
    <div class="mb-4">
      <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>現在のレッスン: {lessonId}</span>
        {#if currentLesson?.timeSpent}
          <span>学習時間: {currentLesson.timeSpent}分</span>
        {/if}
      </div>
    </div>

    <!-- セクション進捗 -->
    {#if sectionProgress && sectionTitle}
      <div class="mb-4 p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-between text-sm text-gray-700 mb-2">
          <span>{sectionTitle}</span>
          <span>{sectionProgress.completed}/{sectionProgress.total}</span>
        </div>
        <div class="progress-bar h-2">
          <div
            class="progress-fill h-2 rounded-full"
            style="width: {sectionProgress.percentage}%"
          ></div>
        </div>
        <div class="text-xs text-gray-500 mt-1 text-right">
          {sectionProgress.percentage}% 完了
        </div>
      </div>
    {/if}

    <!-- Phase全体の進捗 -->
    {#if lessonId}
      {@const phaseNumber = lessonId.startsWith('phase')
        ? parseInt(lessonId.split('-')[0].replace('phase', ''))
        : parseInt(lessonId.split('.')[0])}
      {@const phaseProgress = progress.phases[phaseNumber - 1]}
      {#if phaseProgress}
        <div class="p-3 bg-blue-50 rounded-lg">
          <div class="flex items-center justify-between text-sm text-blue-700 mb-2">
            <span>Phase {phaseProgress.phase}: {phaseProgress.name}</span>
            <span>{phaseProgress.completedLessons}/{phaseProgress.totalLessons}</span>
          </div>
          <div class="progress-bar h-2 bg-blue-200">
            <div
              class="h-2 rounded-full bg-blue-600"
              style="width: {(phaseProgress.completedLessons / phaseProgress.totalLessons) * 100}%"
            ></div>
          </div>
          <div class="text-xs text-blue-600 mt-1 text-right">
            {Math.round((phaseProgress.completedLessons / phaseProgress.totalLessons) * 100)}% 完了
          </div>
        </div>
      {/if}
    {/if}

    <!-- ナビゲーション -->
    {#if showNavigation}
      <div class="mt-4 pt-4 border-t border-gray-200">
        <div class="flex justify-between">
          <a href="/phase1" class="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Phase 1 概要に戻る
          </a>

          <a
            href="/table-of-contents"
            class="text-sm text-gray-600 hover:text-gray-800 flex items-center"
          >
            全体目次
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>
    {/if}
  </div>
{/if}

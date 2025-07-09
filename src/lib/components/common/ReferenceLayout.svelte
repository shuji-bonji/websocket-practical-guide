<script lang="ts">
  import Card from './Card.svelte';

  let {
    title,
    description = '',
    duration = '',
    difficulty = '中級',
    prerequisites = [],
    sectionTitle = 'リファレンス',
    learningObjectives = [],
    referenceCategory = '',
    relatedReferences = [],
    isIndexPage = false,
    children
  } = $props();

  const difficultyConfig: Record<string, { color: string; icon: string }> = {
    初級: { color: 'bg-green-100 text-green-800', icon: '🌱' },
    中級: { color: 'bg-yellow-100 text-yellow-800', icon: '🌿' },
    上級: { color: 'bg-red-100 text-red-800', icon: '🌳' },
    実践: { color: 'bg-purple-100 text-purple-800', icon: '🚀' },
    全レベル: { color: 'bg-blue-100 text-blue-800', icon: '📚' }
  };
</script>

<svelte:head>
  <title>{title} - WebSocketガイド</title>
  <meta name="description" content={description} />
</svelte:head>

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {#if isIndexPage}
    <!-- インデックスページ用ヒーローセクション -->
    <div
      class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 mb-8 text-white"
    >
      <div class="flex items-center gap-3 mb-4">
        <button class="text-sm text-white/80 hover:text-white" onclick={() => history.back()}>
          ← 戻る
        </button>
        <span class="text-sm text-white/70">{sectionTitle}</span>
        {#if referenceCategory}
          <span class="text-sm text-white/50">•</span>
          <span class="text-sm text-white font-medium">{referenceCategory}</span>
        {/if}
      </div>

      <h1 class="text-4xl font-bold mb-4">{title}</h1>

      {#if description}
        <p class="text-lg text-white/90 mb-6">{description}</p>
      {/if}

      <!-- 学習目標（インデックスページ用） -->
      {#if learningObjectives.length > 0}
        <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6">
          <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <span class="text-yellow-300">✨</span>
            このリファレンス集で得られること
          </h3>
          <ul class="space-y-2">
            {#each learningObjectives as objective, index (index)}
              <li class="flex items-start gap-2">
                <span class="text-yellow-300 mt-0.5 flex-shrink-0">✓</span>
                <span class="text-white/90">{objective}</span>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  {:else}
    <!-- 通常のリファレンスヘッダー -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-4">
        <button class="text-sm text-gray-600 hover:text-gray-900" onclick={() => history.back()}>
          ← 戻る
        </button>
        <span class="text-sm text-gray-500">{sectionTitle}</span>
        {#if referenceCategory}
          <span class="text-sm text-gray-400">•</span>
          <span class="text-sm text-blue-600 font-medium">{referenceCategory}</span>
        {/if}
      </div>

      <h1 class="text-4xl font-bold text-gray-900 mb-4">{title}</h1>

      {#if description}
        <p class="text-lg text-gray-600 mb-6">{description}</p>
      {/if}

      <!-- リファレンス情報 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {#if duration}
          <Card class="p-4">
            <div class="flex items-center gap-3">
              <span class="text-blue-500">🕐</span>
              <div>
                <p class="text-sm text-gray-600">読了時間</p>
                <p class="font-semibold">{duration}</p>
              </div>
            </div>
          </Card>
        {/if}

        <Card class="p-4">
          <div class="flex items-center gap-3">
            <span class="text-orange-500">📈</span>
            <div>
              <p class="text-sm text-gray-600">難易度</p>
              <span
                class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium {difficultyConfig[
                  difficulty
                ].color}"
              >
                <span>{difficultyConfig[difficulty].icon}</span>
                {difficulty}
              </span>
            </div>
          </div>
        </Card>

        {#if prerequisites.length > 0}
          <Card class="p-4">
            <div class="flex items-center gap-3">
              <span class="text-purple-500">👥</span>
              <div>
                <p class="text-sm text-gray-600">前提知識</p>
                <p class="font-semibold">{prerequisites.length}項目</p>
              </div>
            </div>
          </Card>
        {/if}
      </div>

      <!-- 前提知識 -->
      {#if prerequisites.length > 0}
        <Card class="p-6 mb-6">
          <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <span class="text-purple-500">👥</span>
            前提知識
          </h3>
          <div class="flex flex-wrap gap-2">
            {#each prerequisites as prerequisite, index (index)}
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
              >
                {prerequisite}
              </span>
            {/each}
          </div>
        </Card>
      {/if}

      <!-- 学習目標 -->
      {#if learningObjectives.length > 0}
        <Card class="p-6 mb-8">
          <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <span class="text-green-500">✓</span>
            この参考資料で学べること
          </h3>
          <ul class="space-y-2">
            {#each learningObjectives as objective, index (index)}
              <li class="flex items-start gap-2">
                <span class="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span class="text-gray-700">{objective}</span>
              </li>
            {/each}
          </ul>
        </Card>
      {/if}
    </div>
  {/if}

  <!-- メインコンテンツ -->
  <div class="prose prose-lg max-w-none">
    {@render children?.()}
  </div>

  <!-- 関連リファレンス -->
  {#if relatedReferences.length > 0}
    <Card class="p-6 mt-12">
      <h3 class="text-lg font-semibold mb-4">関連リファレンス</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each relatedReferences as ref, index (index)}
          <a
            href={ref.url}
            class="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div class="text-2xl">{ref.icon}</div>
            <div>
              <p class="font-medium text-gray-900">{ref.title}</p>
              <p class="text-sm text-gray-600">{ref.description}</p>
            </div>
          </a>
        {/each}
      </div>
    </Card>
  {/if}

  <!-- フッター -->
  <div class="mt-12 pt-8 border-t border-gray-200">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div class="text-center sm:text-left">
        <p class="text-sm text-gray-600">WebSocketガイド - リファレンス資料</p>
        <p class="text-xs text-gray-500 mt-1">実装詳細とベストプラクティス集</p>
      </div>

      <div class="flex items-center gap-4">
        <button
          class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
          onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ページトップへ
        </button>
        <button
          class="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
          onclick={() => history.back()}
        >
          ← 戻る
        </button>
      </div>
    </div>
  </div>
</div>

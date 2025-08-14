<script lang="ts">
  import { progressStore } from '$lib/stores/progress';

  let progress = $derived($progressStore);
</script>

<svelte:head>
  <title>目次 - WebSocket学習プロジェクト</title>
  <meta name="description" content="WebSocket学習プロジェクトの全体的な目次とカリキュラム構成" />
</svelte:head>

<div class="max-w-4xl mx-auto py-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold theme-text-primary mb-4">📚 学習目次</h1>
    <p class="text-lg theme-text-secondary">
      WebSocket学習プロジェクトの完全なカリキュラム構成と各セクションの概要です。
    </p>
  </div>

  <!-- Phase 1 Overview -->
  <div
    class="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6 mb-8"
  >
    <h2 class="text-2xl font-semibold text-blue-900 dark:text-blue-200 mb-4">
      🌱 Phase 1: WebSocket基礎理解
    </h2>
    <p class="text-blue-800 dark:text-blue-300 mb-4">
      GitHub Pages環境でパブリックWebSocketサービスを使用した基礎学習
    </p>

    <div class="grid md:grid-cols-2 gap-4">
      <div
        class="bg-white dark:bg-gray-800 rounded-md p-4 border border-blue-100 dark:border-blue-800"
      >
        <h3 class="font-semibold text-blue-900 dark:text-blue-200 mb-2">1. WebSocket入門</h3>
        <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• WebSocketとは何か</li>
          <li>• HTTPの限界とWebSocketの優位性</li>
          <li>• WebSocketの利用例と適用場面</li>
          <li>• WebSocket vs 他技術の比較理解</li>
        </ul>
      </div>

      <div
        class="bg-white dark:bg-gray-800 rounded-md p-4 border border-blue-100 dark:border-blue-800"
      >
        <h3 class="font-semibold text-blue-900 dark:text-blue-200 mb-2">2. ネットワーク技術</h3>
        <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• HTTP基礎知識</li>
          <li>• OSI参照モデル</li>
          <li>• HTTP/1.1からHTTP/3まで</li>
          <li>• TCPとWebSocket</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- 今後のPhaseプレビュー -->
  <div class="space-y-6">
    <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 opacity-75">
      <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-400 mb-2">
        🔧 Phase 2: 実装技術
      </h2>
      <p class="text-gray-600 dark:text-gray-500">
        ローカル開発環境での詳細な実装学習（今後実装予定）
      </p>
    </div>

    <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 opacity-75">
      <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-400 mb-2">
        🧪 Phase 3: テスト・評価
      </h2>
      <p class="text-gray-600 dark:text-gray-500">品質保証とテスト手法の習得（今後実装予定）</p>
    </div>

    <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-6 opacity-75">
      <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-400 mb-2">
        🚀 Phase 4: 実践開発
      </h2>
      <p class="text-gray-600 dark:text-gray-500">
        本番環境でのプロダクション品質アプリ開発（今後実装予定）
      </p>
    </div>
  </div>

  <!-- Phase 1 現在の進行状況 -->
  <div
    class="mt-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
  >
    <h2 class="text-xl font-semibold theme-text-primary mb-4">📊 Phase 1 学習進行状況</h2>

    {#if progress.phases.length > 0}
      {@const phase1 = progress.phases[0]}
      <div class="mb-4">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{phase1.name}</span>
          <span class="text-sm theme-text-secondary"
            >{phase1.completedLessons}/{phase1.totalLessons} 完了</span
          >
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full"
            style="width: {Math.round((phase1.completedLessons / phase1.totalLessons) * 100)}%"
          ></div>
        </div>
      </div>
    {/if}

    <div class="text-sm theme-text-secondary">
      <p>🎯 <strong>Phase 1の目標:</strong> WebSocketの基本概念理解とブラウザAPIの習得</p>
      <p>📍 <strong>現在の環境:</strong> GitHub Pages（静的サイト）+ パブリックWebSocketサービス</p>
    </div>
  </div>
</div>

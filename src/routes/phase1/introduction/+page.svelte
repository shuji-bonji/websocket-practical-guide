<script lang="ts">
  import { progressStore, type OverallProgress } from '$lib/stores/progress.js';
  import Mermaid from '$lib/components/Mermaid.svelte';

  let progressData: OverallProgress = $progressStore;

  const sections = [
    {
      id: 'what-is-websocket',
      number: '1.1',
      title: 'WebSocketとは何か',
      description: 'WebSocketの基本概念とブラウザ標準APIの重要性を理解する',
      duration: '60分',
      difficulty: '初級',
      path: '/phase1/introduction/what-is-websocket',
      lessonId: 'phase1-introduction-what-is-websocket'
    },
    {
      id: 'http-limitations',
      number: '1.2',
      title: 'HTTPの限界とWebSocketの優位性',
      description: '従来のHTTP通信の制限とWebSocketが解決する問題を理解する',
      duration: '60分',
      difficulty: '初級',
      path: '/phase1/introduction/http-limitations',
      lessonId: 'phase1-introduction-http-limitations'
    },
    {
      id: 'use-cases',
      number: '1.3',
      title: 'WebSocketの利用例と適用場面',
      description:
        'WebSocketの11の主要利用例を視覚的に理解し、実際のアプリケーション設計に活用する',
      duration: '90分',
      difficulty: '初級',
      path: '/phase1/introduction/use-cases',
      lessonId: 'phase1-use-cases'
    },
    {
      id: 'comparison',
      number: '1.4',
      title: 'WebSocket vs 他技術の比較理解',
      description:
        'WebSocketと他のリアルタイム通信技術の特徴を比較し、適切な技術選択ができるようになる',
      duration: '60分',
      difficulty: '初級',
      path: '/phase1/introduction/comparison',
      lessonId: 'phase1-introduction-comparison'
    }
  ];

  function getLessonStatus(lessonId: string): 'completed' | 'pending' {
    return progressData?.phases?.flatMap((p) => p.lessons)?.find((l) => l.id === lessonId)
      ?.completed
      ? 'completed'
      : 'pending';
  }

  function getStatusIcon(status: 'completed' | 'pending'): string {
    return status === 'completed' ? '✅' : '📚';
  }

  function getStatusColor(status: 'completed' | 'pending'): string {
    return status === 'completed' ? 'text-green-600' : 'text-gray-600';
  }
</script>

<svelte:head>
  <title>WebSocket入門 - Phase 1 Introduction</title>
  <meta
    name="description"
    content="WebSocketの基本概念から実践的な利用例まで、体系的に学習するWebSocket入門セクション"
  />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- ヘッダーセクション -->
  <div class="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
    <div class="max-w-6xl mx-auto px-4 py-16">
      <div class="text-center">
        <div
          class="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6"
        >
          🚀 Phase 1: WebSocket基礎理解
        </div>
        <h1 class="text-4xl md:text-6xl font-bold mb-6">WebSocket入門</h1>
        <p class="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
          基本概念から実践的な利用例まで、WebSocketの全体像を理解する
        </p>
        <div class="flex flex-wrap justify-center gap-4 text-sm">
          <div class="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
            ⏱️ 学習時間: 約4-5時間
          </div>
          <div class="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
            📊 難易度: 初級
          </div>
          <div class="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
            🎯 4つのレッスン
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-6xl mx-auto px-4 py-12">
    <!-- 学習の流れ -->
    <div class="mb-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">学習の流れ</h2>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <Mermaid
          chart={`
graph TD
    A[1.1 WebSocketとは何か] --> B[1.2 HTTPの限界と優位性]
    B --> C[1.3 利用例と適用場面]
    C --> D[1.4 他技術との比較]
    
    A1[基本概念理解] --> A
    B1[課題と解決策] --> B
    C1[実践的応用] --> C
    D1[技術選択判断] --> D
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style A1 fill:#bbdefb
    style B1 fill:#f8bbd9
    style C1 fill:#c8e6c9
    style D1 fill:#fff8e1
        `}
        />
      </div>
    </div>

    <!-- レッスン一覧 -->
    <div class="space-y-6">
      <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">レッスン一覧</h2>

      {#each sections as section, index (section.id)}
        <div
          class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div class="p-8">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-4 mb-4">
                  <div
                    class="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-xl font-bold text-lg"
                  >
                    {section.number}
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900">{section.title}</h3>
                    <p class="text-gray-600">{section.description}</p>
                  </div>
                </div>

                <div class="flex flex-wrap gap-4 mb-6">
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    ⏱️ {section.duration}
                  </div>
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    📊 {section.difficulty}
                  </div>
                  {#if progressData}
                    <div
                      class="flex items-center gap-2 text-sm {getStatusColor(
                        getLessonStatus(section.lessonId)
                      )}"
                    >
                      {getStatusIcon(getLessonStatus(section.lessonId))}
                      {getLessonStatus(section.lessonId) === 'completed' ? '完了済み' : '未完了'}
                    </div>
                  {/if}
                </div>

                <a
                  href={section.path}
                  class="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  レッスンを開始 →
                </a>
              </div>
            </div>
          </div>

          {#if index < sections.length - 1}
            <div class="border-t border-gray-100 p-4 bg-gray-50">
              <div class="flex items-center justify-center text-gray-400">↓ 次のレッスンへ</div>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- 学習目標 -->
    <div class="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">このセクションで身につくスキル</h2>

      <div class="grid md:grid-cols-2 gap-8">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">💡 理論的理解</h3>
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              WebSocketプロトコルの基本原理
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              HTTPとの違いと技術的優位性
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              リアルタイム通信の必要性と背景
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              ブラウザ標準APIの重要性
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🛠️ 実践的スキル</h3>
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              適切な技術選択の判断基準
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              11の主要利用例の理解
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              アーキテクチャパターンの選択
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              プロジェクト要件との適合性判定
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 次のフェーズへの案内 -->
    <div
      class="mt-16 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 border border-purple-200"
    >
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">🎯 Phase 1完了後は...</h2>
        <p class="text-gray-600 mb-6 max-w-2xl mx-auto">
          WebSocketの基礎理解を完了すると、Phase 2でネットワーク技術とプロトコルの詳細、Phase
          3で実践的な実装手法を学習していきます。
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <div class="bg-white px-4 py-2 rounded-lg border border-purple-200">
            Phase 2: ネットワーク技術基盤
          </div>
          <div class="bg-white px-4 py-2 rounded-lg border border-purple-200">
            Phase 3: 実装とベストプラクティス
          </div>
          <div class="bg-white px-4 py-2 rounded-lg border border-purple-200">
            Phase 4: 高度なアーキテクチャ
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  :global(.mermaid) {
    display: flex;
    justify-content: center;
  }
</style>

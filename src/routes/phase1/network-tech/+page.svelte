<script lang="ts">
  import WebSocketConnectionDemo from '$lib/components/phase1/WebSocketConnectionDemo.svelte';
  import { progressStore, type OverallProgress } from '$lib/stores/progress.js';
  import Mermaid from '$lib/components/Mermaid.svelte';
  import { href } from '$lib/utils/paths';

  let progressData: OverallProgress = $progressStore;

  const sections = [
    {
      id: 'http-basics',
      number: '2.1',
      title: 'WebSocketを理解するためのHTTP基礎',
      description:
        'HTTP/1.0とHTTP/1.1の接続管理の違いを理解し、WebSocketがHTTPを前提とする理由を学習します。',
      duration: '45分',
      difficulty: '初級',
      path: '/phase1/network-tech/http-basics',
      lessonId: 'phase1-network-http-basics',
      status: 'completed'
    },
    {
      id: 'osi-model',
      number: '2.2',
      title: 'OSI参照モデルとWebSocketの位置',
      description: 'OSI 7層モデルの各層の役割を理解し、WebSocketが動作する層を特定します。',
      duration: '30分',
      difficulty: '初級',
      path: '/phase1/network-tech/osi-model',
      lessonId: 'phase1-network-osi-model',
      status: 'completed'
    },
    {
      id: 'http-versions',
      number: '2.3',
      title: 'HTTP/1.1からHTTP/3までのWebSocket対応',
      description: '各HTTPバージョンでのWebSocket動作の違いと将来の技術選択について学習します。',
      duration: '40分',
      difficulty: '初級',
      path: '/phase1/network-tech/http-versions',
      lessonId: 'phase1-network-http-versions',
      status: 'completed'
    },
    {
      id: 'tcp-websocket',
      number: '2.4',
      title: 'TCPとWebSocketの関係理解',
      description: 'TCP接続の基礎とWebSocketがTCPをどのように活用するかを詳しく学習します。',
      duration: '35分',
      difficulty: '初級',
      path: '/phase1/network-tech/tcp-websocket',
      lessonId: 'phase1-network-tcp-websocket',
      status: 'completed'
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
  <title>ネットワーク技術基礎 - Phase 1 | WebSocket 実践ガイド</title>
  <meta name="description" content="WebSocketを理解するために必要なネットワーク技術の基礎知識" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- ヘッダーセクション -->
  <section class="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800">
    <div class="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-primary-800/90"></div>
    <div class="relative px-4 py-24 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto text-center">
        <div
          class="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium mb-6 text-primary-100"
        >
          🌐 Phase 1: WebSocket基礎理解
        </div>
        <h1 class="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl mb-6">
          ネットワーク技術基礎
        </h1>
        <p class="mx-auto max-w-3xl text-xl text-primary-100 mb-8">
          WebSocketを深く理解するために必要なネットワーク技術の基礎知識を学習します
        </p>
        <div class="flex flex-wrap justify-center gap-4 text-sm">
          <div class="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg text-primary-100">
            ⏱️ 学習時間: 約2.5-3時間
          </div>
          <div class="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg text-primary-100">
            📊 難易度: 初級
          </div>
          <div class="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg text-primary-100">
            🎯 4つのレッスン
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="max-w-6xl mx-auto px-4 py-12">
    <!-- 学習の流れ -->
    <div class="mb-16">
      <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">学習の流れ</h2>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <Mermaid
          chart={`
graph TD
    A[2.1 HTTP基礎] --> B[2.2 OSI参照モデル]
    B --> C[2.3 HTTPバージョン対応]
    C --> D[2.4 TCPとの関係]
    
    A1[接続管理理解] --> A
    B1[層の把握] --> B
    C1[プロトコル進化] --> C
    D1[転送層理解] --> D
    
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
                  href={href(section.path)}
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
              WebSocketとHTTPの関係性
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              OSI参照モデルでのWebSocketの位置
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              HTTP/1.1からHTTP/3までの進化
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              TCP接続の仕組みと特性
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">🛠️ 実践的スキル</h3>
          <ul class="space-y-2 text-gray-600">
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              プロトコルアップグレードの理解
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              ネットワーク層の相互作用把握
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              適切なHTTPバージョンの選択
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-500 mt-1">✓</span>
              接続の最適化手法
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 実践デモ -->
    <div class="mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-4">🛠️ 実践デモ</h2>
      <p class="text-gray-600 mb-6">
        ネットワーク技術の理解を深めるため、実際のWebSocket接続を通してプロトコルの動作を観察してみましょう。
      </p>

      <WebSocketConnectionDemo
        title="ネットワーク技術学習デモ"
        description="HTTPからWebSocketへのプロトコルアップグレードプロセスを観察"
        showEducationalEvents={true}
      />
    </div>

    <!-- 次のフェーズへの案内 -->
    <div
      class="mt-16 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 border border-purple-200"
    >
      <div class="text-center">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">🎯 次のステップ</h2>
        <p class="text-gray-600 mb-6 max-w-2xl mx-auto">
          ネットワーク技術の基礎を理解したら、次はWebSocketプロトコルの詳細仕様について学習します。
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <div class="bg-white px-4 py-2 rounded-lg border border-purple-200">
            Phase 1-3: WebSocketプロトコル仕様（準備中）
          </div>
          <div class="bg-white px-4 py-2 rounded-lg border border-purple-200">
            Phase 1-4: WebSocket API実践（準備中）
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

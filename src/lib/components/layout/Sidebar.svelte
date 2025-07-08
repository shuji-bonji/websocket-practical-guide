<script lang="ts">
  import { page } from '$app/stores';
  import { progressStore, progressActions } from '$lib/stores/progress';

  interface Props {
    open?: boolean;
  }

  let { open = $bindable(false) }: Props = $props();

  let progress = $derived($progressStore);

  // 現在のパスをSvelteKitのpageストアから取得
  let currentPath = $derived($page.url.pathname);

  // ナビゲーションアイテムの型定義
  interface NavigationItem {
    href: string;
    label: string;
    icon?: string;
    lessonId?: string;
    status?: 'available' | 'coming-soon';
  }

  interface NavigationSection {
    title: string;
    items: NavigationItem[];
  }

  // ナビゲーションメニューの定義
  const navigationSections: NavigationSection[] = [
    {
      title: 'はじめに',
      items: [
        { href: '/', label: 'ホーム', icon: 'home' },
        { href: '/curriculum', label: 'カリキュラム概要', icon: 'book' },
        { href: '/phase1', label: 'Phase 1: WebSocket基礎理解', icon: 'lessons' },
        { href: '/phase2', label: 'Phase 2: 実装技術', icon: 'lessons' },
        { href: '/table-of-contents', label: '目次', icon: 'list' }
      ]
    },
    {
      title: 'Phase 1: WebSocket入門 (1. 入門)',
      items: [
        { href: '/phase1/introduction', label: 'セクション概要', icon: 'book' },
        {
          href: '/phase1/introduction/what-is-websocket',
          label: '1.1 WebSocketとは何か',
          lessonId: 'phase1-introduction-what-is-websocket'
        },
        {
          href: '/phase1/introduction/http-limitations',
          label: '1.2 HTTPの限界とWebSocketの優位性',
          lessonId: 'phase1-introduction-http-limitations'
        },
        {
          href: '/phase1/introduction/use-cases',
          label: '1.3 WebSocketの利用例と適用場面',
          lessonId: 'phase1-introduction-use-cases'
        },
        {
          href: '/phase1/introduction/comparison',
          label: '1.4 WebSocket vs 他技術の比較理解',
          lessonId: 'phase1-introduction-comparison'
        }
      ]
    },
    {
      title: 'Phase 1: ネットワーク技術 (2. ネットワーク)',
      items: [
        { href: '/phase1/network-tech', label: 'セクション概要', icon: 'book' },
        {
          href: '/phase1/network-tech/http-basics',
          label: '2.1 WebSocketを理解するためのHTTP基礎',
          lessonId: 'phase1-network-tech-http-basics'
        },
        {
          href: '/phase1/network-tech/osi-model',
          label: '2.2 OSI参照モデルとWebSocketの位置',
          lessonId: 'phase1-network-tech-osi-model'
        },
        {
          href: '/phase1/network-tech/http-versions',
          label: '2.3 HTTP/1.1からHTTP/3までのWebSocket対応',
          lessonId: 'phase1-network-tech-http-versions'
        },
        {
          href: '/phase1/network-tech/tcp-websocket',
          label: '2.4 WebSocket接続確立プロセス',
          lessonId: 'phase1-network-tech-tcp-websocket'
        },
        {
          href: '/phase1/network-tech/security-ports',
          label: '2.5 セキュリティとポート管理',
          lessonId: 'phase1-network-tech-security-ports'
        }
      ]
    },
    {
      title: 'Phase 1: API基本構造 (3. API構造)',
      items: [
        {
          href: '/phase1/api-structure',
          label: 'セクション概要',
          icon: 'book',
          status: 'coming-soon'
        },
        {
          href: '/phase1/api-structure/lifecycle',
          label: '3.1 WebSocket接続ライフサイクル',
          lessonId: 'phase1-api-structure-lifecycle',
          status: 'coming-soon'
        },
        {
          href: '/phase1/api-structure/event-model',
          label: '3.2 イベントベース通信モデル',
          lessonId: 'phase1-api-structure-event-model',
          status: 'coming-soon'
        },
        {
          href: '/phase1/api-structure/roles',
          label: '3.3 クライアント・サーバー役割分担',
          lessonId: 'phase1-api-structure-roles',
          status: 'coming-soon'
        }
      ]
    },
    {
      title: 'Phase 1: 基本操作 (4. 基本操作)',
      items: [
        {
          href: '/phase1/basic-operations',
          label: 'セクション概要',
          icon: 'book',
          status: 'coming-soon'
        },
        {
          href: '/phase1/basic-operations/url-connection',
          label: '4.1 WebSocket URL と接続確立',
          lessonId: 'phase1-basic-operations-url-connection',
          status: 'coming-soon'
        },
        {
          href: '/phase1/basic-operations/api-implementation',
          label: '4.2 ブラウザ標準WebSocket API実装',
          lessonId: 'phase1-basic-operations-api-implementation',
          status: 'coming-soon'
        },
        {
          href: '/phase1/basic-operations/reconnection',
          label: '4.3 接続失敗と再接続処理',
          lessonId: 'phase1-basic-operations-reconnection',
          status: 'coming-soon'
        }
      ]
    },
    {
      title: 'Phase 2: データ通信 (5. データ通信)',
      items: [
        {
          href: '/phase2/data-communication',
          label: 'セクション概要',
          icon: 'book',
          status: 'coming-soon'
        },
        {
          href: '/phase2/data-communication/svelte-stores',
          label: '5.1 WebSocketオブジェクトとSvelteストア',
          lessonId: 'phase2-data-communication-svelte-stores',
          status: 'coming-soon'
        },
        {
          href: '/phase2/data-communication/send-receive',
          label: '5.2 データ送受信パターン',
          lessonId: 'phase2-data-communication-send-receive',
          status: 'coming-soon'
        },
        {
          href: '/phase2/data-communication/error-handling',
          label: '5.3 高度なエラーハンドリング',
          lessonId: 'phase2-data-communication-error-handling',
          status: 'coming-soon'
        }
      ]
    },
    {
      title: 'Phase 2: フレーム・プロトコル (6. フレーム・プロトコル)',
      items: [
        {
          href: '/phase2/frames-protocols',
          label: 'セクション概要',
          icon: 'book',
          status: 'coming-soon'
        },
        {
          href: '/phase2/frames-protocols/frame-structure',
          label: '6.1 WebSocketフレーム構造',
          lessonId: 'phase2-frames-protocols-frame-structure',
          status: 'coming-soon'
        },
        {
          href: '/phase2/frames-protocols/binary-data',
          label: '6.2 バイナリデータ送信',
          lessonId: 'phase2-frames-protocols-binary-data',
          status: 'coming-soon'
        },
        {
          href: '/phase2/frames-protocols/subprotocols',
          label: '6.3 WebSocketサブプロトコルの設計',
          lessonId: 'phase2-frames-protocols-subprotocols',
          status: 'coming-soon'
        },
        {
          href: '/phase2/frames-protocols/graphql-ws',
          label: '6.4 GraphQL WebSocket統合',
          lessonId: 'phase2-frames-protocols-graphql-ws',
          status: 'coming-soon'
        },
        {
          href: '/phase2/frames-protocols/mqtt',
          label: '6.5 MQTT over WebSocket',
          lessonId: 'phase2-frames-protocols-mqtt',
          status: 'coming-soon'
        },
        {
          href: '/phase2/frames-protocols/custom',
          label: '6.6 カスタムプロトコル設計',
          lessonId: 'phase2-frames-protocols-custom',
          status: 'coming-soon'
        }
      ]
    },
    {
      title: 'Phase 2: 高度なトピック (7. 高度なトピック)',
      items: [
        {
          href: '/phase2/advanced-topics',
          label: 'セクション概要',
          icon: 'book',
          status: 'coming-soon'
        },
        {
          href: '/phase2/advanced-topics/security',
          label: '7.1 セキュリティ実装',
          lessonId: 'phase2-advanced-topics-security',
          status: 'coming-soon'
        },
        {
          href: '/phase2/advanced-topics/pwa-integration',
          label: '7.2 PWAとWebSocketの統合',
          lessonId: 'phase2-advanced-topics-pwa-integration',
          status: 'coming-soon'
        },
        {
          href: '/phase2/advanced-topics/scalability',
          label: '7.3 スケーラビリティと負荷対策',
          lessonId: 'phase2-advanced-topics-scalability',
          status: 'coming-soon'
        }
      ]
    },
    {
      title: 'Phase 3: テスト手法 (8. テスト手法)',
      items: [
        { href: '/phase3/testing', label: 'セクション概要', icon: 'book', status: 'coming-soon' },
        {
          href: '/phase3/testing/client-testing',
          label: '8.1 クライアント側テスト',
          lessonId: 'phase3-testing-client-testing',
          status: 'coming-soon'
        },
        {
          href: '/phase3/testing/server-testing',
          label: '8.2 サーバー側テスト',
          lessonId: 'phase3-testing-server-testing',
          status: 'coming-soon'
        },
        {
          href: '/phase3/testing/e2e-testing',
          label: '8.3 E2Eテスト',
          lessonId: 'phase3-testing-e2e-testing',
          status: 'coming-soon'
        }
      ]
    },
    {
      title: 'Phase 3: 技術比較 (9. 技術比較)',
      items: [
        {
          href: '/phase3/comparison',
          label: 'セクション概要',
          icon: 'book',
          status: 'coming-soon'
        },
        {
          href: '/phase3/comparison/alternatives',
          label: '9.1 代替技術の比較',
          lessonId: 'phase3-comparison-alternatives',
          status: 'coming-soon'
        },
        {
          href: '/phase3/comparison/selection-criteria',
          label: '9.2 適用判断基準',
          lessonId: 'phase3-comparison-selection-criteria',
          status: 'coming-soon'
        }
      ]
    },
    {
      title: 'Phase 4: 実践プロジェクト (10. 実践プロジェクト)',
      items: [
        { href: '/phase4/projects', label: 'セクション概要', icon: 'book', status: 'coming-soon' },
        {
          href: '/phase4/projects/chat-app',
          label: '10.1 PWA対応リアルタイムチャット',
          lessonId: 'phase4-projects-chat-app',
          status: 'coming-soon'
        },
        {
          href: '/phase4/projects/collaborative-editor',
          label: '10.2 リアルタイム共同編集システム',
          lessonId: 'phase4-projects-collaborative-editor',
          status: 'coming-soon'
        }
      ]
    },
    {
      title: 'Phase 4: Socket.IO (オプション)',
      items: [
        { href: '/phase4/socket-io', label: 'セクション概要', icon: 'book', status: 'coming-soon' },
        {
          href: '/phase4/socket-io/overview',
          label: 'Socket.IO概要と活用場面',
          lessonId: 'phase4-socket-io-overview',
          status: 'coming-soon'
        }
      ]
    },
    {
      title: '応用編',
      items: [
        {
          href: '/socket-io',
          label: 'Socket.IO（オプション）',
          icon: 'extension',
          status: 'coming-soon'
        },
        { href: '/resources', label: '学習リソース', icon: 'library', status: 'coming-soon' },
        { href: '/tools', label: 'デバッグツール', icon: 'tools', status: 'coming-soon' }
      ]
    }
  ];

  // アイコンコンポーネント
  function getIcon(iconName: string) {
    const icons: Record<string, string> = {
      home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
      lessons:
        'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
      list: 'M4 6h16M4 10h16M4 14h16M4 18h16',
      extension:
        'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
      library: 'M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z',
      tools:
        'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
    };
    return icons[iconName] || icons.book;
  }

  // レッスンの完了状態を取得（Runes版）
  let lessonCompletionMap = $derived(
    new Map(
      progress.phases.flatMap((phase) =>
        phase.lessons.map((lesson) => [lesson.id, lesson.completed])
      )
    )
  );

  // レッスンの完了状態を取得
  function isLessonCompleted(lessonId: string): boolean {
    return lessonCompletionMap.get(lessonId) || false;
  }

  // レッスン完了状態をトグル
  function toggleLessonCompletion(lessonId: string) {
    if (isLessonCompleted(lessonId)) {
      progressActions.uncompleteLesson(lessonId);
    } else {
      progressActions.completeLesson(lessonId);
    }
  }
</script>

<!-- Desktop Sidebar -->
<aside
  class="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 lg:bg-gray-50 lg:border-r lg:border-gray-200"
>
  <div class="flex-1 flex flex-col overflow-y-auto">
    <nav class="flex-1 px-4 py-6 space-y-6">
      {#each navigationSections as section (section.title)}
        <div>
          <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {section.title}
          </h3>
          <div class="mt-2 space-y-1">
            {#each section.items as item (item.href)}
              <div class="flex items-center group">
                {#if item.status === 'coming-soon'}
                  <div
                    class="flex-1 flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-not-allowed text-gray-400"
                  >
                    {#if item.icon}
                      <svg
                        class="mr-3 h-5 w-5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d={getIcon(item.icon)}
                        />
                      </svg>
                    {:else if item.lessonId}
                      <!-- レッスン完了チェックボックス -->
                      <div class="mr-3 flex-shrink-0">
                        {#if item.lessonId && lessonCompletionMap.get(item.lessonId)}
                          <div
                            class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                          >
                            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fill-rule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </div>
                        {:else}
                          <div class="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                        {/if}
                      </div>
                    {/if}

                    <span class="truncate">{item.label}</span>
                    {#if item.status === 'coming-soon'}
                      <span class="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full"
                        >準備中</span
                      >
                    {/if}
                  </div>
                {:else}
                  <a
                    href={item.href}
                    class="flex-1 flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 {currentPath ===
                    item.href
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}"
                  >
                    {#if item.icon}
                      <svg
                        class="mr-3 h-5 w-5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    {/if}

                    {#if item.lessonId}
                      <div class="mr-3 flex items-center">
                        {#if lessonCompletionMap.get(item.lessonId)}
                          <div
                            class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                          >
                            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fill-rule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </div>
                        {:else}
                          <div class="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                        {/if}
                      </div>
                    {/if}

                    <span class="truncate">{item.label}</span>
                  </a>
                {/if}

                <!-- レッスン完了ボタン -->
                {#if item.lessonId}
                  <button
                    type="button"
                    class="ml-2 p-1 rounded-md text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    onclick={() => item.lessonId && toggleLessonCompletion(item.lessonId)}
                    title={item.lessonId && lessonCompletionMap.get(item.lessonId)
                      ? '未完了にする'
                      : '完了にする'}
                    aria-label={item.lessonId && lessonCompletionMap.get(item.lessonId)
                      ? 'レッスンを未完了にする'
                      : 'レッスンを完了にする'}
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </nav>

    <!-- Progress summary -->
    <div class="p-4 bg-white border-t border-gray-200">
      <div class="space-y-3">
        <h4 class="text-sm font-medium text-gray-900">学習進捗サマリー</h4>

        {#each progress.phases as phase (phase.phase)}
          <div class="space-y-1">
            <div class="flex justify-between text-xs text-gray-600">
              <span>Phase {phase.phase}: {phase.name}</span>
              <span>{phase.completedLessons}/{phase.totalLessons}</span>
            </div>
            <div class="progress-bar h-1">
              <div
                class="progress-fill h-1"
                style="width: {(phase.completedLessons / phase.totalLessons) * 100}%"
              ></div>
            </div>
          </div>
        {/each}

        <div class="pt-2 border-t border-gray-100">
          <div class="flex justify-between text-sm font-medium text-gray-900">
            <span>全体進捗</span>
            <span>{Math.round((progress.completedHours / progress.totalHours) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</aside>

<!-- Mobile Sidebar -->
{#if open}
  <!-- Backdrop -->
  <div class="fixed inset-0 flex z-40 lg:hidden">
    <div
      class="fixed inset-0 bg-gray-600 bg-opacity-75"
      onclick={() => (open = false)}
      onkeydown={(e) => e.key === 'Escape' && (open = false)}
      role="button"
      tabindex="0"
      aria-label="サイドバーを閉じる"
    ></div>

    <!-- Mobile sidebar panel -->
    <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white">
      <div class="absolute top-0 right-0 -mr-12 pt-2">
        <button
          type="button"
          class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          onclick={() => (open = false)}
        >
          <span class="sr-only">サイドバーを閉じる</span>
          <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
        <nav class="px-4 space-y-6">
          {#each navigationSections as section (section.title)}
            <div>
              <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {section.title}
              </h3>
              <div class="mt-2 space-y-1">
                {#each section.items as item (item.href)}
                  {#if item.status === 'coming-soon'}
                    <div
                      class="flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-not-allowed text-gray-400"
                    >
                      {#if item.icon}
                        <svg
                          class="mr-3 h-5 w-5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d={getIcon(item.icon)}
                          />
                        </svg>
                      {:else if item.lessonId}
                        <div class="mr-3 flex-shrink-0">
                          {#if item.lessonId && lessonCompletionMap.get(item.lessonId)}
                            <div
                              class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                            >
                              <svg
                                class="w-3 h-3 text-white"
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
                          {:else}
                            <div class="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                          {/if}
                        </div>
                      {/if}

                      <span class="truncate">{item.label}</span>
                      {#if item.status === 'coming-soon'}
                        <span class="ml-2 px-2 py-1 text-xs bg-gray-100 text-gray-500 rounded-full"
                          >準備中</span
                        >
                      {/if}
                    </div>
                  {:else}
                    <a
                      href={item.href}
                      class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 {currentPath ===
                      item.href
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}"
                      onclick={() => (open = false)}
                    >
                      {#if item.icon}
                        <svg
                          class="mr-3 h-5 w-5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      {/if}

                      {#if item.lessonId}
                        <div class="mr-3 flex items-center">
                          {#if lessonCompletionMap.get(item.lessonId)}
                            <div
                              class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                            >
                              <svg
                                class="w-3 h-3 text-white"
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
                          {:else}
                            <div class="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                          {/if}
                        </div>
                      {/if}

                      <span class="truncate">{item.label}</span>
                    </a>
                  {/if}
                {/each}
              </div>
            </div>
          {/each}
        </nav>
      </div>
    </div>
  </div>
{/if}

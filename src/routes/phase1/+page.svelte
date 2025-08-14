<script lang="ts">
  import { progressStore } from '$lib/stores/progress';
  import { href } from '$lib/utils/paths';

  let progress = $derived($progressStore);
  let phase1Progress = $derived(progress.phases[0]);

  // Phase 1 詳細データ
  const phase1Data = {
    phase: 1,
    title: '基礎理解',
    duration: '18.5-21.5時間',
    description: 'WebSocketの概念、ネットワーク技術、API基本構造を理解する基礎フェーズ',
    learningGoals: [
      'ブラウザ標準WebSocket APIの基本概念と適用場面を理解する',
      'WebSocketの11の主要カテゴリーの用途を理解し適用判断ができる',
      'HTTP/1.1、HTTP/2、HTTP/3でのWebSocket対応の違いを理解する',
      'End to End通信とHop by Hop通信の違いを理解する',
      'WebSocketハンドシェイクのプロセスを詳細に説明できる'
    ],
    prerequisites: [
      'TypeScript/JavaScript の中級レベルの知識',
      'HTTP プロトコルの基本理解',
      'ネットワーク通信の基礎知識',
      '非同期処理（Promise/async-await）の理解'
    ]
  };

  // セクション詳細データ
  const sections = [
    {
      id: 1,
      title: 'WebSocket 入門',
      duration: '5-7時間',
      description: 'WebSocketの基本概念と適用場面を理解し、他技術との違いを学習',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      accentColor: 'bg-blue-600',
      lessons: [
        {
          id: 'phase1-introduction-what-is-websocket',
          title: 'WebSocketとは何か',
          duration: '1時間',
          description: 'WebSocketの定義、基本概念、ブラウザ標準WebSocket APIの重要性',
          topics: [
            'WebSocketの定義と基本概念',
            'ブラウザ標準WebSocket APIの重要性',
            'リアルタイム通信の必要性',
            'WebSocketの歴史と標準化（RFC 6455）'
          ],
          exercises: [
            'ブラウザ開発者ツールでWebSocket通信を観察',
            '簡単なWebSocketテストサイトでの動作確認'
          ]
        },
        {
          id: 'phase1-introduction-http-limitations',
          title: 'HTTPの限界とWebSocketの優位性',
          duration: '1時間',
          description: 'HTTP通信の制限を理解し、WebSocketによる双方向通信の利点を学習',
          topics: [
            'HTTPリクエスト/レスポンス型の制限',
            'ポーリング手法の問題点',
            'WebSocket APIによる双方向通信の実現',
            '2016年以降のブラウザ対応状況'
          ],
          exercises: [
            'ポーリングとWebSocketのパフォーマンス比較',
            'ネットワークトラフィックの測定と分析'
          ]
        },
        {
          id: 'phase1-introduction-use-cases',
          title: 'WebSocketの利用例と適用場面',
          duration: '2-3時間',
          description: 'WebSocketの11の主要カテゴリーと実際の適用事例を詳しく学習',
          topics: [
            'リアルタイム通信（チャット、Discord、サポートチャット）',
            '共同編集（Google Docs風、コード共同編集）',
            '通知・アラート（在庫更新、リアルタイムアラート）',
            'データ配信（株価、為替、スポーツスコア）',
            'IoT連携（スマートホーム、センサー通知）',
            'PWA統合（オフライン対応、Service Worker連携）',
            'Webベースシミュレーション',
            'バックエンド連携（GraphQL Subscriptions）',
            'セキュリティ・監査',
            '金融・医療アプリケーション',
            'VR/メタバース連携'
          ],
          exercises: [
            '11カテゴリーからの適用場面選択演習',
            'アーキテクチャ構成図の作成',
            '既存WebSocketアプリの分類・分析',
            '自分のプロジェクトでの適用可能性検討'
          ]
        },
        {
          id: 'phase1-introduction-comparison',
          title: 'WebSocket vs 他技術の比較理解',
          duration: '1時間',
          description: '他の通信技術との違いを理解し、適切な技術選択ができるようになる',
          topics: [
            'WebSocket vs WebTransport',
            'WebSocket vs Server-Sent Events (SSE)',
            'WebSocket vs Socket.IO（概要）',
            '使い分けの判断基準'
          ],
          exercises: ['具体的な用途での技術選択演習', '現在のブラウザ対応状況調査']
        }
      ]
    },
    {
      id: 2,
      title: 'ネットワーク技術',
      duration: '6.5-7.5時間',
      description: 'WebSocketを支えるネットワーク技術の基盤を理解',
      color: 'bg-green-100 text-green-800 border-green-200',
      accentColor: 'bg-green-600',
      lessons: [
        {
          id: '2.1',
          title: 'WebSocketを理解するためのHTTP基礎',
          duration: '45分',
          description: 'HTTP/1.0とHTTP/1.1の違いとWebSocketとの関係',
          topics: [
            'HTTP/1.0 vs HTTP/1.1の接続管理の違い',
            '持続的接続（Keep-Alive）による効率化',
            'WebSocketがHTTP/1.1の持続的接続を前提とする理由'
          ],
          exercises: ['HTTP/1.0とHTTP/1.1の接続パターン比較', 'cURLコマンドでの接続ヘッダー確認']
        },
        {
          id: '2.2',
          title: 'OSI参照モデルとWebSocketの位置',
          duration: '1時間',
          description: 'ネットワーク層とWebSocketの位置づけを理解',
          topics: [
            'OSI 7層モデルの復習',
            'WebSocket（セッション層）とSocket（トランスポート層）の違い',
            'HTTPからWebSocketへのプロトコル昇格'
          ],
          exercises: ['Wiresharkを使ったパケット解析', 'WebSocketハンドシェイクの詳細観察']
        },
        {
          id: '2.3',
          title: 'HTTP/1.1からHTTP/3までのWebSocket対応',
          duration: '2時間',
          description: '各HTTPバージョンでのWebSocket動作の違いを学習',
          topics: [
            'HTTP/1.1でのWebSocketハンドシェイクの基礎',
            'HTTP/2環境でのWebSocket動作',
            'HTTP/3 (QUIC)でのWebSocketの位置づけ',
            'WebTransport APIとの比較・将来性'
          ],
          exercises: [
            '各HTTPバージョンでのWebSocket接続テスト',
            'パフォーマンス比較測定',
            'HTTP/3対応サービスでの動作確認'
          ]
        },
        {
          id: '2.4',
          title: 'WebSocket接続確立プロセス',
          duration: '1.5-2.5時間',
          description: 'WebSocket接続確立の詳細なプロセスを理解',
          topics: [
            'End to End vs Hop by Hop通信の基礎',
            'HTTP/1.1 Upgradeハンドシェイクの詳細',
            'WebSocketキーの生成と検証',
            'プロトコルネゴシエーション',
            'プロキシ・ファイアウォール環境での動作'
          ],
          exercises: [
            'curlコマンドでWebSocketハンドシェイクを手動実行',
            'ハンドシェイクヘッダーの検証実装',
            'プロキシ環境でのWebSocket接続テスト'
          ]
        },
        {
          id: '2.5',
          title: 'セキュリティとポート管理',
          duration: '1時間',
          description: 'WebSocketのセキュリティ要件とポート管理',
          topics: [
            'ws（ポート80）とwss（ポート443）の違い',
            'Originチェックとセキュリティ',
            'ファイアウォール・プロキシとの関係',
            'CORSとの違い'
          ],
          exercises: ['wss接続の設定と証明書管理', 'Originチェックの実装']
        }
      ]
    },
    {
      id: 3,
      title: 'WebSocket API の基本構造',
      duration: '5-6時間',
      description: 'WebSocket APIの基本的な構造と動作メカニズムを理解',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      accentColor: 'bg-purple-600',
      lessons: [
        {
          id: 'phase1-websocket-states',
          title: 'WebSocket状態とライフサイクル',
          duration: '30分',
          description: 'WebSocketの4つの状態と状態遷移を実際の接続で学習',
          topics: [
            'ReadyStateの4つの状態（CONNECTING, OPEN, CLOSING, CLOSED）',
            '状態遷移のタイミングとイベントハンドラ',
            '正常なクローズハンドシェイクと異常切断',
            'Close Codeによる切断理由の識別'
          ],
          exercises: ['リアルタイム状態可視化での接続観察', '異なる公開サービスでの状態比較']
        },
        {
          id: '3.1',
          title: 'WebSocket接続ライフサイクル詳細',
          duration: '1.5時間',
          description: 'WebSocket接続の開始から終了までの詳細なライフサイクル',
          topics: [
            '接続確立（ハンドシェイク）の詳細プロセス',
            'データ通信フェーズでの双方向通信',
            '接続終了（クローズハンドシェイク）',
            '異常切断の検出と処理'
          ],
          exercises: ['TypeScriptでWebSocket接続状態の管理実装', '接続品質の監視システム作成']
        },
        {
          id: '3.2',
          title: 'イベントベース通信モデル',
          duration: '2時間',
          description: 'WebSocketのイベントドリブンな通信モデルを理解',
          topics: [
            'onopen, onmessage, onclose, onerrorイベント',
            'RxJS経験者向け: ObservableパターンでのWebSocket管理',
            'Svelteへの移行: Svelteストアでの WebSocket管理',
            'Promise/async-awaitでのラッピング'
          ],
          exercises: ['イベントハンドラーの実装', 'SvelteストアでのWebSocket状態管理']
        },
        {
          id: '3.3',
          title: 'クライアント・サーバー役割分担',
          duration: '1-2時間',
          description: 'WebSocketにおけるクライアントとサーバーの責務',
          topics: ['クライアント側の責務', 'サーバー側の責務', '状態管理とセッション管理'],
          exercises: [
            'Node.js + TypeScript + 標準wsライブラリでWebSocketサーバー実装',
            '複数クライアント接続管理'
          ]
        }
      ]
    },
    {
      id: 4,
      title: 'WebSocket API の基本操作',
      duration: '4-5時間',
      description: 'ブラウザ標準WebSocket APIの基本的な操作方法を習得',
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      accentColor: 'bg-orange-600',
      lessons: [
        {
          id: '4.1',
          title: 'WebSocket URL と接続確立',
          duration: '1時間',
          description: 'WebSocket URLの形式と接続の確立方法',
          topics: [
            'WebSocket URL形式（ws://, wss://）',
            'サブプロトコルの指定',
            '接続オプションとヘッダー'
          ],
          exercises: ['環境別（開発・本番）の接続設定', '接続パラメータの動的生成']
        },
        {
          id: '4.2',
          title: 'ブラウザ標準WebSocket API実装',
          duration: '2-3時間',
          description: 'ブラウザ標準APIを使った実装方法の習得',
          topics: [
            'ブラウザ標準WebSocket APIの基本使用法',
            'SvelteKitでのクライアント側WebSocket処理',
            'Svelteコンポーネントでのリアルタイムデータ表示',
            'TypeScriptでの型定義とSvelteでの利用'
          ],
          exercises: ['基本的なWebSocket接続の実装', 'Svelteストア形式のWebSocketクライアント作成']
        },
        {
          id: '4.3',
          title: '接続失敗と再接続処理',
          duration: '1-2時間',
          description: '堅牢な接続管理と再接続メカニズムの実装',
          topics: ['接続失敗の種類と原因', '指数バックオフによる再接続', '接続品質の監視'],
          exercises: ['堅牢な再接続ロジックの実装', '接続状態インジケーターの作成']
        }
      ]
    }
  ];

  let mounted = $derived(typeof window !== 'undefined');

  // セクションの進捗率を計算
  function getSectionProgress(sectionId: number): number {
    if (!phase1Progress) return 0;
    const sectionLessons = sections[sectionId - 1]?.lessons || [];
    const completedCount = sectionLessons.filter(
      (lesson) => phase1Progress.lessons.find((l) => l.id === lesson.id)?.completed
    ).length;
    return Math.round((completedCount / sectionLessons.length) * 100);
  }

  // レッスンの完了状態を取得
  function isLessonCompleted(lessonId: string): boolean {
    if (!phase1Progress) return false;
    return phase1Progress.lessons.find((l) => l.id === lessonId)?.completed || false;
  }

  // lessonIdから適切なパスを生成
  function getLessonPath(lessonId: string): string {
    // 新しいPhase構造のlessonIdマッピング
    const lessonPaths: Record<string, string> = {
      'phase1-introduction-what-is-websocket': '/phase1/introduction/what-is-websocket',
      'phase1-introduction-http-limitations': '/phase1/introduction/http-limitations',
      'phase1-introduction-use-cases': '/phase1/introduction/use-cases',
      'phase1-introduction-comparison': '/phase1/introduction/comparison',
      'phase1-websocket-states': '/phase1/websocket-states',
      // ネットワーク技術レッスン
      '2.1': '/phase1/network-tech/http-basics',
      '2.2': '/phase1/network-tech/osi-model',
      '2.3': '/phase1/network-tech/http-versions',
      '2.4': '/phase1/network-tech/tcp-websocket',
      '2.5': '/phase1/network-tech/security-ports',
      // 古いIDとの後方互換性
      '1.1': '/phase1/introduction/what-is-websocket',
      '1.2': '/phase1/introduction/http-limitations',
      '1.3': '/phase1/introduction/use-cases',
      '1.4': '/phase1/introduction/comparison',
      'phase1-use-cases': '/phase1/introduction/use-cases',
      '3.1': '/phase1/websocket-states'
    };

    return lessonPaths[lessonId] || `/phase1/introduction/${lessonId}`;
  }

  // 次の推奨レッスンを取得
  let nextLesson = $derived(
    (() => {
      if (!phase1Progress) return null;
      for (const section of sections) {
        const incompleteLesson = section.lessons.find((lesson) => !isLessonCompleted(lesson.id));
        if (incompleteLesson) {
          return {
            lessonId: incompleteLesson.id,
            title: incompleteLesson.title,
            sectionTitle: section.title,
            path: getLessonPath(incompleteLesson.id)
          };
        }
      }
      return null;
    })()
  );
</script>

<svelte:head>
  <title>Phase 1: 基礎理解 - WebSocket Learning</title>
  <meta
    name="description"
    content="WebSocket基礎理解フェーズ。WebSocketの概念、ネットワーク技術、API基本構造を18.5-21.5時間で体系的に学習。"
  />
</svelte:head>

<!-- Header Section -->
<section class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between">
      <div class="flex-shrink-0" style="width: 60%">
        <nav class="text-blue-200 text-sm mb-4">
          <a href={href('/curriculum')} class="hover:text-white">カリキュラム</a>
          <span class="mx-2">›</span>
          <span>Phase 1</span>
        </nav>
        <h1 class="text-4xl font-bold mb-4">Phase 1: {phase1Data.title}</h1>
        <p class="text-xl text-blue-100 mb-6 max-w-none pr-4">{phase1Data.description}</p>
        <div class="flex items-center space-x-6">
          <div class="bg-white/10 rounded-lg px-4 py-2 w-40">
            <span class="text-blue-200 text-sm text-center block">推奨学習時間</span>
            <div class="font-bold text-center">{phase1Data.duration}</div>
          </div>
          {#if mounted && phase1Progress}
            <div class="bg-white/10 rounded-lg px-4 py-2 w-32">
              <span class="text-blue-200 text-sm text-center block">完了レッスン</span>
              <div class="font-bold text-center">
                {phase1Progress.completedLessons}/{phase1Progress.totalLessons}
              </div>
            </div>
            <div class="bg-white/10 rounded-lg px-4 py-2 w-20">
              <span class="text-blue-200 text-sm text-center block">進捗率</span>
              <div class="font-bold text-center">
                {Math.round((phase1Progress.completedLessons / phase1Progress.totalLessons) * 100)}%
              </div>
            </div>
          {/if}
        </div>
      </div>

      <div class="flex-shrink-0 hidden lg:block" style="width: 40%">
        {#if mounted && phase1Progress}
          <div class="mb-6">
            <div class="text-blue-200 text-sm mb-2">Phase 1 進捗状況</div>
            <div class="bg-white/10 rounded-lg p-4">
              <div class="flex justify-between text-sm text-blue-100 mb-2">
                <span>完了率</span>
                <span
                  >{Math.round(
                    (phase1Progress.completedLessons / phase1Progress.totalLessons) * 100
                  )}%</span
                >
              </div>
              <div class="w-64 bg-white/20 rounded-full h-2">
                <div
                  class="bg-white h-2 rounded-full transition-all duration-300"
                  style="width: {(phase1Progress.completedLessons / phase1Progress.totalLessons) *
                    100}%"
                ></div>
              </div>
              <div class="text-xs text-blue-200 mt-1">
                {phase1Progress.completedLessons} / {phase1Progress.totalLessons} レッスン完了
              </div>
            </div>
          </div>
        {/if}

        {#if nextLesson}
          <div class="text-center">
            <div class="text-blue-200 text-sm mb-2">次の推奨レッスン</div>
            <a
              href={href(nextLesson.path)}
              class="btn-primary bg-white text-blue-600 hover:bg-gray-50 w-full block"
              style="font-size: clamp(0.65rem, 2vw, 0.875rem); line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
            >
              {nextLesson.title}
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>

<!-- 学習目標と前提知識 -->
<section class="py-12 theme-bg-primary">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="card">
        <h2 class="text-2xl font-bold theme-text-primary mb-4">🎯 学習目標</h2>
        <ul class="space-y-2">
          {#each phase1Data.learningGoals as goal (goal)}
            <li class="flex items-start">
              <span class="text-blue-600 mr-2 mt-1">✓</span>
              <span class="theme-text-secondary">{goal}</span>
            </li>
          {/each}
        </ul>
      </div>

      <div class="card">
        <h2 class="text-2xl font-bold theme-text-primary mb-4">📋 前提知識</h2>
        <ul class="space-y-2">
          {#each phase1Data.prerequisites as prerequisite (prerequisite)}
            <li class="flex items-start">
              <span class="text-gray-400 mr-2 mt-1">•</span>
              <span class="theme-text-secondary">{prerequisite}</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- セクション詳細 -->
<section class="py-16 bg-gray-50 dark:bg-gray-900">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold theme-text-primary mb-4">学習セクション</h2>
      <p class="text-lg theme-text-secondary max-w-3xl mx-auto">
        4つのセクションで段階的にWebSocketの基礎を理解します
      </p>
    </div>

    <div class="space-y-8">
      {#each sections as section (section.id)}
        <div class="card border-l-4 {section.color.split(' ')[2]} theme-bg-primary">
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div
                  class="{section.accentColor} text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4"
                >
                  {section.id}
                </div>
                <div>
                  <h3 class="text-xl font-bold theme-text-primary">
                    {section.title}
                  </h3>
                  <div class="flex items-center space-x-4 mt-1">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {section.color}"
                    >
                      {section.duration}
                    </span>
                    {#if mounted}
                      <span class="text-sm theme-text-muted">
                        進捗: {getSectionProgress(section.id)}%
                      </span>
                    {/if}
                  </div>
                </div>
              </div>
              <a href={href(getLessonPath(section.lessons[0].id))} class="btn-secondary">
                セクション開始
              </a>
            </div>
            <p class="theme-text-secondary">{section.description}</p>
          </div>

          <!-- レッスン一覧 -->
          <div class="space-y-4">
            {#each section.lessons as lesson (lesson.id)}
              <div
                class="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 {isLessonCompleted(lesson.id)
                  ? 'border-l-4 border-green-500'
                  : ''}"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <div class="flex items-center mb-2">
                      {#if isLessonCompleted(lesson.id)}
                        <div
                          class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3"
                        >
                          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fill-rule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </div>
                      {:else}
                        <div class="w-6 h-6 border-2 border-gray-300 rounded-full mr-3"></div>
                      {/if}
                      <h4 class="text-lg font-semibold theme-text-primary">
                        {lesson.title}
                      </h4>
                      <span
                        class="ml-3 inline-flex items-center px-2 py-1 rounded text-xs font-medium theme-bg-tertiary theme-text-secondary"
                      >
                        {lesson.duration}
                      </span>
                    </div>
                    <p class="theme-text-secondary mb-4 ml-9">{lesson.description}</p>

                    <div class="ml-9 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h5 class="font-medium theme-text-primary mb-2">📚 学習内容</h5>
                        <ul class="space-y-1">
                          {#each lesson.topics as topic (topic)}
                            <li class="text-sm theme-text-secondary flex items-start">
                              <span class="text-gray-400 mr-2">•</span>
                              <span>{topic}</span>
                            </li>
                          {/each}
                        </ul>
                      </div>

                      <div>
                        <h5 class="font-medium theme-text-primary mb-2">💻 演習</h5>
                        <ul class="space-y-1">
                          {#each lesson.exercises as exercise (exercise)}
                            <li class="text-sm theme-text-secondary flex items-start">
                              <span class="text-blue-500 mr-2">▸</span>
                              <span>{exercise}</span>
                            </li>
                          {/each}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div class="ml-6">
                    <a
                      href={href(getLessonPath(lesson.id))}
                      class="btn-primary {isLessonCompleted(lesson.id)
                        ? 'bg-green-600 hover:bg-green-700'
                        : ''}"
                    >
                      {isLessonCompleted(lesson.id) ? '復習する' : '学習開始'}
                    </a>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Phase進捗と次のステップ -->
<section class="py-16 theme-bg-primary">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    {#if mounted && phase1Progress}
      <div class="mb-8">
        <h2 class="text-2xl font-bold theme-text-primary mb-4">Phase 1 進捗状況</h2>
        <div class="max-w-md mx-auto">
          <div class="flex justify-between text-sm theme-text-secondary mb-2">
            <span>完了率</span>
            <span
              >{Math.round(
                (phase1Progress.completedLessons / phase1Progress.totalLessons) * 100
              )}%</span
            >
          </div>
          <div class="progress-bar h-4">
            <div
              class="progress-fill h-4 rounded-full"
              style="width: {(phase1Progress.completedLessons / phase1Progress.totalLessons) *
                100}%"
            ></div>
          </div>
          <div class="text-sm theme-text-muted mt-2">
            {phase1Progress.completedLessons} / {phase1Progress.totalLessons} レッスン完了
          </div>
        </div>
      </div>

      {#if phase1Progress.completedLessons === phase1Progress.totalLessons}
        <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div class="text-green-800">
            <h3 class="text-lg font-semibold mb-2">🎉 Phase 1 完了おめでとうございます！</h3>
            <p class="mb-4">
              WebSocketの基礎理解を習得しました。次はPhase 2で実装技術を学習しましょう。
            </p>
            <a href={href('/phase2')} class="btn-primary">Phase 2: 実装技術に進む</a>
          </div>
        </div>
      {:else if nextLesson}
        <div
          class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
        >
          <div class="text-blue-800 dark:text-blue-300">
            <h3 class="text-lg font-semibold mb-2">📖 次の学習</h3>
            <p class="mb-4 theme-text-secondary">
              {nextLesson.sectionTitle} の続きを学習しましょう
            </p>
            <a href={href(nextLesson.path)} class="btn-primary">
              {nextLesson.title}
            </a>
          </div>
        </div>
      {/if}
    {/if}

    <div class="mt-12 flex justify-center space-x-4">
      <a href={href('/curriculum')} class="btn-secondary"> カリキュラム概要に戻る </a>
      <a href={href('/table-of-contents')} class="btn-secondary"> 全体目次を見る </a>
    </div>
  </div>
</section>

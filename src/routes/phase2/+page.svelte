<script lang="ts">
  import { progressStore } from '$lib/stores/progress';
  import { href } from '$lib/utils/paths';

  let progress = $derived($progressStore);
  let phase2Progress = $derived(progress.phases[1]);

  // Phase 2 詳細データ
  const phase2Data = {
    phase: 2,
    title: '実装技術',
    duration: '20-23時間',
    description:
      'ローカル開発環境でWebSocketプロトコルの詳細を学習し、フレーム構造・サブプロトコルの実装を理解する',
    learningGoals: [
      'WebSocketフレーム構造とバイナリプロトコルを詳細に理解する',
      'GraphQL-WS、MQTT over WebSocketなどのサブプロトコルを実装できる',
      'Docker環境でのWebSocketサーバー構築・管理ができる',
      'プロトコルレベルでのデバッグとトラブルシューティングができる',
      'WebSocketの拡張機能とカスタムプロトコルを設計できる'
    ],
    prerequisites: [
      'Phase 1の完了（WebSocket基礎知識）',
      'Node.js/npm の基本操作',
      'Docker/Docker Compose の基本理解',
      'バイナリデータとフレーミングの概念',
      'GraphQL や MQTT の基礎知識'
    ]
  };

  // セクション詳細データ
  const sections = [
    {
      id: 1,
      title: 'データ通信実装',
      duration: '6-7時間',
      description: 'WebSocketデータ通信の実装詳細とSvelteストア連携を学習',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      accentColor: 'bg-blue-600',
      lessons: [
        {
          id: 'phase2-data-communication-svelte-stores',
          title: 'WebSocketとSvelteストアの連携',
          duration: '2時間',
          description: 'Svelteの反応性とWebSocketを統合したストア設計パターン',
          topics: [
            'Svelte 5 Runes での WebSocket ストア設計',
            'リアクティブな接続状態管理',
            'メッセージ履歴とキューイング',
            'エラーハンドリングとリトライ機能'
          ],
          exercises: [
            '基本的なWebSocketストアの実装',
            '接続状態の可視化コンポーネント作成',
            'メッセージログ表示機能の実装'
          ]
        },
        {
          id: 'phase2-data-communication-send-receive',
          title: 'メッセージ送受信とタイプセーフティ',
          duration: '2時間',
          description: 'TypeScriptを活用したタイプセーフなメッセージハンドリング',
          topics: [
            'メッセージ型定義とバリデーション',
            'シリアライゼーション/デシリアライゼーション',
            'バイナリデータとテキストデータの処理',
            'メッセージルーティングパターン'
          ],
          exercises: [
            '型安全なメッセージインターフェース設計',
            'JSONスキーマバリデーション実装',
            'バイナリメッセージのエンコード/デコード'
          ]
        },
        {
          id: 'phase2-data-communication-error-handling',
          title: 'エラーハンドリングと品質保証',
          duration: '2-3時間',
          description: '堅牢なWebSocketアプリケーションのためのエラー処理',
          topics: [
            '接続エラーの分類と対処法',
            '自動再接続アルゴリズム',
            'メッセージ送信失敗時のリトライ',
            '品質監視とアラート機能'
          ],
          exercises: [
            '指数バックオフ再接続の実装',
            'メッセージ送信キューとフェイルセーフ',
            '接続品質メトリクス収集'
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'フレーム・プロトコル実装',
      duration: '8-9時間',
      description: 'WebSocketフレーム構造とサブプロトコルの詳細実装',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      accentColor: 'bg-purple-600',
      lessons: [
        {
          id: 'phase2-frames-protocols-frame-structure',
          title: 'WebSocketフレーム構造の詳細解析',
          duration: '2時間',
          description: 'RFC 6455フレーム仕様の完全理解とバイナリ解析',
          topics: [
            'フレームヘッダーの構造（FIN, RSV, Opcode, MASK, Payload length）',
            'ペイロードデータとマスキング',
            '制御フレーム（Ping, Pong, Close）',
            'フレーム分割と再構築'
          ],
          exercises: [
            'フレームパーサーの実装',
            'バイナリフレーム可視化ツール作成',
            '制御フレームハンドリング実装'
          ]
        },
        {
          id: 'phase2-frames-protocols-binary-data',
          title: 'バイナリデータとストリーミング',
          duration: '2時間',
          description: 'バイナリメッセージの効率的な処理とストリーミング実装',
          topics: [
            'ArrayBuffer と TypedArray の活用',
            'ストリーミングデータの分割処理',
            '圧縮（deflate-frame）の実装',
            '大容量データの転送最適化'
          ],
          exercises: [
            'バイナリチャット実装',
            'ファイル転送機能の作成',
            'ストリーミングオーディオの実装'
          ]
        },
        {
          id: 'phase2-frames-protocols-subprotocols',
          title: 'サブプロトコルとネゴシエーション',
          duration: '2時間',
          description: 'WebSocketサブプロトコルの設計と実装パターン',
          topics: [
            'Sec-WebSocket-Protocol ヘッダー',
            'プロトコルネゴシエーション',
            'カスタムサブプロトコルの設計',
            'プロトコルバージョニング'
          ],
          exercises: [
            '独自サブプロトコルの設計・実装',
            'プロトコル互換性テスト',
            'マルチプロトコル対応サーバー構築'
          ]
        },
        {
          id: 'phase2-frames-protocols-graphql-ws',
          title: 'GraphQL-WS プロトコル実装',
          duration: '1時間',
          description: 'GraphQL Subscriptions over WebSocket の実装',
          topics: [
            'graphql-ws サブプロトコル仕様',
            'Connection Init/Ack フロー',
            'Subscription 管理とライフサイクル',
            'GraphQL クエリの動的実行'
          ],
          exercises: [
            'GraphQL-WS クライアント実装',
            'リアルタイムクエリ実行',
            'Subscription 管理ダッシュボード'
          ]
        },
        {
          id: 'phase2-frames-protocols-mqtt',
          title: 'MQTT over WebSocket 実装',
          duration: '1時間',
          description: 'IoT向けMQTTプロトコルのWebSocket実装',
          topics: [
            'MQTT over WebSocket 仕様',
            'Publish/Subscribe パターン',
            'QoS レベルと信頼性保証',
            'IoT デバイス連携'
          ],
          exercises: [
            'MQTT ブローカー接続実装',
            'デバイスデータ可視化',
            'IoT シミュレーション環境構築'
          ]
        }
      ]
    },
    {
      id: 3,
      title: '高度なトピックス',
      duration: '6-7時間',
      description: 'セキュリティ、PWA統合、スケーラビリティなどの実用的なトピック',
      color: 'bg-green-100 text-green-800 border-green-200',
      accentColor: 'bg-green-600',
      lessons: [
        {
          id: 'phase2-advanced-topics-security',
          title: 'WebSocketセキュリティ実装',
          duration: '2-3時間',
          description: '認証・認可・暗号化などのセキュリティ対策実装',
          topics: [
            'JWT トークン認証の実装',
            'Origin 検証とCSRF対策',
            'レート制限とDDoS対策',
            'TLS/SSL 設定とセキュリティヘッダー'
          ],
          exercises: [
            '認証付きWebSocketサーバー構築',
            'セキュリティ攻撃のシミュレーション',
            'セキュリティ監査とペネトレーションテスト'
          ]
        },
        {
          id: 'phase2-advanced-topics-pwa-integration',
          title: 'PWAとの統合実装',
          duration: '2時間',
          description: 'Progressive Web Appでのオフライン対応とService Worker連携',
          topics: [
            'Service Worker でのWebSocket管理',
            'オフライン時のメッセージキューイング',
            'バックグラウンド同期',
            'Push Notification 連携'
          ],
          exercises: [
            'オフライン対応チャットアプリ',
            'Service Worker メッセージングハブ',
            'PWA WebSocket 統合ライブラリ'
          ]
        },
        {
          id: 'phase2-advanced-topics-scalability',
          title: 'スケーラビリティと負荷分散',
          duration: '2時間',
          description: '大規模WebSocketアプリケーションの設計と実装',
          topics: [
            'Redis を使った水平スケーリング',
            'ロードバランサーでの WebSocket 対応',
            'クラスタリングと状態共有',
            'パフォーマンス監視と最適化'
          ],
          exercises: [
            'Redis Pub/Sub 実装',
            'マルチインスタンス負荷分散',
            'スケーラビリティテストとベンチマーク'
          ]
        }
      ]
    }
  ];

  let mounted = $derived(typeof window !== 'undefined');

  // セクションの進捗率を計算
  function getSectionProgress(sectionId: number): number {
    if (!phase2Progress) return 0;
    const sectionLessons = sections[sectionId - 1]?.lessons || [];
    const completedCount = sectionLessons.filter(
      (lesson) => phase2Progress.lessons.find((l) => l.id === lesson.id)?.completed
    ).length;
    return Math.round((completedCount / sectionLessons.length) * 100);
  }

  // レッスンの完了状態を取得
  function isLessonCompleted(lessonId: string): boolean {
    if (!phase2Progress) return false;
    return phase2Progress.lessons.find((l) => l.id === lessonId)?.completed || false;
  }

  // lessonIdから適切なパスを生成
  function getLessonPath(lessonId: string): string {
    // Phase2のパスマッピング
    const lessonPaths: Record<string, string> = {
      'phase2-data-communication-svelte-stores': '/phase2/data/communication/svelte/stores',
      'phase2-data-communication-send-receive': '/phase2/data/communication/send/receive',
      'phase2-data-communication-error-handling': '/phase2/data/communication/error/handling',
      'phase2-frames-protocols-frame-structure': '/phase2/frames/protocols/frame/structure',
      'phase2-frames-protocols-binary-data': '/phase2/frames/protocols/binary/data',
      'phase2-frames-protocols-subprotocols': '/phase2/frames/protocols/subprotocols',
      'phase2-frames-protocols-graphql-ws': '/phase2/frames/protocols/graphql/ws',
      'phase2-frames-protocols-mqtt': '/phase2/frames/protocols/mqtt',
      'phase2-advanced-topics-security': '/phase2/advanced/topics/security',
      'phase2-advanced-topics-pwa-integration': '/phase2/advanced/topics/pwa/integration',
      'phase2-advanced-topics-scalability': '/phase2/advanced/topics/scalability'
    };

    return lessonPaths[lessonId] || `/phase2/${lessonId}`;
  }

  // 次の推奨レッスンを取得
  let nextLesson = $derived(
    (() => {
      if (!phase2Progress) return null;
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
  <title>Phase 2: 実装技術 - WebSocket Learning</title>
  <meta
    name="description"
    content="WebSocket実装技術フェーズ。フレーム構造、サブプロトコル、セキュリティなどを20-23時間で体系的に学習。"
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
          <span>Phase 2</span>
        </nav>
        <h1 class="text-4xl font-bold mb-4">Phase 2: {phase2Data.title}</h1>
        <p class="text-xl text-blue-100 mb-6 max-w-none pr-4">{phase2Data.description}</p>
        <div class="flex items-center space-x-6">
          <div class="bg-white/10 rounded-lg px-4 py-2 w-40">
            <span class="text-blue-200 text-sm text-center block">推奨学習時間</span>
            <div class="font-bold text-center">{phase2Data.duration}</div>
          </div>
          {#if mounted && phase2Progress}
            <div class="bg-white/10 rounded-lg px-4 py-2 w-32">
              <span class="text-blue-200 text-sm text-center block">完了レッスン</span>
              <div class="font-bold text-center">
                {phase2Progress.completedLessons}/{phase2Progress.totalLessons}
              </div>
            </div>
            <div class="bg-white/10 rounded-lg px-4 py-2 w-20">
              <span class="text-blue-200 text-sm text-center block">進捗率</span>
              <div class="font-bold text-center">
                {Math.round((phase2Progress.completedLessons / phase2Progress.totalLessons) * 100)}%
              </div>
            </div>
          {/if}
        </div>
      </div>

      <div class="flex-shrink-0 hidden lg:block" style="width: 40%">
        {#if mounted && phase2Progress}
          <div class="mb-6">
            <div class="text-blue-200 text-sm mb-2">Phase 2 進捗状況</div>
            <div class="bg-white/10 rounded-lg p-4">
              <div class="flex justify-between text-sm text-blue-100 mb-2">
                <span>完了率</span>
                <span
                  >{Math.round(
                    (phase2Progress.completedLessons / phase2Progress.totalLessons) * 100
                  )}%</span
                >
              </div>
              <div class="w-64 bg-white/20 rounded-full h-2">
                <div
                  class="bg-white h-2 rounded-full transition-all duration-300"
                  style="width: {(phase2Progress.completedLessons / phase2Progress.totalLessons) *
                    100}%"
                ></div>
              </div>
              <div class="text-xs text-blue-200 mt-1">
                {phase2Progress.completedLessons} / {phase2Progress.totalLessons} レッスン完了
              </div>
            </div>
          </div>
        {/if}

        {#if nextLesson}
          <div class="text-center">
            <div class="text-blue-200 text-sm mb-2">次の推奨レッスン</div>
            <a
              href={nextLesson.path}
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
<section class="py-12 bg-white dark:bg-gray-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="card">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">🎯 学習目標</h2>
        <ul class="space-y-2">
          {#each phase2Data.learningGoals as goal (goal)}
            <li class="flex items-start">
              <span class="text-blue-600 mr-2 mt-1">✓</span>
              <span class="text-gray-700 dark:text-gray-300">{goal}</span>
            </li>
          {/each}
        </ul>
      </div>

      <div class="card">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">📋 前提知識</h2>
        <ul class="space-y-2">
          {#each phase2Data.prerequisites as prerequisite (prerequisite)}
            <li class="flex items-start">
              <span class="text-gray-400 mr-2 mt-1">•</span>
              <span class="text-gray-700 dark:text-gray-300">{prerequisite}</span>
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
      <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">学習セクション</h2>
      <p class="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
        3つのセクションで段階的にWebSocketの実装技術を習得します
      </p>
    </div>

    <div class="space-y-8">
      {#each sections as section (section.id)}
        <div class="card border-l-4 {section.color.split(' ')[2]} bg-white dark:bg-gray-800">
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <div
                  class="{section.accentColor} text-white w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4"
                >
                  {section.id}
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {section.title}
                  </h3>
                  <div class="flex items-center space-x-4 mt-1">
                    <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {section.color}"
                    >
                      {section.duration}
                    </span>
                    {#if mounted}
                      <span class="text-sm text-gray-500 dark:text-gray-400">
                        進捗: {getSectionProgress(section.id)}%
                      </span>
                    {/if}
                  </div>
                </div>
              </div>
              <a href={getLessonPath(section.lessons[0].id)} class="btn-secondary">
                セクション開始
              </a>
            </div>
            <p class="text-gray-600 dark:text-gray-400">{section.description}</p>
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
                      <h4 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {lesson.title}
                      </h4>
                      <span
                        class="ml-3 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        {lesson.duration}
                      </span>
                    </div>
                    <p class="text-gray-600 dark:text-gray-400 mb-4 ml-9">{lesson.description}</p>

                    <div class="ml-9 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h5 class="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          📚 学習内容
                        </h5>
                        <ul class="space-y-1">
                          {#each lesson.topics as topic (topic)}
                            <li class="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                              <span class="text-gray-400 mr-2">•</span>
                              <span>{topic}</span>
                            </li>
                          {/each}
                        </ul>
                      </div>

                      <div>
                        <h5 class="font-medium text-gray-900 dark:text-gray-100 mb-2">💻 演習</h5>
                        <ul class="space-y-1">
                          {#each lesson.exercises as exercise (exercise)}
                            <li class="text-sm text-gray-600 dark:text-gray-400 flex items-start">
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
                      href={getLessonPath(lesson.id)}
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
<section class="py-16 bg-white dark:bg-gray-800">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    {#if mounted && phase2Progress}
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Phase 2 進捗状況</h2>
        <div class="max-w-md mx-auto">
          <div class="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>完了率</span>
            <span
              >{Math.round(
                (phase2Progress.completedLessons / phase2Progress.totalLessons) * 100
              )}%</span
            >
          </div>
          <div class="progress-bar h-4">
            <div
              class="progress-fill h-4 rounded-full"
              style="width: {(phase2Progress.completedLessons / phase2Progress.totalLessons) *
                100}%"
            ></div>
          </div>
          <div class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {phase2Progress.completedLessons} / {phase2Progress.totalLessons} レッスン完了
          </div>
        </div>
      </div>

      {#if phase2Progress.completedLessons === phase2Progress.totalLessons}
        <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div class="text-green-800">
            <h3 class="text-lg font-semibold mb-2">🎉 Phase 2 完了おめでとうございます！</h3>
            <p class="mb-4">
              WebSocketの実装技術を習得しました。次はPhase 3でテスト・評価を学習しましょう。
            </p>
            <a href={href('/phase3')} class="btn-primary">Phase 3: テスト・評価に進む</a>
          </div>
        </div>
      {:else if nextLesson}
        <div
          class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
        >
          <div class="text-blue-800 dark:text-blue-300">
            <h3 class="text-lg font-semibold mb-2">📖 次の学習</h3>
            <p class="mb-4 text-gray-700 dark:text-gray-300">
              {nextLesson.sectionTitle} の続きを学習しましょう
            </p>
            <a href={nextLesson.path} class="btn-primary">
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

<!-- Docker Setup Guide -->
<section class="py-12 bg-gray-50 dark:bg-gray-900">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="card">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        🐳 開発環境セットアップ
      </h3>
      <div class="grid md:grid-cols-2 gap-8">
        <div>
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-3">必要な環境</h4>
          <ul class="space-y-2">
            <li class="flex items-start">
              <span class="text-gray-400 mr-2 mt-1">•</span>
              <span class="text-gray-700 dark:text-gray-300">Docker & Docker Compose</span>
            </li>
            <li class="flex items-start">
              <span class="text-gray-400 mr-2 mt-1">•</span>
              <span class="text-gray-700 dark:text-gray-300">Node.js 18+ & npm</span>
            </li>
            <li class="flex items-start">
              <span class="text-gray-400 mr-2 mt-1">•</span>
              <span class="text-gray-700 dark:text-gray-300">Git</span>
            </li>
            <li class="flex items-start">
              <span class="text-gray-400 mr-2 mt-1">•</span>
              <span class="text-gray-700 dark:text-gray-300">VSCode（推奨）</span>
            </li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-3">クイックスタート</h4>
          <div class="bg-gray-800 text-green-400 p-4 rounded-lg font-mono text-sm">
            <div>cd ../websocket-practical-guide-apps</div>
            <div>docker-compose up -d</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

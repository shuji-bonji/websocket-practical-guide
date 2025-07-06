<script lang="ts">
	import { progressStore } from '$lib/stores/progress';

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

	// 進捗計算
	function calculateProgress(section: { lessons: { id: string }[] }) {
		if (!phase2Progress) return 0;
		const completedLessons = section.lessons.filter((lesson) =>
			phase2Progress.lessons.some((l) => l.id === lesson.id && l.completed)
		).length;
		return Math.round((completedLessons / section.lessons.length) * 100);
	}

	function isLessonCompleted(lessonId: string) {
		return phase2Progress?.lessons.some((l) => l.id === lessonId && l.completed) || false;
	}

	function getSectionStatusColor(progress: number) {
		if (progress === 100) return 'bg-green-100 text-green-800';
		if (progress > 0) return 'bg-yellow-100 text-yellow-800';
		return 'bg-gray-100 text-gray-600';
	}
</script>

<svelte:head>
	<title>Phase 2: 実装技術 | WebSocket学習</title>
	<meta name="description" content="WebSocketの実装技術とプロトコル詳細を学習するPhase 2" />
</svelte:head>

<div class="max-w-6xl mx-auto py-8 px-4">
	<!-- Phase Header -->
	<div class="mb-8">
		<nav class="text-sm text-gray-500 mb-4">
			<a href="/" class="hover:text-gray-700">ホーム</a>
			<span class="mx-2">›</span>
			<span class="text-gray-900">Phase 2: 実装技術</span>
		</nav>

		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
			<div class="flex items-start justify-between mb-6">
				<div>
					<h1 class="text-3xl font-bold text-gray-900 mb-4">
						🔧 Phase {phase2Data.phase}: {phase2Data.title}
					</h1>
					<p class="text-lg text-gray-600 mb-4">{phase2Data.description}</p>
					<div class="flex items-center space-x-4 text-sm text-gray-500">
						<div class="flex items-center">
							<svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z"
									clip-rule="evenodd"
								/>
							</svg>
							{phase2Data.duration}
						</div>
						<div class="flex items-center">
							<svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
								<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
							</svg>
							{phase2Progress?.lessons.filter((l) => l.completed).length || 0} / {sections.reduce(
								(total, section) => total + section.lessons.length,
								0
							)} レッスン完了
						</div>
					</div>
				</div>
				<div class="flex-shrink-0">
					<div
						class="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold"
					>
						{phase2Data.phase}
					</div>
				</div>
			</div>

			<!-- 進捗バー -->
			<div class="mb-6">
				<div class="flex justify-between text-sm text-gray-600 mb-2">
					<span>全体進捗</span>
					<span
						>{Math.round(
							((phase2Progress?.lessons.filter((l) => l.completed).length || 0) /
								sections.reduce((total, section) => total + section.lessons.length, 0)) *
								100
						)}%</span
					>
				</div>
				<div class="w-full bg-gray-200 rounded-full h-2">
					<div
						class="bg-blue-600 h-2 rounded-full transition-all duration-300"
						style="width: {Math.round(
							((phase2Progress?.lessons.filter((l) => l.completed).length || 0) /
								sections.reduce((total, section) => total + section.lessons.length, 0)) *
								100
						)}%"
					></div>
				</div>
			</div>

			<!-- 学習目標 -->
			<div class="grid md:grid-cols-2 gap-8">
				<div>
					<h3 class="text-lg font-semibold text-gray-900 mb-3">🎯 学習目標</h3>
					<ul class="space-y-2">
						{#each phase2Data.learningGoals as goal (goal)}
							<li class="flex items-start">
								<svg
									class="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clip-rule="evenodd"
									/>
								</svg>
								<span class="text-gray-700 text-sm">{goal}</span>
							</li>
						{/each}
					</ul>
				</div>

				<div>
					<h3 class="text-lg font-semibold text-gray-900 mb-3">📋 前提条件</h3>
					<ul class="space-y-2">
						{#each phase2Data.prerequisites as prerequisite (prerequisite)}
							<li class="flex items-start">
								<svg
									class="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
								<span class="text-gray-600 text-sm">{prerequisite}</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>

	<!-- Sections -->
	<div class="space-y-8">
		{#each sections as section (section.id)}
			{@const sectionProgress = calculateProgress(section)}
			<div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
				<!-- Section Header -->
				<div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
					<div class="flex items-center justify-between">
						<div class="flex items-center space-x-4">
							<div
								class="w-8 h-8 {section.accentColor} rounded-full flex items-center justify-center text-white text-sm font-bold"
							>
								{section.id}
							</div>
							<div>
								<h2 class="text-xl font-semibold text-gray-900">{section.title}</h2>
								<p class="text-sm text-gray-600">{section.description}</p>
							</div>
						</div>
						<div class="flex items-center space-x-4">
							<span
								class="text-xs {getSectionStatusColor(
									sectionProgress
								)} px-2 py-1 rounded-full font-medium"
							>
								{sectionProgress}% 完了
							</span>
							<span class="text-sm text-gray-500">{section.duration}</span>
						</div>
					</div>

					<!-- Section Progress Bar -->
					<div class="mt-3">
						<div class="w-full bg-gray-200 rounded-full h-1.5">
							<div
								class="{section.accentColor} h-1.5 rounded-full transition-all duration-300"
								style="width: {sectionProgress}%"
							></div>
						</div>
					</div>
				</div>

				<!-- Lessons -->
				<div class="p-6">
					<div class="grid gap-4">
						{#each section.lessons as lesson, lessonIndex (lesson.id)}
							{@const isCompleted = isLessonCompleted(lesson.id)}
							{@const lessonUrl = `/phase2/${lesson.id.replace('phase2-', '').replace(/-/g, '/')}`}
							<a
								href={lessonUrl}
								class="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all group"
							>
								<div class="flex items-start justify-between">
									<div class="flex items-start space-x-3 flex-1">
										<div class="flex-shrink-0 mt-1">
											{#if isCompleted}
												<div
													class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
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
												<div
													class="w-6 h-6 border-2 border-gray-300 rounded-full group-hover:border-blue-400 transition-colors"
												></div>
											{/if}
										</div>
										<div class="flex-1">
											<h3
												class="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors"
											>
												{section.id}.{lessonIndex + 1}
												{lesson.title}
											</h3>
											<p class="text-sm text-gray-600 mt-1">{lesson.description}</p>

											<!-- Topics -->
											<div class="mt-3">
												<h4 class="text-xs font-medium text-gray-500 mb-2">学習トピック:</h4>
												<div class="flex flex-wrap gap-1">
													{#each lesson.topics.slice(0, 3) as topic (topic)}
														<span class="text-xs {section.color} px-2 py-1 rounded">{topic}</span>
													{/each}
													{#if lesson.topics.length > 3}
														<span class="text-xs text-gray-500 px-2 py-1"
															>+{lesson.topics.length - 3}個</span
														>
													{/if}
												</div>
											</div>

											<!-- Exercises -->
											{#if lesson.exercises?.length > 0}
												<div class="mt-2">
													<h4 class="text-xs font-medium text-gray-500 mb-1">実習:</h4>
													<p class="text-xs text-gray-600">{lesson.exercises.length}個の実習課題</p>
												</div>
											{/if}
										</div>
									</div>
									<div class="flex-shrink-0 ml-4 text-right">
										<div class="text-sm text-gray-500">{lesson.duration}</div>
										<svg
											class="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors mt-1"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
								</div>
							</a>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Next Phase Preview -->
	<div
		class="mt-12 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6"
	>
		<h3 class="text-lg font-semibold text-gray-900 mb-3">🚀 次のフェーズ</h3>
		<div class="flex items-center justify-between">
			<div>
				<h4 class="font-semibold text-gray-900">Phase 3: テスト・評価</h4>
				<p class="text-sm text-gray-600">WebSocketアプリケーションの品質保証とテスト環境構築</p>
			</div>
			<a
				href="/phase3"
				class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
			>
				Phase 3 へ →
			</a>
		</div>
	</div>

	<!-- Docker Setup Guide -->
	<div class="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
		<h3 class="text-lg font-semibold text-gray-900 mb-4">🐳 開発環境セットアップ</h3>
		<div class="grid md:grid-cols-2 gap-6">
			<div>
				<h4 class="font-medium text-gray-900 mb-2">必要な環境</h4>
				<ul class="text-sm text-gray-600 space-y-1">
					<li>• Docker & Docker Compose</li>
					<li>• Node.js 18+ & npm</li>
					<li>• Git</li>
					<li>• VSCode（推奨）</li>
				</ul>
			</div>
			<div>
				<h4 class="font-medium text-gray-900 mb-2">クイックスタート</h4>
				<div class="bg-gray-800 text-green-400 p-3 rounded font-mono text-sm">
					<div>cd ../websocket-learning-apps</div>
					<div>docker-compose up -d</div>
				</div>
			</div>
		</div>
	</div>
</div>

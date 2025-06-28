<script lang="ts">
	import { progressStore } from '$lib/stores/progress';

	let progress = $derived($progressStore);

	// カリキュラム全体の概要データ
	const curriculumOverview = {
		totalHours: '50-60時間',
		targetLevel: 'TypeScript/JavaScript中級者',
		goal: 'ブラウザ標準WebSocket APIを使ったモダンなリアルタイムWebアプリケーション（PWA対応）の設計・実装',
		techStack: [
			'フロントエンド: Svelte/SvelteKit + TypeScript',
			'バックエンド: Node.js + TypeScript + WebSocket標準ライブラリ',
			'テスト: Vitest + Playwright',
			'PWA: Service Worker + WebSocket統合'
		]
	};

	// Phase詳細データ
	const phases = [
		{
			phase: 1,
			title: '基礎理解',
			duration: '18.5-21.5時間',
			description: 'WebSocketの概念、ネットワーク技術、API基本構造を理解',
			color: 'bg-blue-100 text-blue-800 border-blue-200',
			accentColor: 'bg-blue-600',
			sections: [
				{
					id: '1',
					title: 'WebSocket 入門',
					duration: '5-7時間',
					topics: [
						'WebSocketとは何か',
						'HTTPの限界とWebSocketの優位性',
						'WebSocketの利用例と適用場面',
						'WebSocket vs 他技術の比較理解'
					]
				},
				{
					id: '2',
					title: 'ネットワーク技術',
					duration: '6.5-7.5時間',
					topics: [
						'WebSocketを理解するためのHTTP基礎',
						'OSI参照モデルとWebSocketの位置',
						'HTTP/1.1からHTTP/3までのWebSocket対応',
						'WebSocket接続確立プロセス',
						'セキュリティとポート管理'
					]
				},
				{
					id: '3',
					title: 'WebSocket API の基本構造',
					duration: '5-6時間',
					topics: [
						'WebSocket接続ライフサイクル',
						'イベントベース通信モデル',
						'クライアント・サーバー役割分担'
					]
				},
				{
					id: '4',
					title: 'WebSocket API の基本操作',
					duration: '4-5時間',
					topics: [
						'WebSocket URL と接続確立',
						'ブラウザ標準WebSocket API実装',
						'接続失敗と再接続処理'
					]
				}
			]
		},
		{
			phase: 2,
			title: '実装技術',
			duration: '17-20時間',
			description: 'データ通信、フレーム構造、サブプロトコル設計を習得',
			color: 'bg-green-100 text-green-800 border-green-200',
			accentColor: 'bg-green-600',
			sections: [
				{
					id: '5',
					title: 'WebSocket API データ通信',
					duration: '6-7時間',
					topics: [
						'WebSocketオブジェクトとSvelteストア',
						'データ送受信パターン',
						'高度なエラーハンドリング'
					]
				},
				{
					id: '6',
					title: 'データフレームとサブプロトコル',
					duration: '6-7時間',
					topics: ['WebSocketフレーム構造', 'バイナリデータ送信', 'WebSocketサブプロトコルの設計']
				},
				{
					id: '7',
					title: '高度なトピック',
					duration: '8-10時間',
					topics: ['セキュリティ実装', 'PWAとWebSocketの統合', 'スケーラビリティと負荷対策']
				}
			]
		},
		{
			phase: 3,
			title: 'テスト・評価',
			duration: '8-10時間',
			description: 'テスト手法、他技術比較、適用判断基準を学習',
			color: 'bg-purple-100 text-purple-800 border-purple-200',
			accentColor: 'bg-purple-600',
			sections: [
				{
					id: '8',
					title: 'テスト手法',
					duration: '5-6時間',
					topics: ['クライアント側テスト', 'サーバー側テスト', 'E2Eテスト']
				},
				{
					id: '9',
					title: '他技術との比較・使い分け',
					duration: '3-4時間',
					topics: ['代替技術の比較', '適用判断基準']
				}
			]
		},
		{
			phase: 4,
			title: '実践開発',
			duration: '15-20時間',
			description: 'PWA対応チャット、共同編集システムの実装',
			color: 'bg-orange-100 text-orange-800 border-orange-200',
			accentColor: 'bg-orange-600',
			sections: [
				{
					id: '10',
					title: '実践演習プロジェクト',
					duration: '15-20時間',
					topics: [
						'PWA対応リアルタイムチャット（7-10時間）',
						'リアルタイム共同編集システム（8-10時間）'
					]
				}
			]
		}
	];

	let mounted = $derived(typeof window !== 'undefined');

	// 各Phaseの進捗率を計算
	function getPhaseProgress(phaseNumber: number): number {
		const phaseData = progress.phases[phaseNumber - 1];
		if (!phaseData) return 0;
		return Math.round((phaseData.completedLessons / phaseData.totalLessons) * 100);
	}
</script>

<svelte:head>
	<title>カリキュラム概要 - WebSocket Learning</title>
	<meta
		name="description"
		content="ブラウザ標準WebSocket APIマスターのための50-60時間構造化カリキュラム。基礎理解から実践開発まで4つのPhaseで段階的にスキルアップ。"
	/>
</svelte:head>

<!-- Header Section -->
<section class="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<h1 class="text-4xl font-bold mb-4">WebSocket Learning カリキュラム</h1>
			<p class="text-xl text-primary-100 mb-6">
				ブラウザ標準WebSocket APIを中心とした構造化学習プログラム
			</p>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
				<div class="bg-white/10 rounded-lg p-4">
					<div class="text-2xl font-bold">{curriculumOverview.totalHours}</div>
					<div class="text-primary-200">総学習時間</div>
				</div>
				<div class="bg-white/10 rounded-lg p-4">
					<div class="text-2xl font-bold">4 Phases</div>
					<div class="text-primary-200">段階的学習</div>
				</div>
				<div class="bg-white/10 rounded-lg p-4">
					<div class="text-2xl font-bold">PWA対応</div>
					<div class="text-primary-200">実践的アプリ開発</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- 学習目標と技術スタック -->
<section class="py-12 bg-white">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<div class="card">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">🎯 学習目標</h2>
				<div class="space-y-3">
					<div>
						<span class="font-medium text-gray-700">対象者:</span>
						<span class="text-gray-600">{curriculumOverview.targetLevel}</span>
					</div>
					<div>
						<span class="font-medium text-gray-700">最終目標:</span>
						<p class="text-gray-600 mt-1">{curriculumOverview.goal}</p>
					</div>
				</div>
			</div>

			<div class="card">
				<h2 class="text-2xl font-bold text-gray-900 mb-4">🛠️ 技術スタック</h2>
				<ul class="space-y-2">
					{#each curriculumOverview.techStack as tech (tech)}
						<li class="flex items-start">
							<span class="text-primary-600 mr-2">•</span>
							<span class="text-gray-600">{tech}</span>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</section>

<!-- Phase概要 -->
<section class="py-16 bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-12">
			<h2 class="text-3xl font-bold text-gray-900 mb-4">学習フェーズ概要</h2>
			<p class="text-lg text-gray-600 max-w-3xl mx-auto">
				4つのフェーズで段階的にWebSocket技術をマスター。基礎理解から実践的なプロジェクト開発まで体系的に学習します
			</p>
		</div>

		<div class="space-y-8">
			{#each phases as phase (phase.phase)}
				<div class="card border-l-4 {phase.color.split(' ')[2]} bg-white">
					<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
						<!-- Phase Info -->
						<div class="flex-1">
							<div class="flex items-center mb-4">
								<div
									class="{phase.accentColor} text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mr-4"
								>
									{phase.phase}
								</div>
								<div>
									<h3 class="text-2xl font-bold text-gray-900">
										Phase {phase.phase}: {phase.title}
									</h3>
									<div class="flex items-center space-x-4 mt-1">
										<span
											class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {phase.color}"
										>
											{phase.duration}
										</span>
										{#if mounted && progress.phases[phase.phase - 1]}
											<span class="text-sm text-gray-500">
												進捗: {getPhaseProgress(phase.phase)}%
											</span>
										{/if}
									</div>
								</div>
							</div>
							<p class="text-gray-600 mb-6">{phase.description}</p>

							<!-- Sections -->
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								{#each phase.sections as section (section.id)}
									<div class="bg-gray-50 rounded-lg p-4">
										<h4 class="font-semibold text-gray-900 mb-2">
											{section.id}. {section.title}
										</h4>
										<div class="text-sm text-gray-500 mb-3">{section.duration}</div>
										<ul class="space-y-1">
											{#each section.topics as topic (topic)}
												<li class="text-sm text-gray-600 flex items-start">
													<span class="text-gray-400 mr-2">•</span>
													<span>{topic}</span>
												</li>
											{/each}
										</ul>
									</div>
								{/each}
							</div>
						</div>

						<!-- Progress & Actions -->
						<div class="lg:ml-8 mt-6 lg:mt-0">
							{#if mounted && progress.phases[phase.phase - 1]}
								{@const phaseProgress = progress.phases[phase.phase - 1]}
								<div class="text-center mb-4">
									<div class="w-20 h-20 mx-auto mb-3 relative">
										<svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
											<path
												class="text-gray-200"
												stroke="currentColor"
												stroke-width="3"
												fill="transparent"
												d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
											/>
											<path
												class={phase.accentColor.replace('bg-', 'text-')}
												stroke="currentColor"
												stroke-width="3"
												stroke-linecap="round"
												fill="transparent"
												stroke-dasharray="{(phaseProgress.completedLessons /
													phaseProgress.totalLessons) *
													100}, 100"
												d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
											/>
										</svg>
										<div class="absolute inset-0 flex items-center justify-center">
											<span class="text-sm font-bold text-gray-900">
												{Math.round(
													(phaseProgress.completedLessons / phaseProgress.totalLessons) * 100
												)}%
											</span>
										</div>
									</div>
									<div class="text-sm text-gray-600">
										{phaseProgress.completedLessons}/{phaseProgress.totalLessons} レッスン完了
									</div>
								</div>
							{/if}

							<div class="space-y-3">
								<a href="/phase{phase.phase}" class="btn-primary w-full text-center block">
									Phase {phase.phase} 詳細を見る
								</a>
								{#if phase.phase === 1 || (phase.phase > 1 && getPhaseProgress(phase.phase - 1) >= 80)}
									<a href="/lessons/{phase.phase}.1" class="btn-secondary w-full text-center block">
										学習を開始
									</a>
								{:else}
									<div class="text-center text-sm text-gray-500">
										Phase {phase.phase - 1} を80%以上完了後に開始できます
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- 学習の進め方 -->
<section class="py-16 bg-white">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-12">
			<h2 class="text-3xl font-bold text-gray-900 mb-4">🚀 学習の進め方</h2>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			<div class="text-center">
				<div
					class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
				>
					<span class="text-2xl font-bold">1</span>
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">基礎</h3>
				<p class="text-sm text-gray-600">WebSocket APIの基本概念と技術基盤を理解</p>
			</div>

			<div class="text-center">
				<div
					class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
				>
					<span class="text-2xl font-bold">2</span>
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">実装</h3>
				<p class="text-sm text-gray-600">データ通信とサブプロトコル設計を習得</p>
			</div>

			<div class="text-center">
				<div
					class="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
				>
					<span class="text-2xl font-bold">3</span>
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">評価</h3>
				<p class="text-sm text-gray-600">テスト手法と技術選択判断を学習</p>
			</div>

			<div class="text-center">
				<div
					class="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4"
				>
					<span class="text-2xl font-bold">4</span>
				</div>
				<h3 class="font-semibold text-gray-900 mb-2">実践</h3>
				<p class="text-sm text-gray-600">PWA対応のリアルタイムアプリを開発</p>
			</div>
		</div>

		<div class="mt-12 text-center">
			<div class="bg-primary-50 border border-primary-200 rounded-lg p-6">
				<h3 class="text-lg font-semibold text-primary-800 mb-2">💡 学習のコツ</h3>
				<ul class="text-sm text-primary-700 space-y-1">
					<li>• 各Phaseを順序立てて学習することを推奨</li>
					<li>• 実践演習を重視し、手を動かしながら理解を深める</li>
					<li>• WebSocket APIの標準仕様を常に意識する</li>
					<li>• PWA統合を最終目標として実用的なスキルを身につける</li>
				</ul>
			</div>
		</div>
	</div>
</section>

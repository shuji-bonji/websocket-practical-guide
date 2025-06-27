<script lang="ts">
	import { progressStore } from '$lib/stores/progress';
	import { onMount } from 'svelte';

	$: progress = $progressStore;
	$: overallPercentage = Math.round((progress.completedHours / progress.totalHours) * 100);
	$: currentPhase =
		progress.phases.find((phase) => phase.completedLessons < phase.totalLessons) ||
		progress.phases[progress.phases.length - 1];

	// 最近の学習活動を取得
	$: recentActivities = progress.phases
		.flatMap((phase) => phase.lessons.filter((lesson) => lesson.completed && lesson.completedAt))
		.sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
		.slice(0, 5);

	// 次の推奨レッスンを取得
	$: nextLesson = (() => {
		for (const phase of progress.phases) {
			const incomplete = phase.lessons.find((lesson) => !lesson.completed);
			if (incomplete) {
				return {
					lessonId: incomplete.id,
					phaseNumber: phase.phase,
					phaseName: phase.name
				};
			}
		}
		return null;
	})();

	// フィーチャー一覧
	const features = [
		{
			title: 'ブラウザ標準WebSocket API',
			description:
				'サードパーティライブラリに依存せず、ブラウザネイティブのWebSocket APIを完全マスター',
			icon: '🌐'
		},
		{
			title: '構造化カリキュラム',
			description: '50-60時間の体系的な学習プログラム。基礎から実践まで段階的にスキルアップ',
			icon: '📚'
		},
		{
			title: 'PWA統合',
			description: 'Progressive Web Appとの統合、Service Workerでのオフライン対応を実践的に学習',
			icon: '📱'
		},
		{
			title: 'TypeScript中心',
			description: 'Type-safe な開発手法。SvelteKit + TypeScriptでモダンな開発環境を体験',
			icon: '⚡'
		},
		{
			title: 'リアルタイム実践',
			description: 'チャットアプリ、共同編集システムなど実用的なプロジェクトを通じた実践学習',
			icon: '🚀'
		},
		{
			title: '進捗管理',
			description: '学習進捗の可視化、個人ペースでの学習サポート、達成感のあるチェックポイント',
			icon: '📊'
		}
	];

	// 学習パス
	const learningPath = [
		{
			phase: 1,
			title: '基礎理解',
			description: 'WebSocketの概念、ネットワーク技術、API基本構造を理解',
			duration: '18.5-21.5時間',
			color: 'bg-blue-100 text-blue-800'
		},
		{
			phase: 2,
			title: '実装技術',
			description: 'データ通信、フレーム構造、サブプロトコル設計を習得',
			duration: '17-20時間',
			color: 'bg-green-100 text-green-800'
		},
		{
			phase: 3,
			title: 'テスト・評価',
			description: 'テスト手法、他技術比較、適用判断基準を学習',
			duration: '8-10時間',
			color: 'bg-purple-100 text-purple-800'
		},
		{
			phase: 4,
			title: '実践開発',
			description: 'PWA対応チャット、共同編集システムの実装',
			duration: '15-20時間',
			color: 'bg-orange-100 text-orange-800'
		}
	];

	let mounted = false;
	onMount(() => {
		mounted = true;
	});
</script>

<svelte:head>
	<title>WebSocket Learning - ブラウザ標準WebSocket APIマスター</title>
	<meta
		name="description"
		content="ブラウザ標準WebSocket APIを中心としたリアルタイムWebアプリケーション学習サイト。50-60時間の構造化カリキュラムでPWA対応のモダンアプリ開発をマスター。"
	/>
</svelte:head>

<!-- Hero Section -->
<section class="relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800">
	<div class="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-primary-800/90"></div>
	<div class="relative px-4 py-24 sm:px-6 lg:px-8">
		<div class="text-center">
			<h1 class="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
				WebSocket Learning
			</h1>
			<p class="mx-auto mt-6 max-w-3xl text-xl text-primary-100">
				ブラウザ標準WebSocket APIを中心とした<br />
				リアルタイムWebアプリケーション学習サイト
			</p>
			<p class="mx-auto mt-4 max-w-2xl text-lg text-primary-200">
				TypeScript/JavaScript中級者向け 50-60時間の構造化カリキュラム
			</p>

			<div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
				<a
					href="/curriculum"
					class="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 transition-colors duration-200"
				>
					カリキュラムを見る
					<svg class="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
						<path
							fill-rule="evenodd"
							d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
							clip-rule="evenodd"
						/>
					</svg>
				</a>

				{#if nextLesson}
					<a
						href="/lessons/{nextLesson.lessonId}"
						class="inline-flex items-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary-700 transition-colors duration-200"
					>
						学習を始める
						<svg class="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V8a3 3 0 013-3h6a3 3 0 013 3v2M7 21h10a2 2 0 002-2v-5a2 2 0 00-2-2H7a2 2 0 00-2 2v5a2 2 0 002 2z"
							/>
						</svg>
					</a>
				{/if}
			</div>
		</div>
	</div>
</section>

<!-- Progress Overview -->
{#if mounted && progress.completedHours > 0}
	<section class="py-12 bg-white">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="text-center">
				<h2 class="text-2xl font-bold text-gray-900 mb-8">あなたの学習進捗</h2>

				<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div class="card text-center">
						<div class="text-3xl font-bold text-primary-600 mb-2">
							{progress.completedHours}h / {progress.totalHours}h
						</div>
						<div class="text-gray-600">総学習時間</div>
					</div>

					<div class="card text-center">
						<div class="text-3xl font-bold text-green-600 mb-2">
							{progress.completedPhases} / {progress.totalPhases}
						</div>
						<div class="text-gray-600">完了フェーズ</div>
					</div>

					<div class="card text-center">
						<div class="text-3xl font-bold text-purple-600 mb-2">
							{overallPercentage}%
						</div>
						<div class="text-gray-600">全体進捗</div>
					</div>
				</div>

				<div class="progress-bar h-4 max-w-md mx-auto">
					<div class="progress-fill h-4 rounded-full" style="width: {overallPercentage}%"></div>
				</div>

				{#if nextLesson}
					<div class="mt-6">
						<p class="text-gray-600 mb-3">次の推奨レッスン:</p>
						<a href="/lessons/{nextLesson.lessonId}" class="btn-primary">
							{nextLesson.lessonId} - Phase {nextLesson.phaseNumber}: {nextLesson.phaseName}
						</a>
					</div>
				{:else}
					<div class="mt-6">
						<p class="text-lg font-medium text-green-600">🎉 すべてのレッスンが完了しました！</p>
					</div>
				{/if}
			</div>
		</div>
	</section>
{/if}

<!-- Features Section -->
<section class="py-16 bg-gray-50">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center">
			<h2 class="text-3xl font-bold text-gray-900 mb-4">学習の特徴</h2>
			<p class="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
				ブラウザ標準WebSocket APIにフォーカスした実践的なカリキュラムで、
				モダンなリアルタイムWebアプリケーション開発をマスターします
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
			{#each features as feature}
				<div class="card hover:shadow-md transition-shadow duration-200">
					<div class="text-center">
						<div class="text-4xl mb-4">{feature.icon}</div>
						<h3 class="text-xl font-semibold text-gray-900 mb-3">
							{feature.title}
						</h3>
						<p class="text-gray-600">
							{feature.description}
						</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Learning Path -->
<section class="py-16 bg-white">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="text-center mb-12">
			<h2 class="text-3xl font-bold text-gray-900 mb-4">学習パス</h2>
			<p class="text-lg text-gray-600 max-w-3xl mx-auto">
				4つのフェーズで段階的にWebSocket技術をマスター。
				基礎理解から実践的なプロジェクト開発まで体系的に学習します
			</p>
		</div>

		<div class="space-y-8">
			{#each learningPath as phase, index}
				<div class="flex flex-col md:flex-row items-center">
					<!-- Phase number -->
					<div
						class="flex-shrink-0 w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4 md:mb-0"
					>
						{phase.phase}
					</div>

					<!-- Arrow (hidden on mobile) -->
					{#if index < learningPath.length - 1}
						<div class="hidden md:block mx-4">
							<svg
								class="w-6 h-6 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 8l4 4m0 0l-4 4m4-4H3"
								/>
							</svg>
						</div>
					{/if}

					<!-- Phase content -->
					<div class="flex-1 card md:ml-4 text-center md:text-left">
						<div class="flex flex-col md:flex-row md:items-center justify-between">
							<div class="flex-1">
								<div class="flex items-center justify-center md:justify-start mb-2">
									<h3 class="text-xl font-semibold text-gray-900 mr-3">
										Phase {phase.phase}: {phase.title}
									</h3>
									<span
										class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {phase.color}"
									>
										{phase.duration}
									</span>
								</div>
								<p class="text-gray-600">
									{phase.description}
								</p>
							</div>

							<div class="mt-4 md:mt-0 md:ml-6">
								{#if progress.phases[phase.phase - 1]}
									{@const phaseProgress = progress.phases[phase.phase - 1]}
									<div class="text-right">
										<div class="text-lg font-semibold text-gray-900">
											{phaseProgress.completedLessons}/{phaseProgress.totalLessons}
										</div>
										<div class="text-sm text-gray-500">レッスン完了</div>
										<div class="w-24 progress-bar mt-2">
											<div
												class="progress-fill"
												style="width: {(phaseProgress.completedLessons /
													phaseProgress.totalLessons) *
													100}%"
											></div>
										</div>
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

<!-- Recent Activity -->
{#if mounted && recentActivities.length > 0}
	<section class="py-16 bg-gray-50">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
			<h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">最近の学習活動</h2>

			<div class="space-y-4">
				{#each recentActivities as activity}
					<div class="card flex items-center justify-between">
						<div class="flex items-center">
							<div class="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
							<div>
								<div class="font-medium text-gray-900">
									レッスン {activity.id} を完了
								</div>
								{#if activity.completedAt}
									<div class="text-sm text-gray-500">
										{activity.completedAt.toLocaleDateString('ja-JP', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</div>
								{/if}
							</div>
						</div>

						{#if activity.timeSpent}
							<div class="text-sm text-gray-500">
								{activity.timeSpent}分
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- CTA Section -->
<section class="py-16 bg-primary-600">
	<div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
		<h2 class="text-3xl font-bold text-white mb-4">今すぐWebSocket開発をマスターしよう</h2>
		<p class="text-xl text-primary-100 mb-8">
			TypeScript/JavaScript中級者から上級者へ。リアルタイムWeb開発の専門知識を身につけて、
			モダンなWebアプリケーション開発者として次のレベルに進みましょう。
		</p>

		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a href="/table-of-contents" class="btn-primary bg-white text-primary-600 hover:bg-gray-50">
				目次を確認する
			</a>
			<a
				href="/curriculum"
				class="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
			>
				詳細カリキュラム
			</a>
		</div>
	</div>
</section>

<script lang="ts">
	import { progressStore } from '$lib/stores/progress';

	$: progress = $progressStore;

	// Phase 1のレッスン一覧
	const phase1Lessons = [
		{
			id: '1.1',
			title: 'WebSocketとは何か',
			url: '/lessons/1.1',
			section: 'WebSocket 入門',
			duration: '1時間',
			description: 'WebSocketの基本概念とブラウザ標準APIの重要性を理解'
		}
		// 将来のレッスンはここに追加
	];

	function isLessonCompleted(lessonId: string): boolean {
		return (
			progress.phases.flatMap((p) => p.lessons).find((l) => l.id === lessonId)?.completed || false
		);
	}
</script>

<svelte:head>
	<title>レッスン一覧 - WebSocket Learning</title>
	<meta
		name="description"
		content="WebSocket学習のレッスン一覧。段階的にWebSocket技術をマスターしましょう。"
	/>
</svelte:head>

<!-- Header -->
<section class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
		<h1 class="text-4xl font-bold mb-4">レッスン一覧</h1>
		<p class="text-xl text-blue-100">段階的にWebSocket技術をマスターしましょう</p>
	</div>
</section>

<!-- Navigation -->
<section class="py-8 bg-gray-50">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		<nav class="text-sm text-gray-600 mb-6">
			<a href="/" class="hover:text-gray-800">ホーム</a>
			<span class="mx-2">›</span>
			<span>レッスン一覧</span>
		</nav>

		<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
			<h2 class="text-lg font-semibold text-blue-800 mb-2">📚 学習の進め方</h2>
			<ul class="text-sm text-blue-700 space-y-1">
				<li>• 各レッスンは順序立てて学習することを推奨します</li>
				<li>• インタラクティブデモで実際に体験しながら理解を深めましょう</li>
				<li>• 完了マークを付けて進捗を管理できます</li>
			</ul>
		</div>
	</div>
</section>

<!-- Lessons -->
<section class="py-12 bg-white">
	<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
		<h2 class="text-2xl font-bold text-gray-900 mb-8">Phase 1: 基礎理解</h2>

		<div class="space-y-6">
			<div>
				<h3 class="text-lg font-semibold text-gray-800 mb-4">Section 1: WebSocket 入門</h3>
				<div class="space-y-4">
					{#each phase1Lessons as lesson (lesson.id)}
						<div
							class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow {isLessonCompleted(
								lesson.id
							)
								? 'border-l-4 border-green-500 bg-green-50'
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
										<h4 class="text-lg font-semibold text-gray-900">
											レッスン {lesson.id}: {lesson.title}
										</h4>
										<span
											class="ml-3 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700"
										>
											{lesson.duration}
										</span>
									</div>
									<p class="text-gray-600 mb-4 ml-9">{lesson.description}</p>
								</div>

								<div class="ml-6">
									<a
										href={lesson.url}
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
		</div>

		<!-- 準備中のレッスン -->
		<div class="mt-12 p-6 bg-gray-50 border border-gray-200 rounded-lg">
			<h3 class="text-lg font-semibold text-gray-700 mb-2">🚧 準備中のレッスン</h3>
			<p class="text-gray-600 mb-4">以下のレッスンは現在準備中です。順次公開予定です。</p>
			<ul class="text-sm text-gray-500 space-y-1">
				<li>• レッスン 1.2: HTTPの限界とWebSocketの優位性</li>
				<li>• レッスン 1.3: WebSocketの利用例と適用場面</li>
				<li>• レッスン 1.4: WebSocket vs 他技術の比較理解</li>
				<li>• Section 2以降: ネットワーク技術、API基本構造、基本操作</li>
			</ul>
		</div>

		<!-- ナビゲーション -->
		<div class="mt-12 flex justify-center space-x-4">
			<a href="/curriculum" class="btn-secondary">カリキュラム概要</a>
			<a href="/phase1" class="btn-secondary">Phase 1 詳細</a>
			<a href="/table-of-contents" class="btn-secondary">全体目次</a>
		</div>
	</div>
</section>

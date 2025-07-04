<script lang="ts">
	import WebSocketConnectionDemo from '$lib/components/phase1/WebSocketConnectionDemo.svelte';
</script>

<svelte:head>
	<title>ネットワーク技術基礎 - Phase 1 | WebSocket学習</title>
	<meta name="description" content="WebSocketを理解するために必要なネットワーク技術の基礎知識" />
</svelte:head>

<div class="max-w-4xl mx-auto py-8">
	<!-- セクションヘッダー -->
	<div class="mb-8">
		<nav class="text-sm text-gray-500 mb-4">
			<a href="/phase1" class="hover:text-gray-700">Phase 1</a>
			<span class="mx-2">›</span>
			<span class="text-gray-900">ネットワーク技術基礎</span>
		</nav>

		<h1 class="text-3xl font-bold text-gray-900 mb-4">🌐 2. ネットワーク技術基礎</h1>
		<p class="text-lg text-gray-600">
			WebSocketを深く理解するために必要なネットワーク技術の基礎知識を学習します。
		</p>
	</div>

	<!-- 学習目標 -->
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
		<h2 class="text-xl font-semibold text-blue-900 mb-4">🎯 このセクションの学習目標</h2>
		<ul class="text-blue-800 space-y-2">
			<li class="flex items-start">
				<span class="text-blue-600 mr-2">✓</span>
				WebSocketとHTTPの関係性を理解する
			</li>
			<li class="flex items-start">
				<span class="text-blue-600 mr-2">✓</span>
				OSI参照モデルにおけるWebSocketの位置を把握する
			</li>
			<li class="flex items-start">
				<span class="text-blue-600 mr-2">✓</span>
				HTTP/1.1からHTTP/3までのWebSocket対応を知る
			</li>
			<li class="flex items-start">
				<span class="text-blue-600 mr-2">✓</span>
				TCPとWebSocketの関係を理解する
			</li>
		</ul>
	</div>

	<!-- レッスンリスト -->
	<div class="space-y-6 mb-8">
		<div class="border border-gray-200 rounded-lg p-6">
			<h3 class="text-xl font-semibold text-gray-900 mb-3">📚 学習レッスン一覧</h3>

			<div class="space-y-4">
				<!-- Lesson 2.1 -->
				<div class="border border-gray-100 rounded-md p-4 bg-gray-50">
					<h4 class="font-semibold text-gray-900 mb-2">2.1 WebSocketを理解するためのHTTP基礎</h4>
					<p class="text-gray-600 text-sm mb-3">
						HTTPプロトコルの基本的な仕組みと、WebSocketがHTTPベースでどのように動作するかを学習します。
					</p>
					<div class="text-xs text-gray-500">
						<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">準備中</span>
						<span class="ml-2">予定実装時間: 45分</span>
					</div>
				</div>

				<!-- Lesson 2.2 -->
				<div class="border border-gray-100 rounded-md p-4 bg-gray-50">
					<h4 class="font-semibold text-gray-900 mb-2">2.2 OSI参照モデルとWebSocketの位置</h4>
					<p class="text-gray-600 text-sm mb-3">
						ネットワークの7層モデルを理解し、WebSocketがどの層で動作するかを明確にします。
					</p>
					<div class="text-xs text-gray-500">
						<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">準備中</span>
						<span class="ml-2">予定実装時間: 30分</span>
					</div>
				</div>

				<!-- Lesson 2.3 -->
				<div class="border border-gray-100 rounded-md p-4 bg-gray-50">
					<h4 class="font-semibold text-gray-900 mb-2">
						2.3 HTTP/1.1からHTTP/3までのWebSocket対応
					</h4>
					<p class="text-gray-600 text-sm mb-3">
						HTTPの各バージョンでのWebSocket対応状況と実装上の違いを理解します。
					</p>
					<div class="text-xs text-gray-500">
						<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">準備中</span>
						<span class="ml-2">予定実装時間: 40分</span>
					</div>
				</div>

				<!-- Lesson 2.4 -->
				<div class="border border-gray-100 rounded-md p-4 bg-gray-50">
					<h4 class="font-semibold text-gray-900 mb-2">2.4 TCPとWebSocketの関係理解</h4>
					<p class="text-gray-600 text-sm mb-3">
						TCPプロトコルの基礎とWebSocketがTCPをどのように利用するかを学習します。
					</p>
					<div class="text-xs text-gray-500">
						<span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">準備中</span>
						<span class="ml-2">予定実装時間: 35分</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- 実践デモ -->
	<div class="mb-8">
		<h2 class="text-2xl font-semibold text-gray-900 mb-4">🛠️ 実践デモ</h2>
		<p class="text-gray-600 mb-6">
			ネットワーク技術の理解を深めるため、実際のWebSocket接続を通してプロトコルの動作を観察してみましょう。
		</p>

		<WebSocketConnectionDemo
			title="ネットワーク技術学習デモ"
			description="HTTPからWebSocketへのプロトコルアップグレードプロセスを観察"
			showEducationalEvents={true}
		/>
	</div>

	<!-- 次のステップ -->
	<div class="bg-green-50 border border-green-200 rounded-lg p-6">
		<h2 class="text-xl font-semibold text-green-900 mb-3">🚀 次のステップ</h2>
		<p class="text-green-800 mb-4">
			ネットワーク技術の基礎を理解したら、次はWebSocketプロトコルの詳細仕様について学習します。
		</p>
		<div class="space-y-2">
			<div class="text-sm text-green-700">
				<strong>次のセクション:</strong> 3. WebSocketプロトコル仕様（準備中）
			</div>
			<div class="text-sm text-green-700">
				<strong>予定内容:</strong> WebSocketフレーム構造、ハンドシェイク、拡張機能
			</div>
		</div>
	</div>
</div>

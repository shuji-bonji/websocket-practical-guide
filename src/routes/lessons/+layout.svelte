<script lang="ts">
	import '../../app.css';
</script>

<div class="min-h-screen bg-gray-50">
	<!-- コンテンツエリア -->
	<main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<slot />
	</main>
</div>

<style>
	/* MDsveXレッスンコンテンツ用のタイポグラフィスタイル */

	/* 見出しスタイル - 他のページと統一、レスポンシブ対応 */
	:global(.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6) {
		@apply font-bold text-gray-900 leading-tight;
	}

	:global(.prose h1) {
		@apply text-2xl md:text-3xl mt-0 mb-6;
	}

	:global(.prose h2) {
		@apply text-xl md:text-2xl mt-8 mb-4 border-b border-gray-200 pb-2;
	}

	:global(.prose h3) {
		@apply text-lg md:text-xl mt-6 mb-3;
	}

	:global(.prose h4) {
		@apply text-base md:text-lg mt-4 mb-2;
	}

	/* テキストスタイル - 他のページと統一 */
	:global(.prose p) {
		@apply text-gray-600 leading-relaxed mb-4;
		font-size: 0.875rem; /* 14px - ユーザーリクエストに応じて調整 */
		line-height: 1.6;
	}

	:global(.prose strong) {
		@apply font-semibold text-gray-900;
	}

	/* リストスタイル - 他のページと統一 */
	:global(.prose ul) {
		@apply space-y-2 mb-6 pl-6;
	}

	:global(.prose ol) {
		@apply space-y-2 mb-6 pl-6;
	}

	:global(.prose li) {
		@apply text-gray-600;
		font-size: 0.875rem; /* 14px - ユーザーリクエストに応じて調整 */
	}

	:global(.prose ul > li) {
		@apply relative;
	}

	:global(.prose ul > li::before) {
		content: '•';
		@apply absolute -left-4 text-blue-600 font-bold;
	}

	/* コードスタイル */
	:global(.prose code) {
		@apply text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-sm font-mono;
	}

	:global(.prose pre) {
		@apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6;
	}

	:global(.prose pre code) {
		@apply text-gray-100 bg-transparent p-0 text-sm;
	}

	/* その他の要素 */
	:global(.prose hr) {
		@apply border-gray-300 my-8;
	}

	:global(.prose blockquote) {
		@apply border-l-4 border-blue-500 bg-blue-50 p-4 my-6 italic text-blue-800;
	}

	/* テーブルスタイル */
	:global(.prose table) {
		@apply w-full border-collapse border border-gray-300 my-6;
	}

	:global(.prose th) {
		@apply bg-gray-50 border border-gray-300 px-4 py-2 font-semibold text-left text-gray-900;
	}

	:global(.prose td) {
		@apply border border-gray-300 px-4 py-2 text-gray-700;
	}

	/* リンクスタイル */
	:global(.prose a) {
		@apply text-blue-600 hover:text-blue-800 transition-colors duration-200;
	}

	:global(.prose a:hover) {
		@apply underline;
	}

	/* レスポンシブ対応 - モバイルでの文字サイズ調整 */
	@media (max-width: 640px) {
		:global(.prose p) {
			font-size: 0.8125rem; /* 13px - モバイルで少し小さく */
			line-height: 1.6;
		}

		:global(.prose li) {
			font-size: 0.8125rem; /* 13px - モバイルで少し小さく */
		}

		:global(.prose h1) {
			@apply text-xl;
		}

		:global(.prose h2) {
			@apply text-lg;
		}

		:global(.prose h3) {
			@apply text-base;
		}
	}

	/* タブレット以上では14pxサイズ */
	@media (min-width: 641px) {
		:global(.prose p) {
			font-size: 0.875rem; /* 14px - ユーザーリクエストサイズ */
		}

		:global(.prose li) {
			font-size: 0.875rem; /* 14px - ユーザーリクエストサイズ */
		}
	}
</style>

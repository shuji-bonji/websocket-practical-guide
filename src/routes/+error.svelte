<script lang="ts">
  import { page } from '$app/stores';
  import { href } from '$lib/utils/paths';
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
  <div class="text-center max-w-2xl mx-auto p-8">
    <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
    <h2 class="text-2xl font-semibold text-gray-600 mb-6">ページが見つかりません</h2>
    <p class="text-gray-600 mb-4">
      リクエストされたページ「<code class="bg-gray-200 px-2 py-1 rounded">{$page.url.pathname}</code
      >」は存在しません。
    </p>
    <p class="text-sm text-gray-500 mb-8">
      このページはまだ実装されていない可能性があります。<br />
      プロジェクトは段階的に開発中で、今後のPhaseで追加される予定です。
    </p>
    <div class="space-x-4">
      <a
        href={href('/')}
        class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
      >
        トップページに戻る
      </a>
      <a
        href={href('/phase1')}
        class="inline-block bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition-colors"
      >
        Phase 1へ
      </a>
    </div>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <h3 class="font-medium text-blue-800 mb-2">開発ステータス</h3>
      <p class="text-sm text-blue-700">
        現在 Phase 1 の基本レッスンが実装済みです。<br />
        Phase 2以降のレッスンは順次追加予定です。
      </p>
    </div>
  </div>
</div>

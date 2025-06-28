<script lang="ts">
	import { onMount } from 'svelte';
	import type { MermaidConfig } from '$lib/types/mermaid';

	export let chart: string;
	export let id: string = `mermaid-${Math.random().toString(36).substring(2, 11)}`;

	// リアクティブな状態管理
	let svgContent: string = '';
	let errorMessage: string = '';
	let isLoading: boolean = true;
	let mermaid: {
		initialize: (config: MermaidConfig) => void;
		render: (id: string, chart: string) => Promise<{ svg: string }>;
	} | null = null;
	let isBrowser = false;

	onMount(async () => {
		// TypeScript型安全なMermaid設定
		const config: MermaidConfig = {
			startOnLoad: false,
			theme: 'dark',
			themeVariables: {
				darkMode: true,
				background: '#1f2937',
				primaryColor: '#60a5fa',
				primaryTextColor: '#f9fafb',
				primaryBorderColor: '#3b82f6',
				lineColor: '#9ca3af',
				secondaryColor: '#374151',
				tertiaryColor: '#4b5563',
				mainBkg: '#1f2937',
				secondBkg: '#374151',
				tertiaryBkg: '#4b5563'
			},
			flowchart: {
				useMaxWidth: true,
				htmlLabels: true
			},
			sequence: {
				actorBorder: '#6b7280',
				actorTextColor: '#f9fafb',
				actorLineColor: '#9ca3af',
				signalColor: '#f9fafb',
				signalTextColor: '#f9fafb',
				labelBoxBkgColor: '#4b5563',
				labelBoxBorderColor: '#6b7280',
				labelTextColor: '#f9fafb',
				loopTextColor: '#f9fafb',
				noteBorderColor: '#6b7280',
				noteBkgColor: '#374151',
				noteTextColor: '#f9fafb'
			}
		};

		// ブラウザ環境を確認
		isBrowser = typeof window !== 'undefined';
		if (!isBrowser) {
			isLoading = false;
			return;
		}

		try {
			// 動的インポートでSSRエラーを回避
			const mermaidModule = await import('mermaid');
			mermaid = mermaidModule.default;

			// ✅ 型安全なMermaid初期化（eslint-disableもas anyも不要）
			mermaid.initialize(config);

			// チャートをレンダリング
			const { svg } = await mermaid.render(id, chart);
			svgContent = svg;
			errorMessage = '';
		} catch (error) {
			console.error('Mermaid rendering error:', error);
			svgContent = '';
			errorMessage = `図表の表示に失敗しました: ${error}`;
		} finally {
			isLoading = false;
		}
	});

	// チャートが変更された時の再レンダリング (無限ループ防止)
	$: if (chart && isBrowser && mermaid) {
		renderChart();
	}

	async function renderChart() {
		if (!isBrowser || !mermaid) return;

		try {
			isLoading = true;
			const { svg } = await mermaid.render(`${id}-${Date.now()}`, chart);
			svgContent = svg;
			errorMessage = '';
		} catch (error) {
			console.error('Mermaid rendering error:', error);
			svgContent = '';
			errorMessage = `図表の表示に失敗しました: ${error}`;
		} finally {
			isLoading = false;
		}
	}
</script>

<!-- ✅ Svelte 5推奨：条件分岐とディレクティブ使用 -->
<div class="mermaid-container my-6 flex justify-center">
	{#if isLoading}
		<div class="flex items-center justify-center p-8">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
			<span class="ml-2 text-gray-600">図表を生成中...</span>
		</div>
	{:else if errorMessage}
		<p class="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
			{errorMessage}
		</p>
	{:else if svgContent}
		<!-- {@html} ディレクティブでSVGを安全にレンダリング -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html svgContent}
	{/if}
</div>

<style>
	:global(.mermaid-container svg) {
		max-width: 100%;
		height: auto;
		background-color: #1f2937;
		border-radius: 8px;
		padding: 16px;
	}

	:global(.mermaid-container .node rect) {
		fill: #374151;
		stroke: #6b7280;
		stroke-width: 2px;
	}

	:global(.mermaid-container .node .label) {
		color: #f9fafb;
		font-family: 'Inter', sans-serif;
	}

	:global(.mermaid-container .edgePath .path) {
		stroke: #9ca3af;
		stroke-width: 2px;
	}

	:global(.mermaid-container .edgeLabel) {
		background-color: #4b5563;
		color: #f9fafb;
	}

	:global(.mermaid-container .actor) {
		fill: #374151;
		stroke: #6b7280;
	}

	:global(.mermaid-container .actor-line) {
		stroke: #9ca3af;
	}

	:global(.mermaid-container .messageLine0) {
		stroke: #60a5fa;
		stroke-width: 2px;
	}

	:global(.mermaid-container .messageLine1) {
		stroke: #10b981;
		stroke-width: 2px;
	}

	:global(.mermaid-container .messageText) {
		fill: #f9fafb;
		font-family: 'Inter', sans-serif;
	}

	:global(.mermaid-container .loopText) {
		fill: #f9fafb;
	}

	:global(.mermaid-container .noteText) {
		fill: #f9fafb;
	}

	/* ローディングアニメーション */
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>

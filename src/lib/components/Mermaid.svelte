<script lang="ts">
	import { onMount } from 'svelte';
	import mermaid from 'mermaid';

	export let chart: string;
	export let id: string = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

	let container: HTMLElement;

	onMount(async () => {
		// Mermaidの初期化
		mermaid.initialize({
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
			} as any
		});

		try {
			// チャートをレンダリング
			const { svg } = await mermaid.render(id, chart);
			if (container) {
				// eslint-disable-next-line svelte/no-dom-manipulating
				container.innerHTML = svg;
			}
		} catch (error) {
			console.error('Mermaid rendering error:', error);
			if (container) {
				// eslint-disable-next-line svelte/no-dom-manipulating
				container.innerHTML = `<p class="text-red-600">図表の表示に失敗しました: ${error}</p>`;
			}
		}
	});
</script>

<div bind:this={container} class="mermaid-container my-6 flex justify-center">
	<!-- Mermaidチャートがここに挿入される -->
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
</style>

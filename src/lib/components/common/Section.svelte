<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		level?: 'h2' | 'h3' | 'h4';
		id?: string;
		icon?: string;
		class?: string;
		children: Snippet;
	}

	let { title, level = 'h2', id, icon, class: className = '', children }: Props = $props();

	function getIcon(iconName: string) {
		const icons: Record<string, string> = {
			section:
				'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
			concept:
				'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
			demo: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
			implementation: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
			theory:
				'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
			practice:
				'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
		};
		return icons[iconName] || icons.section;
	}

	const headingClasses = {
		h2: 'text-2xl font-bold text-gray-900',
		h3: 'text-xl font-semibold text-gray-800',
		h4: 'text-lg font-medium text-gray-700'
	};

	const underlineClasses = {
		h2: 'h-1 bg-gradient-to-r from-blue-500 to-purple-500',
		h3: 'h-0.5 bg-gradient-to-r from-green-500 to-blue-500',
		h4: 'h-0.5 bg-gradient-to-r from-orange-500 to-red-500'
	};
</script>

<section class="section mb-12 {className} {level === 'h2' ? 'floating-card' : ''}" {id}>
	<div class="section-header mb-6">
		<div class="flex items-center gap-3 mb-3">
			{#if icon}
				<div class="flex-shrink-0">
					<svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d={getIcon(icon)}
						/>
					</svg>
				</div>
			{/if}

			{#if level === 'h2'}
				<h2 class={headingClasses[level]}>{title}</h2>
			{:else if level === 'h3'}
				<h3 class={headingClasses[level]}>{title}</h3>
			{:else if level === 'h4'}
				<h4 class={headingClasses[level]}>{title}</h4>
			{/if}
		</div>

		<div class="section-underline w-16 rounded-full {underlineClasses[level]}"></div>
	</div>

	<div class="section-content">
		{@render children()}
	</div>
</section>

<style>
	.section {
		position: relative;
	}

	.section-header {
		position: relative;
	}

	.section-underline {
		transition: width 0.3s ease-in-out;
	}

	.section:hover .section-underline {
		width: 4rem;
	}

	.floating-card {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.95) 0%,
			rgba(255, 255, 255, 0.85) 100%
		);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		padding: 2rem;
		margin-bottom: 3rem;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		transition: all 0.3s ease;
	}

	.floating-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
	}
</style>

<script>
	let { title, language = 'javascript', code } = $props();
	let isOpen = $state(false);
</script>

<div class="border border-gray-200 rounded-lg overflow-hidden mb-4">
	<button
		class="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left flex items-center justify-between transition-colors duration-200"
		onclick={() => (isOpen = !isOpen)}
	>
		<span class="font-medium text-gray-700">{title}</span>
		<svg
			class="w-5 h-5 text-gray-500 transition-transform duration-200"
			class:rotate-180={isOpen}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"
			></path>
		</svg>
	</button>

	{#if isOpen}
		<div class="border-t border-gray-200">
			<pre class="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm m-0"><code
					class="language-{language}">{code}</code
				></pre>
		</div>
	{/if}
</div>

<style>
	.rotate-180 {
		transform: rotate(180deg);
	}
</style>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import LessonIntro from '$lib/components/learning/LessonIntro.svelte';
	import ProgressTracker from '$lib/components/learning/ProgressTracker.svelte';
	import NextLesson from '$lib/components/learning/NextLesson.svelte';
	import CompletionMark from '$lib/components/learning/CompletionMark.svelte';

	interface Props {
		lessonId: string;
		title: string;
		duration?: string;
		difficulty?: '初級' | '中級' | '上級';
		prerequisites?: string[];
		sectionTitle?: string;
		nextLessonId?: string;
		nextLessonTitle?: string;
		nextLessonPath?: string;
		learningObjectives?: string[];
		showTopCompletion?: boolean;
		showBottomCompletion?: boolean;
		class?: string;
		children: Snippet;
	}

	let {
		lessonId,
		title,
		duration = '60-90分',
		difficulty = '初級',
		prerequisites = [],
		sectionTitle = 'WebSocket基礎理解',
		nextLessonId,
		nextLessonTitle,
		nextLessonPath,
		learningObjectives = [],
		showTopCompletion = false,
		showBottomCompletion = true,
		class: className = '',
		children
	}: Props = $props();
</script>

<div class="lesson-layout {className}">
	<!-- Lesson Introduction -->
	<LessonIntro {lessonId} {title} {duration} {difficulty} {prerequisites} />

	<!-- Top Completion Mark (optional) -->
	{#if showTopCompletion}
		<CompletionMark {lessonId} />
	{/if}

	<!-- Learning Objectives (collapsible) -->
	{#if learningObjectives.length > 0}
		<div class="mb-8">
			<details>
				<summary><h2>🎯 このレッスンで学ぶこと</h2></summary>

				<div class="mt-4">
					<ul class="space-y-2">
						{#each learningObjectives as objective, index (index)}
							<li class="flex items-start gap-2">
								<svg
									class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fill-rule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clip-rule="evenodd"
									/>
								</svg>
								<span class="text-gray-700">{objective}</span>
							</li>
						{/each}
					</ul>
				</div>
			</details>
		</div>
	{/if}

	<!-- Main Content Wrapper -->
	<div class="lesson-content">
		{@render children()}
	</div>

	<!-- Progress Tracker -->
	<ProgressTracker {lessonId} {sectionTitle} />

	<!-- Bottom Completion Mark -->
	{#if showBottomCompletion}
		<CompletionMark {lessonId} />
	{/if}

	<!-- Next Lesson Navigation -->
	{#if nextLessonId && nextLessonTitle && nextLessonPath}
		<NextLesson {nextLessonId} {nextLessonTitle} {nextLessonPath} />
	{/if}
</div>

<style>
	.lesson-layout {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.lesson-content {
		position: relative;
		min-height: 400px;
	}

	/* Ensure proper spacing for content within layout */
	:global(.lesson-layout .prose) {
		max-width: none;
	}

	/* Style for learning objectives details */
	:global(.lesson-layout details) {
		background-color: #eff6ff;
		border: 1px solid #dbeafe;
		border-radius: 0.5rem;
		padding: 1.5rem;
	}

	:global(.lesson-layout details summary h2) {
		margin-bottom: 0;
		color: #1e3a8a;
	}

	:global(.lesson-layout details[open]) {
		background-color: #dbeafe;
	}
</style>

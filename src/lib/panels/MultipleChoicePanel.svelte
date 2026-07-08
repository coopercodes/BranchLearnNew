<script lang="ts">
	import MultipleChoiceQuestion from '$lib/question/MultipleChoiceQuestion.svelte';
	import type { MultipleChoicePanel } from '$lib/content/types';
	import type { QuestionResponses } from '$lib/question/responsesState.svelte';
	import { userProgress } from '$lib/progress/userProgress.svelte';
	import { untrack } from 'svelte';

	let { panel }: { panel: MultipleChoicePanel } = $props();

	$effect(() => {
		const id = panel.id;
		untrack(() => userProgress.beginPanel(id));
	});

	// Adapts UserProgress to the QuestionResponses contract MultipleChoiceQuestion
	// expects, so every click lands in persistent progress. Grading happens inside
	// UserProgress from the panel content, so correctAnswer is ignored here.
	const responses: QuestionResponses = {
		get: (questionId) => userProgress.answer(panel.id, questionId),
		answer: (questionId, label) => userProgress.recordAttempt(panel, questionId, label)
	};

	let correct = $derived(userProgress.correctCount(panel));
	let incorrect = $derived(userProgress.incorrectCount(panel));
</script>

<div class="flex h-full">
	<!-- Left: article panel, scrolls independently, hugs the divider -->
	<div class="scroll-chill h-full min-w-0 flex-1 overflow-y-auto">
		<div class="flex min-h-full flex-col items-end py-16 pr-8 pl-16 [justify-content:safe_center]">
			<div class="w-full max-w-lg">
				<h1 class="mb-6 text-5xl font-bold text-black">{panel.reading.heading}</h1>
				{#each panel.reading.paragraphs as paragraph (paragraph)}
					<p class="mb-4 text-base text-black">{paragraph}</p>
				{/each}

				{#if panel.reading.tip}
					<div class="border-brand-gold/40 bg-brand-gold/10 mt-6 rounded-lg border px-4 py-3">
						<p class="text-brand-orange mb-1 text-xs font-semibold tracking-wide uppercase">
							{panel.reading.tip.label}
						</p>
						<p class="text-sm text-black">{panel.reading.tip.body}</p>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Divider -->
	<div class="bg-brand-gray-light/60 h-6 w-px shrink-0 self-center"></div>

	<!-- Right: questions panel, scrolls independently, hugs the divider -->
	<div class="scroll-chill h-full min-w-0 flex-1 overflow-y-auto">
		<div
			class="flex min-h-full flex-col items-start py-16 pr-16 pl-8 [justify-content:safe_center]"
		>
			<div class="w-full max-w-sm">
				{#each panel.questions as question, i (question.id)}
					<MultipleChoiceQuestion
						questionId={question.id}
						number={i + 1}
						prompt={question.prompt}
						options={question.options}
						correctAnswer={question.correctAnswer}
						{responses}
					/>
				{/each}

				<p class="mt-2 text-xs text-gray-500">
					{correct}/{panel.questions.length} correct · {incorrect} wrong
					{incorrect === 1 ? 'guess' : 'guesses'}
				</p>
			</div>
		</div>
	</div>
</div>

<script lang="ts">
	import MultipleChoiceQuestion from '$lib/question/MultipleChoiceQuestion.svelte';
	import type { QuestionResponses } from '$lib/question/responsesState.svelte';
	import { trigSession } from '$lib/trig/session.svelte';
	import type { Panel } from '$lib/trig/panels';

	// One multiple-choice question. Every click is reported via `onAnswer`; wrong
	// clicks are kept and the question stays open until it's answered correctly.
	let { panel, onAnswer }: { panel: Panel; onAnswer: (label: string) => void } = $props();

	// Adapt the session to the shape MultipleChoiceQuestion expects. Reads come
	// straight from the (reactive) store; writes go up through `onAnswer`.
	const responses: QuestionResponses = {
		get: (questionId) => {
			const rec = trigSession.answerFor(questionId);
			return {
				questionId,
				selected: rec.selected,
				incorrectAnswers: rec.wrong,
				correct: rec.correct,
				answeredAt: null
			};
		},
		answer: (_questionId, label) => onAnswer(label)
	};
</script>

<div class="flex h-full items-center justify-center px-8 py-12">
	<div class="w-full max-w-md">
		{#key panel.id}
			<MultipleChoiceQuestion
				questionId={panel.id}
				number={1}
				prompt={panel.prompt ?? panel.title}
				options={panel.options ?? []}
				correctAnswer={panel.answer ?? ''}
				{responses}
			/>
		{/key}

		{#if panel.hint}
			<p class="mt-2 text-sm text-brand-gray-mid italic">Hint: {panel.hint}</p>
		{/if}
	</div>
</div>

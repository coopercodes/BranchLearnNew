<script lang="ts">
	import MultipleChoiceQuestion from '$lib/question/MultipleChoiceQuestion.svelte';
	import type { QuestionResponses } from '$lib/question/responsesState.svelte';
	import { trigSession } from '$lib/trig/session.svelte';
	import { PANEL_TYPE_LABELS, type TrigPanel, type TrigQuestion, type TrigSection } from '$lib/trig/types';

	let {
		section,
		panel,
		question
	}: { section: TrigSection; panel: TrigPanel; question: TrigQuestion } = $props();

	// Adapt the session to the contract MultipleChoiceQuestion expects. Grading
	// happens inside the session from the question itself, so every wrong click
	// is kept until the learner lands the correct one.
	const responses: QuestionResponses = {
		get: (questionId) => trigSession.record(questionId),
		answer: (_questionId, label) => trigSession.answer(question, label)
	};

	// How far along this panel type is — e.g. "1 / 2 correct" for multiple choice.
	let stats = $derived(trigSession.panelStats(panel));
	let required = $derived(trigSession.requiredFor(panel));
</script>

<div class="flex h-full items-center justify-center px-8 py-12">
	<div class="w-full max-w-md">
		<div class="mb-6 flex items-center justify-between">
			<p class="text-[11px] font-bold tracking-[0.2em] text-brand-orange uppercase">
				{section.label} · {PANEL_TYPE_LABELS[panel.type]}
			</p>
			<p class="text-[11px] font-semibold text-brand-gray-mid tabular-nums">
				{Math.min(required, stats.correct)} / {required} correct
			</p>
		</div>

		{#key question.id}
			<MultipleChoiceQuestion
				questionId={question.id}
				number={1}
				prompt={question.prompt}
				options={question.options}
				correctAnswer={question.correctAnswer}
				{responses}
			/>
		{/key}

		{#if question.hint}
			<p class="mt-2 text-sm text-brand-gray-mid italic">Hint: {question.hint}</p>
		{/if}
	</div>
</div>

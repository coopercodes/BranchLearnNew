<script lang="ts">
	import { untrack } from 'svelte';
	import { roundFor, type MultipleChoiceContent } from '../panel-content';
	import ChoiceList from './ChoiceList.svelte';
	import ResultNote from './ResultNote.svelte';

	// One untimed question per visit, picked from the bank by visit number. The
	// first click commits the attempt and reports it up; the page owns what
	// happens next.
	let {
		content,
		visit,
		onResult
	}: {
		content: MultipleChoiceContent;
		/** Attempts already spent on this panel when the visit began. */
		visit: number;
		onResult: (correct: boolean) => void;
	} = $props();

	// Fixed for the lifetime of this visit — the component is remounted per visit,
	// and `visit` changing after the answer must not swap the question mid-feedback.
	const question = untrack(() => roundFor(content.questions, visit));

	let chosen = $state<string | null>(null);

	function choose(label: string) {
		if (chosen !== null) return;
		chosen = label;
		onResult(label === question.correctAnswer);
	}
</script>

<div class="scroll-chill flex h-full items-center justify-center overflow-y-auto px-8 py-12">
	<div class="w-full max-w-md">
		<p class="mb-2 text-xs font-semibold tracking-widest text-brand-orange uppercase">
			Multiple choice
		</p>
		<p class="mb-1 text-xl font-semibold text-brand-near-black">{question.prompt}</p>
		<p class="mb-6 text-sm text-brand-gray-mid">{content.lede}</p>

		<ChoiceList
			options={question.options}
			correctAnswer={question.correctAnswer}
			{chosen}
			onchoose={choose}
		/>

		{#if chosen !== null}
			<ResultNote
				result={chosen === question.correctAnswer ? 'correct' : 'incorrect'}
				hint={question.hint}
			/>
		{/if}
	</div>
</div>

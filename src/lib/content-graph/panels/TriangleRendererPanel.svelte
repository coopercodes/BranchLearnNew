<script lang="ts">
	import { untrack } from 'svelte';
	import { roundFor, type TriangleContent } from '../panel-content';
	import TriangleFigure from './TriangleFigure.svelte';
	import ChoiceList from './ChoiceList.svelte';
	import ResultNote from './ResultNote.svelte';

	// Triangle panel: a rendered right triangle on the left, one multiple-choice
	// question about it on the right. Each visit pulls the next round (figure +
	// question) from the bank.
	let {
		content,
		visit,
		onResult
	}: {
		content: TriangleContent;
		visit: number;
		onResult: (correct: boolean) => void;
	} = $props();

	// Fixed for this visit — see GraphMultipleChoicePanel.
	const round = untrack(() => roundFor(content.rounds, visit));

	let chosen = $state<string | null>(null);

	function choose(label: string) {
		if (chosen !== null) return;
		chosen = label;
		onResult(label === round.question.correctAnswer);
	}
</script>

<div class="scroll-chill h-full overflow-y-auto">
	<div
		class="flex min-h-full flex-wrap items-center justify-center gap-x-12 gap-y-8 px-10 py-12 [align-content:safe_center]"
	>
		<!-- Figure -->
		<div class="w-full max-w-[560px] min-w-0 flex-1 basis-[420px]">
			<TriangleFigure spec={round.triangle} />
		</div>

		<!-- Question -->
		<div class="w-full max-w-md flex-1 basis-[320px]">
			<p class="mb-2 text-xs font-semibold tracking-widest text-brand-orange uppercase">
				Triangle · multiple choice
			</p>
			<p class="mb-1 text-xl font-semibold text-brand-near-black">{round.question.prompt}</p>
			<p class="mb-6 text-sm text-brand-gray-mid">{content.lede}</p>

			<ChoiceList
				options={round.question.options}
				correctAnswer={round.question.correctAnswer}
				{chosen}
				onchoose={choose}
			/>

			{#if chosen !== null}
				<ResultNote
					result={chosen === round.question.correctAnswer ? 'correct' : 'incorrect'}
					hint={round.question.hint}
				/>
			{/if}
		</div>
	</div>
</div>

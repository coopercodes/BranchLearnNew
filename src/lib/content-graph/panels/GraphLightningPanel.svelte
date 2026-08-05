<script lang="ts">
	import { untrack } from 'svelte';
	import { roundFor, type LightningContent } from '../panel-content';
	import ChoiceList from './ChoiceList.svelte';
	import ResultNote from './ResultNote.svelte';

	// One timed question per visit. Answering stops the clock; the clock hitting
	// zero spends the attempt as a miss and reveals the answer.
	let {
		content,
		visit,
		onResult
	}: {
		content: LightningContent;
		visit: number;
		onResult: (correct: boolean) => void;
	} = $props();

	// Fixed for this visit — see GraphMultipleChoicePanel.
	const question = untrack(() => roundFor(content.questions, visit));
	const seconds = untrack(() => content.seconds);

	let timeLeft = $state(seconds);
	let chosen = $state<string | null>(null);
	let timedOut = $state(false);
	let resolved = $derived(chosen !== null || timedOut);

	$effect(() => {
		if (resolved) return;
		const tick = setInterval(() => {
			timeLeft -= 1;
			if (timeLeft <= 0) {
				timedOut = true;
				onResult(false);
			}
		}, 1000);
		return () => clearInterval(tick);
	});

	function choose(label: string) {
		if (resolved) return;
		chosen = label;
		onResult(label === question.correctAnswer);
	}
</script>

<div class="scroll-chill flex h-full items-center justify-center overflow-y-auto px-8 py-12">
	<div class="w-full max-w-md">
		<div class="mb-6 flex items-center justify-between">
			<p class="text-xs font-semibold tracking-widest text-brand-orange uppercase">
				⚡ Lightning round
			</p>
			<span
				class="rounded-full px-3 py-1 text-sm font-bold tabular-nums {timeLeft <= 5 && !resolved
					? 'bg-brand-crimson/10 text-brand-crimson'
					: 'bg-brand-navy/10 text-brand-navy'}"
			>
				{resolved ? '—' : `${timeLeft}s`}
			</span>
		</div>

		<p class="mb-1 text-xl font-semibold text-brand-near-black">{question.prompt}</p>
		<p class="mb-6 text-sm text-brand-gray-mid">{content.lede}</p>

		<ChoiceList
			options={question.options}
			correctAnswer={question.correctAnswer}
			chosen={timedOut ? '' : chosen}
			onchoose={choose}
		/>

		{#if resolved}
			{#if timedOut}
				<div class="mt-5">
					<p class="text-sm font-semibold text-brand-crimson">
						⏱ Time's up — the correct answer is highlighted.
					</p>
					<p class="mt-1 text-xs text-brand-gray-mid">
						Press Continue in the bar below to keep moving.
					</p>
				</div>
			{:else}
				<ResultNote
					result={chosen === question.correctAnswer ? 'correct' : 'incorrect'}
					hint={question.hint}
				/>
			{/if}
		{/if}
	</div>
</div>

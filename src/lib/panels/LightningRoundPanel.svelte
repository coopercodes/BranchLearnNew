<script lang="ts">
	import { untrack } from 'svelte';
	import { scale } from 'svelte/transition';
	import type { LightningRoundPanel, Question } from '$lib/content/types';
	import { userProgress } from '$lib/progress/userProgress.svelte';

	let { panel }: { panel: LightningRoundPanel } = $props();

	const REVEAL_MS = 900;

	function firstUnlockedIndex(p: LightningRoundPanel): number {
		const i = p.questions.findIndex((q) => !userProgress.answer(p.id, q.id).locked);
		return i === -1 ? p.questions.length : i;
	}

	let index = $state(0);
	let timeLeft = $state(0);
	// While true, the just-answered question stays on screen showing its result.
	let revealing = $state(false);

	let finished = $derived(index >= panel.questions.length);
	let current: Question | undefined = $derived(panel.questions[index]);
	let score = $derived(userProgress.correctCount(panel));

	// (Re)enter the round whenever a different lightning panel is shown, resuming
	// past any questions already locked on a previous visit. Only the panel prop
	// is tracked — progress reads are untracked so answering doesn't re-run this.
	$effect(() => {
		const p = panel;
		untrack(() => {
			userProgress.beginPanel(p.id);
			index = firstUnlockedIndex(p);
			timeLeft = p.secondsPerQuestion;
			revealing = false;
		});
	});

	// One-second countdown while a question is live; hitting zero spends the
	// attempt as a timeout.
	$effect(() => {
		if (finished || revealing) return;
		const tick = setInterval(() => {
			timeLeft -= 1;
			if (timeLeft <= 0) answer(null);
		}, 1000);
		return () => clearInterval(tick);
	});

	function answer(label: string | null) {
		if (!current || revealing) return;
		userProgress.recordLightning(panel, current.id, label);
		revealing = true;
		setTimeout(() => {
			revealing = false;
			index += 1;
			timeLeft = panel.secondsPerQuestion;
		}, REVEAL_MS);
	}

	function retry() {
		userProgress.resetPanel(panel.id);
		userProgress.beginPanel(panel.id);
		index = 0;
		timeLeft = panel.secondsPerQuestion;
	}

	function optionState(question: Question, label: string): 'correct' | 'incorrect' | 'neutral' {
		const record = userProgress.answer(panel.id, question.id);
		if (!record.locked) return 'neutral';
		if (label === question.correctAnswer) return 'correct';
		if (label === record.selected) return 'incorrect';
		return 'neutral';
	}
</script>

<div class="flex h-full items-center justify-center overflow-y-auto p-10 scroll-chill">
	{#if finished}
		<!-- Summary -->
		<div class="w-full max-w-md text-center">
			<p class="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-orange">
				Lightning round complete
			</p>
			<p class="mb-6 text-5xl font-bold text-brand-near-black">
				{score}<span class="text-brand-gray-mid">/{panel.questions.length}</span>
			</p>

			<div class="mb-8 flex flex-col gap-2 text-left">
				{#each panel.questions as question (question.id)}
					{@const record = userProgress.answer(panel.id, question.id)}
					<div
						class="flex items-center gap-3 rounded-lg border px-4 py-2 {record.correct
							? 'border-brand-forest/40 bg-brand-forest/10'
							: 'border-brand-crimson/40 bg-brand-crimson/10'}"
					>
						<span
							class="text-sm font-bold {record.correct
								? 'text-brand-forest'
								: 'text-brand-crimson'}"
						>
							{record.correct ? '✓' : record.selected === null ? '⏱' : '✗'}
						</span>
						<span class="flex-1 text-sm text-brand-near-black">{question.prompt}</span>
					</div>
				{/each}
			</div>

			<button
				type="button"
				class="cursor-pointer rounded-lg border border-brand-btn-border bg-brand-btn-bg px-5 py-2 text-sm font-semibold text-brand-near-black transition-all hover:brightness-95"
				onclick={retry}
			>
				Try again
			</button>
		</div>
	{:else if current}
		<!-- Live question -->
		<div class="w-full max-w-md">
			<div class="mb-6 flex items-center justify-between">
				<div class="flex items-center gap-2">
					{#each panel.questions as question, i (question.id)}
						{@const record = userProgress.answer(panel.id, question.id)}
						<span
							class="h-2.5 w-2.5 rounded-full {record.locked
								? record.correct
									? 'bg-brand-forest'
									: 'bg-brand-crimson'
								: i === index
									? 'bg-brand-gold'
									: 'bg-brand-gray-light'}"
						></span>
					{/each}
				</div>
				<span
					class="rounded-full px-3 py-1 text-sm font-bold tabular-nums {timeLeft <= 5 && !revealing
						? 'bg-brand-crimson/10 text-brand-crimson'
						: 'bg-brand-navy/10 text-brand-navy'}"
				>
					{revealing ? '—' : `${timeLeft}s`}
				</span>
			</div>

			<p class="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-orange">
				⚡ Question {index + 1} of {panel.questions.length}
			</p>
			<p class="mb-6 text-xl font-semibold text-brand-near-black">{current.prompt}</p>

			<div class="flex flex-col gap-3">
				{#each current.options as opt (opt.label)}
					{@const state = optionState(current, opt.label)}
					<button
						type="button"
						disabled={revealing}
						class="flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-200 disabled:cursor-default {state ===
						'correct'
							? 'border-brand-forest bg-brand-forest/10'
							: state === 'incorrect'
								? 'border-brand-crimson bg-brand-crimson/10'
								: revealing
									? 'border-brand-btn-border bg-brand-btn-bg opacity-40'
									: 'cursor-pointer border-brand-btn-border bg-brand-btn-bg hover:brightness-95'}"
						onclick={() => answer(opt.label)}
					>
						<span
							class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-sm font-light"
						>
							{#if state === 'correct'}
								<span in:scale={{ duration: 200, start: 0.4 }} class="font-bold text-brand-forest"
									>✓</span
								>
							{:else if state === 'incorrect'}
								<span in:scale={{ duration: 200, start: 0.4 }} class="font-bold text-brand-crimson"
									>✗</span
								>
							{:else}
								{opt.label}
							{/if}
						</span>
						<span class="text-sm">{opt.text}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

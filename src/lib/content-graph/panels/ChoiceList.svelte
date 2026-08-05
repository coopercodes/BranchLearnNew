<script lang="ts">
	import { scale } from 'svelte/transition';
	import type { PanelOption } from '../panel-content';

	// One-shot option list shared by every question-style graph panel: the first
	// click commits the attempt, then the correct answer (and a wrong pick) are
	// revealed. The graph system has no retry-until-correct — a miss just sends
	// the walker back around the training loop.
	let {
		options,
		correctAnswer,
		chosen,
		disabled = false,
		onchoose
	}: {
		options: PanelOption[];
		correctAnswer: string;
		/** The committed label, or null while the question is still open. */
		chosen: string | null;
		disabled?: boolean;
		onchoose: (label: string) => void;
	} = $props();

	let revealed = $derived(chosen !== null);

	function stateFor(label: string): 'correct' | 'incorrect' | 'neutral' {
		if (!revealed) return 'neutral';
		if (label === correctAnswer) return 'correct';
		if (label === chosen) return 'incorrect';
		return 'neutral';
	}
</script>

<div class="flex flex-col gap-3">
	{#each options as opt (opt.label)}
		{@const state = stateFor(opt.label)}
		<button
			type="button"
			disabled={revealed || disabled}
			class="flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-200 disabled:cursor-default {state ===
			'correct'
				? 'border-brand-forest bg-brand-forest/10'
				: state === 'incorrect'
					? 'border-brand-crimson bg-brand-crimson/10'
					: revealed || disabled
						? 'border-brand-btn-border bg-brand-btn-bg opacity-40'
						: 'cursor-pointer border-brand-btn-border bg-brand-btn-bg hover:brightness-95'}"
			onclick={() => onchoose(opt.label)}
		>
			<span
				class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-sm font-light"
			>
				{#if state === 'correct'}
					<span in:scale={{ duration: 200, start: 0.4 }} class="font-bold text-brand-forest">✓</span
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

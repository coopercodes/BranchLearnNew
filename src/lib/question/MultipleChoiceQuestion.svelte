<script lang="ts">
	import { scale } from 'svelte/transition';
	import type { ResponsesState } from './responsesState.svelte';

	export interface QuestionOption {
		label: string;
		text: string;
	}

	let {
		questionId,
		number,
		prompt,
		options,
		correctAnswer,
		responses
	}: {
		questionId: string;
		number: number;
		prompt: string;
		options: QuestionOption[];
		correctAnswer: string;
		responses: ResponsesState;
	} = $props();

	let response = $derived(responses.get(questionId));
	let locked = $derived(response.correct);
	let gradientId = $derived(`quest-metal-${questionId}`);

	function choose(label: string) {
		if (locked) return;
		responses.answer(questionId, label, correctAnswer);
	}

	function stateFor(label: string): 'correct' | 'incorrect' | 'neutral' {
		if (response.correct && label === correctAnswer) return 'correct';
		if (response.incorrectAnswers.includes(label)) return 'incorrect';
		return 'neutral';
	}
</script>

<div class="mb-8 last:mb-0">
	<div class="flex items-center gap-2 mb-2">
		<svg width="18" height="18" viewBox="-13 -13 26 26" aria-hidden="true">
			{#if locked}
				<g in:scale={{ duration: 250, start: 0.4 }}>
					<circle r="11" fill="#386d4f" />
					<path
						d="M -5 0.5 L -1.5 4 L 5 -4.5"
						fill="none"
						stroke="white"
						stroke-width="2.2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</g>
			{:else}
				<defs>
					<linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stop-color="#7fe3ff" />
						<stop offset="18%" stop-color="#29b6f6" />
						<stop offset="38%" stop-color="#0277bd" />
						<stop offset="50%" stop-color="#4fc3f7" />
						<stop offset="62%" stop-color="#01579b" />
						<stop offset="82%" stop-color="#039be5" />
						<stop offset="100%" stop-color="#002b4d" />
					</linearGradient>
				</defs>
				<circle r="11" fill="#29b6f6" opacity="0.35" />
				<polygon
					points="0,-9 9,0 0,9 -9,0"
					fill="url(#{gradientId})"
					stroke="#002b4d"
					stroke-width="1.2"
				/>
				<text
					text-anchor="middle"
					dominant-baseline="central"
					font-size="9"
					font-weight="900"
					fill="white"
					stroke="rgba(0, 43, 77, 0.7)"
					stroke-width="0.8"
					paint-order="stroke">?</text
				>
			{/if}
		</svg>
		<p class="text-sm text-gray-500">Question {number}</p>
	</div>
	<p class="text-lg font-semibold text-black mb-6">
		{prompt}
	</p>
	<div class="flex flex-col gap-3">
		{#each options as opt (opt.label)}
			{@const state = stateFor(opt.label)}
			<button
				type="button"
				disabled={state === 'incorrect' || (locked && state !== 'correct')}
				class="flex items-start gap-3 px-4 py-3 border rounded-lg text-left transition-all duration-300 disabled:cursor-default {state ===
				'correct'
					? 'border-brand-forest bg-brand-forest/10'
					: state === 'incorrect'
						? 'border-brand-crimson bg-brand-crimson/10'
						: 'cursor-pointer border-brand-btn-border bg-brand-btn-bg hover:brightness-95'} {locked && state !== 'correct'
					? 'opacity-40'
					: ''}"
				onclick={() => choose(opt.label)}
			>
				<span
					class="relative w-6 h-6 flex items-center justify-center bg-white rounded-full text-sm font-light shrink-0"
				>
					{#if state === 'correct'}
						<svg
							in:scale={{ duration: 200, start: 0.4 }}
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#386d4f"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
					{:else if state === 'incorrect'}
						<svg
							in:scale={{ duration: 200, start: 0.4 }}
							xmlns="http://www.w3.org/2000/svg"
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#d42622"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					{:else}
						{opt.label}
					{/if}
				</span>
				<span class="text-sm pt-[2px]">{opt.text}</span>
			</button>
		{/each}
	</div>
</div>

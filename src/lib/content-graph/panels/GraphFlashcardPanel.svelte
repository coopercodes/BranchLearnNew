<script lang="ts">
	import { untrack } from 'svelte';
	import { fly } from 'svelte/transition';
	import { roundFor, type FlashcardContent } from '../panel-content';

	// Flashcard check: think through the front, flip, then honestly self-report.
	// The self-report IS the answer — "Had it" banks a correct, "Missed it" a miss.
	let {
		content,
		visit,
		onResult
	}: {
		content: FlashcardContent;
		visit: number;
		onResult: (correct: boolean) => void;
	} = $props();

	// Fixed for this visit — see GraphMultipleChoicePanel.
	const card = untrack(() => roundFor(content.cards, visit));

	let flipped = $state(false);
	let graded = $state<'correct' | 'incorrect' | null>(null);

	function grade(correct: boolean) {
		if (graded !== null) return;
		graded = correct ? 'correct' : 'incorrect';
		onResult(correct);
	}
</script>

<div class="scroll-chill flex h-full items-center justify-center overflow-y-auto px-8 py-12">
	<div class="w-full max-w-md">
		<p class="mb-2 text-xs font-semibold tracking-widest text-brand-orange uppercase">
			Flashcard check
		</p>
		<p class="mb-6 text-sm text-brand-gray-mid">{content.lede}</p>

		<button
			type="button"
			class="card-scene block w-full {flipped ? '' : 'cursor-pointer'}"
			onclick={() => (flipped = true)}
			disabled={flipped}
			aria-label={flipped ? 'Card revealed' : 'Flip the card'}
		>
			<div class="card-inner {flipped ? 'is-flipped' : ''}">
				<div
					class="card-face flex flex-col items-center justify-center gap-3 rounded-xl border border-brand-gray-light/70 bg-white px-8 py-10"
				>
					<p class="text-center text-2xl font-bold text-brand-near-black">{card.front}</p>
					<p class="text-xs text-brand-gray-mid">Think it through, then tap to flip</p>
				</div>
				<div
					class="card-face card-back flex flex-col items-center justify-center gap-3 rounded-xl border border-brand-forest/50 bg-brand-green-50 px-8 py-10"
				>
					<p class="text-xs font-semibold tracking-widest text-brand-green-700 uppercase">
						{card.front}
					</p>
					<p class="text-center text-base leading-relaxed text-brand-near-black">{card.back}</p>
				</div>
			</div>
		</button>

		{#if flipped && graded === null}
			<div in:fly={{ y: 8, duration: 250 }} class="mt-6">
				<p class="mb-3 text-center text-sm font-semibold text-brand-near-black">
					Did you have it before the flip?
				</p>
				<div class="flex gap-3">
					<button
						type="button"
						class="flex-1 cursor-pointer rounded-lg border border-brand-forest bg-brand-forest/10 px-4 py-3 text-sm font-bold text-brand-forest transition-all hover:bg-brand-forest/20"
						onclick={() => grade(true)}
					>
						✓ Had it
					</button>
					<button
						type="button"
						class="flex-1 cursor-pointer rounded-lg border border-brand-crimson bg-brand-crimson/10 px-4 py-3 text-sm font-bold text-brand-crimson transition-all hover:bg-brand-crimson/20"
						onclick={() => grade(false)}
					>
						✗ Missed it
					</button>
				</div>
			</div>
		{:else if graded !== null}
			<div in:fly={{ y: 8, duration: 250 }} class="mt-6 text-center">
				{#if graded === 'correct'}
					<p class="text-sm font-semibold text-brand-forest">Banked — honest recall is the rep.</p>
				{:else}
					<p class="text-sm font-semibold text-brand-crimson">
						No sweat — this card will come back around the loop.
					</p>
				{/if}
				<p class="mt-1 text-xs text-brand-gray-mid">
					Press Continue in the bar below to keep moving.
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.card-scene {
		perspective: 1200px;
		background: transparent;
		border: none;
		padding: 0;
	}

	.card-inner {
		position: relative;
		width: 100%;
		min-height: 14rem;
		transform-style: preserve-3d;
		transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.card-inner.is-flipped {
		transform: rotateY(180deg);
	}

	.card-face {
		position: absolute;
		inset: 0;
		backface-visibility: hidden;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
	}

	.card-back {
		transform: rotateY(180deg);
	}
</style>

<script lang="ts">
	import { game, MAX_ELO } from '../gameState.svelte';
	import { ContentGraph } from '../graph-content';

	// The course-complete screen: every subtopic mastered, nowhere left to walk.
	let { onRestart }: { onRestart: () => void } = $props();

	const subtopics = ContentGraph.filter((n) => n.type === 'subtopic');
</script>

<div class="scroll-chill flex h-full items-center justify-center overflow-y-auto px-8 py-12">
	<div class="w-full max-w-lg text-center">
		<p class="mb-3 text-5xl">🎉</p>
		<h1 class="mb-3 text-3xl font-bold text-brand-charcoal">SOH · CAH · TOA mastered</h1>
		<p class="mx-auto mb-8 max-w-md text-base leading-relaxed text-brand-charcoal/85">
			The walker has nowhere left to go — every subtopic hit {MAX_ELO} ELO.
		</p>

		<div class="mb-8 flex flex-col gap-2 text-left">
			{#each subtopics as subtopic (subtopic.id)}
				{@const elo = game.eloFor(subtopic.id)}
				<div
					class="flex items-center gap-3 rounded-lg border border-brand-forest/40 bg-brand-forest/10 px-4 py-2.5"
				>
					<span class="text-sm font-bold text-brand-forest">✓</span>
					<span class="flex-1 text-sm font-semibold text-brand-near-black">{subtopic.title}</span>
					<span class="font-mono text-sm font-bold text-brand-forest tabular-nums">
						{elo}/{MAX_ELO} · {game.rankOf(subtopic.id)}
					</span>
				</div>
			{/each}
		</div>

		<button
			type="button"
			class="cursor-pointer rounded-lg border border-brand-gray-light/70 bg-white px-8 py-3 text-sm font-bold text-brand-charcoal transition-colors hover:bg-brand-cream"
			onclick={onRestart}
		>
			Start over
		</button>
	</div>
</div>

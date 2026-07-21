<script lang="ts">
	import { trigSession } from '$lib/trig/session.svelte';
	import type { TrigSection } from '$lib/trig/types';

	let { section, onContinue }: { section: TrigSection; onContinue: () => void } = $props();

	let panels = $derived(section.panels.length);
	let wrongTries = $derived(
		section.panels.reduce((sum, p) => sum + trigSession.panelStats(p).incorrect, 0)
	);
</script>

<div class="flex h-full items-center justify-center px-8 py-12">
	<div class="w-full max-w-lg text-center">
		<div
			class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-forest"
		>
			<svg viewBox="0 0 24 24" width="40" height="40" aria-hidden="true">
				<polyline
					points="5,13 10,18 19,7"
					fill="none"
					stroke="white"
					stroke-width="2.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</div>

		<p class="mb-2 text-[11px] font-bold tracking-[0.3em] text-brand-forest uppercase">
			Section Complete
		</p>
		<h1 class="mb-3 text-3xl font-bold text-brand-charcoal">
			{section.label} mastered
		</h1>

		<p class="mx-auto mb-8 max-w-md text-base leading-relaxed text-brand-charcoal/85">
			You cleared all {panels} panels in {section.title}.
			{#if wrongTries === 0}
				A clean run — no wrong turns.
			{:else}
				You pushed through {wrongTries}
				{wrongTries === 1 ? 'wrong try' : 'wrong tries'} along the way — that's where the learning sticks.
			{/if}
		</p>

		<button
			type="button"
			class="cursor-pointer rounded-lg bg-brand-forest px-8 py-3 text-sm font-bold text-white transition-all hover:brightness-110"
			onclick={onContinue}
		>
			Continue →
		</button>
	</div>
</div>

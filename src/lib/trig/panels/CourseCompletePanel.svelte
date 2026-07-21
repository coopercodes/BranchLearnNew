<script lang="ts">
	import { trigSections } from '$lib/trig/content';
	import { trigSession } from '$lib/trig/session.svelte';

	let { onRestart }: { onRestart: () => void } = $props();

	let correct = $derived(trigSession.totalCorrect);
	let incorrect = $derived(trigSession.totalIncorrect);
</script>

<div class="flex h-full items-center justify-center px-8 py-12">
	<div class="w-full max-w-lg text-center">
		<p class="mb-3 text-5xl">🎉</p>
		<h1 class="mb-3 text-3xl font-bold text-brand-charcoal">SOH · CAH · TOA complete</h1>
		<p class="mx-auto mb-8 max-w-md text-base leading-relaxed text-brand-charcoal/85">
			You worked through all {trigSections.length} sections. {correct} questions answered correctly across
			{incorrect}
			{incorrect === 1 ? 'wrong turn' : 'wrong turns'}.
		</p>

		<button
			type="button"
			class="cursor-pointer rounded-lg border border-brand-gray-light/70 bg-white px-8 py-3 text-sm font-bold text-brand-charcoal transition-colors hover:bg-brand-cream"
			onclick={onRestart}
		>
			Start over
		</button>
	</div>
</div>

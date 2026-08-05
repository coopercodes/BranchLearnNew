<script lang="ts">
	import { fly } from 'svelte/transition';

	// Shared post-answer feedback line: what happened, plus where to go next
	// (the OS bar's Continue pill is the universal advance control).
	let {
		result,
		hint
	}: {
		result: 'correct' | 'incorrect';
		/** Shown under a miss to set up the next lap. */
		hint?: string;
	} = $props();
</script>

<div in:fly={{ y: 8, duration: 250 }} class="mt-5">
	{#if result === 'correct'}
		<p class="text-sm font-semibold text-brand-forest">Correct — that one's banked.</p>
	{:else}
		<p class="text-sm font-semibold text-brand-crimson">
			Not this time — the correct answer is highlighted.
		</p>
		{#if hint}
			<p class="mt-1 text-sm text-brand-gray-mid italic">Hint: {hint}</p>
		{/if}
	{/if}
	<p class="mt-1 text-xs text-brand-gray-mid">Press Continue in the bar below to keep moving.</p>
</div>

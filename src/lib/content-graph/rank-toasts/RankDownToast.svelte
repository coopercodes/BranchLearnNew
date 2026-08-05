<script lang="ts">
	import BranchMark from '$lib/toast/BranchMark.svelte';

	// Only reachable if ticks can be lost — ELO is the tick percentage, which
	// only ever climbs, so nothing fires this today. Kept wired for when it can.
	let { subtopic, elo, rank }: { subtopic: string; elo: number; rank: string } = $props();
</script>

<div
	class="flex items-center gap-3 rounded-xl bg-brand-navy py-3 pr-5 pl-4 shadow-xl ring-1 ring-brand-crimson/60"
>
	<BranchMark color="var(--color-brand-crimson)" size={28} />
	<div class="min-w-0">
		<p class="text-sm leading-tight font-bold text-brand-crimson">Dropped to {rank}</p>
		<p class="text-xs leading-tight text-brand-gray-light">{subtopic} · {elo}% of ticks</p>
	</div>
</div>

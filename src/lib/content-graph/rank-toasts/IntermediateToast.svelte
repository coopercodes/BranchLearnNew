<script lang="ts">
	import BranchMark from '$lib/toast/BranchMark.svelte';

	let { subtopic, elo }: { subtopic: string; elo: number } = $props();
</script>

<div
	class="flex items-center gap-3 rounded-xl bg-brand-navy py-3 pr-5 pl-4 shadow-xl ring-1 ring-brand-gold/50"
>
	<BranchMark color="var(--color-brand-gold)" size={28} />
	<div class="min-w-0">
		<p class="text-sm leading-tight font-bold text-brand-gold">Intermediate</p>
		<p class="text-xs leading-tight text-brand-gray-light">{subtopic} · {elo}% of ticks</p>
	</div>
</div>

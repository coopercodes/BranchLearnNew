<script lang="ts">
	import BranchMark from '$lib/toast/BranchMark.svelte';

	let { subtopic, elo }: { subtopic: string; elo: number } = $props();
</script>

<div
	class="flex items-center gap-3 rounded-xl bg-brand-green-700 py-3.5 pr-6 pl-5 shadow-xl ring-2 ring-brand-green-200"
>
	<BranchMark color="var(--color-brand-green-100)" size={34} />
	<div class="min-w-0">
		<p class="text-[15px] leading-tight font-bold tracking-wide text-white">Mastery</p>
		<p class="text-xs leading-tight text-brand-green-100">
			{subtopic} · {elo}% — every tick full
		</p>
	</div>
</div>

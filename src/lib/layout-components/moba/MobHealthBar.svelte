<!-- src/lib/components/MobHealthBar.svelte -->
<script lang="ts">
	import { untrack } from 'svelte';

	let {
		hp = 100,
		maxHp = 100,
		label = '',
		showText = false,
		angled = true
	}: {
		hp?: number;
		maxHp?: number;
		label?: string;
		showText?: boolean;
		angled?: boolean;
	} = $props();

	const pct = $derived(maxHp > 0 ? Math.min(100, Math.max(0, (hp / maxHp) * 100)) : 0);
	const low = $derived(pct > 0 && pct <= 20);

	// lagging bar that catches up after a hit
	let trail = $state(pct);
	$effect(() => {
		const next = pct;
		if (next >= untrack(() => trail)) {
			trail = next;
			return;
		}
		const t = setTimeout(() => (trail = next), 350);
		return () => clearTimeout(t);
	});
</script>

<div class="flex flex-col gap-[2px] px-[3px]">
	{#if label}
		<span
			class="truncate text-[10px] font-bold uppercase leading-none tracking-wide
			       text-neutral-300 [text-shadow:0_1px_1px_#000]"
		>
			{label}
		</span>
	{/if}

	<div class="flex">
		<div
			class="relative w-full rounded-[2px] bg-neutral-950 p-[2px]
			       shadow-[0_1px_2px_rgba(0,0,0,0.7)] ring-1 ring-black
			       {angled ? '-skew-x-12' : ''}"
			class:animate-pulse={low}
		>
			<div
				class="relative h-[12px] overflow-hidden rounded-[1px]
				       bg-[#1a0505] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]"
			>
				<!-- damage trail -->
				<div
					class="absolute inset-y-0 left-0 bg-red-200/25 transition-[width] duration-500 ease-out"
					style="width: {trail}%"
				></div>

				<!-- fill -->
				<div
					class="absolute inset-y-0 left-0 bg-gradient-to-t from-red-600 via-red-700 to-red-800
					       transition-[width] duration-200 ease-out"
					style="width: {pct}%"
				>
					<div
						class="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-white/0"
					></div>
					<!-- leading edge highlight -->
					<div class="absolute inset-y-0 right-0 w-[2px] bg-red-300/70"></div>
				</div>

				<!-- angled notches -->
				<div
					class="pointer-events-none absolute inset-0 opacity-70"
					style="background-image: repeating-linear-gradient(90deg, rgba(0,0,0,0.55) 0 1px, transparent 1px 14px)"
				></div>
			</div>

			<div
				class="pointer-events-none absolute inset-0 rounded-[2px]
				       ring-1 ring-inset ring-brand-surface-red-600"
			></div>

			{#if showText}
				<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
					<span
						class="rounded-[2px] bg-black/60 px-[4px] text-[9px] font-extrabold leading-none
						       text-red-100 [text-shadow:0_1px_1px_#000] {angled ? 'skew-x-12' : ''}"
					>
						{Math.ceil(hp)}/{maxHp}
					</span>
				</div>
			{/if}
		</div>
	</div>
</div>
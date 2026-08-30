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

	{#if label}
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
					style="background-image: repeating-linear-gradient(90deg, rgba(0,0,0,0.55) 0 1px, transparent 1px 32px)"
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
						{Math.ceil(hp)}
					</span>
				</div>
			{/if}
		</div>
	</div>
	{/if}


	<div class="flex">
		<div
			class="relative w-full rounded-[2px] bg-neutral-950 p-[2px]
			       shadow-[0_1px_2px_rgba(0,0,0,0.7)] ring-1 ring-black
			       {angled ? '-skew-x-12' : ''}"
			class:animate-pulse={low}
		>
			<div
				class="relative h-[14px] overflow-hidden rounded-[1px]
				       bg-[#1a0505] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]"
			>

				<div class="flex w-full h-full gap-1">
					<!-- TODO: Sync array to HP globally with rules for filled / not-->
					{#each [0, 1, 2, 3, 4] as hpSlot}
						{#if hpSlot >= hp}
							<div class="h-full w-full bg-brand-surface-red-800"></div>
						{:else}
							<div class="h-full w-full bg-brand-crimson"></div>
						{/if}
					{/each}
				</div>
				<div class="pointer-events-none absolute skew-x-12 inset-0 flex items-center justify-center">
					<span
						class="flex items-center gap-[3px] rounded-[2px] bg-black/60 px-[5px] py-[1px]
							text-[11px] font-extrabold leading-none text-red-100
							[text-shadow:0_1px_1px_#000]"
					>
						{hp}
						<!-- <svg viewBox="0 0 24 24" class="h-[11px] w-[11px] shrink-0" aria-hidden="true">
							<defs>
								<linearGradient id="hp-fill" x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stop-color="#f87171" />
									<stop offset="55%" stop-color="#dc2626" />
									<stop offset="100%" stop-color="#dc2626" />
								</linearGradient>
							</defs>
							<path
								d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
								fill="url(#hp-fill)"
								stroke="#450a0a"
								stroke-width="1"
							/>
						</svg> -->
					</span>
				</div>
				

			

				<!-- angled notches -->
				<!-- <div
					class="pointer-events-none absolute inset-0 opacity-70"
					style="background-image: repeating-linear-gradient(90deg, rgba(0,0,0,0.55) 0 1px, transparent 1px 32px)"
				></div> -->
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
						{Math.ceil(hp)}
					</span>
				</div>
			{/if}
		</div>
	</div>
</div>
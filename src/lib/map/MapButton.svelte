<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
    import { satWorld } from './mapDB.svelte';
    import { game } from '$lib/game/index.svelte';

	type Direction = 'n' | 'e' | 's' | 'w';

	interface Props {
		// region: string;
		// zone: string;
		// area: string;
		questsDone?: number;
		questsTotal?: number;
		/** Which directions can be travelled from the current area */
		exits?: Partial<Record<Direction, boolean>>;
		onmove?: (dir: Direction) => void;
	}
    
    let currentRegion = satWorld[game.world.region];
    let currentCords = game.world.regionCords;

	let {
		questsDone = 0,
		questsTotal = 0,
		exits = { n: true, e: true, s: true, w: true },
		onmove
	}: Props = $props();

	let open = $state(false);

	// Placeholder grid until real tiles exist
	const COLS = 32;
	const ROWS = 18;
	const tiles = Array.from({ length: COLS * ROWS }, (_, i) => ({
		x: i % COLS,
		y: Math.floor(i / COLS)
	}));
	const current = { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) };

	const directions: { dir: Direction; label: string; name: string; pos: string }[] = [
		{ dir: 'n', label: 'N', name: 'North', pos: 'col-start-2 row-start-1' },
		{ dir: 'w', label: 'W', name: 'West', pos: 'col-start-1 row-start-2' },
		{ dir: 'e', label: 'E', name: 'East', pos: 'col-start-3 row-start-2' },
		{ dir: 's', label: 'S', name: 'South', pos: 'col-start-2 row-start-3' }
	];

	const arrowKeys: Record<string, Direction> = {
		ArrowUp: 'n',
		ArrowDown: 's',
		ArrowLeft: 'w',
		ArrowRight: 'e'
	};

	function move(dir: Direction) {
		if (exits[dir]) onmove?.(dir);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'Escape') {
			open = false;
			return;
		}
		const dir = arrowKeys[e.key];
		if (dir) {
			e.preventDefault();
			move(dir);
		}
	}

	// Lock page scroll while the map is open
	$effect(() => {
		if (!open) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => (document.body.style.overflow = prev);
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Trigger -->
<button
	type="button"
	onclick={() => (open = true)}
	aria-haspopup="dialog"
	aria-expanded={open}
	class="mx-auto flex cursor-pointer flex-col gap-0.5 rounded-md border border-amber-800 bg-taupe-50 px-4 py-2 text-left hover:bg-taupe-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
>
	<div class="flex items-baseline justify-between gap-4">
		<p class="text-sm font-semibold text-nowrap text-neutral-800">Temp Region Value</p>
		{#if questsTotal > 0}
			<p class="text-[10px] text-nowrap text-neutral-600">{questsDone}/{questsTotal} quests</p>
		{/if}
	</div>
	<p class="flex items-center gap-1.5 text-[10px] text-neutral-700">
		<span>Temp Zone</span>
		<span class="font-thin italic">/</span>
		<span>Temp Area</span>
	</p>
</button>

<!-- Overlay (sibling of the button, never nested inside it) -->
{#if open}
	<div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-8">
		<!-- Backdrop -->
		<button
			type="button"
			aria-label="Close map"
			tabindex="-1"
			onclick={() => (open = false)}
			class="absolute inset-0 cursor-default bg-neutral-900/25"
			transition:fade={{ duration: 150 }}
		></button>

		<!-- Panel: width is capped by viewport height so the 16:9 grid always fits -->
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="map-title"
			class="relative flex w-[min(100%,calc((70dvh-9rem)*16/9))] flex-col overflow-hidden rounded-lg border border-amber-800 bg-taupe-50 shadow-xl mb-12"
			transition:scale={{ duration: 180, start: 0.96, easing: cubicOut }}
		>
			<!-- Header -->
			<header class="flex items-center justify-between gap-4 border-b border-amber-800/30 px-5 py-3">
				<div>
					<h2 id="map-title" class="text-lg font-semibold text-neutral-800">Temp Region</h2>
					<p class="flex items-center gap-1.5 text-xs text-neutral-600">
						<span>Temp Zone</span>
						<span class="font-thin italic">/</span>
						<span>Temp Area</span>
					</p>
				</div>
				<div class="flex items-center gap-4">
					{#if questsTotal > 0}
						<p class="text-xs text-nowrap text-neutral-600">{questsDone}/{questsTotal} quests</p>
					{/if}
					<button
						type="button"
						onclick={() => (open = false)}
						class="cursor-pointer rounded-md border border-amber-800/40 px-2.5 py-1 text-xs text-neutral-700 hover:bg-taupe-200 focus-visible:outline-2 focus-visible:outline-amber-800"
					>
						Close
					</button>
				</div>
			</header>

			<!-- Map grid: fills everything under the header -->
			<section class="relative aspect-video w-full">
				<div
					class="grid h-full w-full gap-px bg-amber-800/10 p-px"
					style="grid-template-columns: repeat({COLS}, minmax(0, 1fr)); grid-template-rows: repeat({ROWS}, minmax(0, 1fr));"
				>
					{#each tiles as tile (`${tile.x},${tile.y}`)}
						{@const isCurrent = tile.x === current.x && tile.y === current.y}
						<div
							class={isCurrent ? 'bg-amber-100 outline-2 -outline-offset-2 outline-amber-800' : 'bg-taupe-50'}
							aria-current={isCurrent ? 'location' : undefined}
						>
							<!-- tile content goes here later -->
						</div>
					{/each}
				</div>

				<!-- Compass, floating over the bottom-right of the grid -->
				<!-- <div
					class="absolute right-3 bottom-3 grid w-20 grid-cols-3 grid-rows-3 gap-1 rounded-lg border border-amber-800/30 bg-taupe-50/90 p-1.5 shadow-md backdrop-blur-sm sm:w-20"
				>
					{#each directions as d (d.dir)}
						<button
							type="button"
							onclick={() => move(d.dir)}
							disabled={!exits[d.dir]}
							aria-label="Travel {d.name}"
							class="{d.pos} aspect-square cursor-pointer rounded-md border border-amber-800 bg-taupe-50 text-xs font-semibold text-neutral-800 hover:bg-taupe-300 focus-visible:outline-2 focus-visible:outline-amber-800 disabled:cursor-not-allowed disabled:border-amber-800/20 disabled:text-neutral-400 disabled:hover:bg-taupe-50"
						>
							{d.label}
						</button>
					{/each}
					<div class="col-start-2 row-start-2 flex items-center justify-center" aria-hidden="true">
						<span class="size-2 rounded-full bg-amber-800"></span>
					</div>
				</div> -->
			</section>
		</div>
	</div>
{/if}
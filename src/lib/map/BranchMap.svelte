<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
    import { satWorld } from './mapDB.svelte';
    import { game } from '$lib/game/index.svelte';
	import BranchMap from './BranchMap.svelte';

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


    // TODO: create this functionality
    let currentMapTiles = $derived(() => {
        return getMapTiles(currentRegion, currentCords);
    })

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

	function move(dir: Direction) {
		if (exits[dir]) onmove?.(dir);
	}

</script>


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
<script>
	import { GameState, game } from "$lib/game/index.svelte";
	import MOBABar from "$lib/layout-components/moba/MOBABar.svelte";
	import MasteryBadge from "$lib/masteries/MasteryBadge.svelte";
	import MasteryCard from "$lib/masteries/MasteryCard.svelte";
	import BranchMark from "$lib/toast/BranchMark.svelte";
	import ActivityView from "./ActivityView.svelte";
	import UserXPBar from "./UserXPBar.svelte";
</script>

<style>
    /* ---------- Resting state: a plain arrow ---------- */
    .shaft {
        transform-box: fill-box;
        transform-origin: 100% 50%;
        transition: transform 0.2s ease-in;
    }
    .shelf-row:hover .shaft {
        transform: scaleX(0);
    }

    .head {
        transform-box: fill-box;
        transform-origin: 0% 50%;
    }
    .shelf-row:hover .head {
        animation: nudge 0.35s 0.12s ease-out both;
    }

    /* ---------- Shelf plank slides out from the left ---------- */
    .plank {
        transform-box: fill-box;
        transform-origin: 0% 50%;
        transform: scaleX(0);
    }
    .shelf-row:hover .plank {
        animation: plank 0.25s 0.12s ease-out both;
    }

    /* ---------- Items pop up onto the shelf, staggered via --d ---------- */
    .item {
        transform-box: fill-box;
        transform-origin: 50% 100%;
        transform: scaleY(0);
    }
    .shelf-row:hover .item {
        animation: pop 0.4s var(--d) cubic-bezier(0.2, 0.9, 0.3, 1.4) both;
    }

    /* ---------- One book gets picked up, tipped to read, and slid back ---------- */
    .lift {
        transform-box: fill-box;
        transform-origin: 50% 100%;
    }
    .shelf-row:hover .lift {
        animation: pickup 2.8s 0.95s ease-in-out infinite;
    }

    @keyframes nudge {
        0%   { transform: translateX(0); }
        50%  { transform: translateX(2px); }
        100% { transform: translateX(0); }
    }

    @keyframes plank {
        from { transform: scaleX(0); }
        to   { transform: scaleX(1); }
    }

    @keyframes pop {
        from { transform: scaleY(0); }
        to   { transform: scaleY(1); }
    }

    
    @media (prefers-reduced-motion: reduce) {
        .shelf-row:hover .shaft { transform: scaleX(0); transition: none; }
        .shelf-row:hover .plank,
        .shelf-row:hover .item { animation: none; transform: none; }
        .shelf-row:hover .lift,
        .shelf-row:hover .head { animation: none; }
    }
</style>

<div class="h-full bg-brand-surface-blue-900 rounded-md border border-brand-blue/70 shadow-lg shadow-brand-blue-600/30 w-72 flex flex-col">
    <div class="flex flex-col gap-2 h-full p-4">
        <div class="flex items-center justify-between">
            <!-- TODO: EXPAND upon this idea -->
            <div class="flex items-center gap-2">
                <div class="relative w-10 h-10 bg-brand-blue flex items-center justify-center text-white from-neutral border border-neutral-400 hover:border-blue-400 cursor-pointer rounded-md">
                    <BranchMark />
                </div>

                <div class="flex flex-col text-left">
                    <p class="font-semibold text-white flex items-center gap-2">cooperwl</p>
                    <p class="text-neutral-200 text-xs cursor-pointer hover:text-blue-300">Ranger Of The Greenwoods</p>
                </div>
            </div>
        </div>

        <UserXPBar />

        

        <ActivityView />

        <div class="grow h-full"></div> 

        <div class="flex items-center justify-between">
            <p class="text-xs font-semibold text-white">Skills</p>
            <div class="h-[1px] w-full bg-brand-surface-blue-600 mx-4"></div>
            <p class="text-xs text-[10px] hover:text-white text-neutral-200 text-nowrap cursor-pointer">Open skills</p>
        </div>

        <div class="flex gap-4">
            <div class="flex flex-col gap-1 w-full bg-sky-950/20 p-2 rounded-sm border-sky-700 border cursor-pointer hover:border-sky-400 hover:bg-sky-900/60">
                <div class="flex items-center">
                    <p class="text-white text-xs font-thin text-[10px]">Recent</p>
                </div>

                <div class="flex items-center gap-2">
                    <p class="text-sm font-semibold text-white">Right Triangles</p>
                    <MasteryBadge size="tiny" shadow={true} level={4} />
                </div>

                <div class="text-xs text-[10px] text-neutral-50">The ability to find missing side lengths and angles within right triangles.</div>

                <div class="h-full grow"></div>
            </div>

            <div class="flex flex-col justify-evenly gap-2 bg-surface-blue-600 p-2 rounded-sm border-sky-900 border cursor-pointer hover:border-sky-400 hover:bg-sky-950">
                <div class="flex items-center gap-2">
                    <!-- TODO: make this the emerald one -->
                    <MasteryBadge size="tiny" mastery="expert" shadow={true} showLevel={false} />
                    <p class="text-xs text-white w-max flex items-center gap-1 font-extrabold">0</p>
                </div>

                <div class="flex items-center gap-2">
                    <MasteryBadge size="tiny" mastery="adept" shadow={true} showLevel={false} />
                    <p class="text-xs text-white w-max flex items-center gap-1 font-extrabold">0</p>
                </div>

                <div class="flex items-center gap-2 w-full">
                    <MasteryBadge size="tiny" mastery="apprentice" shadow={true} showLevel={false} />
                    <p class="text-xs text-white w-max flex items-center gap-1 font-extrabold">2</p>
                </div>
            </div>
        </div>

        <div class="h-[1px] w-full bg-brand-surface-blue-600 my-2"></div>

        <button onclick={() => game.renderer.state = "bookshelf"} class="shelf-row group flex items-center justify-between gap-2 px-2 py-2 rounded-sm cursor-pointer bg-none transition-colors duration-200 hover:bg-brand-surface-blue-600">
            <div class="flex flex-col items-start justify-center w-full text-white font-semibold">
                <p class="text-xs">My Bookshelf</p>
                <p class="text-[10px] font-thin">5 items on display</p>
            </div>

            <svg
                class="h-4 w-[52px] shrink-0 overflow-visible text-zinc-400 transition-colors duration-200 group-hover:text-white"
                viewBox="0 0 42 16"
                aria-hidden="true"
            >
                <!-- Arrow shaft (resting state), retracts into the head on hover -->
                <line
                    class="shaft"
                    x1="24" y1="8" x2="37.5" y2="8"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                />

                <!-- Shelf plank -->
                <rect class="plank" x="1" y="14" width="28.8" height="1.4" rx="0.5" fill="currentColor" />

                <!-- Upright books -->
                <rect class="item" x="2" y="5" width="2.4" height="9" rx="0.4" fill="currentColor" style="--d: 0.18s" />

                <!-- The book that gets picked up and put back -->
                <g class="lift">
                    <rect class="item" x="5" y="3.5" width="2.2" height="10.5" rx="0.4" fill="currentColor" style="--d: 0.24s" />
                </g>

                <rect class="item" x="7.8" y="6" width="2.4" height="8" rx="0.4" fill="currentColor" style="--d: 0.30s" />

                <!-- Two books lying flat, stacked -->
                <g class="item" style="--d: 0.36s">
                    <rect x="11" y="12.4" width="6" height="1.6" rx="0.3" fill="currentColor" />
                    <rect x="11.6" y="10.6" width="5" height="1.5" rx="0.3" fill="currentColor" />
                </g>

                <!-- Crest plaque -->
                <path
                    class="item"
                    d="M18.5 5h4.5v4.5c0 2.1-1.1 3.6-2.25 4.5-1.15-.9-2.25-2.4-2.25-4.5z"
                    fill="currentColor"
                    style="--d: 0.42s"
                />

                <!-- Orb on a stand -->
                <g class="item" style="--d: 0.48s">
                    <circle cx="26.4" cy="9.6" r="2.1" fill="currentColor" />
                    <path d="M24.9 14l.5-1.9h2l.5 1.9z" fill="currentColor" />
                </g>

                <!-- Arrowhead, with a clear gap after the shelf -->
                <path
                    class="head"
                    d="M33.5 3l5 5-5 5"
                    fill="none" stroke="currentColor" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round"
                />
            </svg>
        </button>
    </div>
</div>
<script>
    let { level = 3, xp = 2500, xpMax = 3200 } = $props();

    const pct = $derived(Math.min(100, Math.max(0, (xp / xpMax) * 100)));
    const fmt = (n) => n.toLocaleString();
</script>

<div class="flex flex-col gap-1.5 mt-1">

    <!-- Track -->
    <div
        class="relative h-4 overflow-hidden rounded-sm border border-neutral-600
               bg-linear-to-b from-neutral-900 via-neutral-800/40 to-neutral-900
               shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]"
    >
    <div
    class="pointer-events-none absolute inset-0
           bg-linear-to-r from-transparent via-black/50 to-transparent"
></div>
        <!-- Gold fill -->
        <div
            class="absolute inset-y-0 left-0 saturate-[.85]
                   bg-linear-to-b from-sky-600 via-sky-700 to-sky-800
                   transition-[width] duration-500 ease-out"
            style="width: {pct}%"
        >
            <!-- Metallic sheen on the top half -->
            <div class="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-blue-300/15 to-transparent"></div>
            <!-- Bright leading edge -->
            <div class="absolute inset-y-0 right-0 w-px bg-amber-100/70"></div>
        </div>

        <!-- Segment ticks -->
        <div class="pointer-events-none absolute inset-0 flex justify-evenly">
            {#each Array(4) as _}
                <div class="h-full w-px bg-black/35"></div>
            {/each}
        </div>

        <!-- Glass label -->
        <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
                class="rounded-full border border-white/15 bg-black/40 px-2 py-0.5
                    text-[10px] leading-none text-white tabular-nums
                    backdrop-blur-[4px] backdrop-saturate-150
                    [text-shadow:0_1px_1px_rgb(0_0_0/0.6)]"
            >
                <span class="font-semibold">Level {level}</span>
                <span class="font-light"> · {fmt(xp)} / {fmt(xpMax)} XP</span>
            </span>
        </div>
    </div>
</div>
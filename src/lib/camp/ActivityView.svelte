<script>
    // Replace with real data. `at` is a timestamp.
    const now = Date.now();
    const H = 3600_000, D = 24 * H;

    const activity = [
        { type: 'Quest',     name: 'Training Grounds',          at: now - 2 * 60_000 },
        { type: 'Area',      name: 'The Caves Of Triangulus',   at: now - 1 * H },
        { type: 'Encounter', name: 'Overly Confident Triangle', at: now - 2.5 * H },
        { type: 'Skill',     name: 'Right Triangles IV',        at: now - 1.2 * D },
        { type: 'Quest',     name: 'Angle Hunter',              at: now - 3 * D },
        { type: 'Encounter', name: 'Rogue Hypotenuse',          at: now - 5 * D },
    ];

    const ago = (t) => {
        const m = Math.floor((now - t) / 60_000);
        if (m < 60) return `${m}m`;
        if (m < 1440) return `${Math.floor(m / 60)}h`;
        return `${Math.floor(m / 1440)}d`;
    };

    // Last 7 days, oldest → today
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const week = Array.from({ length: 7 }, (_, i) => {
        const start = startOfToday - (6 - i) * D;
        return {
            label: new Date(start).toLocaleDateString(undefined, { weekday: 'narrow' }),
            count: activity.filter((a) => a.at >= start && a.at < start + D).length,
            today: i === 6,
        };
    });

    const shade = (n) =>
        n === 0 ? 'bg-neutral-800' : n === 1 ? 'bg-blue-900' : n === 2 ? 'bg-blue-700' : 'bg-blue-500';

    // Past week, newest first, max 4
    const recent = activity
        .filter((a) => a.at >= startOfToday - 6 * D)
        .sort((a, b) => b.at - a.at)
        .slice(0, 3);

    const areaColors = ['#38bdf8', '#34d399', '#fbbf24', '#a78bfa', '#38bdf8', '#f87171', '#34d399', '#fbbf24', '#38bdf8'];
</script>

<div class="flex flex-col mt-1">
    <div class="flex items-center justify-between mb-1.5">
        <p class="text-[10px] text-neutral-300">Recent</p>
        <button
            type="button"
            class="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors"
        >
            Expand
            <svg
                viewBox="0 0 16 16"
                class="size-2.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
            >
                <path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9" />
            </svg>
        </button>
    </div>

    <!-- Week strip -->
    <!-- <div class="grid grid-cols-7 gap-1 mb-2">
        {#each week as day}
            <div class="flex flex-col items-center gap-0.5" title="{day.count} activities">
                <div class="h-2 w-full rounded-sm {shade(day.count)} {day.today ? 'ring-1 ring-neutral-400' : ''}"></div>
                <span class="text-[8px] {day.today ? 'text-neutral-200' : 'text-neutral-500'}">{day.label}</span>
            </div>
        {/each}
    </div> -->

    <!-- Compact list -->
    <ul class="flex flex-col gap-1">
        {#each recent as item}
            <li class="flex items-center gap-1.5 text-[10px] leading-4 min-w-0">
                <svg viewBox="0 0 16 16" class="size-3 shrink-0" role="img" aria-label={item.type}>
                    <title>{item.type}</title>

                    {#if item.type === 'Quest'}
                        <!-- Right triangle rotated 45° -->
                        <polygon
                            points="3,12 12,12 3,3"
                            transform="rotate(45 8 8)"
                            class="fill-emerald-400 stroke-emerald-200"
                            stroke-width="0.75"
                            stroke-linejoin="round"
                        />

                    {:else if item.type === 'Area'}
                        <!-- 3x3 node grid -->
                        {#each areaColors as color, i}
                            <rect
                                x={1.5 + (i % 3) * 4.5}
                                y={1.5 + Math.floor(i / 3) * 4.5}
                                width="4"
                                height="4"
                                rx="0.75"
                                fill={color}
                            />
                        {/each}

                    {:else if item.type === 'Encounter'}
                        <!-- Red circle, white skull -->
                        <circle cx="8" cy="8" r="8" class="fill-red-600" />
                        <circle cx="8" cy="7" r="4" fill="white" />
                        <rect x="6" y="9.5" width="4" height="3" rx="0.6" fill="white" />
                        <circle cx="6.5" cy="7" r="1.1" class="fill-red-600" />
                        <circle cx="9.5" cy="7" r="1.1" class="fill-red-600" />
                        <path d="M7.3 10.3v2.2M8.7 10.3v2.2" class="stroke-red-600" stroke-width="0.6" />

                    {:else}
                        <!-- Fallback for other types (e.g. Skill) -->
                        <circle cx="8" cy="8" r="3" class="fill-amber-400" />
                    {/if}
                </svg>

                <span class="truncate italic text-neutral-300">{item.name}</span>
                <span class="ml-auto shrink-0 pl-2 font-light text-neutral-500">{ago(item.at)}</span>
            </li>
        {:else}
            <li class="text-[10px] italic text-neutral-500">No activity this week</li>
        {/each}
    </ul>
</div>
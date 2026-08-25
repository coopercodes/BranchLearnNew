<script lang="ts">
	let { hp = 5, maxHp = 5 } = $props();

	const low = $derived(hp <= 1);
</script>

<div class="mt-2 mx-2">
	<div
		class="relative rounded-[3px] bg-neutral-950 p-[2px]
		       shadow-[0_1px_2px_rgba(0,0,0,0.7)] ring-1 ring-black"
		class:animate-pulse={low}
	>
		<div
			class="relative flex h-[16px] gap-[2px] overflow-hidden rounded-[2px]
			       bg-[#1a0505] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]"
		>
			{#each { length: maxHp } as _, i (i)}
				<div class="relative flex-1 overflow-hidden">
					<div
						class="absolute inset-0 transition-opacity duration-200 ease-out
						       bg-gradient-to-t from-red-600 via-red-700 to-red-800"
						class:opacity-0={i >= hp}
					>
						<div
							class="absolute inset-x-0 top-0 h-1/2
							       bg-gradient-to-b from-white/40 to-white/0"
						></div>
					</div>
				</div>
			{/each}
		</div>

		<div
			class="pointer-events-none absolute inset-0 rounded-[3px]
			       ring-1 ring-inset ring-brand-surface-red-600"
		></div>

		<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span
                class="flex items-center gap-[3px] rounded-[2px] bg-black/60 px-[5px] py-[1px]
                    text-[11px] font-extrabold leading-none text-red-100
                    [text-shadow:0_1px_1px_#000]"
            >
                {hp}
                <svg viewBox="0 0 24 24" class="h-[11px] w-[11px] shrink-0" aria-hidden="true">
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
                </svg>
            </span>
        </div>
	</div>
</div>
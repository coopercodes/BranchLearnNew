<script>
	import { questDB } from '$lib/game/database/questsDB.svelte';
	import { game } from '$lib/game/index.svelte';
	import { tick, untrack } from 'svelte';

    // game
    

	/* ------------------------------------------------------------------ *
	 * Quest data
	 * ------------------------------------------------------------------ */

	const DEFAULT_QUESTS = [
		{
			id: 'training-triangulon',
			type: 'encounter',
			title: 'Training For Triangulon',
			description:
				'An introduction to the combat system behind Branch. Including abilities, enemy types, and more. By the end you will be a Branch combat master!',
			objectives: [
				{ label: 'Defeat the training dummy.', current: 0, total: 1 },
				{ label: 'Use a health potion.', current: 0, total: 1 }
			],
			rewards: [
				{ name: 'Health Potion', count: 3, tone: 'blue' },
				{ name: 'Sword of Rage', count: 1, tone: 'red' }
			]
		},
		{
			id: 'emberroot',
			type: 'common',
			title: 'Emberroot For The Alchemist',
			description:
				'Maren burned through her last batch stabilising a rift. She needs emberroot from the ridge before the vents cool.',
			objectives: [
				{ label: 'Speak to Maren in Lowmarket.', current: 1, total: 1 },
				{ label: 'Harvest emberroot on the ridge.', current: 2, total: 5 },
				{ label: 'Survive the vent collapse.', current: 0, total: 1 },
				{ label: 'Return the batch to Maren.', current: 0, total: 1 }
			],
			rewards: [{ name: 'Ember Draught', count: 2, tone: 'amber' }]
		}
	];

	/* Full class strings so Tailwind's scanner can see them. */
	const TYPE_STYLES = {
		encounter: {
			label: 'Encounter',
			marker: 'bg-rose-400/80 border-rose-400',
			text: 'text-rose-400',
			shell: 'border-rose-400/60',
			done: 'bg-rose-400 border-rose-400',
			doneText: 'text-rose-400',
			cta: 'bg-rose-500 border-rose-300 text-black'
		},
		common: {
			label: 'Quest',
			marker: 'bg-amber-400/80 border-amber-400',
			text: 'text-amber-400',
			shell: 'border-brand-gold/70',
			done: 'bg-brand-gold border-brand-gold',
			doneText: 'text-brand-gold',
			cta: 'bg-brand-gold border-amber-300 text-black'
		}
	};

	const TONE_STYLES = {
		blue: 'border-blue-500/70 bg-blue-500/10',
		red: 'border-red-500/70 bg-red-500/10',
		amber: 'border-amber-500/70 bg-amber-500/30',
		emerald: 'border-emerald-500/70 bg-emerald-500/30',
		violet: 'border-violet-500/70 bg-violet-500/30'
	};

    const MASTERY_RANKS = {
        stone:   { label: 'Stone',   marker: 'border-neutral-400 bg-neutral-500/60', text: 'text-neutral-300' },
        bronze:  { label: 'Bronze',  marker: 'border-amber-600 bg-amber-700/60',     text: 'text-amber-400'   },
        silver:  { label: 'Silver',  marker: 'border-slate-200 bg-slate-300/60',     text: 'text-slate-200'   },
        gold:    { label: 'Gold',    marker: 'border-yellow-300 bg-yellow-400/60',   text: 'text-yellow-200'  },
        emerald: { label: 'Emerald', marker: 'border-emerald-300 bg-emerald-400/60', text: 'text-emerald-200' },
        diamond: { label: 'Diamond', marker: 'border-cyan-200 bg-cyan-300/60',       text: 'text-cyan-100'    }
    };

    // hardcoded for now — swap for activeQuest.masteries later
    const masteries = [
        { label: 'SAT Right Triangles', rank: 'emerald', current: 5, total: 5 },
        { label: 'Pythagorean Theorem', rank: 'gold',    current: 3, total: 5 }
    ];

	/* ------------------------------------------------------------------ *
	 * Props
	 * ------------------------------------------------------------------ */

	let {
		quests = DEFAULT_QUESTS,
		/** Cycles empty → encounter → common → empty forever. Testing only. */
		rotateMode = false,
		/** How long a quest sits fully visible before the next transition. */
		dwell = 2600,
		/** How long the empty state sits before expanding again. */
		emptyDwell = 900,
		onstart = () => {},
		ondismiss = () => {}
	} = $props();

	/* ------------------------------------------------------------------ *
	 * Timings
	 * ------------------------------------------------------------------ */

	const reduced =
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const t = (ms) => (reduced ? 0 : ms);

	// const FADE_OUT = t(180); // old text leaves
	// const FADE_IN = t(260); // new text arrives
	// const EXPAND = t(560); // 0 → content height (the slow one)
	// const RESIZE = t(340); // quest → quest height change
	// const COLLAPSE = t(400); // content height → 0

    const FADE_OUT = t(180 / 2); // old text leaves
	const FADE_IN = t(260 / 2); // new text arrives
	const EXPAND = t(560 / 1.3); // 0 → content height (the slow one)
	const RESIZE = t(340 / 2); // quest → quest height change
	const COLLAPSE = t(400 / 2); // content height → 0

	/* ------------------------------------------------------------------ *
	 * State
	 * ------------------------------------------------------------------ */

	let activeQuest = $state(null); // null === empty state
	let contentHeight = $state(0); // measured height of the rendered content
	let shellHeight = $state(0); // animated height of the surface
	let contentVisible = $state(false); // drives the text fade
	let resizeMs = $state(EXPAND); // current height-transition duration

	let animating = false;
	let chain = Promise.resolve();

	const accent = $derived(TYPE_STYLES[activeQuest?.type] ?? TYPE_STYLES.common);

	/* Keep the shell honest if content reflows while it's open (resize, i18n). */
	$effect(() => {
		if (contentVisible && contentHeight > 0 && !animating) {
			shellHeight = contentHeight;
		}
	});

	/* ------------------------------------------------------------------ *
	 * Transition sequence
	 * ------------------------------------------------------------------ */

	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
	const nextFrame = () =>
		new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

	/** Queue transitions so overlapping calls can't interleave. */
	function enqueue(fn) {
		chain = chain.then(fn).catch(() => {});
		return chain;
	}

	async function runTransition(next) {
		if (next?.id === activeQuest?.id) return;
		animating = true;

		// 1. fade the current details out, height untouched
		if (activeQuest) {
			contentVisible = false;
			await sleep(FADE_OUT);
		}

		if (!next) {
			// 2a. collapse the surface back to zero
			resizeMs = COLLAPSE;
			shellHeight = 0;
			await sleep(COLLAPSE);
			activeQuest = null;
		} else {
			const expandingFromEmpty = shellHeight === 0;

			// 2b. swap the content while it's invisible so we can measure it
			activeQuest = next;
			contentVisible = false;
			await tick();
			await nextFrame();

			// 3. move the surface to the new layout's height
			resizeMs = expandingFromEmpty ? EXPAND : RESIZE;
			shellHeight = contentHeight;
			await sleep(resizeMs);

			// 4. fade the new details in, now that the box is the right size
			contentVisible = true;
			await sleep(FADE_IN);
		}

		animating = false;
	}

	/* ------------------------------------------------------------------ *
	 * Public API — bind:this={card} then card.show(quest) / card.hide()
	 * ------------------------------------------------------------------ */

	export function show(quest) {
		return enqueue(() => runTransition(quest));
	}

	export function hide() {
		return enqueue(() => runTransition(null));
	}

	/* ------------------------------------------------------------------ *
	 * Rotation (testing)
	 * ------------------------------------------------------------------ */

	$effect(() => {
		if (!rotateMode) return;

		const cycle = [...quests, null]; // encounter → common → empty
		let cancelled = false;
		let step = 0;

		(async () => {
			while (!cancelled) {
				const target = cycle[step % cycle.length];
				await show(target);
				if (cancelled) return;
				await sleep(target ? dwell : emptyDwell);
				step++;
			}
		})();

		return () => {
			cancelled = true;
		};
	});

	function handleStart() {
		onstart(activeQuest);
	}

	function handleDismiss() {
		ondismiss(activeQuest);
		hide();
	}

    function questById(id) {
        if (!id) return null;
        const data = questDB[id];
        if (!data) return null;
        return data.id === id ? data : { ...data, id };
    }

    /* Watch the selected quest and drive the card. */
    $effect(() => {
        const id = game.quests.selectedQuestID;
        const quest = untrack(() => questById(id));

        if (!id) {
            hide();
            return;
        }

        // id is set but the entry isn't in the DB yet — leave the card alone
        // rather than collapsing it.
        if (quest) show(quest);
    });
</script>

<div class="absolute bottom-32 max-w-[450px] p-2">
	<!-- Surface: owns the height animation, never scrolls -->
	<div
		class="bg-brand-surface-blue-800 bg-linear-to-br overflow-hidden rounded-sm border {accent.shell}"
		style="height: {shellHeight}px;
		       opacity: {shellHeight > 0 ? 1 : 0};
		       transition: height {resizeMs}ms cubic-bezier(0.22, 0.61, 0.36, 1),
		                   opacity {Math.min(resizeMs, 160)}ms ease-out;"
		aria-hidden={!activeQuest}
	>
		<!-- Content: measured, and fades independently of the surface -->
		<div
			bind:clientHeight={contentHeight}
			class="flex flex-col gap-1 px-4 py-4"
			style="opacity: {contentVisible ? 1 : 0};
			       transform: translateY({contentVisible ? 0 : 4}px);
			       transition: opacity {contentVisible ? FADE_IN : FADE_OUT}ms ease-out,
			                   transform {contentVisible ? FADE_IN : FADE_OUT}ms ease-out;"
		>
			{#if activeQuest}
				<div class="flex justify-between">
                <div class="mr-auto flex items-center justify-start gap-2">
					<div class="h-2 w-2 rotate-45 border {accent.marker}"></div>
					<p class="text-xs {accent.text}">{accent.label}</p>
				</div>
                <!-- border border-neutral-400 bg-neutral-500  -->
                    <button
						type="button"
						onclick={handleDismiss}
						class="flex items-center justify-center text-nowrap rounded-sm text-xs cursor-pointer bg-neutral-500 ring ring-neutral-400 px-2 transition duration-150 font-semibold text-neutral-100"
					>
						X
					</button>
                </div>

				<div class="w-full font-semibold text-neutral-100">{activeQuest.title}</div>
				<p class="text-xs text-neutral-100">{activeQuest.description}</p>

				<div class="mt-4 flex w-full flex-col justify-start">
					<div class="text-left text-[10px] font-extrabold uppercase text-neutral-200">
						Objectives
					</div>

					<div class="mt-2 flex flex-col gap-2">
						{#each activeQuest.objectives as objective (objective.label)}
							{@const done = objective.current >= objective.total}
							<div class="flex items-center gap-3">
								<div
									class="h-2.5 w-2.5 shrink-0 rotate-45 border {done
										? accent.done
										: 'border-neutral-400'}"
								></div>
								<div class="flex w-full items-baseline justify-between">
									<span
										class="text-sm {done ? 'text-neutral-500 line-through' : 'text-neutral-100'}"
									>
										{objective.label}
									</span>
									<span
										class="font-stretch-semi-expanded text-xs tabular-nums {done
											? accent.doneText
											: 'text-neutral-400'}"
									>
										{objective.current}/{objective.total}
									</span>
								</div>
							</div>
						{/each}
					</div>
				</div>

                <div class="mt-6 flex w-full items-stretch gap-3">
	<!-- Rewards -->
	<section
		class="flex flex-1 flex-col rounded-sm p-0"
	>
		<div class="flex items-center gap-2">
            <div class="text-[10px] font-extrabold uppercase tracking-wide text-neutral-200">
                Loot
            </div>
            <div class="grow h-[1px] bg-neutral-500 mr-4">

            </div>
        </div>

		<div class="mt-2 flex flex-col gap-2">
			{#each activeQuest.rewards as reward (reward.name)}
				<div class="flex items-center gap-2">
					<div
						class="h-6 w-6 shrink-0 rounded-sm border {TONE_STYLES[reward.tone] ??
							TONE_STYLES.blue}"
					></div>
					<div class="flex min-w-0 flex-col text-[10px] font-extrabold text-blue-50">
						<p class="truncate">{reward.name}</p>
						<p class="font-light text-neutral-300">{reward.count} total</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Masteries -->
	<section
		class="flex flex-1 flex-col rounded-sm p-0"
	>
		<div class="flex items-center gap-2">
            <div class="text-[10px] font-extrabold uppercase tracking-wide text-neutral-200">
                Masteries
            </div>
            <div class="grow h-[1px] bg-neutral-500 mr-4">

            </div>
        </div>

		<div class="mt-2 flex flex-col gap-2">
			{#each masteries as mastery (mastery.label)}
				{@const rank = MASTERY_RANKS[mastery.rank] ?? MASTERY_RANKS.stone}
				<div class="flex items-center gap-2">
					<div class="h-2.5 w-2.5 shrink-0 rotate-45 border {rank.marker}"></div>
					<div class="flex min-w-0 flex-col text-[10px] font-extrabold text-blue-50">
						<p class="truncate">{mastery.label}</p>
						<p class="font-light {rank.text}">
							{rank.label} <span class="tabular-nums">{mastery.current}/{mastery.total}</span>
						</p>
					</div>
				</div>
			{/each}
		</div>
	</section>
</div>
				

				<div class="mt-8 flex w-full mx-auto items-end justify-between gap-28">
					<!-- border border-neutral-400 bg-neutral-500  -->
                    <button
						type="button"
						onclick={handleDismiss}
						class="flex items-center justify-center text-nowrap rounded-sm text-xs cursor-pointer bg-neutral-500 ring ring-neutral-400 px-2 py-1 transition duration-150 font-semibold text-neutral-100"
					>
						Dismiss
					</button>

					<button
						type="button"
						onclick={handleStart}
						class="text-nowrap cursor-pointer rounded-sm border px-4 py-2 text-black font-semibold bg-brand-gold"
					>
						Start Quest
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>
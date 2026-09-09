<script>
	import { tick } from 'svelte';

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
		blue: 'border-blue-500/90 bg-blue-500/30',
		red: 'border-red-500/90 bg-red-500/30',
		amber: 'border-amber-500/90 bg-amber-500/30',
		emerald: 'border-emerald-500/90 bg-emerald-500/30',
		violet: 'border-violet-500/90 bg-violet-500/30'
	};

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

	const FADE_OUT = t(180); // old text leaves
	const FADE_IN = t(260); // new text arrives
	const EXPAND = t(560); // 0 → content height (the slow one)
	const RESIZE = t(340); // quest → quest height change
	const COLLAPSE = t(400); // content height → 0

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
</script>

<div class="absolute bottom-32 max-w-[450px] p-2">
	<!-- Surface: owns the height animation, never scrolls -->
	<div
		class="bg-brand-surface-blue-700 bg-linear-to-br overflow-hidden rounded-sm border {accent.shell}"
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
				<div class="mr-auto flex items-center justify-start gap-2">
					<div class="h-2 w-2 rotate-45 border {accent.marker}"></div>
					<p class="text-xs {accent.text}">{accent.label}</p>
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

				<div class="mt-4 flex w-full flex-col justify-start">
					<div class="text-left text-[10px] font-extrabold uppercase text-neutral-200">
						Rewards
					</div>
					<div class="mt-2 flex w-full gap-4">
						{#each activeQuest.rewards as reward (reward.name)}
							<div
								class="flex w-1/3 items-center rounded-sm border border-neutral-400/30 bg-neutral-500/30 p-2 py-1"
							>
								<div class="flex items-center gap-2">
									<div
										class="h-6 w-6 rounded-sm border {TONE_STYLES[reward.tone] ??
											TONE_STYLES.blue}"
									></div>
									<div class="flex flex-col text-[10px] font-extrabold text-blue-50">
										<p>{reward.name}</p>
										<p class="font-light">{reward.count} total</p>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="mt-8 flex w-full items-end justify-between gap-28">
					<button
						type="button"
						onclick={handleDismiss}
						class="flex items-center justify-center text-nowrap rounded-sm border border-neutral-400 bg-neutral-500 px-2 py-1 text-xs font-semibold text-neutral-100"
					>
						Dismiss
					</button>

					<button
						type="button"
						onclick={handleStart}
						class="flex items-center justify-center text-nowrap rounded-sm border px-4 py-1 text-sm font-semibold {accent.cta}"
					>
						Start Quest
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>
<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Desktop from '$lib/layout-components/Desktop.svelte';
	import EloTopicMap from '$lib/content-graph/EloTopicMap.svelte';
	import { GameStore } from '$lib/context/stores';
	import GraphPanelRenderer from '$lib/content-graph/panels/GraphPanelRenderer.svelte';
	import GraphDonePanel from '$lib/content-graph/panels/GraphDonePanel.svelte';
	import GraphDevTools from '$lib/content-graph/GraphDevTools.svelte';
	import { ContentGameState, game, type Rank } from '$lib/content-graph/gameState.svelte';
	import { ContentGraph } from '$lib/content-graph/graph-content';
	import {
		contentFor,
		describePanelForLeaf,
		type PanelContent
	} from '$lib/content-graph/panel-content';
	import type { PanelNode } from '$lib/content-graph/types';
	import { osBar } from '$lib/os/osBarProgress.svelte';
	import { leafPanelContext } from '$lib/leaf/panelContext.svelte';
	import { toasts, type ToastComponent } from '$lib/toast/toast.svelte';
	import TimerIsland from '$lib/components/TimerIsland.svelte';
	import MOBABar from '$lib/layout-components/moba/MOBABar.svelte';
	import { BranchContext } from '$lib/context/BranchContext.svelte';
	// ╔══════════════════════════════════════════════════════════════════════╗
	// ║  THE GRAPH IS THE ALGORITHM                                            ║
	// ║                                                                        ║
	// ║  This page holds no recommendation logic. ContentGameState walks the   ║
	// ║  content graph: subtopics circle their training loops until every      ║
	// ║  panel's correct-answer quota is full (100 ELO), then the spine hands  ║
	// ║  the walker to the next subtopic. The page just:                       ║
	// ║    1. walks forward until the graph serves a pending panel,            ║
	// ║    2. renders that panel's content (panel-content.ts, by panelID),     ║
	// ║    3. reports the learner's real answer via game.submitAnswer().       ║
	// ╚══════════════════════════════════════════════════════════════════════╝

	const byId = new Map(ContentGraph.map((n) => [n.id, n]));

	/** The visit being rendered: the pending panel plus its frozen visit number. */
	interface ActiveVisit {
		panel: PanelNode;
		/** Attempts already spent when the visit began — picks the bank item. */
		visit: number;
		content: PanelContent | null;
	}

	let active = $state<ActiveVisit | null>(null);
	/** The submitted outcome, held until Continue so feedback stays on screen. */
	let resolved = $state<'correct' | 'incorrect' | null>(null);
	/** Bumped per advance — remounts the panel so per-visit state resets. */
	let seq = $state(0);

	let courseDone = $derived(active === null && !game.canAdvance);

	// ── Walking ─────────────────────────────────────────────────────────────

	/** Freeze the pending panel into this visit's render state. */
	function enterPending(panel: PanelNode) {
		active = { panel, visit: game.attemptsFor(panel.id), content: contentFor(panel.panelID) };
		seq += 1;
	}

	function advanceToNextPanel() {
		resolved = null;
		for (let hops = 0; hops < 16 && !game.pendingPanel && game.canAdvance; hops++) {
			game.moveNext();
		}
		const pending = game.pendingPanel;
		if (pending) enterPending(pending);
		else {
			active = null;
			seq += 1;
		}
	}

	// Resume a saved game mid-panel, otherwise start walking. SSR is off
	// (+page.ts), so this runs once on the client.
	if (game.pendingPanel) enterPending(game.pendingPanel);
	else advanceToNextPanel();

	// ── Event catching ──────────────────────────────────────────────────────

	/** A panel reported the learner's real answer. */
	function handleResult(correct: boolean) {
		if (!active || resolved !== null) return;
		game.submitAnswer(correct);
		resolved = correct ? 'correct' : 'incorrect';
	}

	function handleContinue() {
		advanceToNextPanel();
	}

	function restart() {
		game.reset();
		toasts.clear();
		advanceToNextPanel();
	}

	// The OS bar's "Continue" pill is the universal advance control: it unlocks
	// once the visit is resolved — either way — because a miss also moves the
	// walker on (the loop brings the panel back around later).
	$effect(() => {
		if (courseDone) {
			osBar.total = 0;
			osBar.answered = 0;
			osBar.onContinue = null;
		} else {
			osBar.total = 1;
			osBar.answered = resolved !== null ? 1 : 0;
			osBar.onContinue = resolved !== null ? handleContinue : null;
		}
	});
	onDestroy(() => osBar.reset());

	// Keep Leaf (the tutor) aware of what the learner is looking at.
	$effect(() => {
		if (active?.content) {
			leafPanelContext.set(describePanelForLeaf(active.content, active.visit));
		} else if (courseDone) {
			leafPanelContext.set(
				'The learner has mastered every subtopic of the SOH CAH TOA course — celebrate with them.'
			);
		} else {
			leafPanelContext.clear();
		}
	});
	onDestroy(() => leafPanelContext.clear());
	// Port this to a store file of some sort later

	let gameState = {
		renderer: "camp"
	}
</script>

<style>
	.camp-stage {
		perspective: 800px;
		height: 240px;
	}

	.camp-base {
		width: 500px;
		height: 300px;
		transform-style: preserve-3d;
		transform: rotateX(65deg);

	}

	.camp-shadow {
		width: 500px;
		height: 300px;
		z-index: 10;
		transform: translateZ(-10px);
	}


</style>

<Desktop>
	{#if gameState.renderer == "camp" }
		<div class="w-screen h-screen flex items-center justify-center  mt-12">
			<div class="flex flex-col justify-center items-center my-auto mx-auto w-full h-full">
				<div class="relative bottom-6 flex flex-col text-center gap-1">
					<p class="text-xs font-bold text-neutral-500">Map</p>
					<p class="italic text-neutral-800">Pythagorean Marshes</p>
				</div>
				<!--  TODO: ADD CONDITIONAL DEV BORDERS FOR SPACING border border-8 border-red-300/20  -->
				<div class="flex gap-12 h-[350px] items-center ">
					<div class="h-full  w-64 rounded-sm">
						<!-- TODO DISPLAY USER STATS-->
						<div class="flex flex-col gap-1 h-ful p-2">
							<p class="text-xs text-neutral-500">Afternoon adventurer.</p>
							<div class="flex justify-between">
								<!-- TODO: EXPAND upon this idea -->
								<div class="flex items-center gap-2">
									<div class="w-4 h-4 bg-neutral-500 border border-neutral-700 rounded-full"></div>
									<p class="font-bold text-xl">@bruh123</p>
								</div>
								<div class="flex flex-col text-right text-xs text-[10px]">
									<p class="font-semibold">lvl 32</p>
									<p>312 encounters</p>
								</div>
							</div>
							<!-- ok this kinda shit lmao ill look into it -->
						</div>
					</div>
					<div class="camp-stage relative">
						<!-- <div class="relative left-1/2 items-center">
							<div class="h-4 w-4 absolute top-2 bg-linear-to-b to-orange-950 from-orange-600 border border-amber-600 border rounded-full"></div>
							<div class="h-3 w-3 absolute top-12 left-3 bg-orange-800 rounded-full"></div>
						</div> -->
						<div class="camp-base flex items-center relative z-30 rounded-[80px] bg-linear-to-b from-green-950 to-green-950">
							<!-- <div class="relative h-4 w-4 bg-red-300 top-12 left-12"></div> -->
							<div class="camp-shadow absolute z-10 rounded-[40px] bg-green-900/30 mx-auto blur-xl"></div>
						</div>
						<div class="flex items-center justify-center">

						</div>
						
					</div>
					<div class="h-full bg-blue-300/30 w-64">
						<!-- 
							DISPLAY UTILITY
							
							AUCTION
							PVP AVAILABILITY
							BLOG
							
						-->
					</div>
				</div>
				<div  class="bg-brand-surface-blue-700 w-[240px] relative -top-6 hover:bg-brand-surface-blue-700 bg-linear-to-br cursor-pointer flex gap-1 flex-col rounded-sm p-2 border  border-brand-gold/70 m-2">
					<div class="flex items-center gap-2 justify-between">
						<div class="w-1.5 h-1.5 bg-amber-400/80 border border-amber-400 rotate-45"></div>
						<p class="text-[9px] text-xs text-amber-400">Recommended Quest</p>
						<div class="w-1.5 h-1.5 bg-amber-400/80 border border-amber-400 rotate-45"></div> 

					</div>
					<div class="text-neutral-100 text-sm italic text-center">Training For Triangulon </div>
					<!-- <p class="text-neutral-300 leading-4 text-[10px]"><span class="rounded-sm mr-[2px] py-0 text-[10px] font-extrabold">0 / 1</span> Defeat the Training Dummy</p> -->


					<!-- TODO: FIND THE QUEST YELLOW COLOR, AMBER IS TEMP -->
					<div class="bg-amber-900/40 px-4 py-1 w-max mx-auto mt-4 rounded-sm border-amber-300 border text-white font-semibold text-sm">Start Quest</div>

				</div>
			</div>
		</div>
	{:else if gameState.renderer == "encounter"}

	{:else if gameState.renderer == "quest"}

	{:else if gameState.renderer == "dev-default"}
		<TimerIsland />
		<!-- Keyed on the visit so advancing crossfades with a fade+drift: the old
	     panel sinks out, the new one rises in. Both absolutely positioned so the
	     swap never reflows the Desktop chrome. -->
		{#key seq}
			<div
				class="absolute inset-0 pb-[56px]"
				in:fly={{ y: 20, duration: 350, delay: 525, easing: cubicOut }}
				out:fly={{ y: 20, duration: 350, easing: cubicOut }}
			>
				{#if courseDone}
					<GraphDonePanel onRestart={restart} />
				{:else if active}
					<GraphPanelRenderer
						content={active.content}
						title={active.panel.title}
						visit={active.visit}
						onResult={handleResult}
					/>
				{/if}
			</div>
		{/key}
	{/if}
	
	
</Desktop>

<GraphDevTools
	active={active ? { panel: active.panel, visit: active.visit } : null}
	resolved={resolved !== null}
	onForce={handleResult}
	onReset={restart}
/>

<div class="flex h-[50px] "></div>
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
	import { ContentGameState, type Rank } from '$lib/content-graph/gameState.svelte';
	import { game } from '$lib/game/index.svelte';
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
	import Sprite from '$lib/components/sprites/Sprite.svelte';
	import Avatar from '$lib/layout-components/moba/Avatar.svelte';
	import BranchMark from '$lib/toast/BranchMark.svelte';
	import SidebarQuestLog from '$lib/camp/SidebarQuestLog.svelte';
	import SelectedQuest from '$lib/camp/SelectedQuest.svelte';
	import MapOverlay from '$lib/map/MapOverlay.svelte';
	import SidebarUser from '$lib/camp/SidebarUser.svelte';
	import Leaf from '$lib/Leaf.svelte';
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
	let mapOpen = $state(false);


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
		width: 450px;
		height: 300px;
		transform-style: preserve-3d;
		transform: rotateX(60deg);
	}

	.camp-shadow {
		width: 500px;
		height: 300px;
		z-index: 10;
		transform: translateZ(-10px);
	}

	/* this whole block is a sibling of .camp-base, so it never inherits the rotateX */
	.campfire {
		width: 120px;
		height: 120px;
	}

	.fire-glow {
		width: 90px;
		height: 90px;
		background: radial-gradient(circle, rgba(251, 146, 60, 0.35) 0%, rgba(251, 146, 60, 0) 70%);
	}

	.fire-pit {
		width: 46px;
		height: 46px;
		bottom: 2px;
		background: radial-gradient(circle at 35% 30%, #9ca3af, #4b5563 65%, #33393f 100%);
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.5),
			0 3px 6px rgba(0, 0, 0, 0.35);
	}

	.campfire-icon {
		width: 160px;
		height: 160px;
	}

	.ember {
		transform-origin: center;
		opacity: 0;
		animation: ember-rise 2.2s ease-in infinite;
		animation-delay: var(--delay, 0s);
		margin-bottom: 120px;
	}

	@keyframes ember-rise {
		0% {
			opacity: 0;
			transform: translate(0, 0) scale(0.6);
		}
		15% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translate(var(--drift, 0), -22px) scale(0.2);
		}
	}



</style>

<Desktop>
	{#if game.renderer.state == "camp" }
		<div class="w-screen h-screen flex items-center justify-center pb-24">
			<div class="flex flex-col justify-center items-center my-auto mx-auto w-full h-full">
				
				<!--  TODO: ADD CONDITIONAL DEV BORDERS FOR SPACING border border-8 border-red-300/20  -->
				<div class="flex gap-12 h-[480px] items-center ">
					<SidebarUser />
					<div class="flex flex-col h-full justify-between relative ">
						{#if mapOpen}
							<!--
							This is a closer idea but not fully centered, will look at later
							<div class="w-full mx-auto absolute right-1/2 z-40">
								<div class="  h-[480px] w-[800px] z-30 bg-taupe-200 rounded-sm">

								</div>
							</div>
							-->
							<div class="w-full absolute left-0 z-40">
								<div class="h-[480px] w-full mx-auto z-30 bg-taupe-200 rounded-sm shadow-xl border border-taupe-900">
								</div>
							</div>
						{/if}
						<button onclick={() => mapOpen = !mapOpen} class="relative z-50 mx-auto cursor-pointer hover:bg-taupe-300 flex flex-col bg-taupe-50 px-4 py-2 border-amber-800 rounded-md border flex-col text-left gap-1">
							<div class="flex items-center text-neutral-800 mx-auto gap-2 justify-between">
								<!-- <p class="text-xs text-[10px] font-thin">Map</p>
								<div class="text-[10px] text-xs italic font-thin">/</div> -->
								<p class="text-xs text-[10px]">The Greenwoods</p>
								<div class=" text-xs italic font-thin">/</div>
								<p class="text-xs text-[10px]">The Caves Of Triangulus</p>
							</div>
							<div class="flex justify-between gap-4">
								<p class=" text-sm mx-auto font-semibold text-neutral-800 text-nowrap">The Entrance</p>
								<!-- TODO: more minimalistic way of displaying region progres?-->
								<!-- bg-brand-surface-blue-800 border rounded-sm border-blue-800/20 px-2 -->
								<div class="flex items-center justify-center font-thin text-amber-900  text-xs">
									2 / 7 Quests
								</div>
							</div>
							
							


							<!-- 
							OLD OVERLAY fullscreen. want to go for fixed grid approach instead
							{#if mapOpen}
								<MapOverlay />
							{/if} -->
						</button>
						<div class="camp-stage relative">
							<div class="camp-base flex items-center justify-center relative z-30 rounded-[80px] bg-linear-to-t from-green-900 via-green-900 to-neutral-900 to-[250%]">
							<div class="camp-shadow absolute z-10 rounded-[40px] bg-green-900/30 mx-auto blur-xl"></div>

							<div class="relative z-20 w-24 h-24 rounded-full bg-linear-to-br from-taupe-500 via-taupe-600 to-taupe-500 shadow-[inset_0_3px_6px_rgba(0,0,0,0.6),0_2px_4px_rgba(0,0,0,0.4)]"></div>
						</div>
						
							<div class="w-full absolute left-0 z-40">
								<div class="  h-[450px] w-full z-30 bg-blue-100">

								</div>
							</div>

						<!-- <div class="shadow-3xl bg-radial absolute inset-0 right-72 top-6">
							<div class="bg-brand-surface-blue-900 border-brand-surface-blue-600 w-max h-max rounded-md border p-1">
								<Leaf width={32} height={32} />
							
							</div>
						</div> -->

						<div class="campfire-wrap absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
							<div class="campfire relative flex items-center justify-center">
								<svg class="campfire-icon relative" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
									<defs>
										<linearGradient id="flameBase" x1="32" y1="27" x2="32" y2="49" gradientUnits="userSpaceOnUse">
											<stop offset="0%" stop-color="#f97316" />
											<stop offset="55%" stop-color="#c2410c" />
											<stop offset="100%" stop-color="#7c2d12" />
										</linearGradient>
										<linearGradient id="flameOuter" x1="32" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
											<stop offset="0%" stop-color="#fde047" />
											<stop offset="45%" stop-color="#fb923c" />
											<stop offset="100%" stop-color="#dc2626" />
										</linearGradient>
										<linearGradient id="flameInner" x1="32" y1="18" x2="32" y2="37" gradientUnits="userSpaceOnUse">
											<stop offset="0%" stop-color="#fef9c3" />
											<stop offset="100%" stop-color="#fbbf24" />
										</linearGradient>
									</defs>

									<!-- crossed logs -->
									<rect x="12" y="43" width="40" height="6" rx="3" fill="#57331e" transform="rotate(-16 32 46)" />
									<rect x="12" y="43" width="40" height="6" rx="3" fill="#6b4226" transform="rotate(16 32 46)" />

							
									<!-- flame -->
									<g transform="translate(0, 6)">
										<path d="M 32 10 C 20 22 20 30 24 38 C 27 41 37 41 40 38 C 44 30 44 22 32 10 Z" fill="url(#flameOuter)" />			
										<path transform="translate(0,1)" d="M 32 18 C 27 25 20 31 29 39 C 28 33 30 29 32 27 C 34 30 36 33 35 39 C 43 31 37 25 32 18 Z" fill="url(#flameInner)" />
									</g>
									<!-- embers -->
									<circle class="ember" cx="28" cy="14" r="2.4" fill="#fb923c" style="--delay:0s; --drift:-6px" />
									<circle class="ember" cx="34" cy="10" r="2.7" fill="#fde047" style="--delay:.5s; --drift:8px" />
									<circle class="ember" cx="31" cy="6" r="2.1" fill="#fca5a5" style="--delay:1s; --drift:2px" />
									<circle class="ember" cx="37" cy="16" r="2.4" fill="#fdba74" style="--delay:1.5s; --drift:-4px" />
								</svg>
							</div>
						</div>
					</div>
					</div>
					
					<!-- <div class="h-full bg-brand-surface-blue-800 rounded-md border  border-brand-gold/70 shadow-lg shadow-brand-surface-blue-600/30 w-72">
						
					</div> -->
					<SidebarQuestLog />
				</div>


				<!-- <div class="w-1.5 h-1.5 bg-amber-400/80 border border-amber-400 rotate-45"></div> -->
				<SelectedQuest />
			</div>
		</div>
	{:else if game.renderer.state == "encounter"}
		<div class="p-4 bg-blue-400">
			<div class="text-3xl">SWITCHED TO ENCOUNTER</div>
		</div>
	{:else if gameState.renderer == "quest"}
		<div class="p-4 bg-blue-400">
			<div class="text-3xl">SWITCHED TO QUEST</div>
		</div>
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


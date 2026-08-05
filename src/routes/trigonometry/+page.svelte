<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Desktop from '$lib/layout-components/Desktop.svelte';
	import EloTopicMap from '$lib/content-graph/EloTopicMap.svelte';
	import GraphPanelRenderer from '$lib/content-graph/panels/GraphPanelRenderer.svelte';
	import GraphDonePanel from '$lib/content-graph/panels/GraphDonePanel.svelte';
	import GraphDevTools from '$lib/content-graph/GraphDevTools.svelte';
	import { game, type Rank } from '$lib/content-graph/gameState.svelte';
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
	import BeginnerToast from '$lib/content-graph/rank-toasts/BeginnerToast.svelte';
	import IntermediateToast from '$lib/content-graph/rank-toasts/IntermediateToast.svelte';
	import ExpertToast from '$lib/content-graph/rank-toasts/ExpertToast.svelte';
	import MasteryToast from '$lib/content-graph/rank-toasts/MasteryToast.svelte';
	import RankDownToast from '$lib/content-graph/rank-toasts/RankDownToast.svelte';

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

	// ── Toasts ──────────────────────────────────────────────────────────────
	/** Highest event sequence number already turned into a toast. */
	let toastedThrough = game.events.at(-1)?.seq ?? 0;

	/** One component per rank, so each card can be styled on its own. */
	const RANK_TOAST: Record<Rank, ToastComponent> = {
		Beginner: BeginnerToast,
		Intermediate: IntermediateToast,
		Expert: ExpertToast,
		Mastery: MasteryToast
	};

	function raiseToasts() {
		for (const event of game.events) {
			if (event.seq <= toastedThrough) continue;
			toastedThrough = event.seq;
			const subtopic = event.subtopicID ? (byId.get(event.subtopicID)?.title ?? '') : '';

			if (event.type === 'rank_up' && event.rank) {
				toasts.custom(RANK_TOAST[event.rank], { subtopic, elo: event.elo ?? 0 });
			} else if (event.type === 'rank_down' && event.rank) {
				toasts.custom(RankDownToast, { subtopic, elo: event.elo ?? 0, rank: event.rank }, 'danger');
			} else if (event.type === 'course_complete') {
				toasts.success('Course complete', 'Every subtopic mastered');
			}
		}
	}

	// ── Walking ─────────────────────────────────────────────────────────────

	/** Freeze the pending panel into this visit's render state. */
	function enterPending(panel: PanelNode) {
		active = { panel, visit: game.attemptsFor(panel.id), content: contentFor(panel.panelID) };
		seq += 1;
	}

	/**
	 * Walk the graph until it serves the next unfinished panel. One moveNext()
	 * already skips satisfied panels; the loop here just carries the walker
	 * across subtopic hand-offs. The graph decides the route — mastered
	 * subtopics advance the spine, everything else circles the training loop.
	 */
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
		raiseToasts();
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
		raiseToasts();
	}

	function handleContinue() {
		advanceToNextPanel();
	}

	function restart() {
		game.reset();
		toasts.clear();
		toastedThrough = 0;
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
</script>

<Desktop>
	{#snippet barLeft()}
		<EloTopicMap />
	{/snippet}

	<!-- Keyed on the visit so advancing crossfades with a fade+drift: the old
	     panel sinks out, the new one rises in. Both absolutely positioned so the
	     swap never reflows the Desktop chrome. -->
	{#key seq}
		<div
			class="absolute inset-0"
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
</Desktop>

<GraphDevTools
	active={active ? { panel: active.panel, visit: active.visit } : null}
	resolved={resolved !== null}
	onForce={handleResult}
	onReset={restart}
/>

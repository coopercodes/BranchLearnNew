<script lang="ts">
	import { SvelteFlow, Background, Controls, type Edge, type Node } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';

	import { analyzeGraph } from '$lib/content-graph/analysis';
	import { buildEdges, buildFlow } from '$lib/content-graph/flow';
	import {
		game,
		hitRateFor,
		MAX_ELO,
		MAX_HIT_RATE,
		MIN_HIT_RATE,
		type ContentEventType,
		type Rank
	} from '$lib/content-graph/gameState.svelte';
	import { toasts, type ToastComponent } from '$lib/toast/toast.svelte';
	import BeginnerToast from '$lib/content-graph/rank-toasts/BeginnerToast.svelte';
	import IntermediateToast from '$lib/content-graph/rank-toasts/IntermediateToast.svelte';
	import ExpertToast from '$lib/content-graph/rank-toasts/ExpertToast.svelte';
	import MasteryToast from '$lib/content-graph/rank-toasts/MasteryToast.svelte';
	import RankDownToast from '$lib/content-graph/rank-toasts/RankDownToast.svelte';
	import { ContentGraph } from '$lib/content-graph/graph-content';
	import TopicNode from '$lib/content-graph/nodes/TopicNode.svelte';
	import SubtopicNode from '$lib/content-graph/nodes/SubtopicNode.svelte';
	import PanelNode from '$lib/content-graph/nodes/PanelNode.svelte';
	import type { PanelNode as PanelGraphNode } from '$lib/content-graph/types';

	const nodeTypes = { topic: TopicNode, subtopic: SubtopicNode, panel: PanelNode };
	const flow = buildFlow(ContentGraph);
	const analysis = analyzeGraph(ContentGraph);

	let nodes = $state.raw<Node[]>(flow.nodes);
	let edges = $state.raw<Edge[]>(buildEdges(ContentGraph, game.lastEdgeID));
	let selectedID = $state<string | null>(null);

	const byId = new Map(ContentGraph.map((n) => [n.id, n]));
	let detail = $derived(byId.get(selectedID ?? game.currentID));

	let subtopics = $derived(ContentGraph.filter((n) => n.type === 'subtopic'));
	let panelCount = $derived(ContentGraph.filter((n) => n.type === 'panel').length);
	let edgeCount = $derived(ContentGraph.reduce((sum, n) => sum + n.outEdges.length, 0));
	let log = $derived([...game.events].reverse());

	/** Panels of whichever subtopic the walker is inside, for the quota list. */
	let activeSubtopicID = $derived.by(() => {
		const node = game.pendingPanel ?? game.current;
		if (node?.type === 'panel') return node.subtopicID;
		if (node?.type === 'subtopic') return node.id;
		return null;
	});
	let activePanels = $derived(
		ContentGraph.filter(
			(n): n is PanelGraphNode => n.type === 'panel' && n.subtopicID === activeSubtopicID
		)
	);

	/** Highest sequence number already turned into a toast. */
	let toastedThrough = game.events.at(-1)?.seq ?? 0;

	/** Edges carry the "just traversed" highlight, so rebuild them after a step. */
	function advance(count = 1) {
		game.advanceMany(count);
		edges = buildEdges(ContentGraph, game.lastEdgeID);
		raiseToasts();
	}

	function reset() {
		game.reset();
		selectedID = null;
		toastedThrough = 0;
		toasts.clear();
		edges = buildEdges(ContentGraph, null);
	}

	/** One component per rank, so each card can be styled on its own. */
	const RANK_TOAST: Record<Rank, ToastComponent> = {
		Beginner: BeginnerToast,
		Intermediate: IntermediateToast,
		Expert: ExpertToast,
		Mastery: MasteryToast
	};

	/** Milestones since the last press get a toast — batches of ×10 included. */
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

	const EVENT_STYLE: Record<ContentEventType, { icon: string; class: string }> = {
		moved: { icon: '→', class: 'text-brand-gray-mid' },
		panel_entered: { icon: '▸', class: 'text-brand-navy' },
		panel_skipped: { icon: '⤳', class: 'text-brand-gray-light' },
		answer_correct: { icon: '✓', class: 'text-brand-forest' },
		answer_incorrect: { icon: '✕', class: 'text-brand-crimson' },
		panel_reinforced: { icon: '★', class: 'text-brand-forest' },
		rank_up: { icon: '▲', class: 'text-brand-forest' },
		rank_down: { icon: '▼', class: 'text-brand-crimson' },
		subtopic_mastered: { icon: '🏆', class: 'text-brand-forest' },
		subtopic_advanced: { icon: '⇣', class: 'text-brand-orange' },
		course_complete: { icon: '🎉', class: 'text-brand-orange' }
	};

	function timeOf(at: number): string {
		return new Date(at).toLocaleTimeString(undefined, {
			hour12: false,
			minute: '2-digit',
			second: '2-digit'
		});
	}
</script>

<div class="min-h-screen bg-brand-cream px-8 py-10">
	<div class="mx-auto max-w-[1400px]">
		<!-- Header -->
		<div class="mb-6 flex flex-wrap items-end justify-between gap-4">
			<div>
				<h1 class="text-4xl font-bold tracking-tight text-brand-navy">Content Graph</h1>
				<p class="mt-1 text-sm text-brand-gray-mid">
					{ContentGraph.length} nodes ({panelCount} panels) · {edgeCount} edges · {analysis.loops
						.length} training loops
				</p>
			</div>
			<div class="flex flex-wrap gap-2 text-sm font-semibold">
				<span
					class="rounded-full px-4 py-2 {analysis.spineAcyclic
						? 'bg-brand-green-100 text-brand-green-700'
						: 'bg-brand-crimson text-white'}"
				>
					{analysis.spineAcyclic ? 'Subtopic spine: acyclic ✓' : 'Spine has a cycle ✕'}
				</span>
				<span class="rounded-full bg-brand-gold/30 px-4 py-2 text-brand-near-black">
					{analysis.loops.filter((l) => l.closed).length} closed training cycles
				</span>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_340px]">
			<div class="flex flex-col gap-6">
				<!-- Flow -->
				<div class="h-[620px] overflow-hidden rounded-xl bg-brand-off-white">
					<SvelteFlow
						bind:nodes
						bind:edges
						{nodeTypes}
						fitView
						fitViewOptions={{ padding: 0.08 }}
						minZoom={0.3}
						nodesDraggable={false}
						nodesConnectable={false}
						onnodeclick={({ node }) => (selectedID = selectedID === node.id ? null : node.id)}
					>
						<Background bgColor="#f8faec" patternColor="#bcbfbe" gap={22} />
						<Controls showLock={false} />
					</SvelteFlow>
				</div>

				<!-- Event log -->
				<div class="rounded-xl bg-brand-white p-5">
					<div class="flex items-baseline justify-between">
						<p class="text-xs tracking-wide text-brand-gray-mid uppercase">Event log</p>
						<p class="font-mono text-[11px] text-brand-gray-mid">
							{game.events.length} events · persisted to <span>{game.storageKey}</span>
						</p>
					</div>
					<div class="mt-3 max-h-64 overflow-y-auto">
						{#each log as event (event.seq)}
							{@const style = EVENT_STYLE[event.type]}
							<div
								class="flex items-baseline gap-2 border-b border-brand-cream py-1 text-[11px] last:border-0"
							>
								<span class="w-8 shrink-0 text-right font-mono text-brand-gray-light">
									{event.seq}
								</span>
								<span class="w-12 shrink-0 font-mono text-brand-gray-light">{timeOf(event.at)}</span
								>
								<span class="w-4 shrink-0 text-center {style.class}">{style.icon}</span>
								<span class="w-36 shrink-0 truncate font-mono text-brand-gray-mid">
									{event.type}
								</span>
								<span class="flex-1 truncate text-brand-near-black">{event.detail}</span>
								{#if event.delta !== undefined}
									<span
										class="shrink-0 font-mono font-bold {event.delta >= 0
											? 'text-brand-forest'
											: 'text-brand-crimson'}"
									>
										{event.delta >= 0 ? '+' : ''}{event.delta} → {event.elo}
									</span>
								{/if}
							</div>
						{:else}
							<p class="text-[11px] text-brand-gray-mid">
								No events yet — press Move forward to start walking.
							</p>
						{/each}
					</div>
				</div>
			</div>

			<!-- Sidebar -->
			<div class="flex flex-col gap-4">
				<!-- Walker -->
				<div class="rounded-xl bg-brand-navy p-5">
					<p class="text-xs tracking-wide text-brand-gray-light uppercase">
						{game.pendingPanel ? 'Awaiting answer' : 'Current node'}
					</p>
					<p class="mt-1 font-bold text-white">
						{(game.pendingPanel ?? game.current)?.title ?? game.currentID}
					</p>
					<p class="mt-0.5 font-mono text-[11px] text-brand-gray-light">
						{(game.pendingPanel ?? game.current)?.id ?? game.currentID}
					</p>

					<div class="mt-4 flex gap-2">
						<button
							onclick={() => advance()}
							disabled={!game.canAdvance}
							class="flex-1 rounded-lg bg-brand-gold px-4 py-2.5 text-sm font-bold text-brand-near-black disabled:cursor-not-allowed disabled:bg-brand-gray-mid disabled:text-brand-gray-light"
						>
							{#if game.pendingPanel}
								Answer panel ({Math.round(game.currentHitRate * 100)}%)
							{:else if game.canAdvance}
								Move forward →
							{:else}
								Course complete 🎉
							{/if}
						</button>
						<button
							onclick={() => advance(10)}
							disabled={!game.canAdvance}
							class="rounded-lg bg-brand-gold/25 px-3 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:text-brand-gray-mid"
						>
							×10
						</button>
					</div>
					<p class="mt-2 text-center text-[11px] text-brand-gray-light">
						{#if game.pendingPanel}
							one press = one event · rolls at the subtopic's hit rate
						{:else if game.nextEdge}
							follows <span class="font-mono">{game.nextEdge.label ?? 'first out-edge'}</span>
						{:else}
							every subtopic mastered
						{/if}
					</p>
					<p class="mt-1 text-center text-[11px] text-brand-gray-light">
						Hit rate scales {MIN_HIT_RATE * 100}% → {MAX_HIT_RATE * 100}% with ELO
					</p>
					<button onclick={reset} class="mt-3 w-full text-xs text-brand-gray-light hover:underline">
						Reset saved game
					</button>
				</div>

				<!-- Node detail -->
				{#if detail}
					<div class="rounded-xl bg-brand-white p-5">
						<p class="text-xs tracking-wide text-brand-gray-mid uppercase">
							{selectedID ? 'Selected' : 'Current'} · {detail.type}
						</p>
						<p class="mt-1 font-bold text-brand-navy">{detail.title}</p>
						{#if detail.summary}
							<p class="mt-1 text-xs text-brand-gray-mid">{detail.summary}</p>
						{/if}

						<!-- Everything panel content will need to key off -->
						<dl class="mt-3 space-y-0.5 text-[11px]">
							<div class="flex justify-between gap-2">
								<dt class="text-brand-gray-mid">id</dt>
								<dd class="truncate font-mono font-bold">{detail.id}</dd>
							</div>
							{#if detail.type === 'panel'}
								<div class="flex justify-between gap-2">
									<dt class="text-brand-gray-mid">panelID</dt>
									<dd class="truncate font-mono font-bold">{detail.panelID}</dd>
								</div>
								<div class="flex justify-between gap-2">
									<dt class="text-brand-gray-mid">requiredCorrect</dt>
									<dd class="font-mono">{detail.requiredCorrect}</dd>
								</div>
							{/if}
							{#if 'subtopicID' in detail}
								<div class="flex justify-between gap-2">
									<dt class="text-brand-gray-mid">subtopicID</dt>
									<dd class="truncate font-mono">{detail.subtopicID}</dd>
								</div>
							{/if}
							{#if 'topicID' in detail}
								<div class="flex justify-between gap-2">
									<dt class="text-brand-gray-mid">topicID</dt>
									<dd class="truncate font-mono">{detail.topicID}</dd>
								</div>
							{/if}
						</dl>

						<p class="mt-3 text-[11px] font-semibold text-brand-gray-mid">
							Out ({detail.outEdges.length})
						</p>
						{#each detail.outEdges as edge (edge.id)}
							<p class="font-mono text-[11px] break-all text-brand-near-black">
								→ {edge.targetId} <span class="text-brand-gray-mid">{edge.label ?? ''}</span>
							</p>
						{:else}
							<p class="text-[11px] text-brand-gray-mid">none — leaf</p>
						{/each}
						<p class="mt-2 text-[11px] font-semibold text-brand-gray-mid">
							In ({detail.inEdges.length})
						</p>
						{#each detail.inEdges as edge (edge.id)}
							<p class="font-mono text-[11px] break-all text-brand-near-black">
								← {edge.targetId} <span class="text-brand-gray-mid">{edge.label ?? ''}</span>
							</p>
						{:else}
							<p class="text-[11px] text-brand-gray-mid">none — root</p>
						{/each}
					</div>
				{/if}

				<!-- ELO -->
				<div class="rounded-xl bg-brand-white p-5">
					<p class="text-xs tracking-wide text-brand-gray-mid uppercase">Subtopic ELO</p>
					<div class="mt-3 space-y-3">
						{#each subtopics as subtopic (subtopic.id)}
							{@const elo = game.eloFor(subtopic.id)}
							{@const mastered = game.isMastered(subtopic.id)}
							<div>
								<div class="flex items-baseline justify-between text-xs">
									<span class="font-semibold text-brand-navy">
										{subtopic.title}
										{#if mastered}<span class="text-brand-forest">✓</span>{/if}
									</span>
									<span class="font-mono font-bold">
										{elo}<span class="text-brand-gray-mid">/{MAX_ELO}</span>
									</span>
								</div>
								<div class="mt-1 h-2 overflow-hidden rounded-full bg-brand-cream">
									<div
										class="h-full rounded-full transition-all duration-300 {mastered
											? 'bg-brand-forest'
											: 'bg-brand-gold'}"
										style="width: {elo}%"
									></div>
								</div>
								<p class="mt-1 flex items-baseline justify-between gap-2 text-[10px]">
									<span class="text-brand-gray-mid">
										{game.satisfiedCount(subtopic.id)}/{game.panelCount(subtopic.id)} reinforced · rolling
										at {Math.round(hitRateFor(elo) * 100)}%
									</span>
									<span
										class="font-bold {mastered ? 'text-brand-forest' : 'text-brand-near-black'}"
									>
										{game.rankOf(subtopic.id)}
									</span>
								</p>
							</div>
						{/each}
					</div>
				</div>

				<!-- Correct-answer quotas for the loop the walker is inside -->
				{#if activePanels.length > 0}
					<div class="rounded-xl bg-brand-white p-5">
						<p class="text-xs tracking-wide text-brand-gray-mid uppercase">Panel quotas</p>
						<div class="mt-2 space-y-1.5">
							{#each activePanels as panel (panel.id)}
								{@const done = game.correctFor(panel.id)}
								{@const satisfied = game.isSatisfied(panel)}
								<div class="flex items-baseline justify-between gap-2 text-[11px]">
									<span class="truncate {panel.id === game.currentID ? 'font-bold' : ''}">
										{#if satisfied}<span class="text-brand-forest">✓</span>{/if}
										{panel.title}
									</span>
									<span
										class="shrink-0 font-mono font-bold {satisfied
											? 'text-brand-forest'
											: 'text-brand-gray-mid'}"
									>
										{Math.min(done, panel.requiredCorrect)}/{panel.requiredCorrect}
									</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Loop structure -->
				<div class="rounded-xl bg-brand-white p-5">
					<p class="text-xs tracking-wide text-brand-gray-mid uppercase">Training loops</p>
					{#each analysis.loops as loop (loop.subtopicID)}
						<p class="mt-2 font-mono text-[11px] break-words text-brand-near-black">
							<span class={loop.closed ? 'text-brand-forest' : 'text-brand-crimson'}>
								{loop.closed ? '↻' : '✕'}
							</span>
							{loop.subtopicID} → {loop.panelIDs.length} panels → {loop.subtopicID}
						</p>
					{/each}
					<p class="mt-3 text-[11px] text-brand-gray-mid">
						Spine order: {analysis.spineOrder.join(' → ')}
					</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Edge styling — spine vs. training loop, plus the step just taken. */
	:global(.cg-edge-spine .svelte-flow__edge-path) {
		stroke: var(--color-brand-gray-mid);
		stroke-width: 1.5;
	}
	:global(.cg-edge-loop .svelte-flow__edge-path) {
		stroke: var(--color-brand-gold);
		stroke-width: 2;
	}
	:global(.cg-edge-active .svelte-flow__edge-path) {
		stroke: var(--color-brand-orange);
		stroke-width: 3;
	}
	:global(.svelte-flow__edge-text) {
		font-size: 10px;
		fill: var(--color-brand-gray-mid);
	}
	:global(.svelte-flow__edge-textbg) {
		fill: var(--color-brand-off-white);
	}
	:global(.svelte-flow__handle) {
		opacity: 0;
	}
</style>

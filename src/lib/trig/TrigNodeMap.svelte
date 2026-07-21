<script lang="ts">
	import { trigSections } from './content';
	import { trigSession } from './session.svelte';
	import { recommendPanel } from './recommender';
	import { REQUIRED_CORRECT, type TrigPanel, type TrigPanelType, type TrigSection } from './types';

	// One compact graph per section: article → practice fan → final. The panel
	// the recommender would serve right now pulses with an orange ring, so you
	// can watch the algorithm cycle across types as questions are answered.

	// Short labels so text fits inside the narrow nodes.
	const SHORT: Record<TrigPanelType, string> = {
		article: 'Article',
		'multiple-choice': 'Multi Choice',
		'fill-blank': 'Fill Blank',
		'lightning-round': 'Lightning',
		'triangle-long-answer': 'Triangle',
		flashcards: 'Flashcards',
		final: 'Final'
	};

	// Layout (per-section viewBox is 320 wide).
	const ARTICLE = { cx: 46, w: 74, h: 24 };
	const PRACTICE = { cx: 176, w: 118, h: 22, gap: 28 };
	const FINAL = { cx: 288, w: 54, h: 24 };
	const PAD = 16;

	interface NodeBox {
		panel: TrigPanel;
		x: number;
		y: number;
		w: number;
		h: number;
		cx: number;
		cy: number;
	}

	function practicePanels(section: TrigSection): TrigPanel[] {
		return section.panels.filter((p) => p.type !== 'article' && p.type !== 'final');
	}

	function sectionHeight(section: TrigSection): number {
		return PAD * 2 + Math.max(3, practicePanels(section).length) * PRACTICE.gap;
	}

	function sectionNodes(section: TrigSection): NodeBox[] {
		const h = sectionHeight(section);
		const cy = h / 2;
		const practice = practicePanels(section);
		const boxes: NodeBox[] = [];
		for (const panel of section.panels) {
			if (panel.type === 'article') {
				boxes.push(box(panel, ARTICLE.cx, cy, ARTICLE.w, ARTICLE.h));
			} else if (panel.type === 'final') {
				boxes.push(box(panel, FINAL.cx, cy, FINAL.w, FINAL.h));
			} else {
				const i = practice.indexOf(panel);
				const py = cy + (i - (practice.length - 1) / 2) * PRACTICE.gap;
				boxes.push(box(panel, PRACTICE.cx, py, PRACTICE.w, PRACTICE.h));
			}
		}
		return boxes;
	}

	function box(panel: TrigPanel, cx: number, cy: number, w: number, h: number): NodeBox {
		return { panel, x: cx - w / 2, y: cy - h / 2, w, h, cx, cy };
	}

	function curve(x1: number, y1: number, x2: number, y2: number): string {
		const mx = (x1 + x2) / 2;
		return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
	}

	type NodeState = 'done' | 'partial' | 'available' | 'locked';

	function nodeState(panel: TrigPanel): NodeState {
		if (trigSession.isPanelComplete(panel)) return 'done';
		const active = trigSession.activeSection(trigSections);
		if (active && panel.sectionId !== active.id) {
			const activeIndex = trigSections.indexOf(active);
			const panelSectionIndex = trigSections.findIndex((s) => s.id === panel.sectionId);
			if (panelSectionIndex > activeIndex) return 'locked';
		}
		const stats = trigSession.panelStats(panel);
		return stats.correct + stats.incorrect > 0 ? 'partial' : 'available';
	}

	const fills: Record<NodeState, string> = {
		done: '#386d4f',
		partial: '#ffc52a',
		available: '#ffffff',
		locked: '#f4f2ec'
	};
	const strokes: Record<NodeState, string> = {
		done: '#386d4f',
		partial: '#e0a800',
		available: '#cfcfcf',
		locked: '#d8d5cd'
	};
	const textFill: Record<NodeState, string> = {
		done: '#ffffff',
		partial: '#2a2a27',
		available: '#3a3a37',
		locked: '#a8a49b'
	};

	function countText(panel: TrigPanel): string {
		const required = REQUIRED_CORRECT[panel.type];
		return `${Math.min(required, trigSession.panelStats(panel).correct)}/${required}`;
	}

	// The panel currently recommended: what's on screen, or (on intro/outro) a
	// live preview of what the recommender would pick for the active section.
	let recommendedId = $derived.by(() => {
		const pos = trigSession.position;
		if (pos?.kind === 'panel') return pos.panelId;
		const active = trigSession.activeSection(trigSections);
		return active ? (recommendPanel(active, trigSession)?.id ?? null) : null;
	});
</script>

<div class="space-y-3">
	{#each trigSections as section (section.id)}
		{@const nodes = sectionNodes(section)}
		{@const h = sectionHeight(section)}
		{@const cy = h / 2}
		{@const done = trigSession.isSectionComplete(section)}
		<div>
			<p class="mb-1 flex items-center gap-1.5 text-[10px] font-bold text-[#3a3a37] uppercase">
				<span class="rounded bg-[#2b2f36] px-1 py-0.5 text-[9px] text-white">{section.label}</span>
				{#if done}<span class="text-[#386d4f]">✓ mastered</span>{/if}
			</p>
			<svg viewBox="0 0 320 {h}" class="w-full" role="img" aria-label="{section.label} panel graph">
				<!-- Edges: article → practice → final -->
				{#each nodes as node (node.panel.id)}
					{#if node.panel.type !== 'article' && node.panel.type !== 'final'}
						{@const edgeDone = trigSession.isPanelComplete(node.panel)}
						<path
							d={curve(ARTICLE.cx + ARTICLE.w / 2, cy, node.x, node.cy)}
							stroke={edgeDone ? '#386d4f80' : '#d9d9d9'}
							stroke-width="1.2"
							fill="none"
						/>
						<path
							d={curve(node.x + node.w, node.cy, FINAL.cx - FINAL.w / 2, cy)}
							stroke={edgeDone ? '#386d4f80' : '#d9d9d9'}
							stroke-width="1.2"
							fill="none"
						/>
					{/if}
				{/each}

				<!-- Nodes -->
				{#each nodes as node (node.panel.id)}
					{@const state = nodeState(node.panel)}
					{@const recommended = node.panel.id === recommendedId}
					<g class={recommended ? 'node-pulse' : ''}>
						{#if recommended}
							<rect
								x={node.x - 3}
								y={node.y - 3}
								width={node.w + 6}
								height={node.h + 6}
								rx={(node.h + 6) / 2}
								fill="none"
								stroke="#f35d29"
								stroke-width="2"
							/>
						{/if}
						<rect
							x={node.x}
							y={node.y}
							width={node.w}
							height={node.h}
							rx={node.h / 2}
							fill={fills[state]}
							stroke={strokes[state]}
							stroke-width="1.2"
						/>
						<text x={node.x + 11} y={node.cy + 3.5} fill={textFill[state]} font-size="9.5" font-weight="600">
							{SHORT[node.panel.type]}
						</text>
						<text
							x={node.x + node.w - 9}
							y={node.cy + 3.5}
							text-anchor="end"
							fill={textFill[state]}
							font-size="9"
						>
							{countText(node.panel)}
						</text>
					</g>
				{/each}
			</svg>
		</div>
	{/each}
</div>

<style>
	.node-pulse {
		animation: node-pulse 1.6s ease-in-out infinite;
	}
	@keyframes node-pulse {
		50% {
			opacity: 0.55;
		}
	}
</style>

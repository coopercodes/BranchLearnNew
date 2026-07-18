<script lang="ts">
	import type { AlgoGameState } from './gameState.svelte';
	import { PANEL_TYPE_LABELS, REQUIRED_CORRECT, type AlgoPanel, type AlgoSection } from './types';

	let { sections, game }: { sections: AlgoSection[]; game: AlgoGameState } = $props();

	// ---- Fixed layout: one row per section, article → practice fan → final ----
	const ROW_H = 320;
	const TOP = 70;
	const VIEW_W = 960;
	const ARTICLE = { cx: 120, w: 160, h: 46 };
	const PRACTICE = { cx: 480, w: 220, h: 40, gap: 62 };
	const FINAL = { cx: 842, w: 150, h: 46 };

	interface NodeBox {
		panel: AlgoPanel;
		x: number;
		y: number;
		w: number;
		h: number;
		cx: number;
		cy: number;
	}

	function rowCenter(rowIndex: number): number {
		return TOP + ROW_H * rowIndex + ROW_H / 2;
	}

	function sectionNodes(section: AlgoSection, rowIndex: number): NodeBox[] {
		const cy = rowCenter(rowIndex);
		const practice = section.panels.filter((p) => p.type !== 'article' && p.type !== 'final');
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

	function box(panel: AlgoPanel, cx: number, cy: number, w: number, h: number): NodeBox {
		return { panel, x: cx - w / 2, y: cy - h / 2, w, h, cx, cy };
	}

	function curve(x1: number, y1: number, x2: number, y2: number): string {
		const mx = (x1 + x2) / 2;
		return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
	}

	/** Elbow from a section's final node down to the next section's article. */
	function sectionLink(rowIndex: number): string {
		const y1 = rowCenter(rowIndex) + FINAL.h / 2;
		const y2 = rowCenter(rowIndex + 1) - ARTICLE.h / 2;
		return `M ${FINAL.cx} ${y1} C ${FINAL.cx} ${y1 + 120}, ${ARTICLE.cx} ${y2 - 120}, ${ARTICLE.cx} ${y2}`;
	}

	type NodeState = 'done' | 'partial' | 'available' | 'locked';

	function nodeState(panel: AlgoPanel, sectionIndex: number): NodeState {
		const active = game.activeSection(sections);
		const activeIndex = active ? sections.indexOf(active) : sections.length;
		if (game.isPanelComplete(panel)) return 'done';
		if (sectionIndex > activeIndex) return 'locked';
		const stats = game.stats(panel.id);
		return stats.correct + stats.incorrect > 0 ? 'partial' : 'available';
	}

	const fills: Record<NodeState, string> = {
		done: 'fill-brand-forest',
		partial: 'fill-brand-gold',
		available: 'fill-brand-white',
		locked: 'fill-brand-cream'
	};
	const strokes: Record<NodeState, string> = {
		done: 'stroke-brand-forest',
		partial: 'stroke-brand-gold',
		available: 'stroke-brand-gray-light',
		locked: 'stroke-brand-gray-light/60'
	};
	const labels: Record<NodeState, string> = {
		done: 'fill-white',
		partial: 'fill-brand-near-black',
		available: 'fill-brand-near-black',
		locked: 'fill-brand-gray-mid'
	};

	function countText(panel: AlgoPanel): string {
		const required = REQUIRED_CORRECT[panel.type];
		return `${Math.min(required, game.stats(panel.id).correct)}/${required}`;
	}

	let viewH = $derived(TOP + ROW_H * sections.length + 20);
	let recommendedId = $derived(game.pending?.panelId ?? null);
</script>

<svg
	viewBox="0 0 {VIEW_W} {viewH}"
	class="w-full"
	role="img"
	aria-label="Learning path progress map"
>
	{#each sections as section, rowIndex (section.id)}
		{@const nodes = sectionNodes(section, rowIndex)}
		{@const cy = rowCenter(rowIndex)}
		{@const sectionDone = game.isSectionComplete(section)}

		<!-- Section header -->
		<text x="40" y={TOP + ROW_H * rowIndex + 8} class="fill-brand-navy font-bold" font-size="20">
			{section.title}
			{#if sectionDone}<tspan class="fill-brand-forest" font-size="13"> ✓ mastered</tspan>{/if}
		</text>
		<text x="40" y={TOP + ROW_H * rowIndex + 28} class="fill-brand-gray-mid" font-size="12">
			{section.formula}
		</text>

		<!-- Edges: article → practice → final -->
		{#each nodes as node (node.panel.id)}
			{#if node.panel.type !== 'article' && node.panel.type !== 'final'}
				{@const edgeDone = game.isPanelComplete(node.panel)}
				<path
					d={curve(ARTICLE.cx + ARTICLE.w / 2, cy, node.x, node.cy)}
					class={edgeDone ? 'stroke-brand-forest/50' : 'stroke-brand-gray-light/60'}
					stroke-width="1.5"
					fill="none"
				/>
				<path
					d={curve(node.x + node.w, node.cy, FINAL.cx - FINAL.w / 2, cy)}
					class={edgeDone ? 'stroke-brand-forest/50' : 'stroke-brand-gray-light/60'}
					stroke-width="1.5"
					fill="none"
				/>
			{/if}
		{/each}

		<!-- Link to the next section -->
		{#if rowIndex < sections.length - 1}
			<path
				d={sectionLink(rowIndex)}
				class={sectionDone ? 'stroke-brand-forest/50' : 'stroke-brand-gray-light/60'}
				stroke-width="1.5"
				stroke-dasharray="4 4"
				fill="none"
			/>
		{/if}

		<!-- Nodes -->
		{#each nodes as node (node.panel.id)}
			{@const state = nodeState(node.panel, rowIndex)}
			{@const recommended = node.panel.id === recommendedId}
			<g class={recommended ? 'animate-pulse' : ''}>
				{#if recommended}
					<rect
						x={node.x - 4}
						y={node.y - 4}
						width={node.w + 8}
						height={node.h + 8}
						rx={(node.h + 8) / 2}
						class="fill-none stroke-brand-orange"
						stroke-width="3"
					/>
				{/if}
				<rect
					x={node.x}
					y={node.y}
					width={node.w}
					height={node.h}
					rx={node.h / 2}
					class="{fills[state]} {strokes[state]}"
					stroke-width="1.5"
				/>
				<text x={node.x + 18} y={node.cy + 4} class="{labels[state]} font-semibold" font-size="12">
					{PANEL_TYPE_LABELS[node.panel.type]}
				</text>
				<text
					x={node.x + node.w - 16}
					y={node.cy + 4}
					text-anchor="end"
					class={labels[state]}
					font-size="11"
				>
					{countText(node.panel)}
				</text>
			</g>
		{/each}
	{/each}
</svg>

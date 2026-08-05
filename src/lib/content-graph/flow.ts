import { MarkerType, type Edge, type Node } from '@xyflow/svelte';
import { findTrainingLoop } from './analysis';
import type { GraphNode } from './types';

/**
 * Positions the graph for Svelte Flow: the topic/subtopic spine runs down the
 * left, and each subtopic's training loop runs out to the right as a row of
 * panels with a return edge sweeping back underneath.
 */

const SPINE_X = 0;
const TOPIC_Y = 0;
const FIRST_ROW_Y = 200;
const ROW_GAP = 300;
const PANEL_X = 360;
const PANEL_GAP = 200;

export interface FlowData extends Record<string, unknown> {
	graphNode: GraphNode;
	/** 1-based position inside the training loop, panels only. */
	loopIndex?: number;
	loopSize?: number;
}

export function buildFlow(nodes: GraphNode[]): { nodes: Node[]; edges: Edge[] } {
	const byId = new Map(nodes.map((n) => [n.id, n]));
	const flowNodes: Node[] = [];

	const topic = nodes.find((n) => n.type === 'topic');
	if (topic) {
		flowNodes.push({
			id: topic.id,
			type: 'topic',
			position: { x: SPINE_X, y: TOPIC_Y },
			data: { graphNode: topic } satisfies FlowData,
			draggable: false
		});
	}

	const subtopics = nodes.filter((n) => n.type === 'subtopic');
	for (const [row, subtopic] of subtopics.entries()) {
		const y = FIRST_ROW_Y + row * ROW_GAP;
		flowNodes.push({
			id: subtopic.id,
			type: 'subtopic',
			position: { x: SPINE_X, y },
			data: { graphNode: subtopic } satisfies FlowData,
			draggable: false
		});

		const loop = findTrainingLoop(nodes, subtopic.id);
		for (const [i, panelID] of loop.panelIDs.entries()) {
			const panel = byId.get(panelID);
			if (!panel) continue;
			flowNodes.push({
				id: panel.id,
				type: 'panel',
				position: { x: PANEL_X + i * PANEL_GAP, y: y + 14 },
				data: {
					graphNode: panel,
					loopIndex: i + 1,
					loopSize: loop.panelIDs.length
				} satisfies FlowData,
				draggable: false
			});
		}
	}

	return { nodes: flowNodes, edges: buildEdges(nodes, null) };
}

/** Rebuilt on every step so the edge just traversed can animate. */
export function buildEdges(nodes: GraphNode[], activeEdgeID: string | null): Edge[] {
	const byId = new Map(nodes.map((n) => [n.id, n]));
	const edges: Edge[] = [];

	for (const node of nodes) {
		for (const edge of node.outEdges) {
			const target = byId.get(edge.targetId);
			if (!target) continue;

			const active = edge.id === activeEdgeID;
			const closesLoop = node.type === 'panel' && target.type === 'subtopic';
			const inLoop = node.type === 'panel' || edge.label === 'to-start-panel';

			edges.push({
				id: edge.id,
				source: node.id,
				target: target.id,
				sourceHandle: sourceHandle(node, target, edge.label),
				targetHandle: targetHandle(node, target),
				// Panel-to-panel steps are obvious from the numbering; labelling
				// only the structural edges keeps the loop readable.
				label: edge.label === 'to-next-panel' ? undefined : edge.label,
				type: closesLoop ? 'smoothstep' : 'default',
				animated: active,
				markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
				class: [
					'cg-edge',
					inLoop ? 'cg-edge-loop' : 'cg-edge-spine',
					active ? 'cg-edge-active' : ''
				].join(' '),
				// Drop the return sweep below the panel row instead of through it.
				...(closesLoop ? { pathOptions: { offset: 64, borderRadius: 18 } } : {})
			});
		}
	}

	return edges;
}

// Handle ids are declared by the node components in ./nodes.

function sourceHandle(from: GraphNode, to: GraphNode, label: string | undefined): string {
	if (from.type === 'panel') return to.type === 'subtopic' ? 'loop-back' : 'out';
	if (from.type === 'subtopic') return label === 'to-start-panel' ? 'loop-start' : 'next';
	return 'next';
}

function targetHandle(from: GraphNode, to: GraphNode): string {
	// A subtopic is entered from the top by the spine, but from the right by
	// its own loop closing — same label on both edges, so go by the source.
	if (to.type === 'subtopic' && from.type === 'panel') return 'loop-end';
	return 'in';
}

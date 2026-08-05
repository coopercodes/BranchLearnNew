import type { GraphNode } from './types';

/**
 * Two structural facts the viewer wants to show:
 *  - the topic/subtopic spine is a DAG (no cycles),
 *  - every subtopic closes exactly one cycle through its panels.
 */

export interface TrainingLoop {
	subtopicID: string;
	panelIDs: string[];
	/** True when following the panels really does land back on the subtopic. */
	closed: boolean;
}

export interface GraphAnalysis {
	/** Topological order of the spine (topic + subtopics), empty entries if cyclic. */
	spineOrder: string[];
	spineAcyclic: boolean;
	loops: TrainingLoop[];
}

/** Kahn's algorithm over the spine only — panel edges are excluded on purpose. */
function spineTopoOrder(nodes: GraphNode[]): { order: string[]; acyclic: boolean } {
	const spine = nodes.filter((n) => n.type === 'topic' || n.type === 'subtopic');
	const inSpine = new Set(spine.map((n) => n.id));
	const indeg = new Map(spine.map((n) => [n.id, 0]));

	for (const node of spine) {
		for (const edge of node.outEdges) {
			if (inSpine.has(edge.targetId)) {
				indeg.set(edge.targetId, (indeg.get(edge.targetId) ?? 0) + 1);
			}
		}
	}

	const byId = new Map(spine.map((n) => [n.id, n]));
	const queue = spine.filter((n) => indeg.get(n.id) === 0).map((n) => n.id);
	const order: string[] = [];

	while (queue.length > 0) {
		const id = queue.shift()!;
		order.push(id);
		for (const edge of byId.get(id)!.outEdges) {
			if (!inSpine.has(edge.targetId)) continue;
			const remaining = (indeg.get(edge.targetId) ?? 0) - 1;
			indeg.set(edge.targetId, remaining);
			if (remaining === 0) queue.push(edge.targetId);
		}
	}

	return { order, acyclic: order.length === spine.length };
}

/**
 * Walks a subtopic's `to-start-panel` edge and then follows panels forward
 * until it lands back on the subtopic — i.e. proves the loop actually closes.
 */
export function findTrainingLoop(nodes: GraphNode[], subtopicID: string): TrainingLoop {
	const byId = new Map(nodes.map((n) => [n.id, n]));
	const subtopic = byId.get(subtopicID);
	const start = subtopic?.outEdges.find((e) => e.label === 'to-start-panel');
	const panelIDs: string[] = [];

	let cursor = start ? byId.get(start.targetId) : undefined;
	while (cursor && cursor.type === 'panel' && panelIDs.length < nodes.length) {
		panelIDs.push(cursor.id);
		const next = cursor.outEdges[0];
		if (!next) break;
		if (next.targetId === subtopicID) return { subtopicID, panelIDs, closed: true };
		cursor = byId.get(next.targetId);
	}

	return { subtopicID, panelIDs, closed: false };
}

export function analyzeGraph(nodes: GraphNode[]): GraphAnalysis {
	const { order, acyclic } = spineTopoOrder(nodes);
	const loops = nodes
		.filter((n) => n.type === 'subtopic')
		.map((n) => findTrainingLoop(nodes, n.id))
		.filter((loop) => loop.panelIDs.length > 0);

	return { spineOrder: order, spineAcyclic: acyclic, loops };
}

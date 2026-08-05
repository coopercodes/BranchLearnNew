import { ContentGraph } from './graph-content';
import type { GraphEdge, GraphNode } from './types';

/** Where a fresh game starts. */
export const ROOT_NODE_ID = 'topic:sohcahtoa';

/** The one piece of state: which node the learner is sitting on right now. */
export let currentNodeID = ROOT_NODE_ID;

/**
 * Move forward exactly one node. `chooseEdge` picks the way out when a node
 * offers more than one — that policy lives in the game state, not here.
 * Returns the new current node id (unchanged if there is nowhere to go).
 */
export function moveForward(
	chooseEdge: (node: GraphNode) => GraphEdge | undefined = (node) => node.outEdges[0]
): string {
	const node = ContentGraph.find((n) => n.id === currentNodeID);
	const nextEdge = node ? chooseEdge(node) : undefined;
	if (nextEdge) currentNodeID = nextEdge.targetId;
	return currentNodeID;
}

/** Put the cursor back where a saved game left it. */
export function resumeAt(nodeID: string) {
	if (ContentGraph.some((n) => n.id === nodeID)) currentNodeID = nodeID;
}

// Adjust this to your actual set of node types
export type GraphNodeType = 'topic' | 'subtopic' | 'panel' | 'content';

/** Reference to a connected node, by GraphNode id */
export interface GraphEdge {
	id: string; // edge id
	targetId: string; // the node this edge points to/from
	/** What the edge means, e.g. `to-subtopic`, `to-next-subtopic`, `to-start-panel`. */
	label?: string;
}

interface BaseGraphNode {
	/** Globally unique — game state is keyed by this. Format: `${sectionId}:${type}`. */
	id: string;
	title: string;
	/** Shown when a content panel is recommended. */
	summary?: string;
	outEdges: GraphEdge[];
	inEdges: GraphEdge[];
}

export interface TopicNode extends BaseGraphNode {
	type: 'topic';
}

export interface SubtopicNode extends BaseGraphNode {
	type: 'subtopic';
	topicID: string;
}

export interface PanelNode extends BaseGraphNode {
	type: 'panel';
	topicID: string;
	subtopicID: string;
	panelID: string;
	/** How many correct answers this panel needs before it counts as reinforced. */
	requiredCorrect: number;
}

// Any other node type (not topic/subtopic/panel) — has topicID + subtopicID per the comments
export interface OtherGraphNode extends BaseGraphNode {
	type: Exclude<GraphNodeType, 'topic' | 'subtopic' | 'panel'>;
	topicID: string;
	subtopicID: string;
}

export type GraphNode = TopicNode | SubtopicNode | PanelNode | OtherGraphNode;

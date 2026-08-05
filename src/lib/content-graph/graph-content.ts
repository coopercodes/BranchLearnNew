import type { GraphNode, PanelNode, SubtopicNode } from './types';

// Structure:
//
//   topic:sohcahtoa
//        │ (to-subtopic)
//        ▼
//   subtopic:soh ──(to-next-subtopic)──► subtopic:cah ──(to-next-subtopic)──► subtopic:toa
//
// The subtopic spine above is a DAG. Each subtopic then owns exactly one
// cycle — its training loop:
//
//   subtopic:soh ──(to-start-panel)──► panel:soh-1 ─► … ─► panel:soh-5
//        ▲                                                      │
//        └───────────────────(to-subtopic)──────────────────────┘
//
// Answering panels inside the loop is what moves the subtopic's ELO, so the
// walker keeps circling until the subtopic is mastered.

const topic: GraphNode = {
	id: 'topic:sohcahtoa',
	type: 'topic',
	title: 'SOH CAH TOA Triangles',
	summary: 'Overview of the SOH CAH TOA trigonometric ratios',
	outEdges: [
		{ id: 'topic:sohcahtoa->subtopic:soh', targetId: 'subtopic:soh', label: 'to-subtopic' }
	],
	inEdges: []
};

const soh: SubtopicNode = {
	id: 'subtopic:soh',
	type: 'subtopic',
	topicID: 'topic:sohcahtoa',
	title: 'SOH — Sine',
	summary: 'Placeholder: Sine = Opposite / Hypotenuse',
	outEdges: [
		{ id: 'subtopic:soh->subtopic:cah', targetId: 'subtopic:cah', label: 'to-next-subtopic' }
	],
	inEdges: [
		{ id: 'topic:sohcahtoa->subtopic:soh', targetId: 'topic:sohcahtoa', label: 'to-subtopic' }
	]
};

const cah: SubtopicNode = {
	id: 'subtopic:cah',
	type: 'subtopic',
	topicID: 'topic:sohcahtoa',
	title: 'CAH — Cosine',
	summary: 'Placeholder: Cosine = Adjacent / Hypotenuse',
	outEdges: [
		{ id: 'subtopic:cah->subtopic:toa', targetId: 'subtopic:toa', label: 'to-next-subtopic' }
	],
	inEdges: [
		{ id: 'subtopic:soh->subtopic:cah', targetId: 'subtopic:soh', label: 'to-next-subtopic' }
	]
};

const toa: SubtopicNode = {
	id: 'subtopic:toa',
	type: 'subtopic',
	topicID: 'topic:sohcahtoa',
	title: 'TOA — Tangent',
	summary: 'Placeholder: Tangent = Opposite / Adjacent',
	outEdges: [
		// last subtopic — no to-next-subtopic yet
	],
	inEdges: [
		{ id: 'subtopic:cah->subtopic:toa', targetId: 'subtopic:cah', label: 'to-next-subtopic' }
	]
};

/** One panel in a training loop. `requiredCorrect` is how often it must be answered right. */
interface PanelSpec {
	title: string;
	requiredCorrect: number;
}

/**
 * Builds a subtopic's training loop: `subtopic → panel 1 → … → panel n → subtopic`.
 * Wires both directions of every edge and hangs the loop off the subtopic.
 */
function trainingLoop(subtopic: SubtopicNode, specs: PanelSpec[]): PanelNode[] {
	const slug = subtopic.id.split(':')[1];
	const ids = specs.map((_, i) => `panel:${slug}-${i + 1}`);

	const panels: PanelNode[] = specs.map((spec, i) => ({
		id: ids[i],
		type: 'panel',
		topicID: subtopic.topicID,
		subtopicID: subtopic.id,
		panelID: `${slug}-${i + 1}`,
		title: spec.title,
		summary: `Practice ${i + 1} of ${specs.length} for ${subtopic.title}`,
		requiredCorrect: spec.requiredCorrect,
		outEdges: [],
		inEdges: []
	}));

	// Enter the loop before walking on to the next subtopic.
	const start = { id: `${subtopic.id}->${ids[0]}`, targetId: ids[0], label: 'to-start-panel' };
	subtopic.outEdges.unshift(start);
	panels[0].inEdges.push({ ...start, targetId: subtopic.id });

	for (let i = 0; i < panels.length - 1; i++) {
		const edge = { id: `${ids[i]}->${ids[i + 1]}`, targetId: ids[i + 1], label: 'to-next-panel' };
		panels[i].outEdges.push(edge);
		panels[i + 1].inEdges.push({ ...edge, targetId: ids[i] });
	}

	// Close the cycle.
	const last = panels[panels.length - 1];
	const close = { id: `${last.id}->${subtopic.id}`, targetId: subtopic.id, label: 'to-subtopic' };
	last.outEdges.push(close);
	subtopic.inEdges.push({ ...close, targetId: last.id });

	return panels;
}

// Recall-style panels only need a couple of hits; the ones that need real work
// have to be answered right more times before they count as reinforced.
const sohPanels = trainingLoop(soh, [
	{ title: 'Label the opposite side', requiredCorrect: 2 },
	{ title: 'Label the hypotenuse', requiredCorrect: 2 },
	{ title: 'Set up sin θ', requiredCorrect: 3 },
	{ title: 'Solve for a missing side', requiredCorrect: 4 },
	{ title: 'Solve for a missing angle', requiredCorrect: 4 }
]);

const cahPanels = trainingLoop(cah, [
	{ title: 'Label the adjacent side', requiredCorrect: 2 },
	{ title: 'Label the hypotenuse', requiredCorrect: 2 },
	{ title: 'Set up cos θ', requiredCorrect: 3 },
	{ title: 'Solve for a missing side', requiredCorrect: 4 },
	{ title: 'Solve for a missing angle', requiredCorrect: 4 }
]);

const toaPanels = trainingLoop(toa, [
	{ title: 'Label the opposite side', requiredCorrect: 2 },
	{ title: 'Label the adjacent side', requiredCorrect: 2 },
	{ title: 'Set up tan θ', requiredCorrect: 3 },
	{ title: 'Solve for a missing side', requiredCorrect: 4 },
	{ title: 'Solve for a missing angle', requiredCorrect: 4 }
]);

export const ContentGraph: GraphNode[] = [
	topic,
	soh,
	...sohPanels,
	cah,
	...cahPanels,
	toa,
	...toaPanels
];

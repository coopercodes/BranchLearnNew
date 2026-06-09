export type TopicStatus = 'done' | 'current' | 'locked';

export interface Topic {
	id: string;
	name: string;
	/** 0–100 mastery for this topic. */
	progress: number;
	status: TopicStatus;
}

/**
 * The learning path shown in the topic map. Reactive so progress can update
 * live as the student works. Mutate entries (don't reassign the array).
 */
export const topics = $state<Topic[]>([
	{ id: 'angles', name: 'Angles & Degrees', progress: 100, status: 'done' },
	{ id: 'right-tri', name: 'Right Triangles', progress: 100, status: 'done' },
	{ id: 'soh', name: 'SOH Triangles', progress: 55, status: 'current' },
	{ id: 'cah-toa', name: 'CAH & TOA', progress: 0, status: 'locked' },
	{ id: 'solve', name: 'Solving Triangles', progress: 0, status: 'locked' },
	{ id: 'unit-circle', name: 'The Unit Circle', progress: 0, status: 'locked' }
]);

/** The topic currently being tutored (falls back to the first). */
export function currentTopic(): Topic {
	return topics.find((t) => t.status === 'current') ?? topics[0];
}

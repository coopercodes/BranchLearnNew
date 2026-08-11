// stores/graph-store.svelte.ts

import type { EventBus } from '../events';

export type GraphNode = {
	id: string;
	label: string;
	unlocked: boolean;
	dependsOn: string[];
};

export class GraphStore {
	nodes = $state<Record<string, GraphNode>>({});

	unlockedIds = $derived(
		Object.values(this.nodes)
			.filter((n) => n.unlocked)
			.map((n) => n.id)
	);
	lockedCount = $derived(Object.values(this.nodes).filter((n) => !n.unlocked).length);

	#bus: EventBus;

	constructor(bus: EventBus) {
		this.#bus = bus;
		// Cross-store reaction: completing a question can unlock graph nodes
		bus.on('QUESTION_COMPLETED', ({ questionId, correct }) => {
			if (correct) this.#tryUnlockDependents(questionId);
		});
	}

	/* ---------------- public store functionality ---------------- */

	addNode(node: Omit<GraphNode, 'unlocked'> & { unlocked?: boolean }) {
		this.nodes[node.id] = { unlocked: false, ...node };
	}

	removeNode(id: string) {
		delete this.nodes[id];
	}

	getNode(id: string): GraphNode | undefined {
		return this.nodes[id];
	}

	/** A node is unlockable when every dependency is already unlocked. */
	isUnlockable(id: string): boolean {
		const node = this.nodes[id];
		if (!node || node.unlocked) return false;
		return node.dependsOn.every((dep) => this.nodes[dep]?.unlocked);
	}

	unlock(id: string) {
		const node = this.nodes[id];
		if (node && !node.unlocked) {
			node.unlocked = true;
			this.#bus.emit('NODE_UNLOCKED', { nodeId: id });
		}
	}

	reset() {
		for (const node of Object.values(this.nodes)) node.unlocked = false;
	}

	/* ---------------- serialization (save/load) ---------------- */

	toJSON() {
		return { nodes: $state.snapshot(this.nodes) };
	}

	load(data: ReturnType<GraphStore['toJSON']>) {
		this.nodes = data.nodes;
	}

	/* ---------------- private ---------------- */

	#tryUnlockDependents(completedId: string) {
		for (const node of Object.values(this.nodes)) {
			if (!node.unlocked && node.dependsOn.includes(completedId)) {
				this.unlock(node.id);
			}
		}
	}
}
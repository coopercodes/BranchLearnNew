// branch-context.svelte.ts — the one context that bundles everything

import { getContext, setContext } from 'svelte';
import { EventBus } from './events';
import { GameStore, UserStore, EventStore, GraphStore } from './stores';

const BRANCH_KEY = Symbol('branch-context');

export class BranchContext {
	readonly events: EventBus;
	readonly game: GameStore;
	readonly user: UserStore;
	readonly eventLog: EventStore;
	readonly graph: GraphStore;

	constructor() {
		this.events = new EventBus();
		// Order matters only if a store emits during construction; these don't.
		this.eventLog = new EventStore(this.events);
		this.game = new GameStore(this.events);
		this.user = new UserStore(this.events);
		this.graph = new GraphStore(this.events);
	}
}

/**
 * Call ONCE, at the top of your root component (+layout.svelte or App.svelte),
 * during component initialization.
 */
export function setBranchContext(): BranchContext {
	const ctx = new BranchContext();
	setContext(BRANCH_KEY, ctx);
	return ctx;
}

/**
 * Call from any descendant component's <script> block.
 */
export function getBranchContext(): BranchContext {
	const ctx = getContext<BranchContext>(BRANCH_KEY);
	if (!ctx) {
		throw new Error(
			'BranchContext not found — did you call setBranchContext() in a parent component?'
		);
	}
	return ctx;
}
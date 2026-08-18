// persistence.svelte.ts — localStorage backup for BranchContext
// (.svelte.ts extension required: this file uses $effect)

import { browser } from '$app/environment';
import type { BranchContext } from './BranchContext.svelte';

const DEFAULT_KEY = 'branch-context';
const VERSION = 1;

type Snapshot = {
	version: number;
	game: ReturnType<BranchContext['game']['toJSON']>;
	user: ReturnType<BranchContext['user']['toJSON']>;
	graph: ReturnType<BranchContext['graph']['toJSON']>;
};

/**
 * Hydrates the context from localStorage, then keeps localStorage in sync
 * whenever persisted state changes (debounced).
 *
 * Call ONCE during root component initialization, right after setBranchContext():
 *
 *   const ctx = setBranchContext();
 *   persistBranchContext(ctx);
 *
 * Returns a dispose function (rarely needed — the root layout lives as long
 * as the app).
 */
export function persistBranchContext(ctx: BranchContext, key = DEFAULT_KEY): () => void {
	// SSR guard: on the server there is no (usable) localStorage; do nothing.
	// (Recent Node versions expose a non-functional localStorage global, so
	// checking `typeof localStorage` is not enough.)
	if (!browser) return () => {};

	/* ---------- 1. Load existing backup ---------- */
	const raw = localStorage.getItem(key);
	if (raw) {
		try {
			const data = JSON.parse(raw) as Snapshot;
			if (data.version === VERSION) {
				ctx.game.load(data.game);
				ctx.user.load(data.user);
				ctx.graph.load(data.graph);
			}
			// version mismatch: ignore (or add migration logic here)
		} catch (err) {
			console.warn('[branch] Failed to restore backup, starting fresh.', err);
		}
	}

	/* ---------- 2. Save on every change, debounced ---------- */
	let timeout: ReturnType<typeof setTimeout> | undefined;

	const dispose = $effect.root(() => {
		$effect(() => {
			// Reading state synchronously here is what registers the
			// dependencies — the effect reruns whenever any of it changes.
			const snapshot: Snapshot = {
				version: VERSION,
				game: ctx.game.toJSON(),
				user: ctx.user.toJSON(),
				graph: ctx.graph.toJSON()
			};
			const serialized = JSON.stringify(snapshot);

			// Debounce the actual write; rapid-fire changes cost one write.
			clearTimeout(timeout);
			timeout = setTimeout(() => localStorage.setItem(key, serialized), 300);
		});
	});

	return () => {
		clearTimeout(timeout);
		dispose();
	};
}

/** Wipe the backup (e.g. from a dev tool or a "reset progress" button). */
export function clearBranchBackup(key = DEFAULT_KEY) {
	if (browser) localStorage.removeItem(key);
}
// resetAll.ts — wipe every piece of client state back to its regular values,
// including the persisted localStorage backups.

import type { BranchContext } from './BranchContext.svelte';
import { clearBranchBackup } from './Persistence.svelte';
import { trigSession } from '$lib/trig/session.svelte';
import { userProgress } from '$lib/progress/userProgress.svelte';
import { algoGame } from '$lib/algo/gameState.svelte';
import { game as contentGraphGame } from '$lib/content-graph/gameState.svelte';

export function completelyClearAllStates(ctx: BranchContext) {
	// Context-backed stores (persisted together under 'branch-context')
	ctx.user.reset();
	ctx.game.reset();
	ctx.graph.reset();
	ctx.eventLog.reset();
	clearBranchBackup();

	// Standalone singletons with their own localStorage keys
	trigSession.reset();
	userProgress.reset();
	algoGame.reset();
	contentGraphGame.reset();
}

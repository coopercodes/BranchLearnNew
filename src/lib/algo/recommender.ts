/**
 * The recommendation algorithm.
 *
 * Within the active section (first one not mastered):
 *   1. The article comes first — no questions until the content is read.
 *   2. Then practice panels, prioritized by how far they are from their
 *      required correct count (furthest first) so effort spreads across
 *      types instead of grinding one panel. Ties break by fewest attempts.
 *   3. The final panel only unlocks once every other panel is complete.
 */

import type { AlgoGameState } from './gameState.svelte';
import { REQUIRED_CORRECT, type AlgoPanel, type AlgoSection } from './types';

export function recommendNext(sections: AlgoSection[], game: AlgoGameState): AlgoPanel | null {
	const section = game.activeSection(sections);
	if (!section) return null;

	const article = section.panels.find((p) => p.type === 'article');
	if (article && !game.isPanelComplete(article)) return article;

	const practice = section.panels.filter(
		(p) => p.type !== 'article' && p.type !== 'final' && !game.isPanelComplete(p)
	);
	if (practice.length > 0) {
		return practice.reduce((best, p) => (score(p, game) > score(best, game) ? p : best));
	}

	return section.panels.find((p) => p.type === 'final' && !game.isPanelComplete(p)) ?? null;
}

/** Higher = more urgent. Remaining correct answers needed, minus attempt fatigue. */
function score(panel: AlgoPanel, game: AlgoGameState): number {
	const stats = game.stats(panel.id);
	const remaining = REQUIRED_CORRECT[panel.type] - stats.correct;
	const attempts = stats.correct + stats.incorrect;
	return remaining - attempts * 0.01;
}

/**
 * The recommendation engine — ported straight from /algo, now driving a real
 * learner instead of a simulation.
 *
 * Within the active section:
 *   1. The article comes first — no questions until the content is read.
 *   2. Then practice panels, prioritized by how far each is from its required
 *      correct count (furthest first) so effort spreads across TYPES instead of
 *      grinding one panel. Ties break by fewest attempts.
 *   3. The Final panel only unlocks once every other panel is complete.
 *
 * This is the one place sequencing lives; content, session, and UI stay dumb.
 */

import type { TrigSession } from './session.svelte';
import { REQUIRED_CORRECT, type TrigPanel, type TrigQuestion, type TrigSection } from './types';

/** Tunables for the strategy — kept as data so experiments are a config change. */
export interface RecommenderConfig {
	/** Weight applied to attempt fatigue when scoring practice panels. */
	attemptPenalty: number;
}

export const defaultConfig: RecommenderConfig = {
	attemptPenalty: 0.01
};

/** Recommend the next panel to show in a section, or null if the section is done. */
export function recommendPanel(
	section: TrigSection,
	session: TrigSession,
	config: RecommenderConfig = defaultConfig
): TrigPanel | null {
	const article = section.panels.find((p) => p.type === 'article');
	if (article && !session.isPanelComplete(article)) return article;

	const practice = section.panels.filter(
		(p) => p.type !== 'article' && p.type !== 'final' && !session.isPanelComplete(p)
	);
	if (practice.length > 0) {
		return practice.reduce((best, p) =>
			score(p, session, config) > score(best, session, config) ? p : best
		);
	}

	return section.panels.find((p) => p.type === 'final' && !session.isPanelComplete(p)) ?? null;
}

/** Higher = more urgent. Remaining correct answers needed, minus attempt fatigue. */
function score(panel: TrigPanel, session: TrigSession, config: RecommenderConfig): number {
	const stats = session.panelStats(panel);
	const remaining = REQUIRED_CORRECT[panel.type] - stats.correct;
	const attempts = stats.correct + stats.incorrect;
	return remaining - attempts * config.attemptPenalty;
}

/**
 * Within a recommended panel, pick the question to show. Prefer the first
 * question the learner hasn't solved yet. If every question is solved but the
 * panel still needs clean corrects, re-serve one whose solve didn't count
 * (wrong-then-right) so the learner can earn a clean pass. Null for content
 * panels (no questions).
 */
export function pickQuestion(panel: TrigPanel, session: TrigSession): TrigQuestion | null {
	const unsolved = panel.questions.find((question) => !session.isSolved(question.id));
	if (unsolved) return unsolved;
	return panel.questions.find((question) => !session.countsCorrect(question.id)) ?? null;
}

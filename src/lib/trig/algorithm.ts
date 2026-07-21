/**
 * Flow transitions — turns the recommender's panel picks into positions the
 * renderer can draw, and moves the learner forward one satisfied panel at a
 * time.
 *
 * Shape per section:
 *   Section Start → (recommended panels, cycling by type) → Section Complete
 * and once every section is complete, the Course Complete panel.
 */

import { findPanel, findSection } from './content';
import { pickQuestion, recommendPanel } from './recommender';
import type { TrigSession } from './session.svelte';
import { isContentPanel, positionKey, type FlowPanel, type Position, type TrigSection } from './types';

/** Where a fresh learner starts: the intro of the first section. */
export function initialPosition(sections: TrigSection[]): Position {
	return { kind: 'section-start', sectionId: sections[0].id };
}

/**
 * Given the current position and progress, resolve the next position. The
 * caller gates this behind "current panel satisfied" (question answered, or
 * intro/outro/article acknowledged).
 */
export function nextPosition(
	sections: TrigSection[],
	session: TrigSession,
	current: Position
): Position {
	if (current.kind === 'course-complete') return current;

	const section = findSection(current.sectionId) ?? sections[0];

	// From the intro or a just-satisfied panel: ask the recommender for the next
	// panel, or close the section out if none remain.
	if (current.kind === 'section-start' || current.kind === 'panel') {
		const panel = recommendPanel(section, session);
		if (panel) {
			const question = isContentPanel(panel.type) ? null : pickQuestion(panel, session);
			return {
				kind: 'panel',
				sectionId: section.id,
				panelId: panel.id,
				questionId: question?.id ?? null
			};
		}
		return { kind: 'section-complete', sectionId: section.id };
	}

	// Section wrap-up: advance to the next section, or finish the course.
	const index = sections.findIndex((s) => s.id === section.id);
	const nextSection = sections[index + 1];
	return nextSection
		? { kind: 'section-start', sectionId: nextSection.id }
		: { kind: 'course-complete' };
}

/** Resolve a saved position into the concrete panel to render. */
export function resolvePanel(
	sections: TrigSection[],
	session: TrigSession,
	pos: Position | null
): FlowPanel {
	const position = pos ?? initialPosition(sections);

	if (position.kind === 'course-complete') {
		return { kind: 'course-complete', key: positionKey(position) };
	}

	const section = findSection(position.sectionId) ?? sections[0];

	if (position.kind === 'section-start') {
		return { kind: 'section-start', key: positionKey(position), section };
	}

	if (position.kind === 'section-complete') {
		return { kind: 'section-complete', key: positionKey(position), section };
	}

	// A panel position. Self-heal a stale/complete panel by re-recommending.
	let panel = findPanel(position.panelId);
	if (!panel || session.isPanelComplete(panel)) {
		panel = recommendPanel(section, session) ?? section.panels[0];
	}

	const question = isContentPanel(panel.type)
		? null
		: (panel.questions.find((q) => q.id === position.questionId) ??
			pickQuestion(panel, session) ??
			panel.questions[0] ??
			null);

	// Include the attempt in the key so a re-served question (new attempt)
	// remounts the panel with a clean slate instead of the previous responses.
	const attempt = question ? session.attemptOf(question.id) : 0;
	return {
		kind: 'panel',
		key: `${positionKey({
			kind: 'panel',
			sectionId: section.id,
			panelId: panel.id,
			questionId: question?.id ?? null
		})}:a${attempt}`,
		section,
		panel,
		question
	};
}

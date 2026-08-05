/**
 * Serialize the current panel into prompt context for Leaf, so the tutor always
 * knows what the learner is looking at. The correct answer is flagged for Leaf's
 * reference only — never to be read out.
 */

import type { Panel } from './panels';

export function describePanelForLeaf(panel: Panel): string {
	if (panel.type === 'reading') {
		return [
			`The learner is reading about "${panel.title}" (${panel.topic}).`,
			panel.formula ? `Formula: ${panel.formula}` : '',
			...(panel.body ?? [])
		]
			.filter(Boolean)
			.join('\n');
	}

	if (panel.type === 'done') {
		return 'The learner has reached the end of the SOH · CAH · TOA course.';
	}

	const options = (panel.options ?? [])
		.map((o) => `${o.label}) ${o.text}${o.label === panel.answer ? ' [correct]' : ''}`)
		.join(' ');
	return [
		`The learner is on a question in the "${panel.topic}" topic.`,
		`Question: ${panel.prompt ?? panel.title}`,
		`Options: ${options}`,
		'The correct option is marked for YOUR reference only — never state it outright; guide the learner toward it step by step.'
	].join('\n');
}

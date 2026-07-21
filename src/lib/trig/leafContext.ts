/**
 * Serialize the current flow panel into prompt context for Leaf, so the tutor
 * always knows what the learner is looking at. Correct answers are flagged for
 * Leaf's reference only — never to be read out.
 */

import { isContentPanel, PANEL_TYPE_LABELS, type FlowPanel } from './types';

export function describePanelForLeaf(panel: FlowPanel): string {
	if (panel.kind === 'section-start') {
		return [
			`The learner is starting the "${panel.section.title}" section (${panel.section.label}).`,
			`Formula: ${panel.section.formula}`,
			`Overview: ${panel.section.overview}`
		].join('\n');
	}

	if (panel.kind === 'section-complete') {
		return `The learner just finished the "${panel.section.title}" section (${panel.section.label}). They are on the completion screen.`;
	}

	if (panel.kind === 'course-complete') {
		return 'The learner has completed the whole SOH · CAH · TOA course.';
	}

	const { section, panel: p, question } = panel;

	if (isContentPanel(p.type) || !question) {
		return [
			`The learner is reading the ${PANEL_TYPE_LABELS.article} for the "${section.title}" section (${section.label}).`,
			`Formula: ${section.formula}`,
			...(p.body ?? [])
		].join('\n');
	}

	const options = question.options
		.map((o) => `${o.label}) ${o.text}${o.label === question.correctAnswer ? ' [correct]' : ''}`)
		.join(' ');
	return [
		`The learner is on a ${PANEL_TYPE_LABELS[p.type]} panel in the "${section.title}" section (${section.label}).`,
		`Question: ${question.prompt}`,
		`Options: ${options}`,
		'The correct option is marked for YOUR reference only — never state it outright; guide the learner toward it step by step.'
	].join('\n');
}

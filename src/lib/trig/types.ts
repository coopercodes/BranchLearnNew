/**
 * Shapes for the algorithm-driven Trigonometry flow.
 *
 * This mirrors the /algo recommendation model, but for a *real* learner
 * instead of a simulation. A course is a list of {@link TrigSection}s
 * (SOH, CAH, TOA); each section owns one panel of every {@link TrigPanelType}.
 * The recommender keeps cycling the learner through a section's panels —
 * spreading practice across types — until each panel's required-correct count
 * is met, then unlocks the section's Final.
 *
 * The panel-type taxonomy (types, required counts, ordering, labels) is shared
 * with /algo so the two stay in lock-step. Ordering lives entirely in
 * recommender.ts + flow.ts; content and UI stay dumb about sequencing.
 */

import {
	isContentPanel,
	PANEL_TYPE_LABELS,
	PANEL_TYPE_ORDER,
	REQUIRED_CORRECT,
	type AlgoPanelType
} from '$lib/algo/types';

/** The panel types the recommender cycles through — reused from /algo. */
export type TrigPanelType = AlgoPanelType;

export { isContentPanel, PANEL_TYPE_LABELS, PANEL_TYPE_ORDER, REQUIRED_CORRECT };

/** Globally unique panel id from a section id + type. Format: `${sectionId}:${type}`. */
export function panelId(sectionId: string, type: TrigPanelType): string {
	return `${sectionId}:${type}`;
}

export interface TrigOption {
	/** Stable identifier for the option, e.g. 'A'. Progress is keyed by it. */
	label: string;
	text: string;
}

/** A single multiple-choice question. Every gradeable panel draws from a pool. */
export interface TrigQuestion {
	/** Globally unique. Session progress is keyed by this. */
	id: string;
	prompt: string;
	options: TrigOption[];
	/** The `label` of the correct option. */
	correctAnswer: string;
	/** Optional one-liner shown under the prompt for a little scaffolding. */
	hint?: string;
}

/**
 * One panel within a section — an article to read, or a pool of questions of a
 * given type. Content panels (articles) complete on read; gradeable panels
 * complete once REQUIRED_CORRECT[type] of their questions are answered right.
 */
export interface TrigPanel {
	/** Globally unique. Format: `${sectionId}:${type}`. */
	id: string;
	sectionId: string;
	type: TrigPanelType;
	title: string;
	/** Pool the flow draws questions from. Empty for content panels. */
	questions: TrigQuestion[];
	/** Article body paragraphs — present only on content panels. */
	body?: string[];
}

/** One topic in the course — e.g. "SOH". Owns one panel of every type. */
export interface TrigSection {
	/** Stable id, e.g. 'soh'. */
	id: string;
	/** Short badge shown in the topic-map ring and node graph, e.g. 'SOH'. */
	label: string;
	/** Full human title, e.g. 'Sine — Opposite over Hypotenuse'. */
	title: string;
	/** The umbrella topic these sections belong to, e.g. 'SOH · CAH · TOA'. */
	group: string;
	/** The formula the section teaches, shown on the intro panel + node graph. */
	formula: string;
	/** A short welcome/overview shown on the Section Start panel. */
	overview: string;
	panels: TrigPanel[];
}

/**
 * A step in the flow. The renderer draws it; the flow resolves it from a
 * {@link Position}. Discriminated on `kind`.
 */
export type FlowPanel =
	| { kind: 'section-start'; key: string; section: TrigSection }
	| {
			kind: 'panel';
			key: string;
			section: TrigSection;
			panel: TrigPanel;
			/** The specific question to show — null for a content panel. */
			question: TrigQuestion | null;
	  }
	| { kind: 'section-complete'; key: string; section: TrigSection }
	| { kind: 'course-complete'; key: string };

/**
 * A saved position — the minimum needed to know which panel to show. Persisted;
 * everything else (which panel to recommend next, section completion) the
 * recommender derives from question progress.
 */
export type Position =
	| { kind: 'section-start'; sectionId: string }
	| { kind: 'panel'; sectionId: string; panelId: string; questionId: string | null }
	| { kind: 'section-complete'; sectionId: string }
	| { kind: 'course-complete' };

/** Stable string identity for a position — used to key panel transitions. */
export function positionKey(pos: Position): string {
	switch (pos.kind) {
		case 'section-start':
			return `start:${pos.sectionId}`;
		case 'panel':
			return `panel:${pos.panelId}:${pos.questionId ?? 'content'}`;
		case 'section-complete':
			return `end:${pos.sectionId}`;
		case 'course-complete':
			return 'course-complete';
	}
}

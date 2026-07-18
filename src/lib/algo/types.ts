/**
 * Shared shapes for the /algo recommendation engine.
 *
 * A course of study is split into sections (SOH, CAH, TOA). Each section owns
 * one panel of every type, and the algorithm keeps recommending panels until
 * the learner has hit each type's required correct count — content panels
 * (articles) just need to be read once. The final panel only unlocks once
 * everything else in the section is complete.
 */

export type SectionId = 'soh' | 'cah' | 'toa';

export type AlgoPanelType =
	| 'article'
	| 'multiple-choice'
	| 'fill-blank'
	| 'lightning-round'
	| 'triangle-long-answer'
	| 'flashcards'
	| 'final';

/** Correct responses needed before a panel counts as mastered. */
export const REQUIRED_CORRECT: Record<AlgoPanelType, number> = {
	article: 1,
	'multiple-choice': 2,
	'fill-blank': 2,
	'lightning-round': 1,
	'triangle-long-answer': 2,
	flashcards: 1,
	final: 1
};

/** Human labels, used by the node viz and dev tools. */
export const PANEL_TYPE_LABELS: Record<AlgoPanelType, string> = {
	article: 'Article',
	'multiple-choice': 'Multiple Choice',
	'fill-blank': 'Fill in the Blank',
	'lightning-round': 'Lightning Round',
	'triangle-long-answer': 'Triangle Long Answer',
	flashcards: 'Flashcards Stack',
	final: 'Final'
};

/** Panel types that are pure content — reading them once completes them. */
export function isContentPanel(type: AlgoPanelType): boolean {
	return type === 'article';
}

/** The fixed order panels appear in, both in data and in the visualization. */
export const PANEL_TYPE_ORDER: readonly AlgoPanelType[] = [
	'article',
	'multiple-choice',
	'fill-blank',
	'lightning-round',
	'triangle-long-answer',
	'flashcards',
	'final'
];

export interface AlgoQuestion {
	prompt: string;
	answer: string;
}

export interface AlgoPanel {
	/** Globally unique — game state is keyed by this. Format: `${sectionId}:${type}`. */
	id: string;
	sectionId: SectionId;
	type: AlgoPanelType;
	title: string;
	/** Pool the simulator draws from on each attempt. Empty for content panels. */
	questions: AlgoQuestion[];
	/** Shown when a content panel is recommended. */
	summary?: string;
}

export interface AlgoSection {
	id: SectionId;
	title: string;
	formula: string;
	description: string;
	panels: AlgoPanel[];
}

/** The simulated learner being walked through the algorithm. */
export interface AlgoUser {
	id: string;
	name: string;
	goal: string;
}

export function panelId(sectionId: SectionId, type: AlgoPanelType): string {
	return `${sectionId}:${type}`;
}

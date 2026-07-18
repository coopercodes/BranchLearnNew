/**
 * The simulated learner. Their chance of answering correctly follows an
 * exponential learning curve: it starts low, climbs with every graded attempt
 * in the current section, and gets a head start for each section already
 * mastered (skills transfer — CAH is easier once SOH is down).
 */

import type { AlgoPanel, AlgoQuestion } from './types';

const CEILING = 0.95;
const BASE_CHANCE = 0.35;
/** Extra starting chance per previously completed section. */
const TRANSFER_BONUS = 0.12;
/** Attempts needed to close ~63% of the gap to the ceiling. */
const LEARNING_RATE = 5;

/**
 * `aptitude` weights the whole curve: ×0.5 simulates a struggling student,
 * ×1 the default learner, ×1.5 a strong one. Clamped so no learner is ever
 * a sure thing in either direction.
 */
export function correctChance(
	sectionAttempts: number,
	completedSections: number,
	aptitude = 1
): number {
	const base = Math.min(CEILING, BASE_CHANCE + TRANSFER_BONUS * completedSections);
	const curve = base + (CEILING - base) * (1 - Math.exp(-sectionAttempts / LEARNING_RATE));
	return Math.min(0.98, Math.max(0.02, curve * aptitude));
}

/** Roll the dice: does the simulated learner get this one right? */
export function rollResponse(chance: number): boolean {
	return Math.random() < chance;
}

/** Pick which question from the panel's pool the learner faces this attempt. */
export function pickQuestionIndex(panel: AlgoPanel): number {
	return panel.questions.length === 0 ? 0 : Math.floor(Math.random() * panel.questions.length);
}

export function questionAt(panel: AlgoPanel, index: number): AlgoQuestion | undefined {
	return panel.questions[index];
}

// stores/game-store.svelte.ts

import type { EventBus, BranchEvents } from '../events';

export class GameStore {
	score = $state(0);
	streak = $state(0);
	bestStreak = $state(0);
	completedQuestions = $state<string[]>([]);

	// Derived state — always in sync, never manually updated
	level = $derived(Math.floor(this.score / 100) + 1);
	questionsAnswered = $derived(this.completedQuestions.length);
	progressToNextLevel = $derived((this.score % 100) / 100);

	#bus: EventBus;

	constructor(bus: EventBus) {
		this.#bus = bus;
		bus.on('QUESTION_COMPLETED', (p) => this.#handleQuestionCompleted(p));
		bus.on('USER_LOGGED_OUT', () => this.reset());
	}

	/* ---------------- event reactions (private) ---------------- */

	#handleQuestionCompleted(p: BranchEvents['QUESTION_COMPLETED']) {
		if (this.hasCompleted(p.questionId)) return; // no double credit
		this.completedQuestions.push(p.questionId);

		if (p.correct) {
			this.streak += 1;
			this.bestStreak = Math.max(this.bestStreak, this.streak);
			this.addPoints(p.points * (1 + this.streak * 0.1)); // streak bonus
		} else {
			this.streak = 0;
		}
	}

	/* ---------------- public store functionality ---------------- */

	addPoints(amount: number) {
		this.score += Math.round(amount);
	}

	hasCompleted(questionId: string): boolean {
		return this.completedQuestions.includes(questionId);
	}

	/**
	 * Convenience action: components can call this instead of emitting the
	 * event themselves. The store still updates via its own event handler,
	 * so all other listeners (GraphStore, EventStore, …) stay informed.
	 */
	completeQuestion(questionId: string, correct: boolean, points = 10) {
		this.#bus.emit('QUESTION_COMPLETED', { questionId, correct, points });
	}

	reset() {
		this.score = 0;
		this.streak = 0;
		this.bestStreak = 0;
		this.completedQuestions = [];
	}

	/* ---------------- serialization (save/load) ---------------- */

	toJSON() {
		return {
			score: this.score,
			streak: this.streak,
			bestStreak: this.bestStreak,
			completedQuestions: [...this.completedQuestions]
		};
	}

	load(data: ReturnType<GameStore['toJSON']>) {
		this.score = data.score;
		this.streak = data.streak;
		this.bestStreak = data.bestStreak;
		this.completedQuestions = data.completedQuestions;
	}
}
/** A single question's answer history within a panel. */
export interface QuestionResponse {
	questionId: string;
	/** The option label currently selected (the one that ended in "correct", once found). */
	selected: string | null;
	/** Every wrong option label the learner has tried, in order, duplicates excluded. */
	incorrectAnswers: string[];
	correct: boolean;
	/** Timestamp of the moment the correct answer was chosen. */
	answeredAt: number | null;
}

function emptyResponse(questionId: string): QuestionResponse {
	return { questionId, selected: null, incorrectAnswers: [], correct: false, answeredAt: null };
}

/**
 * Tracks every answer a learner gives across the questions in one panel:
 * which option they landed on, every wrong guess along the way, and how
 * long the whole panel has taken. One instance per panel — pass it down to
 * each MultipleChoiceQuestion.
 */
export class ResponsesState {
	responses = $state<Record<string, QuestionResponse>>({});
	/** How many questions the current panel has — set by the panel so other UI (e.g. the OS bar) can show progress. */
	totalQuestions = $state(0);
	readonly startedAt = Date.now();
	#now = $state(Date.now());
	#timer = setInterval(() => (this.#now = Date.now()), 1000);

	get(questionId: string): QuestionResponse {
		return this.responses[questionId] ?? emptyResponse(questionId);
	}

	/** Record a click on `label` for `questionId`; grades it against `correctAnswer`. */
	answer(questionId: string, label: string, correctAnswer: string) {
		const current = this.responses[questionId] ?? emptyResponse(questionId);
		if (current.correct) return;

		if (label === correctAnswer) {
			current.selected = label;
			current.correct = true;
			current.answeredAt = Date.now();
		} else if (!current.incorrectAnswers.includes(label)) {
			current.incorrectAnswers = [...current.incorrectAnswers, label];
		}
		this.responses[questionId] = current;
	}

	/** How many questions have been solved so far. */
	get answeredCount() {
		return Object.values(this.responses).filter((r) => r.correct).length;
	}

	/** Total wrong guesses across every question in the panel. */
	get incorrectCount() {
		return Object.values(this.responses).reduce((sum, r) => sum + r.incorrectAnswers.length, 0);
	}

	/** Milliseconds since this panel was opened, ticking live. */
	get totalTimeMs() {
		return this.#now - this.startedAt;
	}

	/** Stop the internal clock — call from the owning component's onDestroy. */
	destroy() {
		clearInterval(this.#timer);
	}
}

/** Shared instance for the current panel — the OS bar reads this to show live progress. */
export const responses = new ResponsesState();

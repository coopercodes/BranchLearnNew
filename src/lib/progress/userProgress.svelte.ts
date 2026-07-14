import { browser } from '$app/environment';
import type { Course, Lesson, LightningRoundPanel, Panel } from '$lib/content/types';

/** Everything recorded about one question, across every attempt. */
export interface StoredAnswer {
	questionId: string;
	/** The option label the learner ended on (the correct one, or their single lightning pick). */
	selected: string | null;
	/** Every wrong option label tried, in order, duplicates excluded. */
	incorrectAnswers: string[];
	correct: boolean;
	/** True once the question can no longer be answered (solved, or lightning attempt spent). */
	locked: boolean;
	/** Timestamp of the click that locked the question. */
	answeredAt: number | null;
}

export interface PanelProgress {
	answers: Record<string, StoredAnswer>;
	startedAt: number | null;
	completedAt: number | null;
}

/** Where the learner currently is inside a course. */
export interface Position {
	lessonId: string;
	panelIndex: number;
}

interface ProgressData {
	panels: Record<string, PanelProgress>;
	position: Position | null;
	lastActiveAt: number | null;
}

const STORAGE_KEY = 'branchlearn:user-progress:v1';

function emptyData(): ProgressData {
	return { panels: {}, position: null, lastActiveAt: null };
}

function emptyAnswer(questionId: string): StoredAnswer {
	return {
		questionId,
		selected: null,
		incorrectAnswers: [],
		correct: false,
		locked: false,
		answeredAt: null
	};
}

function loadData(): ProgressData {
	if (!browser) return emptyData();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? { ...emptyData(), ...JSON.parse(raw) } : emptyData();
	} catch {
		return emptyData();
	}
}

/**
 * The learner's persistent progress: every answer they have clicked, per-panel
 * completion, and where they left off. A reactive singleton — components read
 * it directly and it re-renders them as answers land. Every mutation goes
 * through a method here, which also syncs the whole record to localStorage.
 *
 * Grading lives here too: record methods take the content `Panel`, so callers
 * can never pass a mismatched correct answer.
 */
export class UserProgress {
	#data = $state<ProgressData>(loadData());

	get position(): Position | null {
		return this.#data.position;
	}

	get lastActiveAt(): number | null {
		return this.#data.lastActiveAt;
	}

	/** The stored record for a question — an untouched default if never answered. */
	answer(panelId: string, questionId: string): StoredAnswer {
		return this.#data.panels[panelId]?.answers[questionId] ?? emptyAnswer(questionId);
	}

	panel(panelId: string): PanelProgress {
		return this.#data.panels[panelId] ?? { answers: {}, startedAt: null, completedAt: null };
	}

	isComplete(panel: Panel): boolean {
		return this.panel(panel.id).completedAt !== null;
	}

	/** How many of a panel's questions were answered correctly. */
	correctCount(panel: Panel): number {
		return panel.questions.filter((q) => this.answer(panel.id, q.id).correct).length;
	}

	/**
	 * How many of a panel's questions are settled (locked). For multiple-choice
	 * that means solved; for lightning rounds it means the attempt was spent.
	 * This is what the OS bar counts down from.
	 */
	settledCount(panel: Panel): number {
		return panel.questions.filter((q) => this.answer(panel.id, q.id).locked).length;
	}

	/** Total wrong guesses across a panel. */
	incorrectCount(panel: Panel): number {
		return panel.questions.reduce(
			(sum, q) => sum + this.answer(panel.id, q.id).incorrectAnswers.length,
			0
		);
	}

	/** 0–100: share of a lesson's questions answered correctly. */
	lessonPercent(lesson: Lesson): number {
		const questions = lesson.panels.flatMap((p) => p.questions.map((q) => ({ panelId: p.id, q })));
		if (questions.length === 0) return 0;
		const correct = questions.filter(({ panelId, q }) => this.answer(panelId, q.id).correct).length;
		return Math.round((correct / questions.length) * 100);
	}

	coursePercent(course: Course): number {
		const questions = course.lessons.flatMap((l) =>
			l.panels.flatMap((p) => p.questions.map((q) => ({ panelId: p.id, q })))
		);
		if (questions.length === 0) return 0;
		const correct = questions.filter(({ panelId, q }) => this.answer(panelId, q.id).correct).length;
		return Math.round((correct / questions.length) * 100);
	}

	/** Mark a panel as opened (records startedAt the first time only). */
	beginPanel(panelId: string) {
		const panel = this.#ownPanel(panelId);
		if (panel.startedAt === null) {
			panel.startedAt = Date.now();
			this.#save();
		}
	}

	/**
	 * Untimed multiple-choice click: wrong answers accumulate, the question
	 * locks once the correct option is found.
	 */
	recordAttempt(panel: Panel, questionId: string, label: string) {
		const record = this.#ownAnswer(panel.id, questionId);
		if (record.locked) return;

		if (label === this.#correctAnswerFor(panel, questionId)) {
			record.selected = label;
			record.correct = true;
			record.locked = true;
			record.answeredAt = Date.now();
		} else if (!record.incorrectAnswers.includes(label)) {
			record.incorrectAnswers.push(label);
		}
		this.#finish(panel);
	}

	/**
	 * Lightning-round click: one attempt only, right or wrong. `label: null`
	 * records a timeout (the countdown ran out before a pick).
	 */
	recordLightning(panel: LightningRoundPanel, questionId: string, label: string | null) {
		const record = this.#ownAnswer(panel.id, questionId);
		if (record.locked) return;

		record.selected = label;
		record.correct = label !== null && label === this.#correctAnswerFor(panel, questionId);
		if (label !== null && !record.correct) record.incorrectAnswers.push(label);
		record.locked = true;
		record.answeredAt = Date.now();
		this.#finish(panel);
	}

	/**
	 * Mark a panel with no gradeable questions complete (e.g. a leaf-question
	 * panel, done once the student sends their first message to Leaf).
	 */
	completePanel(panelId: string) {
		const progress = this.#ownPanel(panelId);
		if (progress.completedAt === null) {
			progress.completedAt = Date.now();
			this.#save();
		}
	}

	setPosition(lessonId: string, panelIndex: number) {
		const { position } = this.#data;
		if (position?.lessonId === lessonId && position.panelIndex === panelIndex) return;
		this.#data.position = { lessonId, panelIndex };
		this.#save();
	}

	/** Wipe one panel's answers so it can be replayed (e.g. retry a lightning round). */
	resetPanel(panelId: string) {
		delete this.#data.panels[panelId];
		this.#save();
	}

	/** Wipe everything — answers, completion, and position. */
	reset() {
		this.#data = emptyData();
		if (browser) localStorage.removeItem(STORAGE_KEY);
	}

	#ownPanel(panelId: string): PanelProgress {
		return (this.#data.panels[panelId] ??= { answers: {}, startedAt: null, completedAt: null });
	}

	#ownAnswer(panelId: string, questionId: string): StoredAnswer {
		const panel = this.#ownPanel(panelId);
		return (panel.answers[questionId] ??= emptyAnswer(questionId));
	}

	#correctAnswerFor(panel: Panel, questionId: string): string {
		return panel.questions.find((q) => q.id === questionId)?.correctAnswer ?? '';
	}

	/** After any answer: stamp completion when the panel's exit condition is met, then persist. */
	#finish(panel: Panel) {
		const progress = this.#ownPanel(panel.id);
		if (progress.completedAt === null) {
			const done =
				panel.type === 'multiple-choice'
					? panel.questions.every((q) => progress.answers[q.id]?.correct)
					: panel.questions.every((q) => progress.answers[q.id]?.locked);
			if (done) progress.completedAt = Date.now();
		}
		this.#save();
	}

	#save() {
		this.#data.lastActiveAt = Date.now();
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify($state.snapshot(this.#data)));
		} catch {
			// Storage full or unavailable — progress stays in memory for this session.
		}
	}
}

/** Shared instance — every panel and the progress viewer read and write this. */
export const userProgress = new UserProgress();

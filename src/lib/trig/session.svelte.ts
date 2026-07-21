/**
 * The learner's live Trigonometry session.
 *
 * A reactive singleton persisted to localStorage. It owns:
 *   1. Per-question answer history (every wrong click kept until the learner
 *      lands the correct one — the "click until right" rule).
 *   2. Which content panels (articles) have been read.
 *   3. The learner's saved position in the flow.
 *
 * Panel- and section-level rollups are derived from question progress, so the
 * recommender, node graph, topic map, and dev tools all read one source.
 */

import { browser } from '$app/environment';
import { trigSections } from './content';
import {
	isContentPanel,
	REQUIRED_CORRECT,
	type Position,
	type TrigPanel,
	type TrigQuestion,
	type TrigSection
} from './types';

/**
 * Everything recorded about the CURRENT attempt at a question. When a question
 * is re-served (its earlier solve didn't count), `attempt` increments and the
 * answer fields are wiped, so the panel key changes and the UI remounts clean
 * instead of resurrecting the old marks.
 */
export interface QuestionRecord {
	questionId: string;
	/** Which serve of this question we're on. Bumps each time it's re-served. */
	attempt: number;
	/** The option label the learner ended on (the correct one, once found). */
	selected: string | null;
	/** Every wrong option label tried this attempt, kept until the question is solved. */
	incorrectAnswers: string[];
	correct: boolean;
	answeredAt: number | null;
	firstSeenAt: number | null;
}

/** Correct / incorrect tallies for a panel, rolled up from its questions. */
export interface PanelStats {
	correct: number;
	incorrect: number;
}

interface SessionData {
	answers: Record<string, QuestionRecord>;
	/** Ids of content panels (articles) the learner has read. */
	readPanels: string[];
	/** Lifetime wrong-click count — survives re-serves, unlike per-attempt tallies. */
	lifetimeIncorrect: number;
	position: Position | null;
	startedAt: number | null;
	lastActiveAt: number | null;
}

const STORAGE_KEY = 'branchlearn:trig-session:v3';

function emptyRecord(questionId: string): QuestionRecord {
	return {
		questionId,
		attempt: 0,
		selected: null,
		incorrectAnswers: [],
		correct: false,
		answeredAt: null,
		firstSeenAt: null
	};
}

function emptyData(): SessionData {
	return {
		answers: {},
		readPanels: [],
		lifetimeIncorrect: 0,
		position: null,
		startedAt: null,
		lastActiveAt: null
	};
}

function loadData(): SessionData {
	if (!browser) return emptyData();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? { ...emptyData(), ...JSON.parse(raw) } : emptyData();
	} catch {
		return emptyData();
	}
}

export class TrigSession {
	#data = $state<SessionData>(loadData());

	get storageKey(): string {
		return STORAGE_KEY;
	}

	get position(): Position | null {
		return this.#data.position;
	}

	get startedAt(): number | null {
		return this.#data.startedAt;
	}

	// --- Per-question reads -------------------------------------------------

	record(questionId: string): QuestionRecord {
		return this.#data.answers[questionId] ?? emptyRecord(questionId);
	}

	/** The learner has found the correct answer (possibly after wrong clicks). */
	isSolved(questionId: string): boolean {
		return this.record(questionId).correct;
	}

	/**
	 * Whether a solved question counts toward the algorithm. Only a *clean*
	 * first-try correct (no wrong clicks) counts. A wrong-then-right question is
	 * still solved — the learner found the answer — but is never credited as
	 * correct, so it does not advance panel mastery.
	 */
	countsCorrect(questionId: string): boolean {
		const rec = this.record(questionId);
		return rec.correct && rec.incorrectAnswers.length === 0;
	}

	hasIncorrect(questionId: string): boolean {
		return this.record(questionId).incorrectAnswers.length > 0;
	}

	// --- Panel rollups ------------------------------------------------------

	isRead(panelId: string): boolean {
		return this.#data.readPanels.includes(panelId);
	}

	requiredFor(panel: TrigPanel): number {
		return REQUIRED_CORRECT[panel.type];
	}

	/** Correct / incorrect tallies for a panel, from its questions (or read state). */
	panelStats(panel: TrigPanel): PanelStats {
		if (isContentPanel(panel.type)) {
			return { correct: this.isRead(panel.id) ? 1 : 0, incorrect: 0 };
		}
		let correct = 0;
		let incorrect = 0;
		for (const question of panel.questions) {
			const rec = this.record(question.id);
			// Only clean first-try corrects count toward the algorithm.
			if (rec.correct && rec.incorrectAnswers.length === 0) correct += 1;
			incorrect += rec.incorrectAnswers.length;
		}
		return { correct, incorrect };
	}

	isPanelComplete(panel: TrigPanel): boolean {
		return this.panelStats(panel).correct >= REQUIRED_CORRECT[panel.type];
	}

	// --- Section / course rollups ------------------------------------------

	panelsCompleteIn(section: TrigSection): number {
		return section.panels.filter((p) => this.isPanelComplete(p)).length;
	}

	isSectionComplete(section: TrigSection): boolean {
		return section.panels.every((p) => this.isPanelComplete(p));
	}

	/** First section not yet fully mastered — where the recommender draws from. */
	activeSection(sections: TrigSection[] = trigSections): TrigSection | null {
		return sections.find((s) => !this.isSectionComplete(s)) ?? null;
	}

	/** 0–100 progress through a section, by required-correct across its panels. */
	sectionPercent(section: TrigSection): number {
		let earned = 0;
		let required = 0;
		for (const panel of section.panels) {
			const need = REQUIRED_CORRECT[panel.type];
			required += need;
			earned += Math.min(need, this.panelStats(panel).correct);
		}
		return required === 0 ? 0 : Math.round((earned / required) * 100);
	}

	/** 0–100 across the whole course. */
	overallPercent(sections: TrigSection[] = trigSections): number {
		let earned = 0;
		let required = 0;
		for (const section of sections) {
			for (const panel of section.panels) {
				const need = REQUIRED_CORRECT[panel.type];
				required += need;
				earned += Math.min(need, this.panelStats(panel).correct);
			}
		}
		return required === 0 ? 0 : Math.round((earned / required) * 100);
	}

	/** Clean first-try correct answers across the whole session (what counts). */
	get totalCorrect(): number {
		return Object.values(this.#data.answers).filter(
			(r) => r.correct && r.incorrectAnswers.length === 0
		).length;
	}

	/** Questions the learner has solved (found the answer), clean or not. */
	get totalSolved(): number {
		return Object.values(this.#data.answers).filter((r) => r.correct).length;
	}

	/** Total wrong clicks across the whole session — survives re-serves. */
	get totalIncorrect(): number {
		return this.#data.lifetimeIncorrect;
	}

	/** Which serve of a question the learner is on (0 on the first serve). */
	attemptOf(questionId: string): number {
		return this.record(questionId).attempt;
	}

	// --- Mutations ----------------------------------------------------------

	setPosition(pos: Position) {
		this.#data.startedAt ??= Date.now();
		// Serving a question sets up (or freshens) its current attempt.
		if (pos.kind === 'panel' && pos.questionId) this.serveQuestion(pos.questionId);
		this.#data.position = pos;
		this.#save();
	}

	/**
	 * Prepare a question to be answered and return its current attempt index.
	 *   - never seen  → create attempt 0
	 *   - in progress → resume the current attempt (keep the learner's marks)
	 *   - already solved → this is a RE-SERVE: bump the attempt and wipe the old
	 *     answer, so the learner gets a genuinely clean shot (and the panel key
	 *     changes, remounting the UI instead of showing the previous responses).
	 */
	serveQuestion(questionId: string): number {
		const record = this.#ownRecord(questionId);
		record.firstSeenAt ??= Date.now();
		if (record.correct) {
			record.attempt += 1;
			record.selected = null;
			record.incorrectAnswers = [];
			record.correct = false;
			record.answeredAt = null;
			this.#save();
		}
		return record.attempt;
	}

	/**
	 * Record a click. Wrong answers accumulate and the question stays open;
	 * the correct click locks it. Re-clicking a solved question is a no-op.
	 */
	answer(question: TrigQuestion, label: string) {
		const record = this.#ownRecord(question.id);
		if (record.correct) return;
		record.firstSeenAt ??= Date.now();

		if (label === question.correctAnswer) {
			record.selected = label;
			record.correct = true;
			record.answeredAt = Date.now();
		} else if (!record.incorrectAnswers.includes(label)) {
			record.incorrectAnswers.push(label);
			this.#data.lifetimeIncorrect += 1;
		}
		this.#save();
	}

	/** Mark a content panel (article) as read. */
	markRead(panelId: string) {
		if (!this.#data.readPanels.includes(panelId)) {
			this.#data.readPanels.push(panelId);
			this.#save();
		}
	}

	/** Wipe everything and drop the learner back to the very start. */
	reset() {
		this.#data = emptyData();
		this.#save();
	}

	#ownRecord(questionId: string): QuestionRecord {
		return (this.#data.answers[questionId] ??= emptyRecord(questionId));
	}

	#save() {
		this.#data.lastActiveAt = Date.now();
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify($state.snapshot(this.#data)));
		} catch {
			// Storage full or unavailable — state stays in memory for this session.
		}
	}
}

/** Shared instance — the flow page, TopicMap, node graph, and dev tools read this. */
export const trigSession = new TrigSession();

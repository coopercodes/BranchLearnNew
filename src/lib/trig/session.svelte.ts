/**
 * The learner's saved progress — a reactive singleton persisted to localStorage.
 *
 * It stores only three things:
 *   1. `index`   — where the learner is in the flat `panels` array.
 *   2. `answers` — every response, keyed by panel id. Wrong clicks are KEPT so a
 *                  question can be retried until it's correct.
 *   3. `read`    — which reading panels have been acknowledged.
 *
 * There is no scoring or recommender here. The only "algorithm" is `index`, and
 * the /trigonometry page decides how it moves. Everything else (topic %, etc.)
 * is derived from these three fields.
 */

import { browser } from '$app/environment';
import { panels, TOPICS, type Panel, type Topic } from './panels';

const STORAGE_KEY = 'branchlearn:trig:v4';

/** One question's kept response. */
export interface Answer {
	/** The option label the learner ended on (the correct one, once found). */
	selected: string | null;
	/** Every wrong label tried, kept until the question is solved. */
	wrong: string[];
	correct: boolean;
}

interface Saved {
	index: number;
	answers: Record<string, Answer>;
	read: string[];
}

function emptyAnswer(): Answer {
	return { selected: null, wrong: [], correct: false };
}

function emptySaved(): Saved {
	return { index: 0, answers: {}, read: [] };
}

function load(): Saved {
	if (!browser) return emptySaved();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? { ...emptySaved(), ...JSON.parse(raw) } : emptySaved();
	} catch {
		return emptySaved();
	}
}

export class TrigSession {
	#data = $state<Saved>(load());

	get storageKey(): string {
		return STORAGE_KEY;
	}

	/** Where the learner is in the array. */
	get index(): number {
		return this.#data.index;
	}

	/** The panel currently on screen. */
	get panel(): Panel {
		return panels[this.#data.index] ?? panels[0];
	}

	// --- reads --------------------------------------------------------------

	/** The kept response for a question panel. */
	answerFor(panelId: string): Answer {
		return this.#data.answers[panelId] ?? emptyAnswer();
	}

	isCorrect(panelId: string): boolean {
		return this.answerFor(panelId).correct;
	}

	isRead(panelId: string): boolean {
		return this.#data.read.includes(panelId);
	}

	/** Has the learner finished this panel? (read a reading / solved a question) */
	isComplete(panel: Panel): boolean {
		if (panel.type === 'reading') return this.isRead(panel.id);
		if (panel.type === 'question') return this.isCorrect(panel.id);
		return true; // 'done'
	}

	/** 0–100 completion for a topic, across its panels. */
	topicPercent(topic: Topic): number {
		const inTopic = panels.filter((p) => p.topic === topic);
		if (inTopic.length === 0) return 0;
		const done = inTopic.filter((p) => this.isComplete(p)).length;
		return Math.round((done / inTopic.length) * 100);
	}

	/** 0–100 across the whole course. */
	get overallPercent(): number {
		const total = TOPICS.reduce((sum, t) => sum + this.topicPercent(t), 0);
		return Math.round(total / TOPICS.length);
	}

	// --- mutations ----------------------------------------------------------

	/**
	 * Record a click on a question. Wrong answers accumulate and the question
	 * stays open; the correct click locks it. Clicking a solved question is a
	 * no-op — this is the "retry until correct" rule.
	 */
	answer(panel: Panel, label: string) {
		if (panel.type !== 'question') return;
		const rec = (this.#data.answers[panel.id] ??= emptyAnswer());
		if (rec.correct) return;

		if (label === panel.answer) {
			rec.selected = label;
			rec.correct = true;
		} else if (!rec.wrong.includes(label)) {
			rec.wrong.push(label);
		}
		this.#save();
	}

	/** Mark a reading panel as read. */
	markRead(panelId: string) {
		if (!this.#data.read.includes(panelId)) {
			this.#data.read.push(panelId);
			this.#save();
		}
	}

	/** Move to a panel by index (clamped). This is how the flow advances. */
	goTo(index: number) {
		this.#data.index = Math.max(0, Math.min(panels.length - 1, index));
		this.#save();
	}

	/** Wipe everything and go back to the start. */
	reset() {
		this.#data = emptySaved();
		this.#save();
	}

	#save() {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify($state.snapshot(this.#data)));
		} catch {
			// Storage full or unavailable — state stays in memory for this session.
		}
	}
}

/** Shared instance — the flow page, TopicMap, and dev tools all read this one. */
export const trigSession = new TrigSession();

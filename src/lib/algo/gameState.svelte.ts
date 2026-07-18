import { browser } from '$app/environment';
import { correctChance } from './simulator';
import {
	isContentPanel,
	REQUIRED_CORRECT,
	type AlgoPanel,
	type AlgoPanelType,
	type AlgoSection,
	type SectionId
} from './types';

/** Every event type the platform records about the simulated learner. */
export type AlgoEventType =
	| 'panel_recommended'
	| 'article_read'
	| 'response_correct'
	| 'response_incorrect'
	| 'question_correct'
	| 'question_incorrect'
	| 'panel_completed'
	| 'section_completed';

export interface AlgoEvent {
	at: number;
	type: AlgoEventType;
	sectionId: SectionId;
	panelType: AlgoPanelType;
	detail: string;
}

export interface PanelStats {
	correct: number;
	incorrect: number;
}

/** A recommendation the learner has not responded to yet. */
export interface PendingChoice {
	panelId: string;
	questionIndex: number;
}

interface AlgoStateData {
	panels: Record<string, PanelStats>;
	/** Graded attempts per section — this drives the learning curve. */
	sectionAttempts: Partial<Record<SectionId, number>>;
	completedSections: SectionId[];
	pending: PendingChoice | null;
	events: AlgoEvent[];
	startedAt: number | null;
	/** Learner weight on the correct-chance curve (0.5 = struggling, 1.5 = strong). */
	aptitude: number;
}

const STORAGE_KEY = 'branchlearn:algo-state:v1';
const MAX_EVENTS = 500;
const APTITUDE_MIN = 0.1;
const APTITUDE_MAX = 2;

function emptyData(): AlgoStateData {
	return {
		panels: {},
		sectionAttempts: {},
		completedSections: [],
		pending: null,
		events: [],
		startedAt: null,
		aptitude: 1
	};
}

function loadData(): AlgoStateData {
	if (!browser) return emptyData();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? { ...emptyData(), ...JSON.parse(raw) } : emptyData();
	} catch {
		return emptyData();
	}
}

/**
 * The /algo game state: per-panel correct/incorrect tallies, section
 * completion, the current pending recommendation, and a full event log.
 * A reactive singleton persisted to localStorage on every mutation — the
 * dev tools panel renders straight from it.
 */
export class AlgoGameState {
	#data = $state<AlgoStateData>(loadData());

	get pending(): PendingChoice | null {
		return this.#data.pending;
	}

	get events(): AlgoEvent[] {
		return this.#data.events;
	}

	get startedAt(): number | null {
		return this.#data.startedAt;
	}

	get storageKey(): string {
		return STORAGE_KEY;
	}

	get aptitude(): number {
		return this.#data.aptitude;
	}

	/** Set the learner weight, clamped to a sane range. Persists like everything else. */
	setAptitude(value: number) {
		if (Number.isNaN(value)) return;
		this.#data.aptitude = Math.min(APTITUDE_MAX, Math.max(APTITUDE_MIN, value));
		this.#save();
	}

	stats(panelId: string): PanelStats {
		return this.#data.panels[panelId] ?? { correct: 0, incorrect: 0 };
	}

	requiredFor(type: AlgoPanelType): number {
		return REQUIRED_CORRECT[type];
	}

	isPanelComplete(panel: AlgoPanel): boolean {
		return this.stats(panel.id).correct >= REQUIRED_CORRECT[panel.type];
	}

	isSectionComplete(section: AlgoSection): boolean {
		return this.#data.completedSections.includes(section.id);
	}

	sectionAttempts(sectionId: SectionId): number {
		return this.#data.sectionAttempts[sectionId] ?? 0;
	}

	/** The learner's current chance of a correct response in this section. */
	chanceFor(sectionId: SectionId): number {
		return correctChance(
			this.sectionAttempts(sectionId),
			this.#data.completedSections.length,
			this.#data.aptitude
		);
	}

	/** The first section the learner has not finished — where the algo recommends from. */
	activeSection(sections: AlgoSection[]): AlgoSection | null {
		return sections.find((s) => !this.isSectionComplete(s)) ?? null;
	}

	/** 0–100 across all sections, by required-correct progress. */
	overallPercent(sections: AlgoSection[]): number {
		let earned = 0;
		let required = 0;
		for (const section of sections) {
			for (const panel of section.panels) {
				const need = REQUIRED_CORRECT[panel.type];
				required += need;
				earned += Math.min(need, this.stats(panel.id).correct);
			}
		}
		return required === 0 ? 0 : Math.round((earned / required) * 100);
	}

	/** Store a recommendation the learner must now respond to. */
	recordRecommendation(panel: AlgoPanel, questionIndex: number) {
		this.#data.startedAt ??= Date.now();
		this.#data.pending = { panelId: panel.id, questionIndex };
		this.#log('panel_recommended', panel, `Recommended "${panel.title}"`);
		this.#save();
	}

	/** Resolve a pending article recommendation: reading it completes it. */
	resolveArticle(panel: AlgoPanel, section: AlgoSection) {
		this.#ownStats(panel.id).correct = 1;
		this.#data.pending = null;
		this.#log('article_read', panel, `Read "${panel.title}"`);
		this.#log('panel_completed', panel, `Completed "${panel.title}"`);
		this.#checkSection(section, panel);
		this.#save();
	}

	/** Resolve a pending graded recommendation with the simulated response. */
	resolveResponse(panel: AlgoPanel, section: AlgoSection, prompt: string, correct: boolean) {
		const stats = this.#ownStats(panel.id);
		const attempts = this.#data.sectionAttempts;
		attempts[section.id] = (attempts[section.id] ?? 0) + 1;
		this.#data.pending = null;

		if (correct) {
			stats.correct += 1;
			this.#log('response_correct', panel, `Correct response: "${prompt}"`);
			this.#log(
				'question_correct',
				panel,
				`Question passed (${stats.correct}/${REQUIRED_CORRECT[panel.type]})`
			);
			if (stats.correct === REQUIRED_CORRECT[panel.type]) {
				this.#log('panel_completed', panel, `Completed "${panel.title}"`);
				this.#checkSection(section, panel);
			}
		} else {
			stats.incorrect += 1;
			this.#log('response_incorrect', panel, `Incorrect response: "${prompt}"`);
			this.#log('question_incorrect', panel, `Question missed (${stats.incorrect} misses so far)`);
		}
		this.#save();
	}

	/** Wipe all progress, but keep the aptitude so runs can be compared. */
	reset() {
		this.#data = { ...emptyData(), aptitude: this.#data.aptitude };
		this.#save();
	}

	#ownStats(panelId: string): PanelStats {
		return (this.#data.panels[panelId] ??= { correct: 0, incorrect: 0 });
	}

	/** After a panel completes: stamp the section if every panel is now done. */
	#checkSection(section: AlgoSection, lastPanel: AlgoPanel) {
		const done = section.panels.every((p) => this.isPanelComplete(p));
		if (done && !this.#data.completedSections.includes(section.id)) {
			this.#data.completedSections.push(section.id);
			this.#log('section_completed', lastPanel, `Section ${section.title} mastered`);
		}
	}

	#log(type: AlgoEventType, panel: AlgoPanel, detail: string) {
		this.#data.events.push({
			at: Date.now(),
			type,
			sectionId: panel.sectionId,
			panelType: panel.type,
			detail
		});
		if (this.#data.events.length > MAX_EVENTS) {
			this.#data.events.splice(0, this.#data.events.length - MAX_EVENTS);
		}
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

/** Shared instance — the /algo page and the global dev tools both read this. */
export const algoGame = new AlgoGameState();

/** Content-panel resolution is split from graded resolution; expose the check. */
export { isContentPanel };

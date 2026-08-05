import { browser } from '$app/environment';
import { moveForward, resumeAt, ROOT_NODE_ID } from './graph';
import { ContentGraph } from './graph-content';
import type { GraphEdge, GraphNode, PanelNode } from './types';

/** Every event type the walker records. One user press produces one action event. */
export type ContentEventType =
	| 'moved'
	| 'panel_entered'
	| 'panel_skipped'
	| 'answer_correct'
	| 'answer_incorrect'
	| 'panel_reinforced'
	| 'rank_up'
	| 'rank_down'
	| 'subtopic_mastered'
	| 'subtopic_advanced'
	| 'course_complete';

export interface ContentEvent {
	seq: number;
	at: number;
	type: ContentEventType;
	nodeID: string;
	subtopicID: string | null;
	detail: string;
	/** ELO after the event, and how much it moved — answer events only. */
	elo?: number;
	delta?: number;
	/** Rank crossed into — rank events only. */
	rank?: Rank;
}

/** ELO bands: thirds of the bar, with 100 as its own tier. */
export type Rank = 'Beginner' | 'Intermediate' | 'Expert' | 'Mastery';

export const RANK_ORDER: Rank[] = ['Beginner', 'Intermediate', 'Expert', 'Mastery'];
export const RANK_MIN_ELO: Record<Rank, number> = {
	Beginner: 0,
	Intermediate: 33,
	Expert: 66,
	Mastery: 100
};

export function rankFor(elo: number): Rank {
	if (elo >= RANK_MIN_ELO.Mastery) return 'Mastery';
	if (elo >= RANK_MIN_ELO.Expert) return 'Expert';
	if (elo >= RANK_MIN_ELO.Intermediate) return 'Intermediate';
	return 'Beginner';
}

export type PanelResult = 'correct' | 'incorrect';

export const START_ELO = 0;
export const MAX_ELO = 100;
/** Safety valve on the skip chain; a lap can never exceed the panel count. */
const MAX_SKIP_CHAIN = 32;

/** Accuracy the simulated learner has at 0 ELO and at 100 ELO. */
export const MIN_HIT_RATE = 0.35;
export const MAX_HIT_RATE = 0.95;

const STORAGE_KEY = 'branchlearn:content-graph:v1';
const MAX_EVENTS = 500;

/**
 * The learner gets better as the subtopic's ELO climbs — this is what makes the
 * walk converge instead of drifting around a coin flip forever.
 */
export function hitRateFor(elo: number): number {
	const t = Math.max(0, Math.min(1, elo / MAX_ELO));
	return MIN_HIT_RATE + (MAX_HIT_RATE - MIN_HIT_RATE) * t;
}

const byId = new Map(ContentGraph.map((n) => [n.id, n]));
const panelsBySubtopic: Record<string, PanelNode[]> = {};
for (const node of ContentGraph) {
	if (node.type !== 'panel') continue;
	(panelsBySubtopic[node.subtopicID] ??= []).push(node);
}

interface GameData {
	currentNodeID: string;
	/** panel id → correct answers so far, counted against `requiredCorrect`. */
	correct: Record<string, number>;
	attempts: Record<string, number>;
	results: Record<string, PanelResult>;
	/** subtopic id → the rank band it was last seen in, so crossings can be detected. */
	ranks: Record<string, Rank>;
	/** Subtopics that have hit the mastery bar. Latched — a later miss can't undo it. */
	mastered: string[];
	/** Panel the walker is standing on that has not been answered yet. */
	pendingPanelID: string | null;
	/** Edge the walker just traversed, for highlighting. */
	lastEdgeID: string | null;
	events: ContentEvent[];
	seq: number;
	startedAt: number | null;
}

function emptyData(): GameData {
	return {
		// Always the root — `currentNodeID` is a live binding, so reading it here
		// would restart a reset game wherever the walker happened to be standing.
		currentNodeID: ROOT_NODE_ID,
		correct: {},
		attempts: {},
		results: {},
		ranks: Object.fromEntries(
			ContentGraph.filter((n) => n.type === 'subtopic').map((n) => [n.id, rankFor(START_ELO)])
		),
		mastered: [],
		pendingPanelID: null,
		lastEdgeID: null,
		events: [],
		seq: 0,
		startedAt: null
	};
}

function loadData(): GameData {
	if (!browser) return emptyData();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return emptyData();
		const saved = JSON.parse(raw) as Partial<GameData>;
		const base = emptyData();
		return { ...base, ...saved, ranks: { ...base.ranks, ...saved.ranks } };
	} catch {
		return emptyData();
	}
}

/**
 * The /content-graph game state: walker position, per-subtopic ELO, per-panel
 * correct-answer quotas, and the event log. A reactive singleton persisted to
 * localStorage on every mutation. `graph.ts` still owns the cursor — this
 * decides which edge it takes and reduces the resulting events.
 */
export class ContentGameState {
	#data = $state<GameData>(loadData());

	constructor() {
		// The saved position lives here, so hand it back to the graph cursor.
		resumeAt(this.#data.currentNodeID);
	}

	get currentID(): string {
		return this.#data.currentNodeID;
	}

	get current(): GraphNode | undefined {
		return byId.get(this.#data.currentNodeID);
	}

	get events(): ContentEvent[] {
		return this.#data.events;
	}

	get lastEdgeID(): string | null {
		return this.#data.lastEdgeID;
	}

	get startedAt(): number | null {
		return this.#data.startedAt;
	}

	get storageKey(): string {
		return STORAGE_KEY;
	}

	/** The panel awaiting an answer, if the walker just stepped onto one. */
	get pendingPanel(): PanelNode | null {
		const id = this.#data.pendingPanelID;
		if (!id) return null;
		const node = byId.get(id);
		return node?.type === 'panel' ? node : null;
	}

	/** The edge the next move would take, given current mastery. */
	get nextEdge(): GraphEdge | null {
		const node = this.current;
		return node ? (this.#chooseEdge(node) ?? null) : null;
	}

	/** False only when the course is finished — nothing pending and nowhere to go. */
	get canAdvance(): boolean {
		return this.pendingPanel !== null || this.nextEdge !== null;
	}

	/** Hit rate the *next* answer will be rolled at. */
	get currentHitRate(): number {
		const node = this.pendingPanel ?? this.current;
		const subtopicID =
			node?.type === 'panel' ? node.subtopicID : node?.type === 'subtopic' ? node.id : null;
		return hitRateFor(subtopicID ? this.eloFor(subtopicID) : START_ELO);
	}

	/**
	 * ELO is simply how much of a subtopic's required work is banked: the share
	 * of every panel's `requiredCorrect` ticks that have been filled. It only
	 * ever goes up, and 100 means every tick is full.
	 */
	eloFor(subtopicID: string): number {
		let earned = 0;
		let required = 0;
		for (const panel of panelsBySubtopic[subtopicID] ?? []) {
			required += panel.requiredCorrect;
			earned += Math.min(this.correctFor(panel.id), panel.requiredCorrect);
		}
		return required === 0 ? START_ELO : Math.round((earned / required) * MAX_ELO);
	}

	rankOf(subtopicID: string): Rank {
		return rankFor(this.eloFor(subtopicID));
	}

	correctFor(panelID: string): number {
		return this.#data.correct[panelID] ?? 0;
	}

	attemptsFor(panelID: string): number {
		return this.#data.attempts[panelID] ?? 0;
	}

	resultFor(panelID: string): PanelResult | undefined {
		return this.#data.results[panelID];
	}

	isSatisfied(panel: PanelNode): boolean {
		return this.correctFor(panel.id) >= panel.requiredCorrect;
	}

	/** How many of a subtopic's panels have met their quota. */
	satisfiedCount(subtopicID: string): number {
		return (panelsBySubtopic[subtopicID] ?? []).filter((p) => this.isSatisfied(p)).length;
	}

	panelCount(subtopicID: string): number {
		return (panelsBySubtopic[subtopicID] ?? []).length;
	}

	/**
	 * Every tick full, which is the same thing as 100 ELO now that ELO *is* the
	 * tick percentage. Latched, so the walker's exit decision can't flip back.
	 */
	isMastered(subtopicID: string): boolean {
		return this.#data.mastered.includes(subtopicID);
	}

	#meetsMasteryBar(subtopicID: string): boolean {
		const panels = panelsBySubtopic[subtopicID] ?? [];
		return panels.length > 0 && panels.every((p) => this.isSatisfied(p));
	}

	/**
	 * One press = one action. Either resolve the panel we are standing on, or
	 * move to the next node. Consequences (quota filled, subtopic mastered) are
	 * logged alongside the action that caused them.
	 */
	advance() {
		if (this.pendingPanel) this.#resolvePending();
		else this.#move();
	}

	advanceMany(count: number) {
		for (let i = 0; i < count; i++) {
			if (!this.canAdvance) break;
			this.advance();
		}
	}

	reset() {
		this.#data = emptyData();
		resumeAt(this.#data.currentNodeID);
		if (browser) localStorage.removeItem(STORAGE_KEY);
	}

	/**
	 * A mastered subtopic hands the walker on to the next one; otherwise it
	 * sends it back around its training loop. Every other node has one way out.
	 */
	#chooseEdge = (node: GraphNode): GraphEdge | undefined => {
		if (node.type !== 'subtopic') return node.outEdges[0];
		const loop = node.outEdges.find((e) => e.label === 'to-start-panel');
		const next = node.outEdges.find((e) => e.label === 'to-next-subtopic');
		return this.isMastered(node.id) ? next : (loop ?? next);
	};

	/**
	 * Walk to the next node that actually needs the learner. Panels whose quota
	 * is already full are skipped in the same press — each skip is still logged
	 * so the trail is visible.
	 */
	#move() {
		let from = this.current;
		if (!from || !this.#chooseEdge(from)) {
			this.#log('course_complete', this.#data.currentNodeID, 'Nothing left to walk');
			this.#save();
			return;
		}

		this.#data.startedAt ??= Date.now();

		for (let hops = 0; hops < MAX_SKIP_CHAIN; hops++) {
			const edge = this.#chooseEdge(from);
			if (!edge) break;

			this.#data.lastEdgeID = edge.id;
			this.#data.currentNodeID = moveForward(this.#chooseEdge);
			const to = this.current;

			if (to?.type === 'panel') {
				if (this.isSatisfied(to)) {
					this.#skip(to);
					from = to;
					continue;
				}
				this.#data.pendingPanelID = to.id;
				this.#log('panel_entered', to.id, `Entered "${to.title}"`);
			} else if (from.type === 'subtopic' && to?.type === 'subtopic') {
				this.#log('subtopic_advanced', to.id, `${from.title} mastered → moved to ${to.title}`);
			} else {
				this.#log('moved', to?.id ?? edge.targetId, `Moved to "${to?.title ?? edge.targetId}"`);
			}
			break;
		}

		this.#save();
	}

	/** Quota already full — nothing to bank, so just note the pass-through. */
	#skip(panel: PanelNode) {
		this.#log(
			'panel_skipped',
			panel.id,
			`Skipped "${panel.title}" — already ${panel.requiredCorrect}/${panel.requiredCorrect}`
		);
	}

	/** Roll at the subtopic's current hit rate; a correct answer banks a tick. */
	#resolvePending() {
		const panel = this.pendingPanel;
		if (!panel) return;

		const previous = this.eloFor(panel.subtopicID);
		const hitRate = hitRateFor(previous);
		const result: PanelResult = Math.random() < hitRate ? 'correct' : 'incorrect';
		const wasSatisfied = this.isSatisfied(panel);

		if (result === 'correct') this.#data.correct[panel.id] = this.correctFor(panel.id) + 1;
		this.#data.results[panel.id] = result;
		this.#data.attempts[panel.id] = this.attemptsFor(panel.id) + 1;
		this.#data.pendingPanelID = null;

		// ELO is derived from the ticks, so read it back after banking one.
		const elo = this.eloFor(panel.subtopicID);
		const tally = `${Math.min(this.correctFor(panel.id), panel.requiredCorrect)}/${panel.requiredCorrect}`;
		this.#log(
			result === 'correct' ? 'answer_correct' : 'answer_incorrect',
			panel.id,
			`${result === 'correct' ? 'Correct' : 'Missed'} "${panel.title}" at ${Math.round(hitRate * 100)}% · ${tally}`,
			{ elo, delta: elo - previous }
		);

		this.#checkRank(panel.subtopicID, previous, elo);

		if (!wasSatisfied && this.isSatisfied(panel)) {
			this.#log('panel_reinforced', panel.id, `"${panel.title}" reinforced (${tally})`);
		}
		if (!this.isMastered(panel.subtopicID) && this.#meetsMasteryBar(panel.subtopicID)) {
			this.#data.mastered.push(panel.subtopicID);
			const subtopic = byId.get(panel.subtopicID);
			this.#log(
				'subtopic_mastered',
				panel.subtopicID,
				`${subtopic?.title ?? panel.subtopicID} mastered — every tick full`
			);

			// Last subtopic in the spine — there is nowhere to advance to.
			if (!subtopic?.outEdges.some((e) => e.label === 'to-next-subtopic')) {
				this.#log('course_complete', panel.subtopicID, 'Every subtopic mastered');
			}
		}

		this.#save();
	}

	/** Emit a rank event when an ELO change crosses a band boundary. */
	#checkRank(subtopicID: string, before: number, after: number) {
		const from = this.#data.ranks[subtopicID] ?? rankFor(before);
		const to = rankFor(after);
		if (from === to) return;

		this.#data.ranks[subtopicID] = to;
		const up = RANK_ORDER.indexOf(to) > RANK_ORDER.indexOf(from);
		const title = byId.get(subtopicID)?.title ?? subtopicID;
		this.#log(up ? 'rank_up' : 'rank_down', subtopicID, `${title}: ${from} → ${to}`, {
			elo: after,
			delta: after - before,
			rank: to
		});
	}

	#log(
		type: ContentEventType,
		nodeID: string,
		detail: string,
		extra?: { elo: number; delta: number; rank?: Rank }
	) {
		const node = byId.get(nodeID);
		const subtopicID =
			node?.type === 'panel' ? node.subtopicID : node?.type === 'subtopic' ? node.id : null;

		this.#data.seq += 1;
		this.#data.events.push({
			seq: this.#data.seq,
			at: Date.now(),
			type,
			nodeID,
			subtopicID,
			detail,
			...extra
		});
		if (this.#data.events.length > MAX_EVENTS) {
			this.#data.events = this.#data.events.slice(-MAX_EVENTS);
		}
	}

	#save() {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.#data));
		} catch {
			// Storage full or blocked — the run still works, it just won't survive a reload.
		}
	}
}

export const game = new ContentGameState();

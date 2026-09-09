import type { GameState } from './index.svelte';

export type QuestSave = { active: string[] };

export class QuestState {
	active = $state<string[]>([]);

	#game: GameState;
	constructor(game: GameState) {
		this.#game = game;
	}

	accept(id: string) {
		if (!this.active.includes(id)) this.active.push(id);
	}

	toJSON(): QuestSave {
		return { active: [...this.active] };
	}

	load(d: QuestSave) {
		this.active = d.active ?? [];
	}

	reset() {
		this.active = [];
	}
}
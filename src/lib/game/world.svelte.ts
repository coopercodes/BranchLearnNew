import type { GameState } from './index.svelte';

export type WorldSave = { day: number };

export class WorldState {
	day = $state(1);

	#game: GameState;
	constructor(game: GameState) {
		this.#game = game;
	}

	advanceDay() {
		this.day += 1;
	}

    toJSON(): WorldSave { return { day: this.day }; }
	load(d: WorldSave) { this.day = d.day; }
	reset() { this.day = 1; }
}
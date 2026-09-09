import type { GameState } from './index.svelte';

type CombatPlayer = { hp: number; shield: number };

export type CombatSave = {
	inCombat: boolean;
	player: CombatPlayer;
};

const defaultPlayer = (): CombatPlayer => ({ hp: 100, shield: 0 });

export class CombatState {
	inCombat = $state(false);
	player = $state<CombatPlayer>(defaultPlayer());

	#game: GameState;

	constructor(game: GameState) {
		this.#game = game;
	}

	start() {
		this.inCombat = true;
	}

	end() {
		this.inCombat = false;
	}

	toJSON(): CombatSave {
		return {
			inCombat: this.inCombat,
			player: { ...this.player }
		};
	}

	load(data: CombatSave) {
		this.inCombat = data.inCombat;
		this.player = { ...defaultPlayer(), ...data.player };
	}

	reset() {
		this.inCombat = false;
		this.player = defaultPlayer();
	}
}
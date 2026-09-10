import type { GameState } from './index.svelte';

type CombatPlayer = { 
    hp: number; 
    hpMax: number;
    itemActive: string | null;
};

type CombatEnemy = {
    title: string;
    hp: number;
    hpMax: number;
    type: "sentinel" | "common";
    damage: {
        amount: number; // Generally 1-3
        damageType?: "sentinel" | "vampire";
        damageArray?: number[] // for scaling damage, such as 1, 2, 4 etc.
    }
    criticalStrikeChance: number; // 0 through 100
}

export type CombatSave = {
	inCombat: boolean;
	player: CombatPlayer;
};

/*
    enemy
        title
        hp
        hpMax
        type "Sentinel"
        damage
            damage
            ?damageType "Sentinel"
            ?damageArray
        ?critChance
    player
        hp
        hpMax
        itemActive ("sword of rage", etc.)
*/

const defaultPlayer = (): CombatPlayer => ({ hp: 5, hpMax: 5,});

export class CombatState {
	inCombat = $state(false);
	player = $state<CombatPlayer>(defaultPlayer());
    enemy = $state<CombatEnemy | {}>({});

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
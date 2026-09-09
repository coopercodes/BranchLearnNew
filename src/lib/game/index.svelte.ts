// src/lib/game/index.svelte.ts
import { CombatState, type CombatSave } from './combat.svelte';
import { QuestState, type QuestSave } from './quests.svelte';
import { InventoryState, type InventorySave } from './inventory.svelte';
import { WorldState, type WorldSave } from './world.svelte';

export const SAVE_VERSION = "1.1";

export type GameSave = {
	version: number;
	combat: CombatSave;
	quests: QuestSave;
	inventory: InventorySave;
	world: WorldSave;
};

export class GameState {
	combat: CombatState;
	quests: QuestState;
	inventory: InventoryState;
	world: WorldState;

	constructor() {
		this.combat = new CombatState(this);
		this.quests = new QuestState(this);
		this.inventory = new InventoryState(this);
		this.world = new WorldState(this);
	}

	// derived across substates
	isAlive = $derived(this.combat.player.hp > 0);

	// operations that touch multiple substates
	restAtInn() {
		this.world.advanceDay();
		this.combat.end();
	}

	reset() {
		this.combat = new CombatState(this);
		this.quests = new QuestState(this);
		this.inventory = new InventoryState(this);
		this.world = new WorldState(this);
	}

    toJSON() {
		return {
			version: SAVE_VERSION,
			combat: this.combat.toJSON(),
			quests: this.quests.toJSON(),
			inventory: this.inventory.toJSON(),
			world: this.world.toJSON()
		};
	}

	load(save: GameSave) {
		this.combat.load(save.combat);
		this.quests.load(save.quests);
		this.inventory.load(save.inventory);
		this.world.load(save.world);
	}

}

export const game = new GameState();

export { CombatState, QuestState, InventoryState, WorldState };
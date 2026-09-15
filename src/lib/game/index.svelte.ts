// src/lib/game/index.svelte.ts
import { CombatState, type CombatSave } from './combat.svelte';
import { QuestState, type QuestSave } from './quests.svelte';
import { InventoryState, type InventorySave } from './inventory.svelte';
import { WorldState, type WorldSave } from './world.svelte';
import { RendererState, type RendererSave } from './renderer.svelte';

export const SAVE_VERSION = "1.1";

export type GameSave = {
	version: number;
	combat: CombatSave;
	quests: QuestSave;
	inventory: InventorySave;
	world: WorldSave;
	renderer: RendererSave;
};

export class GameState {
	combat: CombatState;
	quests: QuestState;
	inventory: InventoryState;
	world: WorldState;
	renderer: RendererState;

	constructor() {
		this.combat = new CombatState(this);
		this.quests = new QuestState(this);
		this.inventory = new InventoryState(this);
		this.world = new WorldState(this);
		this.renderer = new RendererState(this);
	}

	// derived across substates
	// TODO: how tf do I get rid of these errors when I legit define them in the constructor
	// TODO URGENT
	isAlive = $derived(this.combat.player.hp > 0);
	atCamp = $derived(this.renderer.state == "camp")

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
			world: this.world.toJSON(),
			renderer: this.renderer.toJSON()
		};
	}

	load(save: GameSave) {
		this.combat.load(save.combat);
		this.quests.load(save.quests);
		this.inventory.load(save.inventory);
		this.world.load(save.world);
		this.renderer.load(save.renderer);
	}

}

export const game = new GameState();

export { CombatState, QuestState, InventoryState, WorldState };
import type { GameState } from './index.svelte';

export type QuestSave = { 
    active: string[],
    selectedQuestID: string;
};

export type Panel = {

}

// game.quests.current
export type selectedQuest = string;

/*


*/

export class QuestState {
	active = $state<string[]>([]);
    selectedQuestID = $state<string>("");

	#game: GameState;
	constructor(game: GameState) {
		this.#game = game;
	}

	accept(id: string) {
		if (!this.active.includes(id)) this.active.push(id);
	}

	toJSON(): QuestSave {
		return { active: [...this.active], selectedQuestID: this.selectedQuestID };
	}

	load(d: QuestSave) {
		this.active = d.active ?? ["training-grounds"];
        this.selectedQuestID = "";
	}

	reset() {
		this.active = [];
        this.selectedQuestID = "";
	}
}
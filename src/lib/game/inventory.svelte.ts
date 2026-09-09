import type { GameState } from './index.svelte';

export type InventorySave = { items: string[] };

export class InventoryState {
	items = $state<string[]>([]);

	#game: GameState;
	constructor(game: GameState) {
		this.#game = game;
	}

	add(item: string) {
		this.items.push(item);
	}

	remove(item: string) {
		const i = this.items.indexOf(item);
		if (i !== -1) this.items.splice(i, 1);
	}

	toJSON(): InventorySave {
		return { items: [...this.items] };
	}

	load(d: InventorySave) {
		this.items = d.items ?? [];
	}

	reset() {
		this.items = [];
	}
}
import type { GameState } from './index.svelte';

export type WorldSave = { 
	day: number 
	region: string
	world: string
};

export class WorldState {
	day = $state(1);


	// regionPath is structured as a list of nested ids
	// sat-mathematics/training-grounds/caves-of-triangulus
	region = $state('sat-math');
	regionCords = $state('0,0')

	// world is to future proof the Branch system
	// users will maintain a similar Level in the overall platform
	// but the can choose a handful of worlds
	// one of the first worlds will be sat-mathematics
	world = $state('sat');

	#game: GameState;
	constructor(game: GameState) {
		this.#game = game;
	}

	advanceDay() {
		this.day += 1;
	}

    toJSON(): WorldSave { 
		return { 
			day: this.day,
			region: this.region,
			world: this.world
		}; 
	}
	load(d: WorldSave) { 
		this.day = d.day; 
		this.region = d.region;
		this.world = d.world;
	}
	reset() { 
		this.day = 1; 
		this.region = 'the-greenwoods';
		this.world = 'sat';
	}
}
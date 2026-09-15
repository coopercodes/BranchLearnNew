import type { GameState } from './index.svelte';


// renderer.state = "camp" makes sense
// can review further in future
// NOTE: concerned about the over usage of "state" throughout the Branch context APIs
// NOTE 2: I don't like the name "type", renderer is one thing that cycles through different rendering states / logic


type RendererStates = "camp" | "encounter" | "quest" | "dev-default";

type Renderer = { 
    state: RendererStates; 
};


export type RendererSave = {
    state: RendererStates; // TODO: how to sync this up to the Renderer type above?
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

const defaultPlayer = (): Renderer => ({ state: "camp"});

export class RendererState {
    state = $state<RendererStates>("camp");

    #game: GameState;

    constructor(game: GameState) {
        this.#game = game;
    }

    toJSON(): RendererSave {
        return {
            state: this.state
        };
    }

    load(data: RendererSave) {
        this.state = data.state;
    }

    reset() {
        this.state = "camp";
    }
}
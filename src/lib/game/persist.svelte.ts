// src/lib/game/persist.svelte.ts
import { browser } from '$app/environment';
import { SAVE_VERSION, type GameSave, type GameState } from './index.svelte';

const KEY = 'rpg:save';

export function save(game: GameState) {
	if (!browser) return;
	try {
		localStorage.setItem(KEY, JSON.stringify(game.toJSON()));
	} catch (err) {
		console.error('Save failed', err); // quota exceeded, private mode, etc.
	}
}

export function load(game: GameState): boolean {
	if (!browser) return false;
	const raw = localStorage.getItem(KEY);
	if (!raw) return false;

	try {
		const migrated = migrate(JSON.parse(raw) as GameSave);
		if (!migrated) return false;
		game.load(migrated);
		return true;
	} catch (err) {
		console.error('Corrupt save, starting fresh', err);
		return false;
	}
}

export function clear() {
	if (browser) localStorage.removeItem(KEY);
}

function migrate(save: GameSave): GameSave | null {
	if (save.version === SAVE_VERSION) return save;
	// if (save.version === 1) { save.world.weather = 'clear'; save.version = 2; }
	console.warn(`Unsupported save version ${save.version}`);
	return null;
}

export function startAutosave(game: GameState, delay = 500) {
	if (!browser) return () => {};

	return $effect.root(() => {
		$effect(() => {
			// reading the whole tree here is what registers the dependencies
			const json = JSON.stringify(game.toJSON());
			const timer = setTimeout(() => {
				try {
					localStorage.setItem(KEY, json);
				} catch (err) {
					console.error('Autosave failed', err);
				}
			}, delay);
			return () => clearTimeout(timer);
		});
	});
}
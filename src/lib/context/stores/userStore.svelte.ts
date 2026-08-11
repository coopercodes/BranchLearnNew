// stores/user-store.svelte.ts

import type { EventBus } from '../events';

export type UserPreferences = {
	theme: 'light' | 'dark';
	soundEnabled: boolean;
};

export class UserStore {
	userId = $state<string | null>(null);
	displayName = $state<string>('');
	preferences = $state<UserPreferences>({ theme: 'light', soundEnabled: true });

	isLoggedIn = $derived(this.userId !== null);

	#bus: EventBus;

	constructor(bus: EventBus) {
		this.#bus = bus;
		// React to events emitted anywhere in the app
		bus.on('USER_LOGGED_IN', ({ userId }) => (this.userId = userId));
		bus.on('USER_LOGGED_OUT', () => this.#clear());
	}

	/* ---------------- public store functionality ---------------- */

	/**
	 * Actions emit events rather than only mutating local state, so every
	 * other store (GameStore reset, EventStore log, …) reacts in one place.
	 */
	login(userId: string, displayName = '') {
		this.displayName = displayName;
		this.#bus.emit('USER_LOGGED_IN', { userId });
	}

	logout() {
		this.#bus.emit('USER_LOGGED_OUT');
	}

	setPreference<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
		this.preferences[key] = value;
	}

	toggleTheme() {
		this.preferences.theme = this.preferences.theme === 'light' ? 'dark' : 'light';
	}

	reset() {
		this.#clear();
		this.preferences = { theme: 'light', soundEnabled: true };
	}

	/* ---------------- serialization (save/load) ---------------- */

	toJSON() {
		return {
			userId: this.userId,
			displayName: this.displayName,
			preferences: $state.snapshot(this.preferences)
		};
	}

	load(data: ReturnType<UserStore['toJSON']>) {
		this.userId = data.userId;
		this.displayName = data.displayName;
		this.preferences = data.preferences;
	}

	/* ---------------- private ---------------- */

	#clear() {
		this.userId = null;
		this.displayName = '';
	}
}
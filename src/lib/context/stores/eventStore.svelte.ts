// stores/event-store.svelte.ts

import type { EventBus, EventKey } from '../events';

export type LoggedEvent = {
	event: EventKey;
	payload: unknown;
	timestamp: number;
};

export class EventStore {
	log = $state<LoggedEvent[]>([]);
	maxEntries = $state(500); // cap so the log doesn't grow unbounded

	totalEvents = $derived(this.log.length);
	lastEvent = $derived(this.log.at(-1) ?? null);

	constructor(bus: EventBus) {
		bus.onAny((event, payload) => {
			this.log.push({ event, payload, timestamp: Date.now() });
			if (this.log.length > this.maxEntries) {
				this.log.splice(0, this.log.length - this.maxEntries);
			}
		});
	}

	/* ---------------- public store functionality ---------------- */

	eventsOfType(type: EventKey): LoggedEvent[] {
		return this.log.filter((e) => e.event === type);
	}

	countOf(type: EventKey): number {
		return this.eventsOfType(type).length;
	}

	/** Events that occurred within the last `ms` milliseconds. */
	recent(ms: number): LoggedEvent[] {
		const cutoff = Date.now() - ms;
		return this.log.filter((e) => e.timestamp >= cutoff);
	}

	clear() {
		this.log = [];
	}

	/** Alias so all stores share a uniform reset() API. */
	reset() {
		this.clear();
	}
}
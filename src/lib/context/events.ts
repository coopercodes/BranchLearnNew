// events.ts — typed global event bus

/**
 * The single source of truth for every global event in the app.
 * Add new events here and every emit/on call site gets full type safety.
 */
export type BranchEvents = {
	QUESTION_COMPLETED: { questionId: string; correct: boolean; points: number };
	USER_LOGGED_IN: { userId: string };
	USER_LOGGED_OUT: undefined;
	NODE_UNLOCKED: { nodeId: string };
};

export type EventKey = keyof BranchEvents;
type Handler<K extends EventKey> = (payload: BranchEvents[K]) => void;
type AnyHandler = <K extends EventKey>(event: K, payload: BranchEvents[K]) => void;

export class EventBus {
	#handlers = new Map<EventKey, Set<Handler<any>>>();
	#anyHandlers = new Set<AnyHandler>();

	/** Subscribe to one event. Returns an unsubscribe function. */
	on<K extends EventKey>(event: K, handler: Handler<K>): () => void {
		if (!this.#handlers.has(event)) this.#handlers.set(event, new Set());
		this.#handlers.get(event)!.add(handler);
		return () => this.#handlers.get(event)?.delete(handler);
	}

	/** Subscribe to every event (useful for logging / the EventStore). */
	onAny(handler: AnyHandler): () => void {
		this.#anyHandlers.add(handler);
		return () => this.#anyHandlers.delete(handler);
	}

	/** Fire an event to all subscribers. */
	emit<K extends EventKey>(
		event: K,
		...args: BranchEvents[K] extends undefined ? [] : [payload: BranchEvents[K]]
	): void {
		const payload = args[0] as BranchEvents[K];
		this.#handlers.get(event)?.forEach((h) => h(payload));
		this.#anyHandlers.forEach((h) => h(event, payload));
	}
}
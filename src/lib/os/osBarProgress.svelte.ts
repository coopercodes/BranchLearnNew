/**
 * What the OS bar's center widget shows: how many questions the active
 * panel still has, and what "Continue" should do once they're all done.
 *
 * The page that owns the desktop feeds this from an $effect (os-layout
 * mirrors its ResponsesState, /trigonometry mirrors UserProgress for the
 * current panel) and resets it on destroy so the bar never shows stale
 * counts from another route.
 */
export class OsBarProgress {
	total = $state(0);
	answered = $state(0);
	/** When set, the bar's "Continue" pill becomes clickable and runs this. */
	onContinue = $state<(() => void) | null>(null);

	get remaining() {
		return Math.max(0, this.total - this.answered);
	}

	get isComplete() {
		return this.total > 0 && this.remaining === 0;
	}

	reset() {
		this.total = 0;
		this.answered = 0;
		this.onContinue = null;
	}
}

/** Shared instance read by RemainingCount in the OS bar. */
export const osBar = new OsBarProgress();

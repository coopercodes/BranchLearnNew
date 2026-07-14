/**
 * A generalized "selected element" — anything in the app the student has
 * focused that Leaf should know about when they chat: a triangle side, an
 * angle, a textbook chapter, a question, and so on. Each surface builds one
 * of these from its own domain objects, so Leaf never needs to understand
 * triangle- or textbook-specific shapes.
 */
export interface SelectedElement {
	/** Machine-readable type, e.g. 'triangle-side', 'triangle-angle', 'textbook-chapter'. */
	kind: string;
	/** Short human-readable label for the selection chip, e.g. 'Side AB' or 'The Sine Ratio'. */
	label: string;
	/** The element's display value, if it has one, e.g. '8.0 units' or '56°'. */
	value?: string;
	/** True when the student sees a "?" instead of the value — Leaf should coach, not reveal. */
	hidden?: boolean;
	/** Plain-English explanation handed to Leaf: what this element is and how to talk about it. */
	explanation: string;
}

/** Format a selection as prompt context Leaf can understand. */
export function describeSelectedElement(el: SelectedElement): string {
	const lines = [
		'The student currently has an element selected:',
		`- kind: ${el.kind}`,
		`- label: ${el.label}`
	];
	if (el.value !== undefined) {
		lines.push(`- value: ${el.value}${el.hidden ? ' (hidden from the student — they only see a "?")' : ''}`);
	}
	lines.push(`- about this selection: ${el.explanation}`);
	return lines.join('\n');
}

/**
 * The desktop's shared selection. Any window can publish what the student
 * just focused (a textbook chapter, a question, …) and the Leaf window reads
 * it live, the same way the /leaf route feeds LeafChat its triangle click.
 */
export class LeafSelectionState {
	current = $state<SelectedElement | null>(null);

	select(element: SelectedElement) {
		this.current = element;
	}

	clear() {
		this.current = null;
	}
}

/** Shared instance for the OS desktop. */
export const leafSelection = new LeafSelectionState();

import type { Lesson, Panel, Question } from '$lib/content/types';

/**
 * Serialize the slide the student is currently on into prompt context for
 * Leaf. Correct answers are included but flagged so Leaf coaches toward them
 * instead of reading them out.
 */
export function describePanelForLeaf(lesson: Lesson, panel: Panel): string {
	const lines = [
		`The student is currently on the "${panel.title}" slide of the "${lesson.title}" lesson.`,
		`Slide summary: ${panel.description}`
	];

	if (panel.type === 'multiple-choice') {
		lines.push('', `The slide shows an article titled "${panel.reading.heading}":`);
		for (const paragraph of panel.reading.paragraphs) lines.push(`- ${paragraph}`);
		if (panel.reading.tip) lines.push(`- ${panel.reading.tip.label}: ${panel.reading.tip.body}`);
		lines.push('', ...describeQuestions(panel.questions));
	} else if (panel.type === 'lightning-round') {
		lines.push(
			'',
			`This is a timed lightning round (${panel.secondsPerQuestion} seconds per question, one attempt each).`,
			...describeQuestions(panel.questions)
		);
	} else {
		lines.push(
			'',
			'This is a "Question" slide: the student is prompted to talk the section through with you (Leaf).',
			`Prompt shown to the student: ${panel.prompt}`,
			`Suggested starter questions: ${panel.suggestions.join(' | ')}`
		);
	}

	return lines.join('\n');
}

function describeQuestions(questions: Question[]): string[] {
	if (questions.length === 0) return [];
	return [
		'The slide asks these questions. The correct answers are marked for YOUR reference only — never state a correct answer outright; guide the student toward it step by step:',
		...questions.map((q) => {
			const options = q.options
				.map((o) => `${o.label}) ${o.text}${o.label === q.correctAnswer ? ' [correct]' : ''}`)
				.join(' ');
			return `- ${q.prompt} Options: ${options}`;
		})
	];
}

/**
 * The desktop-wide "what slide is the student on" context. The course page
 * publishes the active panel here on every slide change, and the Leaf window
 * folds it into its prompt so Leaf always knows what the student is looking at.
 */
export class LeafPanelContextState {
	current = $state<string | null>(null);

	set(context: string) {
		this.current = context;
	}

	clear() {
		this.current = null;
	}
}

/** Shared instance for the OS desktop. */
export const leafPanelContext = new LeafPanelContextState();

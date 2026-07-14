/**
 * Shared shapes for statically-defined course content.
 *
 * Content is a plain tree: Course → Lesson → Panel → Question. Panels are a
 * discriminated union on `type` — add a new panel kind by extending the
 * `Panel` union and teaching PanelRenderer.svelte how to draw it.
 */

export interface QuestionOption {
	label: string;
	text: string;
}

/** A single multiple-choice question, used by every panel type. */
export interface Question {
	/** Globally unique — progress is keyed by panel id + question id. */
	id: string;
	prompt: string;
	options: QuestionOption[];
	/** The `label` of the correct option. */
	correctAnswer: string;
}

/** Explanatory copy shown beside the questions in a multiple-choice panel. */
export interface Reading {
	heading: string;
	paragraphs: string[];
	tip?: { label: string; body: string };
}

interface BasePanel {
	/** Globally unique — UserProgress stores answers under this id. */
	id: string;
	title: string;
	/** One-to-two sentence summary, shown when the panel is selected in the learning map. */
	description: string;
}

/** Read-and-answer panel: an article on the left, untimed questions on the right. */
export interface MultipleChoicePanel extends BasePanel {
	type: 'multiple-choice';
	reading: Reading;
	questions: Question[];
}

/** Rapid-fire panel: one question at a time, one attempt each, on a countdown. */
export interface LightningRoundPanel extends BasePanel {
	type: 'lightning-round';
	secondsPerQuestion: number;
	questions: Question[];
}

/**
 * "Question" panel: the student is prompted to talk the section through with
 * Leaf. Completes once they send their first message.
 */
export interface LeafQuestionPanel extends BasePanel {
	type: 'leaf-question';
	/** The nudge shown beside the chat, e.g. "Ask Leaf to explain…". */
	prompt: string;
	/** Clickable starter questions the student can send to Leaf in one tap. */
	suggestions: string[];
	/** Always empty — present so progress aggregates treat every panel uniformly. */
	questions: Question[];
}

export type Panel = MultipleChoicePanel | LightningRoundPanel | LeafQuestionPanel;

export interface Lesson {
	id: string;
	title: string;
	description: string;
	panels: Panel[];
}

export interface Course {
	id: string;
	title: string;
	description: string;
	lessons: Lesson[];
}

/** Every panel in a course, in learning order, tagged with its lesson. */
export function coursePanels(
	course: Course
): { lesson: Lesson; panel: Panel; panelIndex: number }[] {
	return course.lessons.flatMap((lesson) =>
		lesson.panels.map((panel, panelIndex) => ({ lesson, panel, panelIndex }))
	);
}

export function findLesson(course: Course, lessonId: string): Lesson | undefined {
	return course.lessons.find((l) => l.id === lessonId);
}

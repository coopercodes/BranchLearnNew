/**
 * Learner-facing content for every panel node in the content graph.
 *
 * The graph (graph-content.ts) owns STRUCTURE — which panels exist, what order
 * the walker visits them in, and how many correct answers each one needs. This
 * file owns what actually appears on screen when the walker lands on a panel:
 * a dictionary keyed by `PanelNode.panelID`.
 *
 * Because a panel must be answered correctly `requiredCorrect` times, the
 * walker revisits it around the training loop. Every panel kind therefore
 * carries a BANK of items and shows one per visit, rotated by the panel's
 * attempt count (`roundFor`), so repeat laps get fresh material.
 *
 * Panel kinds:
 *   - 'multiple-choice' → one untimed question per visit.
 *   - 'lightning'       → one question on a countdown; the timer running out
 *                         spends the attempt as a miss.
 *   - 'flashcard'       → think → flip → honestly self-report the check.
 *   - 'triangle'        → a rendered right triangle plus a multiple-choice
 *                         question about it.
 */

export interface PanelOption {
	/** Stable label, e.g. 'A'. The correct answer is stored as one of these. */
	label: string;
	text: string;
}

export interface PanelQuestion {
	/** Unique inside this file — `${panelID}-q${n}` by convention. */
	id: string;
	prompt: string;
	options: PanelOption[];
	/** The `label` of the correct option. */
	correctAnswer: string;
	/** Shown after a wrong answer. */
	hint?: string;
}

export type SideName = 'AB' | 'BC' | 'CA';

/**
 * A right triangle for TriangleFigure: the right angle is ALWAYS at C
 * (bottom-left); A sits above it and B out to the right, so CA and CB are the
 * legs and AB is the hypotenuse. θ is drawn at A or B.
 */
export interface TriangleSpec {
	/** Which acute vertex carries θ. */
	theta: 'A' | 'B';
	/** Text drawn along each side ('10', 'x', or the side's own name). Omit to leave blank. */
	sides?: Partial<Record<SideName, string>>;
	/** Known angle values, e.g. { A: '30°' } — merged into the θ label when at the θ vertex. */
	angles?: Partial<Record<'A' | 'B', string>>;
	/** Side drawn emphasized in gold — "the side the question is about". */
	highlight?: SideName;
}

export interface Flashcard {
	id: string;
	front: string;
	back: string;
}

/** One visit's worth of a triangle panel: the figure plus its question. */
export interface TriangleRound {
	triangle: TriangleSpec;
	question: PanelQuestion;
}

interface BasePanelContent {
	/** Matches `PanelNode.panelID` — the dictionary key, repeated for sanity. */
	panelID: string;
	title: string;
	/** One-line setup shown above the activity. */
	lede: string;
}

export interface MultipleChoiceContent extends BasePanelContent {
	type: 'multiple-choice';
	questions: PanelQuestion[];
}

export interface LightningContent extends BasePanelContent {
	type: 'lightning';
	/** Countdown per visit, in seconds. */
	seconds: number;
	questions: PanelQuestion[];
}

export interface FlashcardContent extends BasePanelContent {
	type: 'flashcard';
	cards: Flashcard[];
}

export interface TriangleContent extends BasePanelContent {
	type: 'triangle';
	rounds: TriangleRound[];
}

export type PanelContent =
	| MultipleChoiceContent
	| LightningContent
	| FlashcardContent
	| TriangleContent;

/** Which item of a bank this visit shows — attempts so far, wrapped. */
export function roundFor<T>(bank: T[], visit: number): T {
	return bank[((visit % bank.length) + bank.length) % bank.length];
}

const LABELS = ['A', 'B', 'C', 'D'];

/** Compact question builder — `correct` is the index into `texts`. */
function q(
	id: string,
	prompt: string,
	texts: string[],
	correct: number,
	hint?: string
): PanelQuestion {
	return {
		id,
		prompt,
		correctAnswer: LABELS[correct],
		hint,
		options: texts.map((text, i) => ({ label: LABELS[i], text }))
	};
}

/** Side names drawn on the figure, for "point at the side" questions. */
const NAMED_SIDES: TriangleSpec['sides'] = { AB: 'AB', BC: 'BC', CA: 'CA' };

/**
 * THE DICTIONARY. One entry per panel node in graph-content.ts, keyed by
 * `panelID`. Bank sizes are >= the panel's `requiredCorrect` so every lap of
 * the training loop sees a different item.
 */
export const PANEL_CONTENT: Record<string, PanelContent> = {
	// ─────────────────────────────── SOH ───────────────────────────────
	'soh-1': {
		panelID: 'soh-1',
		type: 'triangle',
		title: 'Label the opposite side',
		lede: 'θ is the star of the show — find the side sitting directly across from it.',
		rounds: [
			{
				triangle: { theta: 'A', sides: NAMED_SIDES },
				question: q(
					'soh-1-q1',
					'θ sits at vertex A. Which side is OPPOSITE θ?',
					['AB', 'BC', 'CA'],
					1,
					'The opposite side is the only side that never touches θ.'
				)
			},
			{
				triangle: { theta: 'B', sides: NAMED_SIDES },
				question: q(
					'soh-1-q2',
					'Now θ has moved to vertex B. Which side is OPPOSITE θ?',
					['AB', 'BC', 'CA'],
					2,
					'Look for the side that θ cannot reach.'
				)
			},
			{
				triangle: { theta: 'A', sides: NAMED_SIDES, highlight: 'BC' },
				question: q(
					'soh-1-q3',
					'The gold side sits across from θ. In SOH CAH TOA language it is the…',
					['Opposite', 'Adjacent', 'Hypotenuse'],
					0,
					'Across from θ = opposite. The hypotenuse is across from the RIGHT angle.'
				)
			}
		]
	},

	'soh-2': {
		panelID: 'soh-2',
		type: 'flashcard',
		title: 'Label the hypotenuse',
		lede: 'Think through the front of the card, flip it, and check yourself honestly.',
		cards: [
			{
				id: 'soh-2-c1',
				front: 'The hypotenuse',
				back: 'The longest side of a right triangle — always directly across from the right angle. It never moves when θ moves.'
			},
			{
				id: 'soh-2-c2',
				front: 'How do you spot the hypotenuse fast?',
				back: 'Find the little square marking the 90° corner — the hypotenuse is the one side that does not touch it.'
			},
			{
				id: 'soh-2-c3',
				front: 'SOH',
				back: 'Sine = Opposite ÷ Hypotenuse.'
			}
		]
	},

	'soh-3': {
		panelID: 'soh-3',
		type: 'multiple-choice',
		title: 'Set up sin θ',
		lede: 'Build the sine ratio before you ever reach for a calculator.',
		questions: [
			q(
				'soh-3-q1',
				'sin θ equals which ratio?',
				[
					'Opposite / Hypotenuse',
					'Adjacent / Hypotenuse',
					'Opposite / Adjacent',
					'Hypotenuse / Opposite'
				],
				0,
				'S-O-H: Sine = Opposite over Hypotenuse.'
			),
			q(
				'soh-3-q2',
				'The side opposite θ is 3 and the hypotenuse is 5. What is sin θ?',
				['4/5', '3/5', '3/4', '5/3'],
				1,
				'Drop the two lengths straight into opposite / hypotenuse.'
			),
			q(
				'soh-3-q3',
				'sin θ = 7/25, and the 7 is the opposite side. How long is the hypotenuse?',
				['7', '18', '24', '25'],
				3,
				'In O/H, the bottom number is the hypotenuse.'
			)
		]
	},

	'soh-4': {
		panelID: 'soh-4',
		type: 'triangle',
		title: 'Solve for a missing side',
		lede: 'Use sin θ = opposite / hypotenuse to pin down x.',
		rounds: [
			{
				triangle: {
					theta: 'A',
					angles: { A: '30°' },
					sides: { AB: '10', BC: 'x' },
					highlight: 'BC'
				},
				question: q(
					'soh-4-q1',
					'sin 30° = 0.5 and the hypotenuse is 10. Solve for x.',
					['5', '8.7', '10', '20'],
					0,
					'x = 10 × sin 30°.'
				)
			},
			{
				triangle: {
					theta: 'B',
					angles: { B: '45°' },
					sides: { AB: '12', CA: 'x' },
					highlight: 'CA'
				},
				question: q(
					'soh-4-q2',
					'sin 45° ≈ 0.71 and the hypotenuse is 12. x is closest to…',
					['6.0', '8.5', '12', '16.9'],
					1,
					'x = 12 × sin 45°.'
				)
			},
			{
				triangle: {
					theta: 'A',
					angles: { A: '60°' },
					sides: { AB: '14', BC: 'x' },
					highlight: 'BC'
				},
				question: q(
					'soh-4-q3',
					'sin 60° ≈ 0.87 and the hypotenuse is 14. x is closest to…',
					['7.0', '11.0', '12.1', '16.2'],
					2,
					'x = 14 × sin 60°.'
				)
			},
			{
				triangle: {
					theta: 'A',
					angles: { A: '30°' },
					sides: { BC: '6', AB: 'x' },
					highlight: 'AB'
				},
				question: q(
					'soh-4-q4',
					'This time the HYPOTENUSE is missing: sin 30° = 0.5 and the opposite side is 6. Solve for x.',
					['3', '6.9', '9', '12'],
					3,
					'Rearrange: hypotenuse = opposite ÷ sin θ = 6 ÷ 0.5.'
				)
			}
		]
	},

	'soh-5': {
		panelID: 'soh-5',
		type: 'lightning',
		title: 'Solve for a missing angle',
		lede: 'Quick-fire inverse sine — beat the clock.',
		seconds: 12,
		questions: [
			q('soh-5-q1', 'sin θ = 1/2. What is θ?', ['30°', '45°', '60°', '90°'], 0),
			q('soh-5-q2', 'sin θ = √2/2. What is θ?', ['30°', '45°', '60°', '90°'], 1),
			q('soh-5-q3', 'sin θ = √3/2. What is θ?', ['30°', '45°', '60°', '90°'], 2),
			q(
				'soh-5-q4',
				'Opposite = 5, hypotenuse = 10. What is θ?',
				['30°', '45°', '60°', '90°'],
				0,
				'sin θ = 5/10 = 1/2.'
			)
		]
	},

	// ─────────────────────────────── CAH ───────────────────────────────
	'cah-1': {
		panelID: 'cah-1',
		type: 'triangle',
		title: 'Label the adjacent side',
		lede: 'Adjacent means "next to" — the leg touching θ that is not the hypotenuse.',
		rounds: [
			{
				triangle: { theta: 'A', sides: NAMED_SIDES },
				question: q(
					'cah-1-q1',
					'θ sits at vertex A. Which side is ADJACENT to θ?',
					['AB', 'BC', 'CA'],
					2,
					'Two sides touch θ — the adjacent is the one that is NOT the hypotenuse.'
				)
			},
			{
				triangle: { theta: 'B', sides: NAMED_SIDES },
				question: q(
					'cah-1-q2',
					'Now θ is at vertex B. Which side is ADJACENT to θ?',
					['AB', 'BC', 'CA'],
					1,
					'Follow the legs out of θ; skip the hypotenuse.'
				)
			},
			{
				triangle: { theta: 'B', sides: NAMED_SIDES, highlight: 'AB' },
				question: q(
					'cah-1-q3',
					'The gold side touches θ but it is NOT the adjacent. What is it?',
					['Opposite', 'Adjacent', 'Hypotenuse'],
					2,
					'It runs across from the right angle — that makes it the hypotenuse.'
				)
			}
		]
	},

	'cah-2': {
		panelID: 'cah-2',
		type: 'flashcard',
		title: 'Label the hypotenuse',
		lede: 'Adjacent and hypotenuse both touch θ — make sure you can tell them apart.',
		cards: [
			{
				id: 'cah-2-c1',
				front: 'Adjacent vs. hypotenuse — both touch θ. How do you tell them apart?',
				back: 'The hypotenuse is across from the right angle; the adjacent is the OTHER side touching θ — one of the two legs.'
			},
			{
				id: 'cah-2-c2',
				front: 'CAH',
				back: 'Cosine = Adjacent ÷ Hypotenuse.'
			},
			{
				id: 'cah-2-c3',
				front: 'Does the hypotenuse change when θ moves to the other corner?',
				back: 'No — opposite and adjacent are relative to θ, but the hypotenuse is fixed by the right angle.'
			}
		]
	},

	'cah-3': {
		panelID: 'cah-3',
		type: 'multiple-choice',
		title: 'Set up cos θ',
		lede: 'Build the cosine ratio from the sides you can see.',
		questions: [
			q(
				'cah-3-q1',
				'cos θ equals which ratio?',
				[
					'Opposite / Hypotenuse',
					'Adjacent / Hypotenuse',
					'Adjacent / Opposite',
					'Hypotenuse / Adjacent'
				],
				1,
				'C-A-H: Cosine = Adjacent over Hypotenuse.'
			),
			q(
				'cah-3-q2',
				'The side adjacent to θ is 4 and the hypotenuse is 5. What is cos θ?',
				['3/5', '5/4', '4/5', '4/3'],
				2,
				'Adjacent on top, hypotenuse on the bottom.'
			),
			q(
				'cah-3-q3',
				'cos θ = 8/17. Which side is the 17?',
				['The opposite', 'The adjacent', 'The hypotenuse'],
				2,
				'In A/H, the bottom number is always the hypotenuse.'
			)
		]
	},

	'cah-4': {
		panelID: 'cah-4',
		type: 'lightning',
		title: 'Solve for a missing side',
		lede: 'Rapid cosine solves — one shot each, watch the clock.',
		seconds: 12,
		questions: [
			q(
				'cah-4-q1',
				'cos 60° = 0.5 and the hypotenuse is 10. The adjacent side is…',
				['5', '7.1', '8.7', '10'],
				0
			),
			q(
				'cah-4-q2',
				'cos 30° ≈ 0.87 and the hypotenuse is 8. The adjacent side is closest to…',
				['4.0', '6.9', '5.7', '8.0'],
				1
			),
			q(
				'cah-4-q3',
				'cos θ = 3/5 and the adjacent side is 9. The hypotenuse is…',
				['15', '12', '5.4', '6'],
				0,
				'hypotenuse = adjacent ÷ cos θ = 9 ÷ 0.6.'
			),
			q(
				'cah-4-q4',
				'cos 45° ≈ 0.71 and the hypotenuse is 10. The adjacent side is closest to…',
				['7.1', '5.0', '8.7', '10'],
				0
			)
		]
	},

	'cah-5': {
		panelID: 'cah-5',
		type: 'triangle',
		title: 'Solve for a missing angle',
		lede: 'Read the two sides off the figure, build cos θ, and work backwards to θ.',
		rounds: [
			{
				triangle: { theta: 'A', sides: { CA: '5', AB: '10' }, highlight: 'CA' },
				question: q(
					'cah-5-q1',
					'Adjacent = 5, hypotenuse = 10, so cos θ = 0.5. What is θ?',
					['30°', '45°', '60°', '90°'],
					2,
					'cos 60° = 1/2 — cosine SHRINKS as the angle grows.'
				)
			},
			{
				triangle: { theta: 'A', sides: { CA: '7.1', AB: '10' }, highlight: 'CA' },
				question: q(
					'cah-5-q2',
					'Adjacent = 7.1, hypotenuse = 10, so cos θ ≈ 0.71. What is θ?',
					['30°', '45°', '60°', '90°'],
					1,
					'cos 45° = √2/2 ≈ 0.71.'
				)
			},
			{
				triangle: { theta: 'B', sides: { BC: '8.7', AB: '10' }, highlight: 'BC' },
				question: q(
					'cah-5-q3',
					'θ is at B now. Adjacent = 8.7, hypotenuse = 10, so cos θ ≈ 0.87. What is θ?',
					['30°', '45°', '60°', '90°'],
					0,
					'cos 30° = √3/2 ≈ 0.87.'
				)
			}
		]
	},

	// ─────────────────────────────── TOA ───────────────────────────────
	'toa-1': {
		panelID: 'toa-1',
		type: 'flashcard',
		title: 'Label the opposite side',
		lede: 'Tangent needs BOTH legs — start by nailing the opposite one.',
		cards: [
			{
				id: 'toa-1-c1',
				front: 'The opposite side',
				back: 'The side directly across from θ — the only side that never touches θ.'
			},
			{
				id: 'toa-1-c2',
				front: 'θ moves from one acute corner to the other. What happens to the opposite side?',
				back: 'It swaps with the adjacent — opposite and adjacent are always relative to where θ sits.'
			},
			{
				id: 'toa-1-c3',
				front: 'TOA',
				back: 'Tangent = Opposite ÷ Adjacent. No hypotenuse anywhere in sight.'
			}
		]
	},

	'toa-2': {
		panelID: 'toa-2',
		type: 'triangle',
		title: 'Label the adjacent side',
		lede: 'Tangent is the legs-only ratio — find the adjacent leg for this θ.',
		rounds: [
			{
				triangle: { theta: 'B', sides: NAMED_SIDES },
				question: q(
					'toa-2-q1',
					'θ sits at vertex B. Which side is ADJACENT to θ?',
					['AB', 'BC', 'CA'],
					1,
					'The adjacent touches θ and forms the right angle — not the hypotenuse.'
				)
			},
			{
				triangle: { theta: 'A', sides: NAMED_SIDES },
				question: q(
					'toa-2-q2',
					'Now θ is at vertex A. Which side is ADJACENT to θ?',
					['AB', 'BC', 'CA'],
					2,
					'Skip the hypotenuse; take the leg running out of θ.'
				)
			},
			{
				triangle: { theta: 'A', sides: NAMED_SIDES },
				question: q(
					'toa-2-q3',
					'tan θ = opposite / adjacent. With θ at A, that is…',
					['BC / CA', 'CA / BC', 'BC / AB', 'CA / AB'],
					0,
					'Opposite of A is BC; adjacent to A is CA. The hypotenuse never appears in tangent.'
				)
			}
		]
	},

	'toa-3': {
		panelID: 'toa-3',
		type: 'lightning',
		title: 'Set up tan θ',
		lede: 'Fast tangent setups — no hypotenuse allowed.',
		seconds: 12,
		questions: [
			q(
				'toa-3-q1',
				'tan θ equals which ratio?',
				[
					'Opposite / Hypotenuse',
					'Adjacent / Opposite',
					'Opposite / Adjacent',
					'Adjacent / Hypotenuse'
				],
				2
			),
			q('toa-3-q2', 'Opposite = 3, adjacent = 4. What is tan θ?', ['3/4', '4/3', '3/5', '4/5'], 0),
			q('toa-3-q3', 'tan 45° = ?', ['0', '1', '√3', '1/2'], 1),
			q(
				'toa-3-q4',
				'tan θ = 5/12 and the opposite side is 5. The adjacent side is…',
				['12', '5', '13', '7'],
				0
			)
		]
	},

	'toa-4': {
		panelID: 'toa-4',
		type: 'triangle',
		title: 'Solve for a missing side',
		lede: 'Use tan θ = opposite / adjacent to pin down x.',
		rounds: [
			{
				triangle: {
					theta: 'A',
					angles: { A: '45°' },
					sides: { CA: '6', BC: 'x' },
					highlight: 'BC'
				},
				question: q(
					'toa-4-q1',
					'tan 45° = 1 and the adjacent side is 6. Solve for x.',
					['3', '6', '8.5', '12'],
					1,
					'x = 6 × tan 45°.'
				)
			},
			{
				triangle: {
					theta: 'A',
					angles: { A: '30°' },
					sides: { CA: '9', BC: 'x' },
					highlight: 'BC'
				},
				question: q(
					'toa-4-q2',
					'tan 30° ≈ 0.58 and the adjacent side is 9. x is closest to…',
					['4.5', '5.2', '7.8', '15.6'],
					1,
					'x = 9 × tan 30°.'
				)
			},
			{
				triangle: {
					theta: 'A',
					angles: { A: '60°' },
					sides: { CA: '4', BC: 'x' },
					highlight: 'BC'
				},
				question: q(
					'toa-4-q3',
					'tan 60° ≈ 1.73 and the adjacent side is 4. x is closest to…',
					['2.3', '4.6', '6.9', '8.0'],
					2,
					'x = 4 × tan 60°.'
				)
			},
			{
				triangle: { theta: 'A', sides: { BC: '12', CA: 'x' }, highlight: 'CA' },
				question: q(
					'toa-4-q4',
					'tan θ = 3/4 and the OPPOSITE side is 12. Solve for the adjacent side x.',
					['9', '12', '16', '20'],
					2,
					'Rearrange: adjacent = opposite ÷ tan θ = 12 ÷ 0.75.'
				)
			}
		]
	},

	'toa-5': {
		panelID: 'toa-5',
		type: 'multiple-choice',
		title: 'Solve for a missing angle',
		lede: 'Work backwards from a tangent ratio to the angle that made it.',
		questions: [
			q('toa-5-q1', 'tan θ = 1. What is θ?', ['30°', '45°', '60°', '90°'], 1, 'Equal legs → 45°.'),
			q(
				'toa-5-q2',
				'Opposite = 7 and adjacent = 7. What is θ?',
				['30°', '45°', '60°', '7°'],
				1,
				'tan θ = 7/7 = 1.'
			),
			q('toa-5-q3', 'tan θ = √3. What is θ?', ['30°', '45°', '60°', '90°'], 2),
			q(
				'toa-5-q4',
				'Opposite = 1 and adjacent = √3. What is θ?',
				['30°', '45°', '60°', '90°'],
				0,
				'tan 30° = 1/√3.'
			)
		]
	}
};

/** Content for a graph panel node, if any exists. */
export function contentFor(panelID: string): PanelContent | null {
	return PANEL_CONTENT[panelID] ?? null;
}

/**
 * Serialize the visit the learner is looking at into prompt context for Leaf.
 * Correct answers are included but flagged so Leaf coaches toward them instead
 * of reading them out.
 */
export function describePanelForLeaf(content: PanelContent, visit: number): string {
	const lines = [
		`The learner is on the "${content.title}" panel (${content.panelID}). ${content.lede}`
	];

	const guard =
		'The correct answer is marked for YOUR reference only — never state it outright; guide the learner toward it step by step.';

	if (content.type === 'flashcard') {
		const card = roundFor(content.cards, visit);
		lines.push(
			'This is a flashcard self-check: the learner thinks it through, flips the card, and honestly reports whether they had it.',
			`Card front: ${card.front}`,
			`Card back (reference only — do not just read it out): ${card.back}`
		);
		return lines.join('\n');
	}

	const question =
		content.type === 'triangle'
			? roundFor(content.rounds, visit).question
			: roundFor(content.questions, visit);

	if (content.type === 'lightning') {
		lines.push(`This is a timed lightning question (${content.seconds} seconds, one attempt).`);
	} else if (content.type === 'triangle') {
		const { triangle } = roundFor(content.rounds, visit);
		const sides = Object.entries(triangle.sides ?? {})
			.map(([name, text]) => `${name} = "${text}"`)
			.join(', ');
		lines.push(
			`A right triangle is drawn: the right angle is at C, with legs CA and CB and hypotenuse AB. θ is at vertex ${triangle.theta}.` +
				(sides ? ` Labeled: ${sides}.` : '') +
				(triangle.highlight ? ` Side ${triangle.highlight} is highlighted in gold.` : '')
		);
	}

	const options = question.options
		.map((o) => `${o.label}) ${o.text}${o.label === question.correctAnswer ? ' [correct]' : ''}`)
		.join(' ');
	lines.push(`Question: ${question.prompt}`, `Options: ${options}`, guard);
	return lines.join('\n');
}

/**
 * The whole course as ONE flat array.
 *
 * Each object in `panels` is a single self-contained panel with all the info it
 * needs to render. The flow is dead simple: walk this array from index 0 to the
 * end. There is NO recommender and NO scoring — where the learner goes next is
 * decided in one place (`advance()` in the /trigonometry page), and by default
 * that's just `index + 1`. Edit that function to build your own algorithm.
 *
 * Panel kinds:
 *   - 'reading'  → some text to read (topic intro + article). Completes on read.
 *   - 'question' → one multiple-choice question. Retried until it's correct.
 *   - 'done'     → the final "you finished" screen.
 */

export const TOPICS = ['SOH', 'CAH', 'TOA'] as const;
export type Topic = (typeof TOPICS)[number];

export interface Option {
	/** Stable label, e.g. 'A'. The correct answer is stored as one of these. */
	label: string;
	text: string;
}

export interface Panel {
	/** Globally unique — localStorage progress is keyed by this. */
	id: string;
	/** Which topic this belongs to. Drives the % on the topic map. Omit for 'done'. */
	topic?: Topic;
	type: 'reading' | 'question' | 'done';
	title: string;

	// --- reading panels ---
	formula?: string;
	/** Paragraphs of article body. */
	body?: string[];

	// --- question panels ---
	prompt?: string;
	options?: Option[];
	/** The `label` of the correct option. */
	answer?: string;
	hint?: string;
}

/** Compact helper for a 4-option question. `answer` is the correct label. */
function q(
	id: string,
	topic: Topic,
	prompt: string,
	options: [string, string, string, string],
	answer: string,
	hint?: string
): Panel {
	const labels = ['A', 'B', 'C', 'D'];
	return {
		id,
		topic,
		type: 'question',
		title: prompt,
		prompt,
		answer,
		hint,
		options: options.map((text, i) => ({ label: labels[i], text }))
	};
}

/**
 * THE PATH. Just an array — add, remove, or reorder objects and the flow follows
 * along. Order here is the order the learner sees.
 */
export const panels: Panel[] = [
	// ─────────────────────────────── SOH ───────────────────────────────
	{
		id: 'soh-read',
		topic: 'SOH',
		type: 'reading',
		title: 'Sine — Opposite over Hypotenuse',
		formula: 'sin(θ) = Opposite / Hypotenuse',
		body: [
			'Sine is the ratio of the side opposite an angle to the hypotenuse: sin(θ) = opposite / hypotenuse.',
			'In any right triangle, pick an angle θ. The side directly across from it is the opposite; the longest side, across from the right angle, is always the hypotenuse.',
			'Because it is a ratio against the longest side, sin(θ) always lands between 0 and 1 for an acute angle.'
		]
	},
	q('soh-mc-1', 'SOH', 'sin(θ) equals which ratio?', [
		'Opposite / Hypotenuse',
		'Adjacent / Hypotenuse',
		'Opposite / Adjacent',
		'Hypotenuse / Opposite'
	], 'A'),
	q(
		'soh-mc-2',
		'SOH',
		'A right triangle has opposite 3 and hypotenuse 5. What is sin(θ)?',
		['3/5', '4/5', '3/4', '5/3'],
		'A',
		'Drop the two lengths straight into the ratio.'
	),
	q('soh-fb-1', 'SOH', 'sin(θ) = ______ / Hypotenuse', [
		'Opposite',
		'Adjacent',
		'Hypotenuse',
		'Angle'
	], 'A'),
	q(
		'soh-fb-2',
		'SOH',
		'If sin(θ) = 0.5 and the hypotenuse is 10, the opposite side is ______.',
		['5', '20', '2', '0.05'],
		'A'
	),
	q('soh-lr-1', 'SOH', 'sin(30°) = ?', ['1/2', '1', '√3/2', '0'], 'A'),
	q(
		'soh-tla-1',
		'SOH',
		'A ladder leans against a wall at 60° and reaches 8 m up. Using sine, the ladder length is closest to…',
		['9.24 m', '6.93 m', '4.00 m', '16.0 m'],
		'A',
		'ladder = height / sin(60°)'
	),
	q(
		'soh-tla-2',
		'SOH',
		'A right triangle has hypotenuse 13 and opposite 5. The angle θ is closest to…',
		['22.6°', '67.4°', '45.0°', '30.0°'],
		'A',
		'θ = sin⁻¹(5/13)'
	),
	q('soh-fc-1', 'SOH', 'What does the S in SOH stand for?', [
		'Sine',
		'Slope',
		'Secant',
		'Sum'
	], 'A'),
	q(
		'soh-final-1',
		'SOH',
		'Given θ = 45° and hypotenuse 12, the opposite side is closest to…',
		['8.49', '6.00', '12.0', '17.0'],
		'A',
		'opposite = 12 × sin(45°)'
	),

	// ─────────────────────────────── CAH ───────────────────────────────
	{
		id: 'cah-read',
		topic: 'CAH',
		type: 'reading',
		title: 'Cosine — Adjacent over Hypotenuse',
		formula: 'cos(θ) = Adjacent / Hypotenuse',
		body: [
			'Cosine is the ratio of the side adjacent to an angle to the hypotenuse: cos(θ) = adjacent / hypotenuse.',
			'The adjacent side touches the angle θ but is never the hypotenuse. Where sine looks across the triangle, cosine looks along it.',
			'Sine and cosine are linked: sin²(θ) + cos²(θ) = 1, so knowing one always recovers the other.'
		]
	},
	q('cah-mc-1', 'CAH', 'cos(θ) equals which ratio?', [
		'Adjacent / Hypotenuse',
		'Opposite / Hypotenuse',
		'Opposite / Adjacent',
		'Adjacent / Opposite'
	], 'A'),
	q(
		'cah-mc-2',
		'CAH',
		'A right triangle has adjacent 4 and hypotenuse 5. What is cos(θ)?',
		['4/5', '3/5', '4/3', '5/4'],
		'A'
	),
	q('cah-fb-1', 'CAH', 'cos(θ) = ______ / Hypotenuse', [
		'Adjacent',
		'Opposite',
		'Hypotenuse',
		'Angle'
	], 'A'),
	q(
		'cah-fb-2',
		'CAH',
		'If cos(θ) = 0.8 and the hypotenuse is 10, the adjacent side is ______.',
		['8', '2', '12.5', '0.08'],
		'A'
	),
	q('cah-lr-1', 'CAH', 'cos(60°) = ?', ['1/2', '√3/2', '1', '0'], 'A'),
	q(
		'cah-tla-1',
		'CAH',
		'A 10 m ramp meets the ground at 20°. Using cosine, its base extends along the ground about…',
		['9.40 m', '3.42 m', '10.6 m', '5.00 m'],
		'A',
		'base = 10 × cos(20°)'
	),
	q(
		'cah-tla-2',
		'CAH',
		'A right triangle has hypotenuse 17 and adjacent 15. The angle θ is closest to…',
		['28.1°', '61.9°', '45.0°', '32.0°'],
		'A',
		'θ = cos⁻¹(15/17)'
	),
	q('cah-fc-1', 'CAH', 'What does the A in CAH stand for?', [
		'Adjacent',
		'Angle',
		'Area',
		'Altitude'
	], 'A'),
	q(
		'cah-final-1',
		'CAH',
		'Given θ = 30° and hypotenuse 20, the adjacent side is closest to…',
		['17.3', '10.0', '20.0', '11.5'],
		'A',
		'adjacent = 20 × cos(30°)'
	),

	// ─────────────────────────────── TOA ───────────────────────────────
	{
		id: 'toa-read',
		topic: 'TOA',
		type: 'reading',
		title: 'Tangent — Opposite over Adjacent',
		formula: 'tan(θ) = Opposite / Adjacent',
		body: [
			'Tangent is the ratio of the opposite side to the adjacent side: tan(θ) = opposite / adjacent.',
			'It is the only SOH · CAH · TOA ratio that skips the hypotenuse entirely, so it shines when a problem never mentions the longest side.',
			'Tangent is also sin(θ) / cos(θ). It starts at 0, equals 1 at 45°, and grows without bound toward 90°.'
		]
	},
	q('toa-mc-1', 'TOA', 'tan(θ) equals which ratio?', [
		'Opposite / Adjacent',
		'Opposite / Hypotenuse',
		'Adjacent / Hypotenuse',
		'Hypotenuse / Adjacent'
	], 'A'),
	q(
		'toa-mc-2',
		'TOA',
		'A right triangle has opposite 3 and adjacent 4. What is tan(θ)?',
		['3/4', '4/3', '3/5', '4/5'],
		'A'
	),
	q('toa-fb-1', 'TOA', 'tan(θ) = Opposite / ______', [
		'Adjacent',
		'Hypotenuse',
		'Opposite',
		'Angle'
	], 'A'),
	q(
		'toa-fb-2',
		'TOA',
		'If tan(θ) = 2 and the adjacent side is 6, the opposite side is ______.',
		['12', '3', '8', '4'],
		'A'
	),
	q('toa-lr-1', 'TOA', 'tan(45°) = ?', ['1', '1/2', '√2', '0'], 'A'),
	q(
		'toa-tla-1',
		'TOA',
		'From 50 m away, the angle of elevation to a treetop is 35°. Using tangent, the tree height is about…',
		['35.0 m', '28.7 m', '61.0 m', '50.0 m'],
		'A',
		'height = 50 × tan(35°)'
	),
	q(
		'toa-tla-2',
		'TOA',
		'A right triangle has opposite 7 and adjacent 24. The angle θ is closest to…',
		['16.3°', '73.7°', '45.0°', '20.0°'],
		'A',
		'θ = tan⁻¹(7/24)'
	),
	q('toa-fc-1', 'TOA', 'TOA = Tangent, Opposite, ______', [
		'Adjacent',
		'Hypotenuse',
		'Angle',
		'Area'
	], 'A'),
	q(
		'toa-final-1',
		'TOA',
		'A right triangle has opposite 10 and adjacent 10. The angle θ is…',
		['45°', '30°', '60°', '90°'],
		'A',
		'θ = tan⁻¹(1)'
	),

	// ─────────────────────────────── DONE ───────────────────────────────
	{ id: 'done', type: 'done', title: 'SOH · CAH · TOA complete' }
];

/** Look up a panel by id. */
export function findPanel(id: string): Panel | undefined {
	return panels.find((p) => p.id === id);
}

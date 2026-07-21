/**
 * Static content for the algorithm-driven Trigonometry flow.
 *
 * Same shape as the /algo demo: three SOH · CAH · TOA sections, each holding
 * ONE panel of every panel type. The recommender cycles the learner across
 * these types (spreading practice) until each panel's required-correct count is
 * met. Gradeable panels carry a small MC question pool (deliberately basic);
 * the single article panel carries body copy and completes on read.
 */

import {
	PANEL_TYPE_LABELS,
	panelId,
	type TrigPanel,
	type TrigPanelType,
	type TrigQuestion,
	type TrigSection
} from './types';

const GROUP = 'SOH · CAH · TOA';

/** Gradeable question pools for a section, keyed by panel type. */
type GradedType = Exclude<TrigPanelType, 'article'>;

interface SectionSeed {
	id: string;
	label: string;
	title: string;
	formula: string;
	overview: string;
	/** Article body paragraphs. */
	article: string[];
	questions: Record<GradedType, TrigQuestion[]>;
}

function buildSection(seed: SectionSeed): TrigSection {
	const article: TrigPanel = {
		id: panelId(seed.id, 'article'),
		sectionId: seed.id,
		type: 'article',
		title: `${PANEL_TYPE_LABELS.article}: ${seed.label}`,
		questions: [],
		body: seed.article
	};

	const graded = (Object.keys(seed.questions) as GradedType[]).map(
		(type): TrigPanel => ({
			id: panelId(seed.id, type),
			sectionId: seed.id,
			type,
			title: `${PANEL_TYPE_LABELS[type]}: ${seed.label}`,
			questions: seed.questions[type]
		})
	);

	return {
		id: seed.id,
		label: seed.label,
		title: seed.title,
		group: GROUP,
		formula: seed.formula,
		overview: seed.overview,
		panels: [article, ...graded]
	};
}

/** Compact helper: 4-option question where `answer` is the correct label. */
function q(
	id: string,
	prompt: string,
	options: [string, string, string, string],
	answer: string,
	hint?: string
): TrigQuestion {
	const labels = ['A', 'B', 'C', 'D'];
	return {
		id,
		prompt,
		correctAnswer: answer,
		hint,
		options: options.map((text, i) => ({ label: labels[i], text }))
	};
}

export const trigSections: TrigSection[] = [
	buildSection({
		id: 'soh',
		label: 'SOH',
		title: 'Sine — Opposite over Hypotenuse',
		formula: 'sin(θ) = Opposite / Hypotenuse',
		overview:
			'Sine relates the side opposite an angle to the hypotenuse. Pick an angle θ: the side across from it is the opposite, and the longest side is always the hypotenuse.',
		article: [
			'Sine is the ratio of the side opposite an angle to the hypotenuse: sin(θ) = opposite / hypotenuse.',
			'In any right triangle, pick an angle θ. The side directly across from it is the opposite; the longest side, across from the right angle, is always the hypotenuse.',
			'Because it is a ratio against the longest side, sin(θ) always lands between 0 and 1 for an acute angle.'
		],
		questions: {
			'multiple-choice': [
				q('soh-mc-1', 'sin(θ) equals which ratio?', [
					'Opposite / Hypotenuse',
					'Adjacent / Hypotenuse',
					'Opposite / Adjacent',
					'Hypotenuse / Opposite'
				], 'A'),
				q(
					'soh-mc-2',
					'A right triangle has opposite 3 and hypotenuse 5. What is sin(θ)?',
					['3/5', '4/5', '3/4', '5/3'],
					'A',
					'Drop the two lengths straight into the ratio.'
				)
			],
			'fill-blank': [
				q('soh-fb-1', 'sin(θ) = ______ / Hypotenuse', [
					'Opposite',
					'Adjacent',
					'Hypotenuse',
					'Angle'
				], 'A'),
				q(
					'soh-fb-2',
					'If sin(θ) = 0.5 and the hypotenuse is 10, the opposite side is ______.',
					['5', '20', '2', '0.05'],
					'A'
				)
			],
			'lightning-round': [
				q('soh-lr-1', '⚡ sin(30°) = ?', ['1/2', '1', '√3/2', '0'], 'A')
			],
			'triangle-long-answer': [
				q(
					'soh-tla-1',
					'A ladder leans against a wall at 60° and reaches 8 m up. Using sine, the ladder length is closest to…',
					['9.24 m', '6.93 m', '4.00 m', '16.0 m'],
					'A',
					'ladder = height / sin(60°)'
				),
				q(
					'soh-tla-2',
					'A right triangle has hypotenuse 13 and opposite 5. The angle θ is closest to…',
					['22.6°', '67.4°', '45.0°', '30.0°'],
					'A',
					'θ = sin⁻¹(5/13)'
				)
			],
			flashcards: [
				q('soh-fc-1', 'Card: what does the S in SOH stand for?', [
					'Sine',
					'Slope',
					'Secant',
					'Sum'
				], 'A')
			],
			final: [
				q(
					'soh-final-1',
					'Final: given θ = 45° and hypotenuse 12, the opposite side is closest to…',
					['8.49', '6.00', '12.0', '17.0'],
					'A',
					'opposite = 12 × sin(45°)'
				)
			]
		}
	}),
	buildSection({
		id: 'cah',
		label: 'CAH',
		title: 'Cosine — Adjacent over Hypotenuse',
		formula: 'cos(θ) = Adjacent / Hypotenuse',
		overview:
			'Cosine relates the side adjacent to an angle to the hypotenuse. The adjacent side touches θ but is not the hypotenuse. Where sine looks across the triangle, cosine looks along it.',
		article: [
			'Cosine is the ratio of the side adjacent to an angle to the hypotenuse: cos(θ) = adjacent / hypotenuse.',
			'The adjacent side touches the angle θ but is never the hypotenuse. Where sine looks across the triangle, cosine looks along it.',
			'Sine and cosine are linked: sin²(θ) + cos²(θ) = 1, so knowing one always recovers the other.'
		],
		questions: {
			'multiple-choice': [
				q('cah-mc-1', 'cos(θ) equals which ratio?', [
					'Adjacent / Hypotenuse',
					'Opposite / Hypotenuse',
					'Opposite / Adjacent',
					'Adjacent / Opposite'
				], 'A'),
				q(
					'cah-mc-2',
					'A right triangle has adjacent 4 and hypotenuse 5. What is cos(θ)?',
					['4/5', '3/5', '4/3', '5/4'],
					'A'
				)
			],
			'fill-blank': [
				q('cah-fb-1', 'cos(θ) = ______ / Hypotenuse', [
					'Adjacent',
					'Opposite',
					'Hypotenuse',
					'Angle'
				], 'A'),
				q(
					'cah-fb-2',
					'If cos(θ) = 0.8 and the hypotenuse is 10, the adjacent side is ______.',
					['8', '2', '12.5', '0.08'],
					'A'
				)
			],
			'lightning-round': [
				q('cah-lr-1', '⚡ cos(60°) = ?', ['1/2', '√3/2', '1', '0'], 'A')
			],
			'triangle-long-answer': [
				q(
					'cah-tla-1',
					'A 10 m ramp meets the ground at 20°. Using cosine, its base extends along the ground about…',
					['9.40 m', '3.42 m', '10.6 m', '5.00 m'],
					'A',
					'base = 10 × cos(20°)'
				),
				q(
					'cah-tla-2',
					'A right triangle has hypotenuse 17 and adjacent 15. The angle θ is closest to…',
					['28.1°', '61.9°', '45.0°', '32.0°'],
					'A',
					'θ = cos⁻¹(15/17)'
				)
			],
			flashcards: [
				q('cah-fc-1', 'Card: what does the A in CAH stand for?', [
					'Adjacent',
					'Angle',
					'Area',
					'Altitude'
				], 'A')
			],
			final: [
				q(
					'cah-final-1',
					'Final: given θ = 30° and hypotenuse 20, the adjacent side is closest to…',
					['17.3', '10.0', '20.0', '11.5'],
					'A',
					'adjacent = 20 × cos(30°)'
				)
			]
		}
	}),
	buildSection({
		id: 'toa',
		label: 'TOA',
		title: 'Tangent — Opposite over Adjacent',
		formula: 'tan(θ) = Opposite / Adjacent',
		overview:
			'Tangent is the ratio of the opposite side to the adjacent side — the only SOH · CAH · TOA ratio that skips the hypotenuse entirely. It shines when a problem never mentions the longest side.',
		article: [
			'Tangent is the ratio of the opposite side to the adjacent side: tan(θ) = opposite / adjacent.',
			'It is the only SOH · CAH · TOA ratio that skips the hypotenuse entirely, so it shines when a problem never mentions the longest side.',
			'Tangent is also sin(θ) / cos(θ). It starts at 0, equals 1 at 45°, and grows without bound toward 90°.'
		],
		questions: {
			'multiple-choice': [
				q('toa-mc-1', 'tan(θ) equals which ratio?', [
					'Opposite / Adjacent',
					'Opposite / Hypotenuse',
					'Adjacent / Hypotenuse',
					'Hypotenuse / Adjacent'
				], 'A'),
				q(
					'toa-mc-2',
					'A right triangle has opposite 3 and adjacent 4. What is tan(θ)?',
					['3/4', '4/3', '3/5', '4/5'],
					'A'
				)
			],
			'fill-blank': [
				q('toa-fb-1', 'tan(θ) = Opposite / ______', [
					'Adjacent',
					'Hypotenuse',
					'Opposite',
					'Angle'
				], 'A'),
				q(
					'toa-fb-2',
					'If tan(θ) = 2 and the adjacent side is 6, the opposite side is ______.',
					['12', '3', '8', '4'],
					'A'
				)
			],
			'lightning-round': [
				q('toa-lr-1', '⚡ tan(45°) = ?', ['1', '1/2', '√2', '0'], 'A')
			],
			'triangle-long-answer': [
				q(
					'toa-tla-1',
					'From 50 m away, the angle of elevation to a treetop is 35°. Using tangent, the tree height is about…',
					['35.0 m', '28.7 m', '61.0 m', '50.0 m'],
					'A',
					'height = 50 × tan(35°)'
				),
				q(
					'toa-tla-2',
					'A right triangle has opposite 7 and adjacent 24. The angle θ is closest to…',
					['16.3°', '73.7°', '45.0°', '20.0°'],
					'A',
					'θ = tan⁻¹(7/24)'
				)
			],
			flashcards: [
				q('toa-fc-1', 'Card: TOA = Tangent, Opposite, ______', [
					'Adjacent',
					'Hypotenuse',
					'Angle',
					'Area'
				], 'A')
			],
			final: [
				q(
					'toa-final-1',
					'Final: a right triangle has opposite 10 and adjacent 10. The angle θ is…',
					['45°', '30°', '60°', '90°'],
					'A',
					'θ = tan⁻¹(1)'
				)
			]
		}
	})
];

/** Look up a section by id. */
export function findSection(id: string): TrigSection | undefined {
	return trigSections.find((s) => s.id === id);
}

/** Look up a panel anywhere in the course. */
export function findPanel(id: string): TrigPanel | undefined {
	for (const section of trigSections) {
		const panel = section.panels.find((p) => p.id === id);
		if (panel) return panel;
	}
	return undefined;
}

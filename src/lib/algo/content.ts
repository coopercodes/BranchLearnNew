/**
 * Static content for the /algo demo: three trigonometry sections (SOH, CAH,
 * TOA), each with one panel of every type and a small question pool the
 * simulator draws from.
 */

import {
	PANEL_TYPE_LABELS,
	panelId,
	type AlgoPanel,
	type AlgoPanelType,
	type AlgoQuestion,
	type AlgoSection,
	type AlgoUser,
	type SectionId
} from './types';

export const algoUser: AlgoUser = {
	id: 'user-demo-01',
	name: 'Cooper Lappenbusch',
	goal: 'The GOAT?'
};

interface SectionSeed {
	id: SectionId;
	title: string;
	formula: string;
	description: string;
	articleSummary: string;
	/** Question pools, keyed by every gradeable panel type. */
	questions: Record<Exclude<AlgoPanelType, 'article'>, AlgoQuestion[]>;
}

function buildSection(seed: SectionSeed): AlgoSection {
	const article: AlgoPanel = {
		id: panelId(seed.id, 'article'),
		sectionId: seed.id,
		type: 'article',
		title: `${PANEL_TYPE_LABELS.article}: ${seed.title}`,
		questions: [],
		summary: seed.articleSummary
	};
	const graded = (Object.keys(seed.questions) as Exclude<AlgoPanelType, 'article'>[]).map(
		(type): AlgoPanel => ({
			id: panelId(seed.id, type),
			sectionId: seed.id,
			type,
			title: `${PANEL_TYPE_LABELS[type]}: ${seed.title}`,
			questions: seed.questions[type]
		})
	);
	return {
		id: seed.id,
		title: seed.title,
		formula: seed.formula,
		description: seed.description,
		panels: [article, ...graded]
	};
}

export const algoSections: AlgoSection[] = [
	buildSection({
		id: 'soh',
		title: 'SOH',
		formula: 'sin(θ) = Opposite / Hypotenuse',
		description: 'Sine relates the side opposite an angle to the hypotenuse.',
		articleSummary:
			'Sine is the ratio of the side opposite an angle to the hypotenuse. In any right triangle, pick an angle θ: the side across from it is the opposite, and the longest side (across from the right angle) is always the hypotenuse.',
		questions: {
			'multiple-choice': [
				{ prompt: 'sin(θ) equals which ratio?', answer: 'Opposite / Hypotenuse' },
				{
					prompt: 'A triangle has opposite 3 and hypotenuse 5. What is sin(θ)?',
					answer: '3/5 = 0.6'
				},
				{
					prompt: 'Which side is always the hypotenuse?',
					answer: 'The side opposite the right angle'
				}
			],
			'fill-blank': [
				{ prompt: 'sin(θ) = ______ / Hypotenuse', answer: 'Opposite' },
				{ prompt: 'sin(θ) = Opposite / ______', answer: 'Hypotenuse' },
				{
					prompt: 'If sin(θ) = 0.5 and the hypotenuse is 10, the opposite side is ______.',
					answer: '5'
				}
			],
			'lightning-round': [
				{ prompt: 'Quick! sin(30°) = ?', answer: '0.5' },
				{ prompt: 'Quick! Opposite 6, hypotenuse 10 — sin(θ)?', answer: '0.6' },
				{ prompt: 'Quick! Does sine use the adjacent side?', answer: 'No' }
			],
			'triangle-long-answer': [
				{
					prompt:
						'A ladder leans against a wall at 60° and reaches 8 m up. Use sine to find the ladder length.',
					answer: '8 / sin(60°) ≈ 9.24 m'
				},
				{
					prompt: 'Given a right triangle with hypotenuse 13 and opposite 5, solve for θ.',
					answer: 'θ = sin⁻¹(5/13) ≈ 22.6°'
				}
			],
			flashcards: [
				{ prompt: 'Card: What does the S in SOH stand for?', answer: 'Sine' },
				{ prompt: 'Card: SOH = Sine, ______, Hypotenuse', answer: 'Opposite' }
			],
			final: [
				{
					prompt:
						'Final check: solve a full SOH problem — find the opposite side given θ = 45° and hypotenuse 12.',
					answer: '12 × sin(45°) ≈ 8.49'
				}
			]
		}
	}),
	buildSection({
		id: 'cah',
		title: 'CAH',
		formula: 'cos(θ) = Adjacent / Hypotenuse',
		description: 'Cosine relates the side adjacent to an angle to the hypotenuse.',
		articleSummary:
			'Cosine is the ratio of the side adjacent to an angle to the hypotenuse. The adjacent side touches the angle θ (but is not the hypotenuse). Where sine looks across the triangle, cosine looks along it.',
		questions: {
			'multiple-choice': [
				{ prompt: 'cos(θ) equals which ratio?', answer: 'Adjacent / Hypotenuse' },
				{
					prompt: 'A triangle has adjacent 4 and hypotenuse 5. What is cos(θ)?',
					answer: '4/5 = 0.8'
				},
				{
					prompt: 'Which side is the adjacent side?',
					answer: 'The side touching θ that is not the hypotenuse'
				}
			],
			'fill-blank': [
				{ prompt: 'cos(θ) = ______ / Hypotenuse', answer: 'Adjacent' },
				{ prompt: 'cos(θ) = Adjacent / ______', answer: 'Hypotenuse' },
				{
					prompt: 'If cos(θ) = 0.8 and the hypotenuse is 10, the adjacent side is ______.',
					answer: '8'
				}
			],
			'lightning-round': [
				{ prompt: 'Quick! cos(60°) = ?', answer: '0.5' },
				{ prompt: 'Quick! Adjacent 8, hypotenuse 10 — cos(θ)?', answer: '0.8' },
				{ prompt: 'Quick! Does cosine use the opposite side?', answer: 'No' }
			],
			'triangle-long-answer': [
				{
					prompt:
						'A 10 m ramp meets the ground at 20°. Use cosine to find how far its base extends along the ground.',
					answer: '10 × cos(20°) ≈ 9.40 m'
				},
				{
					prompt: 'Given a right triangle with hypotenuse 17 and adjacent 15, solve for θ.',
					answer: 'θ = cos⁻¹(15/17) ≈ 28.1°'
				}
			],
			flashcards: [
				{ prompt: 'Card: What does the C in CAH stand for?', answer: 'Cosine' },
				{ prompt: 'Card: CAH = Cosine, ______, Hypotenuse', answer: 'Adjacent' }
			],
			final: [
				{
					prompt:
						'Final check: solve a full CAH problem — find the adjacent side given θ = 30° and hypotenuse 20.',
					answer: '20 × cos(30°) ≈ 17.32'
				}
			]
		}
	}),
	buildSection({
		id: 'toa',
		title: 'TOA',
		formula: 'tan(θ) = Opposite / Adjacent',
		description: 'Tangent relates the opposite side to the adjacent side.',
		articleSummary:
			'Tangent is the ratio of the opposite side to the adjacent side — the only SOH-CAH-TOA ratio that skips the hypotenuse entirely. It is perfect when a problem never mentions the longest side.',
		questions: {
			'multiple-choice': [
				{ prompt: 'tan(θ) equals which ratio?', answer: 'Opposite / Adjacent' },
				{
					prompt: 'A triangle has opposite 3 and adjacent 4. What is tan(θ)?',
					answer: '3/4 = 0.75'
				},
				{ prompt: 'Which ratio never uses the hypotenuse?', answer: 'Tangent' }
			],
			'fill-blank': [
				{ prompt: 'tan(θ) = ______ / Adjacent', answer: 'Opposite' },
				{ prompt: 'tan(θ) = Opposite / ______', answer: 'Adjacent' },
				{
					prompt: 'If tan(θ) = 2 and the adjacent side is 6, the opposite side is ______.',
					answer: '12'
				}
			],
			'lightning-round': [
				{ prompt: 'Quick! tan(45°) = ?', answer: '1' },
				{ prompt: 'Quick! Opposite 9, adjacent 3 — tan(θ)?', answer: '3' },
				{ prompt: 'Quick! Does tangent use the hypotenuse?', answer: 'No' }
			],
			'triangle-long-answer': [
				{
					prompt:
						'From 50 m away, the angle of elevation to the top of a tree is 35°. Use tangent to find the tree height.',
					answer: '50 × tan(35°) ≈ 35.0 m'
				},
				{
					prompt: 'Given a right triangle with opposite 7 and adjacent 24, solve for θ.',
					answer: 'θ = tan⁻¹(7/24) ≈ 16.3°'
				}
			],
			flashcards: [
				{ prompt: 'Card: What does the T in TOA stand for?', answer: 'Tangent' },
				{ prompt: 'Card: TOA = Tangent, Opposite, ______', answer: 'Adjacent' }
			],
			final: [
				{
					prompt:
						'Final check: solve a full TOA problem — find θ given opposite 10 and adjacent 10.',
					answer: 'θ = tan⁻¹(1) = 45°'
				}
			]
		}
	})
];

export function findAlgoPanel(id: string): AlgoPanel | undefined {
	for (const section of algoSections) {
		const panel = section.panels.find((p) => p.id === id);
		if (panel) return panel;
	}
	return undefined;
}

import type { Course } from './types';

/**
 * The static content store for the Trigonometry course. Everything the
 * /trigonometry route renders comes from this tree; UserProgress records
 * answers against the panel/question ids defined here, so treat ids as
 * stable once learners have progress saved against them.
 */
export const trigonometryCourse: Course = {
	id: 'trigonometry',
	title: 'Trigonometry',
	description: 'Right triangles, ratios, and the angles that connect them — SAT style.',
	lessons: [
		{
			id: 'soh-sine',
			title: 'SOH — Sine',
			description: 'Opposite over hypotenuse: the first leg of SOH-CAH-TOA.',
			panels: [
				{
					type: 'multiple-choice',
					id: 'soh-sine-intro',
					title: 'Meet sin(θ)',
					description:
						'What sine measures and how to read it straight off a right triangle — opposite over hypotenuse — plus the co-function identity that pairs it with cosine.',
					reading: {
						heading: 'sin(θ)',
						paragraphs: [
							'In a right triangle, sin(θ) is the ratio of the side opposite angle θ to the hypotenuse: sin(θ) = opposite / hypotenuse.',
							'On the unit circle, sin(θ) is the y-coordinate of the point where the terminal side of angle θ meets the circle — the same ratio, now defined for any angle.',
							'For common angles, sin(θ) works out to clean values: sin(30°) = 1/2, sin(45°) = √2/2, and sin(60°) = √3/2. These come up often enough that they are worth memorizing outright.',
							'Because it is a ratio against the hypotenuse — the longest side — sin(θ) is always between -1 and 1. If a calculation gives you something outside that range, double-check your work.'
						],
						tip: {
							label: 'Tip',
							body: 'sin(θ) = cos(90° − θ) for any acute angle θ. This co-function identity lets you swap between sine and cosine for complementary angles without touching a calculator.'
						}
					},
					questions: [
						{
							id: 'soh-sine-ratio',
							prompt:
								'In a right triangle, the side opposite angle θ has length 5 and the hypotenuse has length 13. What is sin(θ)?',
							correctAnswer: 'A',
							options: [
								{ label: 'A', text: '5/13' },
								{ label: 'B', text: '12/13' },
								{ label: 'C', text: '5/12' },
								{ label: 'D', text: '13/5' }
							]
						},
						{
							id: 'soh-sine-cofunction',
							prompt: 'If sin(θ) = cos(40°) and θ is acute, what is the value of θ, in degrees?',
							correctAnswer: 'B',
							options: [
								{ label: 'A', text: '40' },
								{ label: 'B', text: '50' },
								{ label: 'C', text: '90' },
								{ label: 'D', text: '140' }
							]
						},
						{
							id: 'soh-sine-ladder',
							prompt:
								'A ladder leans against a wall, making a 60° angle with the ground. If the ladder is 10 feet long, how high up the wall does it reach?',
							correctAnswer: 'C',
							options: [
								{ label: 'A', text: '5 feet' },
								{ label: 'B', text: '5√2 feet' },
								{ label: 'C', text: '5√3 feet' },
								{ label: 'D', text: '10 feet' }
							]
						}
					]
				},
				{
					type: 'lightning-round',
					id: 'soh-sine-lightning',
					title: 'Sine Lightning Round',
					description:
						'Four quick-fire sine questions on a 15-second clock. One attempt each — trust your instincts.',
					secondsPerQuestion: 15,
					questions: [
						{
							id: 'soh-lightning-30',
							prompt: 'sin(30°) = ?',
							correctAnswer: 'B',
							options: [
								{ label: 'A', text: '√3/2' },
								{ label: 'B', text: '1/2' },
								{ label: 'C', text: '√2/2' },
								{ label: 'D', text: '1' }
							]
						},
						{
							id: 'soh-lightning-90',
							prompt: 'For which angle is sin(θ) equal to 1?',
							correctAnswer: 'C',
							options: [
								{ label: 'A', text: '0°' },
								{ label: 'B', text: '45°' },
								{ label: 'C', text: '90°' },
								{ label: 'D', text: '180°' }
							]
						},
						{
							id: 'soh-lightning-range',
							prompt: 'Which value could NOT be sin(θ) for any angle θ?',
							correctAnswer: 'D',
							options: [
								{ label: 'A', text: '-1' },
								{ label: 'B', text: '0' },
								{ label: 'C', text: '0.99' },
								{ label: 'D', text: '1.2' }
							]
						},
						{
							id: 'soh-lightning-cofn',
							prompt: 'If sin(θ) = 0.6, what is cos(90° − θ)?',
							correctAnswer: 'B',
							options: [
								{ label: 'A', text: '0.4' },
								{ label: 'B', text: '0.6' },
								{ label: 'C', text: '0.8' },
								{ label: 'D', text: '1.6' }
							]
						}
					]
				}
			]
		},
		{
			id: 'cah-cosine',
			title: 'CAH — Cosine',
			description: 'Adjacent over hypotenuse: sine’s complementary twin.',
			panels: [
				{
					type: 'multiple-choice',
					id: 'cah-cosine-intro',
					title: 'Meet cos(θ)',
					description:
						'Cosine as adjacent over hypotenuse, its home on the unit circle, and the Pythagorean identity that ties it back to sine.',
					reading: {
						heading: 'cos(θ)',
						paragraphs: [
							'In a right triangle, cos(θ) is the ratio of the side adjacent to angle θ to the hypotenuse: cos(θ) = adjacent / hypotenuse.',
							'On the unit circle, cos(θ) is the x-coordinate of the point where the terminal side of angle θ meets the circle.',
							'Cosine runs opposite to sine as an angle grows: cos(0°) = 1, cos(60°) = 1/2, and cos(90°) = 0. The steeper the angle, the smaller the cosine.',
							'Sine and cosine are tied together by the Pythagorean identity: sin²(θ) + cos²(θ) = 1. Given one ratio, you can always recover the other.'
						],
						tip: {
							label: 'Tip',
							body: 'The SAT loves the Pythagorean identity in disguise. If a question hands you sin(θ) and asks for cos(θ), sketch the right triangle: the missing side almost always comes from a 3-4-5 or 5-12-13 family.'
						}
					},
					questions: [
						{
							id: 'cah-cosine-ratio',
							prompt:
								'In a right triangle, the side adjacent to angle θ has length 8 and the hypotenuse has length 17. What is cos(θ)?',
							correctAnswer: 'A',
							options: [
								{ label: 'A', text: '8/17' },
								{ label: 'B', text: '15/17' },
								{ label: 'C', text: '8/15' },
								{ label: 'D', text: '17/8' }
							]
						},
						{
							id: 'cah-cosine-identity',
							prompt: 'If sin(θ) = 3/5 and θ is acute, what is cos(θ)?',
							correctAnswer: 'C',
							options: [
								{ label: 'A', text: '2/5' },
								{ label: 'B', text: '3/4' },
								{ label: 'C', text: '4/5' },
								{ label: 'D', text: '5/4' }
							]
						},
						{
							id: 'cah-cosine-ramp',
							prompt:
								'A 20-foot ramp makes a 30° angle with the ground. How far does the ramp extend horizontally along the ground?',
							correctAnswer: 'D',
							options: [
								{ label: 'A', text: '10 feet' },
								{ label: 'B', text: '10√2 feet' },
								{ label: 'C', text: '20√3 feet' },
								{ label: 'D', text: '10√3 feet' }
							]
						}
					]
				},
				{
					type: 'lightning-round',
					id: 'cah-cosine-lightning',
					title: 'Cosine Lightning Round',
					description:
						'Rapid recall of cosine values and identities. Four questions, one shot each, clock running.',
					secondsPerQuestion: 15,
					questions: [
						{
							id: 'cah-lightning-60',
							prompt: 'cos(60°) = ?',
							correctAnswer: 'A',
							options: [
								{ label: 'A', text: '1/2' },
								{ label: 'B', text: '√3/2' },
								{ label: 'C', text: '√2/2' },
								{ label: 'D', text: '0' }
							]
						},
						{
							id: 'cah-lightning-0',
							prompt: 'cos(0°) = ?',
							correctAnswer: 'D',
							options: [
								{ label: 'A', text: '0' },
								{ label: 'B', text: '1/2' },
								{ label: 'C', text: '-1' },
								{ label: 'D', text: '1' }
							]
						},
						{
							id: 'cah-lightning-identity',
							prompt: 'sin²(θ) + cos²(θ) = ?',
							correctAnswer: 'B',
							options: [
								{ label: 'A', text: '0' },
								{ label: 'B', text: '1' },
								{ label: 'C', text: 'tan²(θ)' },
								{ label: 'D', text: '2' }
							]
						},
						{
							id: 'cah-lightning-cofn',
							prompt: 'cos(θ) = sin(?) for any acute angle θ',
							correctAnswer: 'C',
							options: [
								{ label: 'A', text: 'θ' },
								{ label: 'B', text: '180° − θ' },
								{ label: 'C', text: '90° − θ' },
								{ label: 'D', text: '2θ' }
							]
						}
					]
				}
			]
		},
		{
			id: 'toa-tangent',
			title: 'TOA — Tangent',
			description: 'Opposite over adjacent: slopes, heights, and shadows.',
			panels: [
				{
					type: 'multiple-choice',
					id: 'toa-tangent-intro',
					title: 'Meet tan(θ)',
					description:
						'Tangent as opposite over adjacent — the ratio behind slopes, heights, and shadow problems — and why it grows without bound.',
					reading: {
						heading: 'tan(θ)',
						paragraphs: [
							'In a right triangle, tan(θ) is the ratio of the side opposite angle θ to the side adjacent to it: tan(θ) = opposite / adjacent.',
							'Tangent is also the quotient of the other two ratios: tan(θ) = sin(θ) / cos(θ). When cos(θ) = 0 — at 90° — tangent is undefined.',
							'Unlike sine and cosine, tangent is not capped at 1. It starts at tan(0°) = 0, hits tan(45°) = 1, and grows without bound as the angle approaches 90°.',
							'Tangent is the natural tool for height-and-shadow problems: the angle of elevation and one ground distance are enough to find any height.'
						],
						tip: {
							label: 'Tip',
							body: 'tan(45°) = 1 is the fastest sanity check in trig: at 45° the opposite and adjacent sides are equal, so their ratio must be exactly 1.'
						}
					},
					questions: [
						{
							id: 'toa-tangent-ratio',
							prompt:
								'In a right triangle, the side opposite angle θ has length 7 and the side adjacent to θ has length 24. What is tan(θ)?',
							correctAnswer: 'B',
							options: [
								{ label: 'A', text: '24/7' },
								{ label: 'B', text: '7/24' },
								{ label: 'C', text: '7/25' },
								{ label: 'D', text: '24/25' }
							]
						},
						{
							id: 'toa-tangent-tree',
							prompt:
								'From a point 30 feet from the base of a tree, the angle of elevation to the top is 45°. How tall is the tree?',
							correctAnswer: 'A',
							options: [
								{ label: 'A', text: '30 feet' },
								{ label: 'B', text: '15 feet' },
								{ label: 'C', text: '30√2 feet' },
								{ label: 'D', text: '30√3 feet' }
							]
						},
						{
							id: 'toa-tangent-quotient',
							prompt: 'If sin(θ) = 0.8 and cos(θ) = 0.6, what is tan(θ)?',
							correctAnswer: 'C',
							options: [
								{ label: 'A', text: '0.48' },
								{ label: 'B', text: '0.75' },
								{ label: 'C', text: '4/3' },
								{ label: 'D', text: '1.4' }
							]
						}
					]
				},
				{
					type: 'lightning-round',
					id: 'toa-tangent-lightning',
					title: 'Tangent Lightning Round',
					description:
						'A fast tangent finisher: special values, the quotient identity, and the angle where tangent breaks.',
					secondsPerQuestion: 15,
					questions: [
						{
							id: 'toa-lightning-45',
							prompt: 'tan(45°) = ?',
							correctAnswer: 'B',
							options: [
								{ label: 'A', text: '1/2' },
								{ label: 'B', text: '1' },
								{ label: 'C', text: '√2' },
								{ label: 'D', text: '√3' }
							]
						},
						{
							id: 'toa-lightning-undefined',
							prompt: 'At which angle is tan(θ) undefined?',
							correctAnswer: 'D',
							options: [
								{ label: 'A', text: '0°' },
								{ label: 'B', text: '30°' },
								{ label: 'C', text: '45°' },
								{ label: 'D', text: '90°' }
							]
						},
						{
							id: 'toa-lightning-quotient',
							prompt: 'tan(θ) = ?',
							correctAnswer: 'A',
							options: [
								{ label: 'A', text: 'sin(θ) / cos(θ)' },
								{ label: 'B', text: 'cos(θ) / sin(θ)' },
								{ label: 'C', text: 'sin(θ) · cos(θ)' },
								{ label: 'D', text: '1 / sin(θ)' }
							]
						},
						{
							id: 'toa-lightning-60',
							prompt: 'tan(60°) = ?',
							correctAnswer: 'C',
							options: [
								{ label: 'A', text: '1/2' },
								{ label: 'B', text: '√3/3' },
								{ label: 'C', text: '√3' },
								{ label: 'D', text: '2' }
							]
						}
					]
				}
			]
		}
	]
};

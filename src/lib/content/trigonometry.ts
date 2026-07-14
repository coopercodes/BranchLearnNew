import type { Course } from './types';

/**
 * The static content store for the Trigonometry course. Everything the
 * /trigonometry route renders comes from this tree; UserProgress records
 * answers against the panel/question ids defined here, so treat ids as
 * stable once learners have progress saved against them.
 *
 * The five lessons mirror the five sections of the SAT Trigonometry
 * textbook. Each article (textbook subsection) gets one multiple-choice
 * panel whose 1–2 questions test that article directly, and every lesson
 * closes with a "Question" panel where the student talks the section
 * through with Leaf.
 */
export const trigonometryCourse: Course = {
	id: 'trigonometry',
	title: 'Trigonometry',
	description: 'Right triangles, ratios, and the angles that connect them — SAT style.',
	lessons: [
		{
			id: 'right-triangle-basics',
			title: 'Right Triangle Basics',
			description: 'The vocabulary everything else depends on: hypotenuse, opposite, adjacent.',
			panels: [
				{
					type: 'multiple-choice',
					id: 'rtb-hypotenuse',
					title: 'The Hypotenuse',
					description:
						'The fixed side of a right triangle: across from the right angle, always the longest, never renamed.',
					reading: {
						heading: 'The Hypotenuse',
						paragraphs: [
							'The hypotenuse is the side directly across from the right angle. Two facts make it easy to spot: it is always the longest side, and it is the only side that never touches the right angle.',
							'Unlike "opposite" and "adjacent," the hypotenuse is fixed — it does not matter which acute angle you are working from. In a 3-4-5 triangle, the hypotenuse is 5 no matter which angle the question asks about.',
							'Why is it always longest? In any triangle, the longest side sits across from the biggest angle. In a right triangle the 90° angle is always the biggest — the other two must share the remaining 90° — so the side across from it wins.'
						],
						tip: {
							label: 'Tip',
							body: 'Handed a right triangle with sides 6, 8, and 10? The hypotenuse is 10 before you even see the picture: it is the longest.'
						}
					},
					questions: [
						{
							id: 'rtb-hyp-identify',
							prompt:
								'A right triangle has sides of length 7, 24, and 25. Which side is the hypotenuse?',
							correctAnswer: 'C',
							options: [
								{ label: 'A', text: 'The side of length 7' },
								{ label: 'B', text: 'The side of length 24' },
								{ label: 'C', text: 'The side of length 25' },
								{ label: 'D', text: 'It depends on which acute angle you choose' }
							]
						},
						{
							id: 'rtb-hyp-position',
							prompt: 'The hypotenuse of a right triangle is always located…',
							correctAnswer: 'B',
							options: [
								{ label: 'A', text: 'Next to the smallest angle' },
								{ label: 'B', text: 'Across from the right angle' },
								{ label: 'C', text: 'Across from the chosen angle θ' },
								{ label: 'D', text: 'Between the two acute angles' }
							]
						}
					]
				},
				{
					type: 'multiple-choice',
					id: 'rtb-opposite-adjacent',
					title: 'Opposite & Adjacent',
					description:
						'The two legs are named relative to the angle you pick — and they swap when the angle does.',
					reading: {
						heading: 'Opposite & Adjacent',
						paragraphs: [
							'The two legs are named relative to the angle you pick. Choose an acute angle θ: the opposite side is the leg across the triangle from θ (it never touches θ), and the adjacent side is the leg that forms one arm of θ.',
							'Here is the detail the SAT loves to test: if you switch to the other acute angle, opposite and adjacent trade places. The leg that was opposite the first angle is adjacent to the second. Only the hypotenuse stays put.',
							'So in a right triangle with legs 3 and 4: from angle A, opposite = 3 and adjacent = 4; from angle B, opposite = 4 and adjacent = 3.'
						],
						tip: {
							label: 'Tip',
							body: 'Before touching any formula, mark the angle in the problem and label the three sides O, A, H on your sketch. Ten seconds of labeling prevents the most common trig mistake.'
						}
					},
					questions: [
						{
							id: 'rtb-oa-relative',
							prompt:
								'In a right triangle, the side opposite angle A has length 9 and the side adjacent to angle A has length 12. Relative to the OTHER acute angle B, what is the length of the opposite side?',
							correctAnswer: 'B',
							options: [
								{ label: 'A', text: '9' },
								{ label: 'B', text: '12' },
								{ label: 'C', text: '15' },
								{ label: 'D', text: 'Cannot be determined' }
							]
						},
						{
							id: 'rtb-oa-touch',
							prompt: 'Which side of a right triangle never touches the angle θ it is named for?',
							correctAnswer: 'A',
							options: [
								{ label: 'A', text: 'The opposite side' },
								{ label: 'B', text: 'The adjacent side' },
								{ label: 'C', text: 'The hypotenuse' },
								{ label: 'D', text: 'Both legs touch θ' }
							]
						}
					]
				},
				{
					type: 'leaf-question',
					id: 'rtb-leaf-question',
					title: 'Question: Label a Triangle',
					description:
						'Talk the side names through with Leaf until the labeling habit is automatic.',
					prompt:
						'Before moving on, make sure the side names are second nature. Ask Leaf to walk you through labeling a right triangle — or test yourself and have Leaf check your reasoning.',
					suggestions: [
						'Can you give me a triangle and ask me to label the sides?',
						'Why do opposite and adjacent swap when I switch angles?',
						'How do I spot the hypotenuse in any right triangle?'
					],
					questions: []
				}
			]
		},
		{
			id: 'soh-cah-toa',
			title: 'SOH-CAH-TOA',
			description: 'Sine, cosine, and tangent as ratios of the labeled sides.',
			panels: [
				{
					type: 'multiple-choice',
					id: 'sct-sine',
					title: 'The Sine Ratio',
					description:
						'SOH: sine as opposite over hypotenuse, the values worth memorizing, and the co-function identity.',
					reading: {
						heading: 'sin(θ)',
						paragraphs: [
							'The sine of an angle θ is the length of the side opposite θ divided by the length of the hypotenuse: sin(θ) = opposite / hypotenuse.',
							'Because every right triangle with the same angle θ is similar, this ratio never changes — only the triangle’s size does. For common angles it works out to clean values: sin(30°) = 1/2, sin(45°) = √2/2, sin(60°) = √3/2.',
							'Since sine is a ratio against the hypotenuse — the longest side — it is always between -1 and 1. If a calculation gives you something outside that range, double-check your work.'
						],
						tip: {
							label: 'Tip',
							body: 'sin(θ) = cos(90° − θ) for any acute angle θ. This co-function identity lets you swap between sine and cosine for complementary angles without touching a calculator.'
						}
					},
					questions: [
						{
							id: 'sct-sine-ratio',
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
							id: 'sct-sine-cofunction',
							prompt: 'If sin(θ) = cos(40°) and θ is acute, what is the value of θ, in degrees?',
							correctAnswer: 'B',
							options: [
								{ label: 'A', text: '40' },
								{ label: 'B', text: '50' },
								{ label: 'C', text: '90' },
								{ label: 'D', text: '140' }
							]
						}
					]
				},
				{
					type: 'multiple-choice',
					id: 'sct-cosine',
					title: 'The Cosine Ratio',
					description:
						'CAH: cosine as adjacent over hypotenuse, and the Pythagorean identity that ties it to sine.',
					reading: {
						heading: 'cos(θ)',
						paragraphs: [
							'The cosine of an angle θ is the length of the side adjacent to θ divided by the length of the hypotenuse: cos(θ) = adjacent / hypotenuse.',
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
							id: 'sct-cosine-ratio',
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
							id: 'sct-cosine-identity',
							prompt: 'If sin(θ) = 3/5 and θ is acute, what is cos(θ)?',
							correctAnswer: 'C',
							options: [
								{ label: 'A', text: '2/5' },
								{ label: 'B', text: '3/4' },
								{ label: 'C', text: '4/5' },
								{ label: 'D', text: '5/4' }
							]
						}
					]
				},
				{
					type: 'multiple-choice',
					id: 'sct-tangent',
					title: 'The Tangent Ratio',
					description:
						'TOA: tangent as opposite over adjacent — the ratio behind slopes, heights, and shadows.',
					reading: {
						heading: 'tan(θ)',
						paragraphs: [
							'The tangent of an angle θ is the ratio of the side opposite θ to the side adjacent to it: tan(θ) = opposite / adjacent.',
							'Tangent is also the quotient of the other two ratios: tan(θ) = sin(θ) / cos(θ). When cos(θ) = 0 — at 90° — tangent is undefined.',
							'Unlike sine and cosine, tangent is not capped at 1. It starts at tan(0°) = 0, hits tan(45°) = 1, and grows without bound as the angle approaches 90°.'
						],
						tip: {
							label: 'Tip',
							body: 'tan(45°) = 1 is the fastest sanity check in trig: at 45° the opposite and adjacent sides are equal, so their ratio must be exactly 1.'
						}
					},
					questions: [
						{
							id: 'sct-tangent-ratio',
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
							id: 'sct-tangent-quotient',
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
					type: 'multiple-choice',
					id: 'sct-special-angles',
					title: 'Special Angles & Identities',
					description:
						'The 30-60-90 and 45-45-90 families, and the three identities that unlock most SAT trig questions.',
					reading: {
						heading: 'Special Angles',
						paragraphs: [
							'Two triangle families produce every "clean" trig value the SAT expects you to know. The 30-60-90 triangle has sides in the ratio 1 : √3 : 2, giving sin(30°) = 1/2 and cos(30°) = √3/2.',
							'The 45-45-90 triangle has sides in the ratio 1 : 1 : √2, giving sin(45°) = cos(45°) = √2/2 and tan(45°) = 1.',
							'Three identities to keep on hand: the Pythagorean identity sin²(θ) + cos²(θ) = 1, the co-function identity sin(θ) = cos(90° − θ), and the quotient identity tan(θ) = sin(θ) / cos(θ).'
						],
						tip: {
							label: 'Tip',
							body: 'Nearly every SAT trigonometry question is a two-step problem: identify the triangle family, then apply the identity.'
						}
					},
					questions: [
						{
							id: 'sct-special-306090',
							prompt: 'The sides of a 30-60-90 triangle are always in which ratio?',
							correctAnswer: 'B',
							options: [
								{ label: 'A', text: '1 : 1 : √2' },
								{ label: 'B', text: '1 : √3 : 2' },
								{ label: 'C', text: '1 : 2 : 3' },
								{ label: 'D', text: '3 : 4 : 5' }
							]
						},
						{
							id: 'sct-special-identity',
							prompt: 'sin²(θ) + cos²(θ) = ?',
							correctAnswer: 'B',
							options: [
								{ label: 'A', text: '0' },
								{ label: 'B', text: '1' },
								{ label: 'C', text: 'tan²(θ)' },
								{ label: 'D', text: '2' }
							]
						}
					]
				},
				{
					type: 'lightning-round',
					id: 'sct-lightning',
					title: 'SOH-CAH-TOA Lightning Round',
					description:
						'Four quick-fire questions across all three ratios on a 15-second clock. One attempt each.',
					secondsPerQuestion: 15,
					questions: [
						{
							id: 'sct-lightning-sin30',
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
							id: 'sct-lightning-cos0',
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
							id: 'sct-lightning-tan45',
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
							id: 'sct-lightning-toa',
							prompt: 'tan(θ) = ?',
							correctAnswer: 'A',
							options: [
								{ label: 'A', text: 'opposite / adjacent' },
								{ label: 'B', text: 'adjacent / opposite' },
								{ label: 'C', text: 'opposite / hypotenuse' },
								{ label: 'D', text: 'adjacent / hypotenuse' }
							]
						}
					]
				},
				{
					type: 'leaf-question',
					id: 'sct-leaf-question',
					title: 'Question: Pick the Ratio',
					description: 'Practice matching triangles to the right ratio in a conversation with Leaf.',
					prompt:
						'SOH-CAH-TOA only pays off when you can pick the right ratio on sight. Ask Leaf to quiz you, or dig into whichever ratio still feels shaky.',
					suggestions: [
						'Quiz me: describe a triangle and ask which ratio to use.',
						'What is the difference between sine and cosine, intuitively?',
						'Why does tangent grow without bound but sine never passes 1?'
					],
					questions: []
				}
			]
		},
		{
			id: 'missing-sides',
			title: 'Solving for Missing Sides',
			description: 'Use a trig ratio to find an unknown side from an angle and one side.',
			panels: [
				{
					type: 'multiple-choice',
					id: 'ms-choosing-ratio',
					title: 'Choosing the Right Ratio',
					description:
						'The problem picks the ratio for you: match the side you know and the side you want to SOH, CAH, or TOA.',
					reading: {
						heading: 'Choosing the Ratio',
						paragraphs: [
							'The ratio is chosen for you by the problem — you just have to read it off. Ask two questions: which side do I know, and which side do I want?',
							'Then pick the one ratio that mentions both: opposite & hypotenuse → sine, adjacent & hypotenuse → cosine, opposite & adjacent → tangent.',
							'The hypotenuse never appears in a tangent equation, and the pair opposite–hypotenuse can only be sine. There is never more than one correct choice.'
						],
						tip: {
							label: 'Tip',
							body: 'A ladder problem gives the distance from the wall (adjacent) and asks for height (opposite)? Opposite and adjacent — tangent picked itself.'
						}
					},
					questions: [
						{
							id: 'ms-cr-pick',
							prompt:
								'You know the hypotenuse of a right triangle and want the side adjacent to a given angle θ. Which ratio should you use?',
							correctAnswer: 'B',
							options: [
								{ label: 'A', text: 'sin(θ)' },
								{ label: 'B', text: 'cos(θ)' },
								{ label: 'C', text: 'tan(θ)' },
								{ label: 'D', text: 'Any of the three works' }
							]
						},
						{
							id: 'ms-cr-ladder',
							prompt:
								'A ladder makes a 70° angle with the ground, and its base is 4 feet from the wall. To find how high it reaches on the wall, which equation is correct?',
							correctAnswer: 'C',
							options: [
								{ label: 'A', text: 'sin(70°) = h/4' },
								{ label: 'B', text: 'cos(70°) = h/4' },
								{ label: 'C', text: 'tan(70°) = h/4' },
								{ label: 'D', text: 'tan(70°) = 4/h' }
							]
						}
					]
				},
				{
					type: 'multiple-choice',
					id: 'ms-solving-equation',
					title: 'Solving the Equation',
					description:
						'Unknown on top: multiply. Unknown on bottom: divide. Then sanity-check against the hypotenuse.',
					reading: {
						heading: 'Solving It',
						paragraphs: [
							'Once the ratio is set up, the unknown lives in one of two places. Unknown on top (the numerator): multiply both sides by the denominator. sin(35°) = x/10 becomes x = 10·sin(35°).',
							'Unknown on bottom (the denominator): the known side gets divided by the trig value. cos(50°) = 8/x becomes x = 8/cos(50°). Rushing students multiply instead — and the SAT always lists that wrong answer as a choice.',
							'Sanity check every answer: the hypotenuse must come out longest, and a side found by multiplying by sin or cos must be shorter than the side you multiplied.'
						],
						tip: {
							label: 'Tip',
							body: 'If your "leg" comes out longer than the hypotenuse, you flipped the equation — divide where you multiplied, or vice versa.'
						}
					},
					questions: [
						{
							id: 'ms-se-top',
							prompt: 'If sin(35°) = x/10, then x = ?',
							correctAnswer: 'A',
							options: [
								{ label: 'A', text: '10·sin(35°)' },
								{ label: 'B', text: '10/sin(35°)' },
								{ label: 'C', text: 'sin(35°)/10' },
								{ label: 'D', text: 'sin(10°)/35' }
							]
						},
						{
							id: 'ms-se-bottom',
							prompt: 'If cos(50°) = 8/x, then x = ?',
							correctAnswer: 'D',
							options: [
								{ label: 'A', text: '8·cos(50°)' },
								{ label: 'B', text: 'cos(50°)/8' },
								{ label: 'C', text: '8 − cos(50°)' },
								{ label: 'D', text: '8/cos(50°)' }
							]
						}
					]
				},
				{
					type: 'leaf-question',
					id: 'ms-leaf-question',
					title: 'Question: Solve One with Leaf',
					description: 'Work a missing-side problem end to end with Leaf checking each step.',
					prompt:
						'Try solving a missing-side problem out loud. Ask Leaf for a practice problem and talk through your label → ratio → solve steps — Leaf will catch slips before they become habits.',
					suggestions: [
						'Give me a missing-side problem to solve step by step.',
						'I always mix up when to multiply vs divide — can you help?',
						'How do I sanity-check a missing-side answer?'
					],
					questions: []
				}
			]
		},
		{
			id: 'missing-angles',
			title: 'Solving for Missing Angles',
			description: 'Inverse trig functions: from two known sides back to the angle.',
			panels: [
				{
					type: 'multiple-choice',
					id: 'ma-inverse-functions',
					title: 'Inverse Trig Functions',
					description:
						'Arcsin, arccos, and arctan take a ratio in and give an angle out — and the ⁻¹ is not an exponent.',
					reading: {
						heading: 'sin⁻¹, cos⁻¹, tan⁻¹',
						paragraphs: [
							'An inverse trig function takes a ratio in and gives an angle out — the exact reverse of the ordinary functions. sin(30°) = 0.5, so sin⁻¹(0.5) = 30°.',
							'There are three, one per ratio: sin⁻¹ (arcsin), cos⁻¹ (arccos), and tan⁻¹ (arctan).',
							'The notation trap: the −1 is not an exponent. sin⁻¹(x) means "the angle whose sine is x" — it does not mean 1/sin(x).',
							'Since sine and cosine stay between −1 and 1, sin⁻¹ and cos⁻¹ only accept inputs in [−1, 1]. Arctangent accepts any number.'
						],
						tip: {
							label: 'Tip',
							body: 'If your calculator errors on sin⁻¹(1.4), nothing is broken — no angle has a sine of 1.4. Recheck which side you put over which.'
						}
					},
					questions: [
						{
							id: 'ma-if-meaning',
							prompt: 'What does sin⁻¹(0.5) mean?',
							correctAnswer: 'C',
							options: [
								{ label: 'A', text: '1 divided by sin(0.5)' },
								{ label: 'B', text: 'sin(0.5) raised to the power −1' },
								{ label: 'C', text: 'The angle whose sine is 0.5' },
								{ label: 'D', text: 'The sine of −0.5' }
							]
						},
						{
							id: 'ma-if-domain',
							prompt: 'Which of these expressions is undefined?',
							correctAnswer: 'B',
							options: [
								{ label: 'A', text: 'tan⁻¹(1.4)' },
								{ label: 'B', text: 'cos⁻¹(1.4)' },
								{ label: 'C', text: 'sin⁻¹(0.4)' },
								{ label: 'D', text: 'tan⁻¹(14)' }
							]
						}
					]
				},
				{
					type: 'multiple-choice',
					id: 'ma-two-sides',
					title: 'From Two Sides to an Angle',
					description:
						'Label the two known sides, pick their ratio, apply its inverse — plus the free second angle.',
					reading: {
						heading: 'Two Sides → Angle',
						paragraphs: [
							'Given two sides of a right triangle, finding an angle is a three-step routine: label the two known sides relative to the angle you want, pick the ratio those sides form, and apply the inverse of that ratio.',
							'Example: a ramp rises 3 feet over a 12-foot run. The rise is opposite, the run is adjacent — so tan(θ) = 3/12 = 0.25, and θ = tan⁻¹(0.25) ≈ 14°.',
							'The two acute angles of a right triangle add to 90°, so once you find one, the other is free: 90° − θ. And an angle across from the shorter leg must come out less than 45° — if your answer disagrees with the picture, you mixed up opposite and adjacent.'
						],
						tip: {
							label: 'Tip',
							body: 'Found one acute angle? Never compute the second with more trig — 90° minus the first is faster and cannot introduce a new error.'
						}
					},
					questions: [
						{
							id: 'ma-ts-ramp',
							prompt:
								'A ramp rises 3 feet over a horizontal run of 12 feet. Which expression gives the angle the ramp makes with the ground?',
							correctAnswer: 'B',
							options: [
								{ label: 'A', text: 'sin⁻¹(3/12)' },
								{ label: 'B', text: 'tan⁻¹(3/12)' },
								{ label: 'C', text: 'cos⁻¹(3/12)' },
								{ label: 'D', text: 'tan(3/12)' }
							]
						},
						{
							id: 'ma-ts-complement',
							prompt:
								'One acute angle of a right triangle measures 37°. What is the other acute angle?',
							correctAnswer: 'A',
							options: [
								{ label: 'A', text: '53°' },
								{ label: 'B', text: '63°' },
								{ label: 'C', text: '90°' },
								{ label: 'D', text: '143°' }
							]
						}
					]
				},
				{
					type: 'leaf-question',
					id: 'ma-leaf-question',
					title: 'Question: Angles with Leaf',
					description: 'Untangle inverse-function notation and practice angle-finding with Leaf.',
					prompt:
						'Inverse notation trips almost everyone at first. Ask Leaf anything that still feels fuzzy — or request a practice problem and solve it together.',
					suggestions: [
						'Why does sin⁻¹ not mean 1/sin?',
						'Give me a two-sides-to-an-angle problem to try.',
						'When would I use arccos instead of arctan?'
					],
					questions: []
				}
			]
		},
		{
			id: 'pythagorean-trig',
			title: 'The Pythagorean Theorem + Trig',
			description: 'Pair a² + b² = c² with trig ratios to fully solve any right triangle.',
			panels: [
				{
					type: 'multiple-choice',
					id: 'pt-theorem',
					title: 'The Pythagorean Theorem',
					description:
						'a² + b² = c², the minus sign that finds a leg, and the triples the SAT reuses constantly.',
					reading: {
						heading: 'a² + b² = c²',
						paragraphs: [
							'In every right triangle, the legs a and b and the hypotenuse c satisfy a² + b² = c². The theorem only works in right triangles, and c must be the hypotenuse — the most common error is plugging the hypotenuse in as a leg.',
							'Rearranged for a missing leg: a = √(c² − b²). Note the minus sign — legs come from subtracting under the square root, never adding.',
							'A few whole-number side sets satisfy the theorem exactly, and the SAT recycles them endlessly: 3-4-5 (and multiples like 6-8-10), 5-12-13, and 7-24-25. Spotting a triple turns a square-root calculation into instant recall.'
						],
						tip: {
							label: 'Tip',
							body: 'Hypotenuse 13 and leg 5? The other leg is 12 — no arithmetic needed once you know the 5-12-13 family.'
						}
					},
					questions: [
						{
							id: 'pt-th-leg',
							prompt: 'A right triangle has hypotenuse 10 and one leg of length 6. What is the other leg?',
							correctAnswer: 'B',
							options: [
								{ label: 'A', text: '4' },
								{ label: 'B', text: '8' },
								{ label: 'C', text: '√136' },
								{ label: 'D', text: '16' }
							]
						},
						{
							id: 'pt-th-triple',
							prompt: 'Which of the following is NOT a right triangle?',
							correctAnswer: 'D',
							options: [
								{ label: 'A', text: 'Sides 3, 4, 5' },
								{ label: 'B', text: 'Sides 5, 12, 13' },
								{ label: 'C', text: 'Sides 6, 8, 10' },
								{ label: 'D', text: 'Sides 4, 5, 6' }
							]
						}
					]
				},
				{
					type: 'multiple-choice',
					id: 'pt-full-solve',
					title: 'Fully Solving a Triangle',
					description:
						'Alternate between Pythagoras and trig ratios until every side and angle is known.',
					reading: {
						heading: 'The Full Solve',
						paragraphs: [
							'"Solving" a triangle means finding all three sides and all three angles. In a right triangle one angle is already known — 90° — so you need two sides and the two acute angles.',
							'From two sides: Pythagoras gives the third side, inverse trig gives one angle, and subtraction from 90° gives the other. Legs 5 and 12 → hypotenuse 13, θ = tan⁻¹(5/12) ≈ 22.6°, other angle ≈ 67.4°.',
							'From one side and one acute angle: subtraction gives the other angle, a trig ratio gives a second side, and Pythagoras (or another ratio) gives the third.',
							'Trig ratios connect sides through angles; Pythagoras connects sides directly. When both can reach the same side, computing it both ways is a free error check.'
						],
						tip: {
							label: 'Tip',
							body: 'Whatever you are given, take inventory first: which sides and angles do I have, which do I need, and which tool — ratio, inverse, or Pythagoras — bridges the gap?'
						}
					},
					questions: [
						{
							id: 'pt-fs-legs',
							prompt:
								'A right triangle has legs 5 and 12. Which expression gives the acute angle across from the leg of length 5?',
							correctAnswer: 'C',
							options: [
								{ label: 'A', text: 'sin⁻¹(5/12)' },
								{ label: 'B', text: 'tan⁻¹(12/5)' },
								{ label: 'C', text: 'tan⁻¹(5/12)' },
								{ label: 'D', text: 'cos⁻¹(5/13)' }
							]
						},
						{
							id: 'pt-fs-angle-side',
							prompt:
								'A right triangle has hypotenuse 20 and one acute angle of 30°. What is the length of the side opposite that angle?',
							correctAnswer: 'A',
							options: [
								{ label: 'A', text: '10' },
								{ label: 'B', text: '10√3' },
								{ label: 'C', text: '20·cos(30°)' },
								{ label: 'D', text: '40' }
							]
						}
					]
				},
				{
					type: 'leaf-question',
					id: 'pt-leaf-question',
					title: 'Question: The Capstone Solve',
					description:
						'Finish the course by fully solving a triangle with Leaf as your step-by-step checker.',
					prompt:
						'This is the capstone: everything from side names to inverse functions in one problem. Ask Leaf for a triangle to fully solve, and narrate every step — or ask how the tools fit together.',
					suggestions: [
						'Give me a triangle to fully solve — all sides and angles.',
						'When should I reach for Pythagoras instead of a trig ratio?',
						'Can you check my plan for solving a triangle from two sides?'
					],
					questions: []
				}
			]
		}
	]
};

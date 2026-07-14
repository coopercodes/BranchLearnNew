/** An article — a subsection nested under a textbook section. */
export interface TextbookArticle {
	id: string;
	title: string;
	/** Markdown body — supports KaTeX via \( ... \) inline and $$ ... $$ blocks. */
	markdown: string;
}

/** A main section in the Textbook window: an overview page plus nested articles. */
export interface TextbookSection {
	id: string;
	title: string;
	/** Markdown body for the section's overview page. */
	markdown: string;
	articles: TextbookArticle[];
}

/**
 * Static sections for the SAT Trigonometry textbook. String.raw keeps the
 * LaTeX backslashes intact so \( \frac{a}{b} \) reads like real TeX here.
 */
export const textbookSections: TextbookSection[] = [
	{
		id: 'right-triangle-basics',
		title: 'Right Triangle Basics',
		markdown: String.raw`# Right Triangle Basics

A **right triangle** is a triangle with one \( 90^\circ \) angle — the *right angle*, marked with a small square. Every SAT trigonometry problem starts here, because the three trig ratios are defined entirely in terms of a right triangle's sides.

Those three sides get names, and two of the names **depend on which angle you're talking about**:

- The **hypotenuse** — the side across from the right angle. Always the longest side, and it never changes.
- The **opposite** side — the side across from the angle \( \theta \) you've chosen.
- The **adjacent** side — the side next to \( \theta \) that isn't the hypotenuse.

Get the labels right and every formula that follows is just reading sides off a picture. Get them wrong and every answer that follows is wrong too — which is why this section comes first.

The two articles in this section cover the fixed side (the hypotenuse) and the two angle-relative sides (opposite and adjacent).`,
		articles: [
			{
				id: 'the-hypotenuse',
				title: 'The Hypotenuse',
				markdown: String.raw`# The Hypotenuse

The **hypotenuse** is the side directly across from the right angle. Two facts make it easy to spot:

1. It is always the **longest** side of a right triangle.
2. It is the only side that **never touches** the right angle.

Unlike "opposite" and "adjacent," the hypotenuse is **fixed** — it does not matter which acute angle you're working from. In a triangle with legs 3 and 4 and hypotenuse 5, the hypotenuse is 5 no matter which angle the question asks about.

## Why it's always longest

In any triangle, the longest side sits across from the biggest angle. In a right triangle the right angle \( (90^\circ) \) is always the biggest angle — the other two must share the remaining \( 90^\circ \) — so the side across from it, the hypotenuse, is always the longest.

## Quick check

If someone hands you a right triangle with sides 6, 8, and 10, you know the hypotenuse is 10 before you even see the picture: it's the longest.`
			},
			{
				id: 'opposite-and-adjacent',
				title: 'Opposite & Adjacent',
				markdown: String.raw`# Opposite & Adjacent

The other two sides — the **legs** — are named *relative to the angle you pick*. Choose an acute angle \( \theta \):

- The **opposite** side is the leg across the triangle from \( \theta \). It does not touch \( \theta \) at all.
- The **adjacent** side is the leg that forms one arm of \( \theta \). "Adjacent" means "next to."

## The labels swap

Here is the detail the SAT loves to test: if you switch to the *other* acute angle, **opposite and adjacent trade places**. The leg that was opposite the first angle is adjacent to the second, and vice versa. Only the hypotenuse stays put.

So a right triangle with legs 3 and 4:

- From angle \( A \): opposite \( = 3 \), adjacent \( = 4 \)
- From angle \( B \): opposite \( = 4 \), adjacent \( = 3 \)

## The habit to build

Before touching any trig formula, mark the angle in the problem and physically label the three sides **O**, **A**, **H** on your sketch. Ten seconds of labeling prevents the single most common trig mistake: computing a perfectly correct ratio for the wrong angle.`
			}
		]
	},
	{
		id: 'soh-cah-toa',
		title: 'SOH-CAH-TOA',
		markdown: String.raw`# SOH-CAH-TOA

With the sides labeled, trigonometry boils down to three ratios — and one mnemonic holds all of them:

| Letters | Ratio | Meaning |
| --- | --- | --- |
| **SOH** | \( \sin(\theta) = \frac{\text{opposite}}{\text{hypotenuse}} \) | **S**ine = **O**pposite over **H**ypotenuse |
| **CAH** | \( \cos(\theta) = \frac{\text{adjacent}}{\text{hypotenuse}} \) | **C**osine = **A**djacent over **H**ypotenuse |
| **TOA** | \( \tan(\theta) = \frac{\text{opposite}}{\text{adjacent}} \) | **T**angent = **O**pposite over **A**djacent |

Because every right triangle with the same acute angle \( \theta \) is similar, these ratios depend only on the **angle**, never on the triangle's size. That's the whole trick: memorize a handful of values, and you can solve any right triangle that shares the angle.

The articles in this section take each ratio in turn, then collect the special-angle values worth memorizing.`,
		articles: [
			{
				id: 'sine',
				title: 'The Sine Ratio',
				markdown: String.raw`# The Sine Ratio

The sine of an angle \( \theta \) is the length of the side **opposite** \( \theta \) divided by the length of the **hypotenuse**:

$$ \sin(\theta) = \frac{\text{opposite}}{\text{hypotenuse}} $$

Because every right triangle with the same angle \( \theta \) is similar, this ratio never changes — only the triangle's size does.

## Values worth memorizing

| Angle | \( \sin(\theta) \) |
| --- | --- |
| \( 30^\circ \) | \( \frac{1}{2} \) |
| \( 45^\circ \) | \( \frac{\sqrt{2}}{2} \) |
| \( 60^\circ \) | \( \frac{\sqrt{3}}{2} \) |

Since sine is a ratio against the hypotenuse — the longest side — it is always between \( -1 \) and \( 1 \). If a calculation gives you something outside that range, double-check your work.

## The co-function identity

Sine and cosine are linked for any acute angle:

$$ \sin(\theta) = \cos(90^\circ - \theta) $$

That lets you rewrite a sine expression as a cosine one (or vice versa) without ever knowing the actual angle — a shortcut that shows up often on SAT trigonometry questions.`
			},
			{
				id: 'cosine',
				title: 'The Cosine Ratio',
				markdown: String.raw`# The Cosine Ratio

The cosine of an angle \( \theta \) is the length of the side **adjacent** to \( \theta \) divided by the length of the **hypotenuse**:

$$ \cos(\theta) = \frac{\text{adjacent}}{\text{hypotenuse}} $$

On the unit circle, \( \cos(\theta) \) is the x-coordinate of the point where the terminal side of the angle meets the circle. Cosine runs opposite to sine as an angle grows: \( \cos(0^\circ) = 1 \), \( \cos(60^\circ) = \frac{1}{2} \), and \( \cos(90^\circ) = 0 \). The steeper the angle, the smaller the cosine.

## The Pythagorean identity

Sine and cosine are tied together by one equation:

$$ \sin^2(\theta) + \cos^2(\theta) = 1 $$

Given one ratio, you can always recover the other. The SAT loves this identity in disguise — if a question hands you \( \sin(\theta) = \frac{3}{5} \) and asks for \( \cos(\theta) \), sketch the right triangle: the missing side almost always comes from a **3-4-5** or **5-12-13** family, giving \( \cos(\theta) = \frac{4}{5} \).`
			},
			{
				id: 'tangent',
				title: 'The Tangent Ratio',
				markdown: String.raw`# The Tangent Ratio

The tangent of an angle \( \theta \) is the ratio of the side **opposite** to the side **adjacent**:

$$ \tan(\theta) = \frac{\text{opposite}}{\text{adjacent}} $$

Tangent is also the quotient of the other two ratios:

$$ \tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)} $$

When \( \cos(\theta) = 0 \) — at \( 90^\circ \) — tangent is **undefined**.

## No upper bound

Unlike sine and cosine, tangent is not capped at 1. It starts at \( \tan(0^\circ) = 0 \), hits \( \tan(45^\circ) = 1 \), and grows without bound as the angle approaches \( 90^\circ \).

\( \tan(45^\circ) = 1 \) is the fastest sanity check in trig: at \( 45^\circ \) the opposite and adjacent sides are equal, so their ratio must be exactly 1.

## Heights and shadows

Tangent is the natural tool for height-and-shadow problems: the angle of elevation and one ground distance are enough to find any height. From a point 30 feet from a tree, with a \( 45^\circ \) angle of elevation to the top:

$$ h = 30 \cdot \tan(45^\circ) = 30 \text{ feet} $$`
			},
			{
				id: 'special-angles',
				title: 'Special Angles & Identities',
				markdown: String.raw`# Special Angles & Identities

Two triangle families produce every "clean" trig value the SAT expects you to know.

## The 30-60-90 triangle

Sides are always in the ratio \( 1 : \sqrt{3} : 2 \). From it:

$$ \sin(30^\circ) = \frac{1}{2}, \quad \cos(30^\circ) = \frac{\sqrt{3}}{2}, \quad \tan(30^\circ) = \frac{\sqrt{3}}{3} $$

## The 45-45-90 triangle

Sides are in the ratio \( 1 : 1 : \sqrt{2} \). From it:

$$ \sin(45^\circ) = \cos(45^\circ) = \frac{\sqrt{2}}{2}, \quad \tan(45^\circ) = 1 $$

## The identities to keep on hand

1. **Pythagorean:** \( \sin^2(\theta) + \cos^2(\theta) = 1 \)
2. **Co-function:** \( \sin(\theta) = \cos(90^\circ - \theta) \)
3. **Quotient:** \( \tan(\theta) = \frac{\sin(\theta)}{\cos(\theta)} \)

Between the two special triangles and these three identities, nearly every SAT trigonometry question is a two-step problem: identify the family, then apply the identity.`
			}
		]
	},
	{
		id: 'missing-sides',
		title: 'Solving for Missing Sides',
		markdown: String.raw`# Solving for Missing Sides

The core SAT trig skill: you're given **one angle and one side** of a right triangle, and asked for another side. Every one of these problems is the same three steps:

1. **Label** the sides (opposite, adjacent, hypotenuse) relative to the given angle.
2. **Pick the ratio** that connects the side you *know* to the side you *want* — SOH, CAH, or TOA.
3. **Solve** the resulting equation for the unknown.

For example: an angle of \( 35^\circ \), a hypotenuse of 10, and you need the opposite side. Opposite and hypotenuse means sine:

$$ \sin(35^\circ) = \frac{x}{10} \quad\Rightarrow\quad x = 10\sin(35^\circ) $$

The two articles in this section break down the two places students slip: choosing the right ratio, and doing the algebra once it's chosen.`,
		articles: [
			{
				id: 'choosing-the-ratio',
				title: 'Choosing the Right Ratio',
				markdown: String.raw`# Choosing the Right Ratio

The ratio is chosen for you by the problem — you just have to read it off. Ask two questions:

1. Which side do I **know**?
2. Which side do I **want**?

Then pick the one ratio that mentions both:

| You have / want | Ratio |
| --- | --- |
| opposite & hypotenuse | \( \sin(\theta) = \frac{O}{H} \) |
| adjacent & hypotenuse | \( \cos(\theta) = \frac{A}{H} \) |
| opposite & adjacent | \( \tan(\theta) = \frac{O}{A} \) |

The hypotenuse never appears in a tangent equation, and the pair opposite–hypotenuse can only be sine. There is never more than one correct choice.

## Worked example

A ladder leans against a wall at \( 70^\circ \) to the ground. Its base is 4 feet from the wall, and you want how high it reaches. The 4 feet is **adjacent** to the angle; the height is **opposite**. Opposite and adjacent → tangent:

$$ \tan(70^\circ) = \frac{h}{4} $$

No sine, no cosine — the sides named in the problem picked tangent for you.`
			},
			{
				id: 'solving-the-equation',
				title: 'Solving the Equation',
				markdown: String.raw`# Solving the Equation

Once the ratio is set up, the unknown lives in one of two places — and each has its own one-step fix.

## Unknown on top: multiply

$$ \sin(35^\circ) = \frac{x}{10} \quad\Rightarrow\quad x = 10\sin(35^\circ) $$

When the unknown is the **numerator**, multiply both sides by the denominator. Done.

## Unknown on bottom: divide

$$ \cos(50^\circ) = \frac{8}{x} \quad\Rightarrow\quad x = \frac{8}{\cos(50^\circ)} $$

When the unknown is the **denominator**, the known side gets divided by the trig value. Students rushing this step often write \( x = 8\cos(50^\circ) \) — multiplying when they should divide — and the SAT always lists that wrong answer as a choice.

## Sanity check every answer

The hypotenuse must come out **longest**. A side found by *multiplying* by \( \sin \) or \( \cos \) must be **shorter** than the side you multiplied (both ratios are below 1 for acute angles). If your answer breaks either rule, you flipped the equation.`
			}
		]
	},
	{
		id: 'missing-angles',
		title: 'Solving for Missing Angles',
		markdown: String.raw`# Solving for Missing Angles

Sometimes the problem flips: you know **two sides** and need the **angle** between or across from them. The trig ratios alone can't answer that — \( \sin(\theta) = 0.5 \) tells you a ratio, not an angle. To *undo* a ratio and recover the angle, you need the **inverse trig functions**:

$$ \theta = \sin^{-1}(0.5) = 30^\circ $$

Each ratio has its own inverse — arcsine, arccosine, arctangent — written \( \sin^{-1} \), \( \cos^{-1} \), \( \tan^{-1} \) on your calculator.

The workflow mirrors the missing-side problems exactly: label the sides, pick the ratio that uses the two sides you know, then apply that ratio's inverse. The two articles cover the functions themselves and the start-to-finish workflow.`,
		articles: [
			{
				id: 'inverse-trig-functions',
				title: 'Inverse Trig Functions',
				markdown: String.raw`# Inverse Trig Functions

An inverse trig function takes a **ratio in**, and gives an **angle out** — the exact reverse of the ordinary functions:

$$ \sin(30^\circ) = 0.5 \qquad\Longleftrightarrow\qquad \sin^{-1}(0.5) = 30^\circ $$

There are three, one per ratio:

| Inverse | Also called | Undoes |
| --- | --- | --- |
| \( \sin^{-1} \) | arcsin | sine |
| \( \cos^{-1} \) | arccos | cosine |
| \( \tan^{-1} \) | arctan | tangent |

## The notation trap

The \( -1 \) is **not an exponent**. \( \sin^{-1}(x) \) means "the angle whose sine is \( x \)" — it does *not* mean \( \frac{1}{\sin(x)} \). This is the single most common misreading of the notation.

## Domain limits

Since sine and cosine of any angle stay between \( -1 \) and \( 1 \), \( \sin^{-1} \) and \( \cos^{-1} \) only accept inputs in \( [-1, 1] \). Ask a calculator for \( \sin^{-1}(1.4) \) and it errors — no angle has a sine of 1.4. Arctangent, like tangent, has no such cap and accepts any number.`
			},
			{
				id: 'two-sides-to-an-angle',
				title: 'From Two Sides to an Angle',
				markdown: String.raw`# From Two Sides to an Angle

Given two sides of a right triangle, finding an angle is a three-step routine:

1. **Label** the two known sides relative to the angle you want (opposite? adjacent? hypotenuse?).
2. **Pick the ratio** those two sides form — same table as always.
3. **Apply the inverse** of that ratio.

## Worked example

A wheelchair ramp rises 3 feet over a horizontal run of 12 feet. What angle does it make with the ground?

The rise (3) is **opposite** the angle; the run (12) is **adjacent**. Opposite and adjacent → tangent:

$$ \tan(\theta) = \frac{3}{12} = 0.25 \quad\Rightarrow\quad \theta = \tan^{-1}(0.25) \approx 14^\circ $$

## Sanity checks

- The two acute angles of a right triangle add to \( 90^\circ \) — if you find one, the other is free: \( 90^\circ - \theta \).
- An angle across from the *shorter* leg must come out **less than** \( 45^\circ \); across from the longer leg, more. If your answer disagrees with the picture, you mixed up opposite and adjacent.`
			}
		]
	},
	{
		id: 'pythagorean-trig',
		title: 'The Pythagorean Theorem + Trig',
		markdown: String.raw`# The Pythagorean Theorem + Trig

The Pythagorean theorem is the third tool in the kit, and it needs **no angles at all**: in any right triangle with legs \( a \) and \( b \) and hypotenuse \( c \),

$$ a^2 + b^2 = c^2 $$

Paired with the trig ratios, it lets you **fully solve** a right triangle — every side and every angle — from remarkably little information:

- Know **two sides**? Pythagoras gives the third; inverse trig gives the angles.
- Know **one side and one acute angle**? Trig ratios give a second side; Pythagoras (or another ratio) gives the third; subtraction from \( 90^\circ \) gives the last angle.

The articles in this section review the theorem itself (and the famous triples the SAT reuses constantly), then walk a complete triangle solve from start to finish.`,
		articles: [
			{
				id: 'pythagorean-theorem',
				title: 'The Pythagorean Theorem',
				markdown: String.raw`# The Pythagorean Theorem

In every right triangle, the legs \( a \) and \( b \) and the hypotenuse \( c \) satisfy:

$$ a^2 + b^2 = c^2 $$

The theorem only works in **right** triangles, and \( c \) must be the **hypotenuse** — the most common error is plugging the hypotenuse in as a leg.

## Solving for a leg

Rearranged for a missing leg:

$$ a = \sqrt{c^2 - b^2} $$

Note the **minus** sign: legs come from subtracting under the square root, never adding. Adding is only for finding the hypotenuse.

## Pythagorean triples

A few whole-number side sets satisfy the theorem exactly, and the SAT recycles them endlessly:

- **3-4-5** (and its multiples: 6-8-10, 9-12-15, 30-40-50…)
- **5-12-13** (and 10-24-26…)
- **7-24-25**

Spotting a triple turns a square-root calculation into instant recall: a right triangle with hypotenuse 13 and leg 5 has other leg 12, no arithmetic needed.`
			},
			{
				id: 'fully-solving-a-triangle',
				title: 'Fully Solving a Triangle',
				markdown: String.raw`# Fully Solving a Triangle

"Solving" a triangle means finding **all three sides and all three angles**. In a right triangle, one angle is already known — \( 90^\circ \) — so you need two sides and two acute angles. Two starting points cover every problem:

## Starting from two sides

Say the legs are 5 and 12.

1. **Third side (Pythagoras):** \( c = \sqrt{5^2 + 12^2} = \sqrt{169} = 13 \)
2. **First angle (inverse trig):** \( \theta = \tan^{-1}\!\left(\frac{5}{12}\right) \approx 22.6^\circ \)
3. **Second angle (subtraction):** \( 90^\circ - 22.6^\circ = 67.4^\circ \)

## Starting from one side and one angle

Say the hypotenuse is 20 and one acute angle is \( 30^\circ \).

1. **Other angle:** \( 90^\circ - 30^\circ = 60^\circ \)
2. **Opposite side (trig ratio):** \( 20\sin(30^\circ) = 10 \)
3. **Last side:** \( 20\cos(30^\circ) = 10\sqrt{3} \) — or Pythagoras: \( \sqrt{20^2 - 10^2} = 10\sqrt{3} \)

## The takeaway

Trig ratios connect sides *through angles*; Pythagoras connects sides *directly*. Fully solving a triangle is just alternating between the two until nothing is left unknown — and when Pythagoras and a trig ratio both reach the same side, computing it both ways is a free error check.`
			}
		]
	}
];

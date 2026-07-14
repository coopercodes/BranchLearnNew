/** A chapter in the Textbook window: picked from the sidebar, rendered as markdown. */
export interface TextbookChapter {
	id: string;
	title: string;
	/** Markdown body — supports KaTeX via \( ... \) inline and $$ ... $$ blocks. */
	markdown: string;
}

/**
 * Static chapters for the SAT Trigonometry textbook. String.raw keeps the
 * LaTeX backslashes intact so \( \frac{a}{b} \) reads like real TeX here.
 */
export const textbookChapters: TextbookChapter[] = [
	{
		id: 'sine',
		title: 'The Sine Ratio',
		markdown: String.raw`# The Sine Ratio

Every right triangle has two acute angles, and each one defines three basic ratios between its sides: sine, cosine, and tangent. The sine of an angle \( \theta \) is the length of the side **opposite** \( \theta \) divided by the length of the **hypotenuse**:

$$ \sin(\theta) = \frac{\text{opposite}}{\text{hypotenuse}} $$

Because every right triangle with the same angle \( \theta \) is similar, this ratio never changes — only the triangle's size does. That's what makes \( \sin(\theta) \) useful on the SAT: memorize a handful of values and you can solve any right triangle that shares that angle.

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
];

<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Desktop from '$lib/layout-components/Desktop.svelte';
	import { desktop, APPS } from '$lib/os/windowStore.svelte';
	import { osBar } from '$lib/os/osBarProgress.svelte';
	import MultipleChoiceQuestion from '$lib/question/MultipleChoiceQuestion.svelte';
	import { responses } from '$lib/question/responsesState.svelte';

	onMount(() => {
		desktop.open(APPS.find((a) => a.id === 'book')!);
	});

	const word = 'sin(θ)';
	const definitions = [
		'In a right triangle, sin(θ) is the ratio of the side opposite angle θ to the hypotenuse: sin(θ) = opposite / hypotenuse.',
		'On the unit circle, sin(θ) is the y-coordinate of the point where the terminal side of angle θ meets the circle — the same ratio, now defined for any angle, not just those inside a right triangle.',
		"For common angles, sin(θ) works out to clean values: sin(30°) = 1/2, sin(45°) = √2/2, and sin(60°) = √3/2. These come up often enough on the SAT that it's worth memorizing them outright.",
		"Because it's a ratio against the hypotenuse — the longest side of a right triangle — sin(θ) is always between -1 and 1. If a calculation ever gives you something outside that range, double-check your work.",
		'sin(θ) is an odd function: sin(-θ) = -sin(θ). Graphically, that means the sine curve is symmetric about the origin, repeating every 360° (or 2π radians).'
	];

	const tip = {
		label: 'Tip',
		body: 'sin(θ) = cos(90° - θ) for any acute angle θ. This co-function identity lets you swap between sine and cosine for complementary angles without touching a calculator.'
	};

	const questions = [
		{
			id: 'sat-trig-sin-01',
			number: 1,
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
			id: 'sat-trig-sin-02',
			number: 2,
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
			id: 'sat-trig-sin-03',
			number: 3,
			prompt:
				'A ladder leans against a wall, making a 60° angle with the ground. If the ladder is 10 feet long, how high up the wall does it reach?',
			correctAnswer: 'C',
			options: [
				{ label: 'A', text: '5 feet' },
				{ label: 'B', text: '5√2 feet' },
				{ label: 'C', text: '5√3 feet' },
				{ label: 'D', text: '10 feet' }
			]
		},
		{
			id: 'sat-trig-sin-04',
			number: 4,
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
			id: 'sat-trig-sin-05',
			number: 5,
			prompt: 'If sin(θ) = 0.6, what is cos(90° - θ)?',
			correctAnswer: 'B',
			options: [
				{ label: 'A', text: '0.4' },
				{ label: 'B', text: '0.6' },
				{ label: 'C', text: '0.8' },
				{ label: 'D', text: '1.6' }
			]
		}
	];

	// Mirror this page's answer state into the OS bar's remaining-count widget.
	$effect(() => {
		osBar.total = questions.length;
		osBar.answered = responses.answeredCount;
	});
	onDestroy(() => osBar.reset());
</script>

<Desktop>
	<div class="h-full flex">
		<!-- Left: article panel, scrolls independently, hugs the divider -->
		<div class="flex-1 h-full min-w-0 overflow-y-auto scroll-chill">
			<div
				class="min-h-full flex flex-col [justify-content:safe_center] items-end pl-16 pr-8 py-16"
			>
				<div class="w-full max-w-lg">
					<h1 class="text-5xl font-bold mb-6 text-black">{word}</h1>
					{#each definitions as def (def)}
						<p class="text-base text-black mb-4">{def}</p>
					{/each}

					<div class="mt-6 rounded-lg border border-brand-gold/40 bg-brand-gold/10 px-4 py-3">
						<p class="text-xs font-semibold uppercase tracking-wide text-brand-orange mb-1">
							{tip.label}
						</p>
						<p class="text-sm text-black">{tip.body}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Divider -->
		<div class="w-px h-6 bg-brand-gray-light/60 self-center shrink-0"></div>

		<!-- Right: questions panel, scrolls independently, hugs the divider -->
		<div class="flex-1 h-full min-w-0 overflow-y-auto scroll-chill">
			<div
				class="min-h-full flex flex-col [justify-content:safe_center] items-start pl-8 pr-16 py-16"
			>
				<div class="w-full max-w-sm">
					{#each questions as question (question.id)}
						<MultipleChoiceQuestion
							questionId={question.id}
							number={question.number}
							prompt={question.prompt}
							options={question.options}
							correctAnswer={question.correctAnswer}
							{responses}
						/>
					{/each}

					<p class="text-xs text-gray-500 mt-2">
						{responses.answeredCount}/{questions.length} correct · {responses.incorrectCount} wrong
						{responses.incorrectCount === 1 ? 'guess' : 'guesses'} · {Math.floor(
							responses.totalTimeMs / 1000
						)}s elapsed
					</p>
				</div>
			</div>
		</div>
	</div>
</Desktop>

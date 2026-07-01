
<script lang="ts">
	import { onMount } from "svelte";
	import Desktop from "$lib/layout-components/Desktop.svelte";
	import { desktop, APPS } from "$lib/os/windowStore.svelte";

	onMount(() => {
		desktop.open(APPS.find((a) => a.id === 'book')!);
	});

	const word = "sin(θ)";
	const definitions = [
		"In a right triangle, sin(θ) is the ratio of the side opposite angle θ to the hypotenuse: sin(θ) = opposite / hypotenuse.",
		"On the unit circle, sin(θ) is the y-coordinate of the point where the terminal side of angle θ meets the circle — the same ratio, now defined for any angle, not just those inside a right triangle."
	];

	const questions = [
		{
			number: 1,
			prompt: "In a right triangle, the side opposite angle θ has length 5 and the hypotenuse has length 13. What is sin(θ)?",
			options: [
				{ label: "A", text: "5/13" },
				{ label: "B", text: "12/13" },
				{ label: "C", text: "5/12" },
				{ label: "D", text: "13/5" }
			]
		},
		{
			number: 2,
			prompt: "If sin(θ) = cos(40°) and θ is acute, what is the value of θ, in degrees?",
			options: [
				{ label: "A", text: "40" },
				{ label: "B", text: "50" },
				{ label: "C", text: "90" },
				{ label: "D", text: "140" }
			]
		}
	];

	let selected = $state<Record<number, string | null>>(
		Object.fromEntries(questions.map((q) => [q.number, null]))
	);
</script>

<Desktop>
	<div class="h-full flex items-center justify-center px-16 mb-24">
		<div class="flex gap-16 w-full max-w-4xl items-start">
			<!-- Left: word + definitions -->
			<div class="flex-1">
				<h1 class="text-5xl font-bold mb-6">{word}</h1>
				{#each definitions as def (def)}
					<p class="text-base text-gray-700 mb-4">{def}</p>
				{/each}
			</div>

			<!-- Divider -->
			<div class="w-px bg-blue-500 h-[24px] my-auto self-stretch"></div>

			<!-- Right: multiple choice -->
			<div class="flex-1">
				{#each questions as question (question.number)}
					<div class="mb-8 last:mb-0">
						<p class="text-sm text-gray-500 mb-2">Question {question.number}</p>
						<p class="text-lg font-semibold mb-6">
							{question.prompt}
						</p>
						<div class="flex flex-col gap-3">
							{#each question.options as opt (opt.label)}
								<button
									class="cursor-pointer flex items-start gap-3 px-4 py-3 border border-brand-btn-border rounded-lg text-left bg-brand-btn-bg hover:brightness-95 transition-all {selected[question.number] === opt.label ? 'border-gray-500' : ''}"
									onclick={() => selected[question.number] = opt.label}
								>
									<span class="w-6 h-6 flex items-center justify-center bg-white rounded-full text-sm font-light shrink-0">{opt.label}</span>
									<span class="text-sm">{opt.text}</span>
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</Desktop>

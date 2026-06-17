
<script lang="ts">
	import LeafWindow from "$lib/layout-components/LeafWindow.svelte";
	import OSBar from "$lib/layout-components/OSBar.svelte";
	import WindowLayer from "$lib/layout-components/WindowLayer.svelte";

	const word = "infinite";
	const definitions = [
		"something that has no limits, such as the universe or (in some religions) God.",
		"To be infinite is something we do not yet understand. Infinite is found in the grass, the trees, the words, the book, but never is infinite defined as just one thing. Within infinite we find everything, even the finite can only exist with the infinite."
	];

	const question = {
		number: 1,
		options: [
			{ label: "A", text: "To impose without limits" },
			{ label: "B", text: "To create without boundaries" },
			{ label: "C", text: "To see into the endless, boundless variability of life" },
			{ label: "D", text: "To breathe, understand, and see further with others." }
		]
	};

	let selected = $state<string | null>(null);
</script>

<div class="h-screen flex flex-col">
	<div class="desktop relative flex-1 grow overflow-hidden">
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
					<p class="text-sm text-gray-500 mb-2">Question {question.number}</p>
					<p class="text-lg font-semibold mb-6">
						What does it mean to <em>be</em> infinite?
					</p>
					<div class="flex flex-col gap-3">
						{#each question.options as opt (opt.label)}
							<button
								class="cursor-pointer flex items-start gap-3 px-4 py-3 border border-brand-btn-border rounded-lg text-left bg-brand-btn-bg hover:brightness-95 transition-all {selected === opt.label ? 'border-gray-500' : ''}"
								onclick={() => selected = opt.label}
							>
								<span class="w-6 h-6 flex items-center justify-center bg-white rounded-full text-sm font-light shrink-0">{opt.label}</span>
								<span class="text-sm">{opt.text}</span>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Draggable, resizable windows -->
		<WindowLayer />
	</div>
	<OSBar />
	<LeafWindow />
</div>

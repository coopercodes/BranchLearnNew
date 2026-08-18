<script lang="ts">
	import { fly } from "svelte/transition";
	import BranchLogo from "$lib/assets/branch.svg"
	import Book from "$lib/Book.svelte";
	import Leaf from "$lib/Leaf.svelte";

	let currentWindow = $state(0);
	let name = $state("");

	const DURATION = 350;

	const TOTAL_WINDOWS = 3; // total tutorial steps

	let progress = $derived(Math.min(currentWindow / TOTAL_WINDOWS, 1));

	// Exit: fades while moving down. Enter: fades in while moving up from below,
	// delayed so it starts only after the previous window has fully faded out.
	const outFly = { y: 30, duration: DURATION };
	const inFly = { y: 30, duration: DURATION, delay: DURATION };

	function next() {
		currentWindow += 1;
	}

	function enterTrigonometry() {
		// TODO: navigate to the trigonometry learning path
		console.log(`Entering Trigonometry as ${name || "anonymous"}`);
	}

	let carouselIndex = $state(0);
	const slides = [1, 2, 3]; // placeholder slides

	function prevSlide() {
		carouselIndex = (carouselIndex - 1 + slides.length) % slides.length;
	}

	function nextSlide() {
		carouselIndex = (carouselIndex + 1) % slides.length;
	}

</script>

<style>
	.black-filter {
		filter: brightness(0);
	}

	.tutorial-hud {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 0.75rem 1.5rem 1rem;
		pointer-events: none; /* doesn't block clicks on content behind it */
		z-index: 100;
	}

	.hud-label {
		display: flex;
		justify-content: space-between;
		max-width: 340px;
		margin: 0 auto 0.35rem;
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #000000;
	}

	.hud-count {
		font-variant-numeric: tabular-nums;
	}

	.hud-bar {
		position: relative;
		max-width: 340px;
		margin: 0 auto;
		height: 12px;
		border-radius: 6px;
		background: rgba(20, 24, 18, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.25);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
		overflow: hidden;
	}

	.hud-fill {
		height: 100%;
		background: linear-gradient(to bottom, #a8d95a, #6aa832);
		border-radius: 6px;
		transition: width 400ms ease;
		box-shadow: 0 0 8px rgba(140, 200, 80, 0.6);
	}

	.hud-ticks {
		position: absolute;
		inset: 0;
		display: flex;
		justify-content: space-evenly;
	}

	.hud-tick {
		width: 1px;
		background: rgba(0, 0, 0, 0.4);
	}
</style>


<div class="h-screen w-screen relative overflow-hidden">

	{#if false}

	{:else}
		<!-- Window 0: Get Started -->
		{#if currentWindow === 0}
			<div class="absolute inset-0 text-3xl flex items-center justify-center" in:fly={inFly} out:fly={outFly}>
				<div class="flex flex-col items-center">

					<div class="flex items-center space-x-4">
						<img src={BranchLogo} alt="Branch logo" class="h-14 w-14 black-filter subpixel-antialiased"/>
						<p class="font-bold text-5xl">Branch</p>
					</div>

					<p class="text-sm mt-2">learning can be beautiful</p>

					<button
						class="text-sm px-4 py-1 bg-blue-700 cursor-pointer text-white font-bold mt-4 rounded-sm border border-blue-300 shadow-7xl shadow-blue-900/50"
						onclick={next}
					>
						Get Started In 30 Seconds
					</button>
					<p class="text-xs mt-2 text-neutral-500">No account necessary</p>
				</div>
			</div>

		<!-- Window 1: What is Branch? -->
		{:else if currentWindow === 1}
			<div
		class="absolute inset-0 flex flex-col items-center justify-center gap-6"
		in:fly={inFly}
		out:fly={outFly}
	>


		

		<!-- Row 2: existing content row -->
		<div class="flex items-center space-x-6">
			<div class="flex flex-col max-w-md px-4">
				<p class="font-bold text-4xl">Uhh, what is this website?</p>
				<p class="text-sm mt-4 text-neutral-600">
					<span class="font-semibold text-black">Branch</span> is an RPG SAT preparation website... it's a new thing. Branch combines a revolutionary learning interface with MMO concepts such as monsters, dungeons, and even gold!
				</p>

				<p class="text-sm mt-4 text-neutral-600">
					Let me guess, you've used an SAT preparation website only for you to be falling asleep 2 hours later? We've been there, that's why we built this.
				</p>

				<p class="text-sm mt-4 text-neutral-600">
					The best part about Branch is that you have fun and you get a higher SAT score in LESS time. Pretty baller.
				</p>

				<p class="text-sm mt-4 text-neutral-600">
					We've found that Branch is easier to learn when you experience it first hand, so dive in and try it out!
			</div>

			<div class="bg-brand-orange p-4 w-[325px] border-white border rounded-md text-white">
				<p class="font-bold text-sm text-white mb-1">Research Backed</p>
				<p class="text-xs">The research team at Branch uses real, peer reviewed studies on how humans learn to make <span class="font-semibold">the most effective learning experience ever created.</span></p>

				<div class="flex flex-col gap-2 mt-4 text-xs">
					<div class="flex items-center gap-2">
						<!-- document icon -->
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						<span>32 peer reviewed papers</span>
					</div>

					<div class="flex items-center gap-2">
						<!-- sparkles icon -->
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
						</svg>
						<span>Proprietary recommendation algorithm</span>
					</div>

					<div class="flex items-center gap-2">
						<!-- refresh/adapt icon -->
						<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						<span>Learning engine adapts to user responses</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Row 3: continue button -->
		<button
			class="text-sm px-12 py-4 bg-blue-700 cursor-pointer text-white font-bold rounded-sm border border-blue-300 shadow-blue-900/50"
			onclick={next}
		>
			Continue
		</button>
	</div>

			

		<!-- Window 2: Name -->
		{:else if currentWindow === 2}
			<div class="absolute inset-0 flex items-center justify-center" in:fly={inFly} out:fly={outFly}>
				<div class="flex flex-col items-center max-w-md text-center px-4">
					<p class="font-bold text-4xl">Nice to meet you</p>
					<p class="text-sm mt-2 text-neutral-600">What is your name?</p>

					<input
						type="text"
						bind:value={name}
						placeholder="Your name"
						class="mt-6 text-sm px-3 py-2 border border-neutral-300 rounded-sm w-64 text-center focus:outline-none focus:border-blue-500"
						onkeydown={(e) => e.key === "Enter" && name.trim() && next()}
					/>

					<button
						class="text-sm px-4 py-1 bg-blue-700 cursor-pointer text-white font-bold mt-4 rounded-sm border border-blue-300 shadow-blue-900/50 disabled:opacity-40 disabled:cursor-not-allowed"
						onclick={next}
						disabled={!name.trim()}
					>
						Continue
					</button>
				</div>
			</div>

		<!-- Window 3: Select learning path -->
		{:else if currentWindow === 3}
			<div class="absolute inset-0 flex items-center justify-center" in:fly={inFly} out:fly={outFly}>
				<div class="flex flex-col items-center max-w-md text-center px-4">
					<p class="font-bold text-4xl">Select a learning path</p>
					<p class="text-sm mt-2 text-neutral-600">
						{name ? `Alright ${name.trim()}, where` : "Where"} do you want to start?
					</p>

					<div class="flex flex-col items-center mt-6 space-y-3 w-64">
						<button
							class="w-full text-sm px-4 py-2 bg-blue-700 cursor-pointer text-white font-bold rounded-sm border border-blue-300 shadow-blue-900/50"
							onclick={enterTrigonometry}
						>
							Enter Trigonometry
						</button>

						<button
							class="w-full text-sm px-4 py-2 bg-neutral-200 text-neutral-400 font-bold rounded-sm border border-neutral-300 cursor-not-allowed"
							disabled
						>
							Algebra — coming soon
						</button>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>

<div class="tutorial-hud">
	<div class="hud-label">
		<span>Tutorial Progress</span>
		<span class="hud-count">{Math.min(currentWindow, TOTAL_WINDOWS)} / {TOTAL_WINDOWS}</span>
	</div>
	<div class="hud-bar">
		<div class="hud-fill" style:width="{progress * 100}%"></div>
		<div class="hud-ticks">
			{#each Array(TOTAL_WINDOWS - 1) as _}
				<div class="hud-tick"></div>
			{/each}
		</div>
	</div>
</div>
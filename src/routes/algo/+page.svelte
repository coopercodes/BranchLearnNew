<script lang="ts">
	import AlgoNodeMap from '$lib/algo/AlgoNodeMap.svelte';
	import { algoSections, algoUser, findAlgoPanel } from '$lib/algo/content';
	import { algoGame } from '$lib/algo/gameState.svelte';
	import { recommendNext } from '$lib/algo/recommender';
	import { pickQuestionIndex, rollResponse } from '$lib/algo/simulator';
	import { isContentPanel, PANEL_TYPE_LABELS } from '$lib/algo/types';

	interface Outcome {
		kind: 'correct' | 'incorrect' | 'read';
		prompt: string;
		answer: string | null;
	}

	let lastOutcome = $state<Outcome | null>(null);

	let pendingPanel = $derived(
		algoGame.pending ? (findAlgoPanel(algoGame.pending.panelId) ?? null) : null
	);
	let pendingQuestion = $derived(
		pendingPanel && algoGame.pending ? pendingPanel.questions[algoGame.pending.questionIndex] : null
	);
	let activeSection = $derived(algoGame.activeSection(algoSections));
	let allDone = $derived(activeSection === null);
	let chance = $derived(activeSection ? algoGame.chanceFor(activeSection.id) : 0);

	let buttonLabel = $derived(
		allDone
			? 'Course Mastered 🎉'
			: pendingPanel
				? isContentPanel(pendingPanel.type)
					? 'Mark as Read'
					: 'Simulate Response'
				: 'Next Choice'
	);

	let recentEvents = $derived([...algoGame.events].reverse().slice(0, 5));

	/**
	 * One button, two phases: first click asks the algorithm for the next
	 * panel; second click simulates the learner's response to it.
	 */
	function nextChoice() {
		if (allDone && !algoGame.pending) return;
		if (algoGame.pending) {
			resolvePending();
		} else {
			const panel = recommendNext(algoSections, algoGame);
			if (!panel) return;
			lastOutcome = null;
			algoGame.recordRecommendation(panel, pickQuestionIndex(panel));
		}
	}

	function resolvePending() {
		const pending = algoGame.pending;
		if (!pending) return;
		const panel = findAlgoPanel(pending.panelId);
		const section = panel && algoSections.find((s) => s.id === panel.sectionId);
		if (!panel || !section) return;

		if (isContentPanel(panel.type)) {
			algoGame.resolveArticle(panel, section);
			lastOutcome = { kind: 'read', prompt: panel.title, answer: null };
			return;
		}

		const question = panel.questions[pending.questionIndex];
		const correct = rollResponse(algoGame.chanceFor(section.id));
		algoGame.resolveResponse(panel, section, question.prompt, correct);
		lastOutcome = {
			kind: correct ? 'correct' : 'incorrect',
			prompt: question.prompt,
			answer: question.answer
		};
	}

	function restart() {
		if (confirm('Restart the simulation? This wipes the saved game state.')) {
			algoGame.reset();
			lastOutcome = null;
		}
	}

	/** Clamp happens in the game state; write the accepted value back into the input. */
	function onAptitudeChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		algoGame.setAptitude(Number(input.value));
		input.value = String(algoGame.aptitude);
	}
</script>

<div class="min-h-screen bg-brand-cream px-8 py-12">
	<div class="mx-auto max-w-6xl">
		<!-- Header -->
		<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
			<div>
				<h1 class="text-4xl font-bold tracking-tight text-brand-navy">The Algo</h1>
				<p class="mt-1 text-sm text-brand-gray-mid">
					Watch the recommendation engine walk a learner through SOH · CAH · TOA
				</p>
			</div>
			<button onclick={restart} class="text-sm font-semibold text-brand-crimson hover:underline">
				Restart simulation
			</button>
		</div>

		<!-- Learner + stats row -->
		<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
			<div class="flex items-center gap-4 rounded-xl bg-brand-navy p-5">
				<div
					class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-gold text-lg font-bold text-brand-near-black"
				>
					{algoUser.name.charAt(0)}
				</div>
				<div class="min-w-0">
					<p class="truncate font-bold text-white">{algoUser.name}</p>
					<p class="truncate text-xs text-brand-gray-light">{algoUser.goal}</p>
				</div>
			</div>
			<div class="rounded-xl bg-brand-white p-5 outline outline-1 outline-brand-gray-light/40">
				<p class="text-xs font-semibold tracking-widest text-brand-orange uppercase">
					Correct chance
				</p>
				<p class="mt-1 text-3xl font-bold text-brand-near-black">
					{allDone ? '—' : `${Math.round(chance * 100)}%`}
				</p>
				<div class="mt-2 h-1.5 rounded-full bg-brand-cream">
					<div
						class="h-1.5 rounded-full bg-brand-orange transition-all duration-500"
						style:width="{allDone ? 100 : Math.round(chance * 100)}%"
					></div>
				</div>
				<p class="mt-1 text-[11px] text-brand-gray-mid">
					{allDone
						? 'Every section mastered'
						: `Rises as ${algoUser.name.split(' ')[0]} practices ${activeSection?.title}`}
				</p>
				<div
					class="mt-3 flex items-center justify-between gap-3 border-t border-brand-gray-light/30 pt-2"
				>
					<label for="aptitude" class="text-[11px] text-brand-gray-mid">
						Learner weight
						<span class="block text-[10px]">×0.5 struggling · ×1 average · ×1.5 strong</span>
					</label>
					<input
						id="aptitude"
						type="number"
						min="0.1"
						max="2"
						step="0.1"
						value={algoGame.aptitude}
						onchange={onAptitudeChange}
						class="w-20 rounded-md border-brand-gray-light/60 py-1 text-sm text-brand-near-black focus:border-brand-orange focus:ring-brand-orange"
					/>
				</div>
			</div>
			<div class="rounded-xl bg-brand-white p-5 outline outline-1 outline-brand-gray-light/40">
				<p class="text-xs font-semibold tracking-widest text-brand-forest uppercase">
					Overall progress
				</p>
				<p class="mt-1 text-3xl font-bold text-brand-near-black">
					{algoGame.overallPercent(algoSections)}%
				</p>
				<div class="mt-2 h-1.5 rounded-full bg-brand-cream">
					<div
						class="h-1.5 rounded-full bg-brand-forest transition-all duration-500"
						style:width="{algoGame.overallPercent(algoSections)}%"
					></div>
				</div>
				<p class="mt-1 text-[11px] text-brand-gray-mid">
					{allDone ? 'SOH · CAH · TOA complete' : `Currently in ${activeSection?.title}`}
				</p>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<!-- Node map -->
			<div
				class="rounded-xl bg-brand-white p-6 outline outline-1 outline-brand-gray-light/40 lg:col-span-2"
			>
				<AlgoNodeMap sections={algoSections} game={algoGame} />
			</div>

			<!-- Action column -->
			<div class="space-y-4 lg:sticky lg:top-8 lg:self-start">
				<!-- Current recommendation -->
				<div class="rounded-xl bg-brand-white p-6 outline outline-1 outline-brand-gray-light/40">
					<p class="text-xs font-semibold tracking-widest text-brand-orange uppercase">
						{pendingPanel ? 'Recommended panel' : allDone ? 'All done' : 'Up next'}
					</p>

					<!-- Fixed-height content area so the button below never moves. -->
					<div class="scroll-chill mt-2 h-56 overflow-y-auto">
						{#if pendingPanel}
							<p class="font-bold text-brand-near-black">{pendingPanel.title}</p>
							<p class="mt-1 text-xs text-brand-gray-mid">
								{PANEL_TYPE_LABELS[pendingPanel.type]} ·
								{algoGame.stats(pendingPanel.id).correct}/{algoGame.requiredFor(pendingPanel.type)} correct
								so far
							</p>
							<div class="mt-3 rounded-lg bg-brand-cream/70 p-4 text-sm text-brand-near-black">
								{#if isContentPanel(pendingPanel.type)}
									{pendingPanel.summary}
								{:else}
									{pendingQuestion?.prompt}
								{/if}
							</div>
						{:else if allDone}
							<p class="text-sm text-brand-near-black">
								{algoUser.name} has mastered all three sections. Reset the game state to run the simulation
								again.
							</p>
						{:else}
							<p class="text-sm text-brand-gray-mid">
								Hit “Next Choice” and the algorithm will pick the best panel for
								{algoUser.name.split(' ')[0]} right now.
							</p>
						{/if}
					</div>

					<button
						onclick={nextChoice}
						disabled={allDone && !algoGame.pending}
						class="mt-4 w-full rounded-lg bg-brand-navy py-3 text-sm font-bold text-white transition-colors hover:bg-brand-near-black disabled:cursor-not-allowed disabled:opacity-40"
					>
						{buttonLabel}
					</button>
				</div>

				<!-- Last outcome -->
				{#if lastOutcome}
					<div
						class="rounded-xl p-5 {lastOutcome.kind === 'correct'
							? 'bg-brand-forest text-white'
							: lastOutcome.kind === 'incorrect'
								? 'bg-brand-crimson text-white'
								: 'bg-brand-gold text-brand-near-black'}"
					>
						<p class="text-xs font-semibold tracking-widest uppercase opacity-80">
							{lastOutcome.kind === 'correct'
								? '✓ Correct response'
								: lastOutcome.kind === 'incorrect'
									? '✗ Incorrect response'
									: '📖 Article read'}
						</p>
						<p class="mt-1 text-sm font-semibold">{lastOutcome.prompt}</p>
						{#if lastOutcome.answer}
							<p class="mt-1 text-xs opacity-80">Answer: {lastOutcome.answer}</p>
						{/if}
					</div>
				{/if}

				<!-- Recent events -->
				<div class="rounded-xl bg-brand-white p-5 outline outline-1 outline-brand-gray-light/40">
					<p class="mb-2 text-xs font-semibold tracking-widest text-brand-gray-mid uppercase">
						Recent events
					</p>
					{#if recentEvents.length === 0}
						<p class="text-xs text-brand-gray-mid">Nothing yet — the log lives in localStorage.</p>
					{:else}
						<ol class="space-y-1.5">
							{#each recentEvents as event (event.at + event.type + event.detail)}
								<li class="text-xs text-brand-near-black">
									<span class="font-mono text-[10px] text-brand-orange uppercase">
										{event.type}
									</span>
									<span class="text-brand-gray-mid">— {event.detail}</span>
								</li>
							{/each}
						</ol>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

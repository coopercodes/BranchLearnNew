<script lang="ts">
	import { contentFor, roundFor } from './panel-content';
	import { game, MAX_ELO } from './gameState.svelte';
	import { ContentGraph } from './graph-content';
	import type { PanelNode } from './types';

	// Dev tools for the graph-driven flow: walker position, per-subtopic ELO,
	// the current round's answer (cheat), and force-resolve buttons that feed
	// the same submitAnswer path the real panels use.
	let {
		active,
		resolved,
		onForce,
		onReset
	}: {
		active: { panel: PanelNode; visit: number } | null;
		resolved: boolean;
		onForce: (correct: boolean) => void;
		onReset: () => void;
	} = $props();

	let open = $state(false);
	let revealed = $state(false);

	const subtopics = ContentGraph.filter((n) => n.type === 'subtopic');

	// The current round's correct answer — the cheat tool.
	let cheat = $derived.by(() => {
		if (!active) return null;
		const content = contentFor(active.panel.panelID);
		if (!content || content.type === 'flashcard') return null;
		const question =
			content.type === 'triangle'
				? roundFor(content.rounds, active.visit).question
				: roundFor(content.questions, active.visit);
		const opt = question.options.find((o) => o.label === question.correctAnswer);
		return { label: question.correctAnswer, text: opt?.text ?? '', prompt: question.prompt };
	});

	function shortName(subtopicID: string): string {
		return (subtopicID.split(':')[1] ?? subtopicID).toUpperCase();
	}

	function resetState() {
		if (confirm('Wipe the entire content-graph game from localStorage?')) {
			onReset();
			revealed = false;
		}
	}
</script>

<!-- Fixed overlay, orange/white functional-grid style — same seat TrigDevTools had. -->
<div class="fixed right-4 bottom-16 z-50 flex flex-col items-end gap-3 font-sans">
	{#if open}
		<div
			class="flex max-h-[78vh] w-[24rem] flex-col overflow-hidden rounded-sm border border-[#e5e2dc] bg-white shadow-2xl"
		>
			<!-- Header -->
			<div class="flex items-center justify-between bg-[#f35d29] px-4 py-3">
				<div>
					<p class="text-[10px] font-semibold tracking-[0.2em] text-white/80 uppercase">
						Branch · Dev Tools
					</p>
					<p class="text-sm font-bold text-white">Content Graph</p>
				</div>
				<span class="font-mono text-sm font-bold text-white tabular-nums">
					{game.events.length} ev
				</span>
			</div>

			<div class="scroll-chill flex-1 divide-y divide-[#eeece7] overflow-y-auto">
				<!-- Position -->
				<section class="px-4 py-3">
					<p class="mb-2 text-[10px] font-semibold tracking-[0.2em] text-[#f35d29] uppercase">
						01 · Walker
					</p>
					<dl class="space-y-1 text-xs text-[#3a3a37]">
						<div class="flex justify-between gap-4">
							<dt class="text-[#9a9891]">Current node</dt>
							<dd class="truncate font-mono">{game.currentID}</dd>
						</div>
						<div class="flex justify-between gap-4">
							<dt class="text-[#9a9891]">Pending panel</dt>
							<dd class="truncate font-mono">{active?.panel.panelID ?? '—'}</dd>
						</div>
						{#if active}
							<div class="flex justify-between gap-4">
								<dt class="text-[#9a9891]">Attempts / quota</dt>
								<dd class="font-mono tabular-nums">
									{game.attemptsFor(active.panel.id)} tries ·
									{Math.min(game.correctFor(active.panel.id), active.panel.requiredCorrect)}/{active
										.panel.requiredCorrect} banked
								</dd>
							</div>
						{/if}
					</dl>
				</section>

				<!-- ELO -->
				<section class="px-4 py-3">
					<p class="mb-2 text-[10px] font-semibold tracking-[0.2em] text-[#f35d29] uppercase">
						02 · Subtopic ELO
					</p>
					<div class="grid grid-cols-3 gap-2 text-center">
						{#each subtopics as subtopic (subtopic.id)}
							<div class="rounded-sm bg-[#f6f5f1] py-2">
								<p class="font-mono text-lg font-bold text-[#3a3a37]">
									{game.eloFor(subtopic.id)}<span class="text-xs text-[#9a9891]">/{MAX_ELO}</span>
								</p>
								<p class="text-[10px] tracking-wide text-[#9a9891] uppercase">
									{shortName(subtopic.id)}
								</p>
								<p class="text-[9px] tracking-wide text-[#3d8b5f] uppercase">
									{game.rankOf(subtopic.id)}
								</p>
							</div>
						{/each}
					</div>
				</section>

				<!-- Force resolve -->
				<section class="px-4 py-3">
					<p class="mb-2 text-[10px] font-semibold tracking-[0.2em] text-[#f35d29] uppercase">
						03 · Force answer
					</p>
					<div class="flex gap-2">
						<button
							onclick={() => onForce(true)}
							disabled={!active || resolved}
							class="flex-1 rounded-sm border border-[#3d8b5f] px-2 py-1.5 text-[10px] font-semibold tracking-[0.1em] text-[#3d8b5f] uppercase transition-colors hover:bg-[#3d8b5f] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
						>
							✓ Correct
						</button>
						<button
							onclick={() => onForce(false)}
							disabled={!active || resolved}
							class="flex-1 rounded-sm border border-[#d42622] px-2 py-1.5 text-[10px] font-semibold tracking-[0.1em] text-[#d42622] uppercase transition-colors hover:bg-[#d42622] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
						>
							✗ Incorrect
						</button>
					</div>
				</section>

				<!-- Cheat -->
				<section class="px-4 py-3">
					<div class="mb-2 flex items-center justify-between">
						<p class="text-[10px] font-semibold tracking-[0.2em] text-[#f35d29] uppercase">
							04 · Cheat
						</p>
						<button
							onclick={() => (revealed = !revealed)}
							disabled={!cheat}
							class="rounded-sm border border-[#f35d29] px-2 py-0.5 text-[10px] font-semibold tracking-[0.1em] text-[#f35d29] uppercase transition-colors hover:bg-[#f35d29] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
						>
							{revealed ? 'Hide' : 'Reveal answer'}
						</button>
					</div>
					{#if !cheat}
						<p class="text-xs text-[#9a9891]">No multiple-choice question on screen right now.</p>
					{:else if !revealed}
						<p class="text-xs text-[#9a9891]">Answer hidden — hit “Reveal answer”.</p>
					{:else}
						<p class="mb-1 text-[11px] text-[#9a9891]">{cheat.prompt}</p>
						<p class="font-mono text-sm font-bold text-[#3d8b5f]">
							{cheat.label}) {cheat.text}
						</p>
					{/if}
				</section>
			</div>

			<!-- Footer -->
			<div
				class="flex items-center justify-between border-t border-[#eeece7] bg-[#faf9f6] px-4 py-2.5"
			>
				<p class="text-[10px] text-[#9a9891] uppercase">{game.storageKey}</p>
				<button
					onclick={resetState}
					class="rounded-sm border border-[#f35d29] px-3 py-1 text-[10px] font-semibold tracking-[0.15em] text-[#f35d29] uppercase transition-colors hover:bg-[#f35d29] hover:text-white"
				>
					Reset State
				</button>
			</div>
		</div>
	{/if}

	<button
		onclick={() => (open = !open)}
		aria-label="Toggle content-graph dev tools"
		class="flex h-11 w-11 items-center justify-center rounded-sm bg-[#f35d29] text-[10px] font-bold tracking-widest text-white uppercase shadow-lg transition-transform hover:scale-105"
	>
		{open ? '×' : 'DEV'}
	</button>
</div>

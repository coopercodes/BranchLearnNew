<script lang="ts">
	import { trigSession } from './session.svelte';
	import { panels, TOPICS } from './panels';

	let open = $state(false);
	let revealed = $state(false);

	let panel = $derived(trigSession.panel);

	// The current question's answer — the cheat tool. Null unless a question is up.
	let cheat = $derived.by(() => {
		if (panel.type !== 'question') return null;
		const opt = panel.options?.find((o) => o.label === panel.answer);
		return { label: panel.answer ?? '', text: opt?.text ?? '', prompt: panel.prompt ?? panel.title };
	});

	function resetState() {
		if (confirm('Wipe the entire trig session from localStorage?')) {
			trigSession.reset();
			revealed = false;
		}
	}
</script>

<!-- Session dev tools: fixed overlay, orange/white functional-grid style. -->
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
					<p class="text-sm font-bold text-white">Trig Session</p>
				</div>
				<span class="font-mono text-sm font-bold text-white tabular-nums">
					{trigSession.overallPercent}%
				</span>
			</div>

			<div class="scroll-chill flex-1 divide-y divide-[#eeece7] overflow-y-auto">
				<!-- Position -->
				<section class="px-4 py-3">
					<p class="mb-2 text-[10px] font-semibold tracking-[0.2em] text-[#f35d29] uppercase">
						01 · Position
					</p>
					<dl class="space-y-1 text-xs text-[#3a3a37]">
						<div class="flex justify-between gap-4">
							<dt class="text-[#9a9891]">Index</dt>
							<dd class="font-mono tabular-nums">{trigSession.index} / {panels.length - 1}</dd>
						</div>
						<div class="flex justify-between gap-4">
							<dt class="text-[#9a9891]">Panel id</dt>
							<dd class="truncate font-mono">{panel.id}</dd>
						</div>
						<div class="flex justify-between gap-4">
							<dt class="text-[#9a9891]">Type</dt>
							<dd class="font-mono">{panel.type}</dd>
						</div>
					</dl>
				</section>

				<!-- Topic progress -->
				<section class="px-4 py-3">
					<p class="mb-2 text-[10px] font-semibold tracking-[0.2em] text-[#f35d29] uppercase">
						02 · Topics
					</p>
					<div class="grid grid-cols-3 gap-2 text-center">
						{#each TOPICS as topic (topic)}
							<div class="rounded-sm bg-[#f6f5f1] py-2">
								<p class="font-mono text-lg font-bold text-[#3a3a37]">
									{trigSession.topicPercent(topic)}%
								</p>
								<p class="text-[10px] tracking-wide text-[#9a9891] uppercase">{topic}</p>
							</div>
						{/each}
					</div>
				</section>

				<!-- Cheat -->
				<section class="px-4 py-3">
					<div class="mb-2 flex items-center justify-between">
						<p class="text-[10px] font-semibold tracking-[0.2em] text-[#f35d29] uppercase">
							03 · Cheat
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
						<p class="text-xs text-[#9a9891]">No question on screen right now.</p>
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
			<div class="flex items-center justify-between border-t border-[#eeece7] bg-[#faf9f6] px-4 py-2.5">
				<p class="text-[10px] text-[#9a9891] uppercase">localStorage · live</p>
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
		aria-label="Toggle trig dev tools"
		class="flex h-11 w-11 items-center justify-center rounded-sm bg-[#f35d29] text-[10px] font-bold tracking-widest text-white uppercase shadow-lg transition-transform hover:scale-105"
	>
		{open ? '×' : 'DEV'}
	</button>
</div>

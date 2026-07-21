<script lang="ts">
	import { onDestroy } from 'svelte';
	import { trigSections } from './content';
	import { trigSession } from './session.svelte';
	import { resolvePanel } from './algorithm';
	import TrigNodeMap from './TrigNodeMap.svelte';
	import { PANEL_TYPE_LABELS } from './types';

	let open = $state(false);
	let revealed = $state(false);

	// A once-a-second clock so "time elapsed" ticks live while the panel is open.
	let now = $state(Date.now());
	const timer = setInterval(() => (now = Date.now()), 1000);
	onDestroy(() => clearInterval(timer));

	let panel = $derived(resolvePanel(trigSections, trigSession, trigSession.position));

	// The current question's answer — the cheat tool. Null unless a gradeable
	// question is on screen.
	let cheat = $derived.by(() => {
		if (panel.kind !== 'panel' || !panel.question) return null;
		const q = panel.question;
		const opt = q.options.find((o) => o.label === q.correctAnswer);
		return { label: q.correctAnswer, text: opt?.text ?? '', prompt: q.prompt };
	});

	let elapsed = $derived(trigSession.startedAt ? now - trigSession.startedAt : 0);
	let correct = $derived(trigSession.totalCorrect);
	let incorrect = $derived(trigSession.totalIncorrect);
	let solved = $derived(trigSession.totalSolved);
	let answered = $derived(correct + incorrect);

	function formatElapsed(ms: number): string {
		const total = Math.floor(ms / 1000);
		const h = Math.floor(total / 3600);
		const m = Math.floor((total % 3600) / 60);
		const s = total % 60;
		const mm = String(m).padStart(2, '0');
		const ss = String(s).padStart(2, '0');
		return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
	}

	function positionLabel(): string {
		const pos = trigSession.position;
		if (!pos) return '—';
		if (pos.kind === 'course-complete') return 'Course complete';
		if (pos.kind === 'section-start') return `${pos.sectionId} · intro`;
		if (pos.kind === 'section-complete') return `${pos.sectionId} · wrap-up`;
		return pos.panelId;
	}

	function currentType(): string {
		return panel.kind === 'panel' ? PANEL_TYPE_LABELS[panel.panel.type] : '—';
	}

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
			class="flex max-h-[78vh] w-[26rem] flex-col overflow-hidden rounded-sm border border-[#e5e2dc] bg-white shadow-2xl"
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
					{formatElapsed(elapsed)}
				</span>
			</div>

			<div class="scroll-chill flex-1 divide-y divide-[#eeece7] overflow-y-auto">
				<!-- Session -->
				<section class="px-4 py-3">
					<p class="mb-2 text-[10px] font-semibold tracking-[0.2em] text-[#f35d29] uppercase">
						01 · Session
					</p>
					<dl class="space-y-1 text-xs text-[#3a3a37]">
						<div class="flex justify-between gap-4">
							<dt class="text-[#9a9891]">Time elapsed</dt>
							<dd class="font-mono tabular-nums">{formatElapsed(elapsed)}</dd>
						</div>
						<div class="flex justify-between gap-4">
							<dt class="text-[#9a9891]">Position</dt>
							<dd class="truncate font-mono">{positionLabel()}</dd>
						</div>
						<div class="flex justify-between gap-4">
							<dt class="text-[#9a9891]">Current type</dt>
							<dd class="font-mono">{currentType()}</dd>
						</div>
						<div class="flex justify-between gap-4">
							<dt class="text-[#9a9891]">Overall</dt>
							<dd class="font-mono">{trigSession.overallPercent()}%</dd>
						</div>
					</dl>
				</section>

				<!-- Responses -->
				<section class="px-4 py-3">
					<p class="mb-2 text-[10px] font-semibold tracking-[0.2em] text-[#f35d29] uppercase">
						02 · Responses
					</p>
					<div class="grid grid-cols-3 gap-2 text-center">
						<div class="rounded-sm bg-[#eef6f0] py-2">
							<p class="font-mono text-lg font-bold text-[#3d8b5f]">{correct}</p>
							<p class="text-[10px] tracking-wide text-[#9a9891] uppercase">Correct</p>
						</div>
						<div class="rounded-sm bg-[#fbecea] py-2">
							<p class="font-mono text-lg font-bold text-[#c73a2e]">{incorrect}</p>
							<p class="text-[10px] tracking-wide text-[#9a9891] uppercase">Incorrect</p>
						</div>
						<div class="rounded-sm bg-[#f6f5f1] py-2">
							<p class="font-mono text-lg font-bold text-[#3a3a37]">
								{answered ? Math.round((correct / answered) * 100) : 0}%
							</p>
							<p class="text-[10px] tracking-wide text-[#9a9891] uppercase">Accuracy</p>
						</div>
					</div>
					<p class="mt-2 text-[10px] text-[#9a9891]">
						{solved} solved · <span class="font-semibold text-[#3d8b5f]">{correct} counted</span>
						(clean first try). Wrong-then-right solves don't count toward mastery.
					</p>
				</section>

				<!-- Recommender graph -->
				<section class="px-4 py-3">
					<div class="mb-2 flex items-center justify-between">
						<p class="text-[10px] font-semibold tracking-[0.2em] text-[#f35d29] uppercase">
							03 · Recommender
						</p>
						<span class="flex items-center gap-1 text-[9px] text-[#9a9891] uppercase">
							<span class="inline-block h-2 w-2 rounded-full border-2 border-[#f35d29]"></span>
							recommended now
						</span>
					</div>
					<TrigNodeMap />
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
			<div
				class="flex items-center justify-between border-t border-[#eeece7] bg-[#faf9f6] px-4 py-2.5"
			>
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

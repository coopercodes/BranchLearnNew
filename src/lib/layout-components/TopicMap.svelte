<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import SectionProgressRing from '$lib/trig/SectionProgressRing.svelte';
	import { trigSections } from '$lib/trig/content';
	import { trigSession } from '$lib/trig/session.svelte';
	import { pickQuestion } from '$lib/trig/recommender';
	import { isContentPanel, PANEL_TYPE_LABELS, type TrigPanel, type TrigSection } from '$lib/trig/types';

	/** Short glyph shown inside each panel node. */
	const ABBREV: Record<string, string> = {
		article: 'A',
		'multiple-choice': 'MC',
		'fill-blank': 'FB',
		'lightning-round': 'LR',
		'triangle-long-answer': 'TL',
		flashcards: 'FC',
		final: '★'
	};

	/** A row in the map: a section header, or one panel node under it. */
	type Row =
		| { kind: 'section'; id: string; section: TrigSection; sectionIndex: number }
		| { kind: 'panel'; id: string; section: TrigSection; sectionIndex: number; panel: TrigPanel };

	const rows: Row[] = trigSections.flatMap((section, sectionIndex) => [
		{ kind: 'section' as const, id: `section-${section.id}`, section, sectionIndex },
		...section.panels.map((panel) => ({
			kind: 'panel' as const,
			id: `panel-${panel.id}`,
			section,
			sectionIndex,
			panel
		}))
	]);

	// Where the learner is now — the section drives the trigger badge + ring.
	let currentSection = $derived.by(() => {
		const pos = trigSession.position;
		if (pos?.kind === 'course-complete') return trigSections[trigSections.length - 1];
		if (!pos) return trigSections[0];
		return trigSections.find((s) => s.id === pos.sectionId) ?? trigSections[0];
	});
	let currentPanelId = $derived(
		trigSession.position?.kind === 'panel' ? trigSession.position.panelId : null
	);
	let sectionPercent = $derived(trigSession.sectionPercent(currentSection));

	let dialogEl = $state<HTMLDialogElement | null>(null);

	// The node highlighted in the map — starts on the current panel each open.
	let selectedId = $state<string | null>(null);
	let selectedRow = $derived(
		rows.find((r) => r.kind === 'panel' && r.id === selectedId) ??
			rows.find((r) => r.kind === 'panel' && r.panel.id === currentPanelId) ??
			rows.find((r) => r.kind === 'panel')
	);

	/** The line above a row is "walked" (green) once the panel before it is complete. */
	function walkedAbove(rowIndex: number): boolean {
		for (let i = rowIndex - 1; i >= 0; i--) {
			const row = rows[i];
			if (row.kind === 'panel') return trigSession.isPanelComplete(row.panel);
		}
		return false;
	}

	function statusLine(panel: TrigPanel): string {
		if (trigSession.isPanelComplete(panel)) return 'Mastered';
		const stats = trigSession.panelStats(panel);
		return stats.correct + stats.incorrect > 0 ? 'In progress' : 'Not started';
	}

	function open() {
		selectedId =
			rows.find((r) => r.kind === 'panel' && r.panel.id === currentPanelId)?.id ?? null;
		dialogEl?.showModal();
	}
	function close() {
		dialogEl?.close();
	}
	function onDialogClick(e: MouseEvent) {
		if (e.target === dialogEl) close();
	}

	/** Jump straight to a panel (picking its next unsolved question). */
	function jump() {
		if (!selectedRow || selectedRow.kind !== 'panel') return;
		const { section, panel } = selectedRow;
		const question = isContentPanel(panel.type) ? null : pickQuestion(panel, trigSession);
		trigSession.setPosition({
			kind: 'panel',
			sectionId: section.id,
			panelId: panel.id,
			questionId: question?.id ?? null
		});
		close();
		goto(resolve('/trigonometry'));
	}
</script>

<!-- Trigger: current-section badge with a gradient progress ring, opens the map -->
<button
	type="button"
	class="focus-card relative flex h-10 min-w-0 cursor-pointer items-center gap-2.5 overflow-hidden rounded-lg border px-2.5 text-brand-off-white transition"
	aria-haspopup="dialog"
	aria-label="Open learning map. Current section: {currentSection.label}, {sectionPercent}% complete"
	onclick={open}
>
	<SectionProgressRing percent={sectionPercent} size={30} stroke={3.5} />
	<span class="min-w-0">
		<span class="flex items-center gap-1 leading-none tabular-nums">
			{#each trigSections as section, i (section.id)}
				<span
					class="text-[10px] font-bold tracking-wide uppercase {section.id === currentSection.id
						? 'text-brand-gold'
						: 'text-brand-gray-mid'}"
				>
					{section.label}
				</span>
				{#if i < trigSections.length - 1}
					<span class="text-[10px] text-brand-gray-mid">·</span>
				{/if}
			{/each}
		</span>
		<span class="mt-0.5 block max-w-[11rem] truncate text-left text-sm leading-tight font-semibold">
			{currentSection.title}
		</span>
	</span>
</button>

<dialog bind:this={dialogEl} class="map-dialog" aria-label="Learning map" onclick={onDialogClick}>
	<div class="map-inner overflow-hidden rounded-xl border border-brand-gray-light/70">
		<header
			class="flex items-center justify-between border-b border-brand-gray-light/50 bg-white/80 px-5 py-3 backdrop-blur-sm"
		>
			<div>
				<h2 class="text-base font-bold text-brand-charcoal">{currentSection.group}</h2>
				<p class="text-[10px] tracking-widest text-brand-gray-mid uppercase">Learning map</p>
			</div>
			<button
				type="button"
				class="ctrl bg-brand-crimson"
				aria-label="Close learning map"
				onclick={close}
			></button>
		</header>

		<div class="flex">
			<!-- Left: the path -->
			<div class="path scroll-chill flex-1 overflow-y-auto px-5 py-4">
				{#each rows as row, i (row.id)}
					{#if row.kind === 'section'}
						<div class="row">
							<div class="rail">
								<span class="line grow" class:walked={walkedAbove(i)} class:hidden={i === 0}></span>
							</div>
							<div class="flex items-center gap-2 self-center">
								<span
									class="rounded bg-brand-navy px-1.5 py-0.5 text-[10px] font-black tracking-wide text-white uppercase"
								>
									{row.section.label}
								</span>
								<p class="text-[11px] font-bold tracking-wide text-brand-gray-mid">
									{row.section.title}
								</p>
							</div>
						</div>
					{:else}
						{@const complete = trigSession.isPanelComplete(row.panel)}
						{@const isCurrent = row.panel.id === currentPanelId}
						{@const isSelected = selectedRow?.kind === 'panel' && selectedRow.id === row.id}
						<div class="row">
							<div class="rail">
								<span class="line top" class:walked={walkedAbove(i)}></span>
								<button
									type="button"
									class="node"
									class:done={complete}
									class:current={isCurrent}
									class:selected={isSelected}
									aria-pressed={isSelected}
									aria-label="Select {PANEL_TYPE_LABELS[row.panel.type]}"
									onclick={() => (selectedId = row.id)}
								>
									{#if complete}
										<svg viewBox="0 0 12 12" width="14" height="14" aria-hidden="true">
											<polyline
												points="1.5,6.5 4.5,9.5 10.5,3"
												fill="none"
												stroke="white"
												stroke-width="2.2"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									{:else}
										<span class="glyph">{ABBREV[row.panel.type]}</span>
									{/if}
								</button>
								<span
									class="line bot"
									class:walked={complete}
									class:hidden={i === rows.length - 1}
								></span>
							</div>

							<button
								type="button"
								class="cursor-pointer self-center rounded-md px-2 py-1 text-left text-sm transition-colors {isSelected
									? 'font-semibold text-brand-charcoal'
									: 'text-brand-gray-mid hover:text-brand-charcoal'}"
								onclick={() => (selectedId = row.id)}
							>
								{PANEL_TYPE_LABELS[row.panel.type]}
							</button>
						</div>
					{/if}
				{/each}
			</div>

			<!-- Right: detail of the selected panel -->
			{#if selectedRow && selectedRow.kind === 'panel'}
				{@const stats = trigSession.panelStats(selectedRow.panel)}
				<aside
					class="desc w-64 shrink-0 border-l border-brand-gray-light/50 bg-white/75 px-5 py-5 backdrop-blur-[1px]"
				>
					<p class="mb-1 text-[10px] font-bold tracking-widest text-brand-orange uppercase">
						{selectedRow.section.label} · {PANEL_TYPE_LABELS[selectedRow.panel.type]}
					</p>
					<h3 class="mb-3 text-base leading-snug font-bold text-brand-charcoal">
						{selectedRow.panel.title}
					</h3>

					<div
						class="mb-4 rounded-lg border border-brand-gray-light/50 bg-white px-3 py-2 text-xs text-brand-gray-mid"
					>
						<p class="font-semibold text-brand-charcoal">{statusLine(selectedRow.panel)}</p>
						{#if isContentPanel(selectedRow.panel.type)}
							<p>Read to complete</p>
						{:else}
							<p>
								{Math.min(trigSession.requiredFor(selectedRow.panel), stats.correct)}/{trigSession.requiredFor(
									selectedRow.panel
								)} correct · {stats.incorrect} wrong
							</p>
						{/if}
					</div>

					<button
						type="button"
						class="w-full cursor-pointer rounded-lg bg-brand-blue px-3 py-2 text-sm font-semibold text-white transition-all hover:brightness-110"
						onclick={jump}
					>
						{selectedRow.panel.id === currentPanelId ? 'Resume here →' : 'Go to this panel →'}
					</button>
				</aside>
			{/if}
		</div>
	</div>
</dialog>

<style>
	/* --- Trigger card (window-like styling) --- */
	.focus-card {
		border-color: rgba(122, 122, 122, 0.6);
		background: transparent;
		max-width: 18rem;
	}
	.focus-card:hover {
		border-color: var(--color-brand-gray-light, #bcbfbe);
		transform: translateY(-1px);
	}

	/* --- Dialog shell --- */
	.map-dialog {
		margin: auto;
		border: none;
		padding: 0;
		background: transparent;
		color: inherit;
		max-height: 85vh;
		overflow: visible;
	}
	.map-dialog::backdrop {
		background: rgba(10, 12, 10, 0.6);
		backdrop-filter: blur(3px);
	}
	.map-dialog[open] {
		animation: pop 0.2s cubic-bezier(0.2, 0.8, 0.3, 1);
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: scale(0.94);
		}
	}

	/* Graph paper, same recipe as TriangleDesigner */
	.map-inner {
		width: min(92vw, 620px);
		background-color: white;
		background-image:
			linear-gradient(to right, #e8e8e8 1px, transparent 1px),
			linear-gradient(to bottom, #e8e8e8 1px, transparent 1px);
		background-size: 30px 30px;
		background-position: -1px -1px;
		box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
	}

	.path {
		max-height: min(56vh, 460px);
	}

	.ctrl {
		height: 0.8rem;
		width: 0.8rem;
		border-radius: 9999px;
		opacity: 0.85;
		transition:
			opacity 0.15s ease,
			transform 0.15s ease;
	}
	.ctrl:hover {
		opacity: 1;
		transform: scale(1.15);
	}

	/* --- Path rows / rail / nodes --- */
	.row {
		display: grid;
		grid-template-columns: 40px 1fr;
		gap: 0.5rem;
	}
	.rail {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.line {
		width: 3px;
		flex: 1;
		min-height: 14px;
		border-radius: 9999px;
		background: #d9d9d9;
	}
	.line.walked {
		background: var(--color-brand-forest, #386d4f);
	}
	.line.hidden {
		visibility: hidden;
	}

	.node {
		display: flex;
		height: 34px;
		width: 34px;
		flex-shrink: 0;
		cursor: pointer;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		border: 2px solid #cfcfcf;
		background: white;
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}
	.node:hover {
		transform: scale(1.08);
	}
	.glyph {
		font-size: 11px;
		font-weight: 700;
		line-height: 1;
		color: #7a7a7a;
	}

	.node.done {
		background: var(--color-brand-forest, #386d4f);
		border-color: var(--color-brand-forest, #386d4f);
	}
	.node.done .glyph {
		color: white;
	}
	.node.current {
		border-color: var(--color-brand-blue, #0573e6);
		box-shadow: 0 0 0 4px rgba(5, 115, 230, 0.2);
		animation: ring 1.8s ease-in-out infinite;
	}
	.node.selected {
		box-shadow:
			0 0 0 3px white,
			0 0 0 6px var(--color-brand-gold, #ffc52a);
	}
	.node.current.selected {
		animation: none;
	}
	@keyframes ring {
		50% {
			box-shadow: 0 0 0 7px rgba(5, 115, 230, 0.1);
		}
	}
</style>

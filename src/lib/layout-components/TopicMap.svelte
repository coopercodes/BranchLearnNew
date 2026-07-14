<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { trigonometryCourse as course } from '$lib/content/trigonometry';
	import type { Lesson, Panel } from '$lib/content/types';
	import { userProgress } from '$lib/progress/userProgress.svelte';

	interface PathEntry {
		lesson: Lesson;
		lessonIndex: number;
		panel: Panel;
		panelIndex: number;
	}

	/** Rows of the map: lesson labels interleaved with panel nodes, in learning order. */
	type PathRow =
		| { kind: 'lesson'; id: string; lesson: Lesson; lessonIndex: number }
		| ({ kind: 'panel'; id: string } & PathEntry);

	const entries: PathEntry[] = course.lessons.flatMap((lesson, lessonIndex) =>
		lesson.panels.map((panel, panelIndex) => ({ lesson, lessonIndex, panel, panelIndex }))
	);

	const rows: PathRow[] = course.lessons.flatMap((lesson, lessonIndex) => [
		{ kind: 'lesson' as const, id: `lesson-${lesson.id}`, lesson, lessonIndex },
		...lesson.panels.map((panel, panelIndex) => ({
			kind: 'panel' as const,
			id: panel.id,
			lesson,
			lessonIndex,
			panel,
			panelIndex
		}))
	]);

	let dialogEl = $state<HTMLDialogElement | null>(null);

	/** Where the learner actually is right now (falls back to the very first panel). */
	let current = $derived(
		entries.find(
			(e) =>
				e.lesson.id === userProgress.position?.lessonId &&
				e.panelIndex === userProgress.position?.panelIndex
		) ?? entries[0]
	);

	/** The node highlighted in the map — starts at `current` each time the map opens. */
	let selectedId = $state<string | null>(null);
	let selected = $derived(entries.find((e) => e.panel.id === selectedId) ?? current);

	/** The line above a row is "walked" (green) once the panel before it is complete. */
	function walkedAbove(rowIndex: number): boolean {
		for (let i = rowIndex - 1; i >= 0; i--) {
			const row = rows[i];
			if (row.kind === 'panel') return userProgress.isComplete(row.panel);
		}
		return false;
	}

	function statusLine(panel: Panel): string {
		const progress = userProgress.panel(panel.id);
		if (progress.completedAt) return 'Completed';
		if (progress.startedAt) return 'In progress';
		return 'Not started';
	}

	function open() {
		selectedId = current.panel.id;
		dialogEl?.showModal();
	}
	function close() {
		dialogEl?.close();
	}
	// Native <dialog>: a click whose target is the dialog itself came from the
	// backdrop (content clicks target inner elements), so close on those.
	function onDialogClick(e: MouseEvent) {
		if (e.target === dialogEl) close();
	}

	function jump() {
		userProgress.setPosition(selected.lesson.id, selected.panelIndex);
		close();
		goto(resolve('/trigonometry'));
	}
</script>

<!-- Trigger: minimal current-section card, opens the map dialog -->
<button
	type="button"
	class="focus-card relative flex h-10 min-w-0 cursor-pointer flex-col items-start justify-center overflow-hidden rounded-lg border px-3 transition"
	aria-haspopup="dialog"
	aria-label="Open learning map. Current section: {current.panel.title}"
	onclick={open}
>
	<span
		class="text-[10px] leading-none font-semibold tracking-widest text-brand-gray-mid uppercase tabular-nums"
	>
		{course.title}
		{current.lessonIndex + 1}.{current.panelIndex + 1}
	</span>
	<span class="w-full truncate text-left text-sm leading-tight font-semibold text-brand-off-white">
		{current.panel.title}
	</span>
</button>

<dialog bind:this={dialogEl} class="map-dialog" aria-label="Learning map" onclick={onDialogClick}>
	<div class="map-inner overflow-hidden rounded-xl border border-brand-gray-light/70">
		<header
			class="flex items-center justify-between border-b border-brand-gray-light/50 bg-white/80 px-5 py-3 backdrop-blur-sm"
		>
			<div>
				<h2 class="text-base font-bold text-brand-charcoal">{course.title}</h2>
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
			<!-- Left: the path, scrolls like a Duolingo track -->
			<div class="path scroll-chill flex-1 overflow-y-auto px-5 py-4">
				{#each rows as row, i (row.id)}
					{#if row.kind === 'lesson'}
						<div class="row">
							<div class="rail">
								<span class="line grow" class:walked={walkedAbove(i)} class:hidden={i === 0}></span>
							</div>
							<p
								class="self-center text-[11px] font-bold tracking-widest text-brand-gray-mid uppercase"
							>
								{row.lessonIndex + 1}. {row.lesson.title}
							</p>
						</div>
					{:else}
						{@const complete = userProgress.isComplete(row.panel)}
						{@const isCurrent = row.panel.id === current.panel.id}
						{@const isSelected = row.panel.id === selected.panel.id}
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
									aria-label="Select {row.panel.title}"
									onclick={() => (selectedId = row.panel.id)}
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
										<span class="glyph">{row.panel.type === 'lightning-round' ? '⚡' : row.panel.type === 'leaf-question' ? '🍃' : '📖'}</span>
									{/if}
								</button>
								<span class="line bot" class:walked={complete} class:hidden={i === rows.length - 1}
								></span>
							</div>

							<button
								type="button"
								class="cursor-pointer self-center rounded-md px-2 py-1 text-left text-sm transition-colors {isSelected
									? 'font-semibold text-brand-charcoal'
									: 'text-brand-gray-mid hover:text-brand-charcoal'}"
								onclick={() => (selectedId = row.panel.id)}
							>
								{row.panel.title}
							</button>
						</div>
					{/if}
				{/each}
			</div>

			<!-- Right: description of the selected section -->
			<aside
				class="desc w-64 shrink-0 border-l border-brand-gray-light/50 bg-white/75 px-5 py-5 backdrop-blur-[1px]"
			>
				<p class="mb-1 text-[10px] font-bold tracking-widest text-brand-orange uppercase">
					Lesson {selected.lessonIndex + 1} · {selected.lesson.title}
				</p>
				<h3 class="mb-2 text-lg font-bold text-brand-charcoal">{selected.panel.title}</h3>
				<span
					class="mb-3 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold {selected
						.panel.type === 'lightning-round'
						? 'bg-brand-gold/25 text-brand-orange'
						: selected.panel.type === 'leaf-question'
							? 'bg-brand-forest/10 text-brand-forest'
							: 'bg-brand-blue/10 text-brand-blue'}"
				>
					{selected.panel.type === 'lightning-round'
						? '⚡ Lightning round'
						: selected.panel.type === 'leaf-question'
							? '🍃 Ask Leaf'
							: '📖 Read & practice'}
				</span>

				<p class="mb-4 text-sm leading-relaxed text-brand-charcoal/85">
					{selected.panel.description}
				</p>

				<div
					class="mb-4 rounded-lg border border-brand-gray-light/50 bg-white px-3 py-2 text-xs text-brand-gray-mid"
				>
					<p class="font-semibold text-brand-charcoal">{statusLine(selected.panel)}</p>
					{#if selected.panel.type === 'leaf-question'}
						<p>Chat with Leaf to complete</p>
					{:else}
						<p>
							{userProgress.correctCount(selected.panel)}/{selected.panel.questions.length} correct ·
							{userProgress.incorrectCount(selected.panel)} wrong
						</p>
					{/if}
				</div>

				<button
					type="button"
					class="w-full cursor-pointer rounded-lg bg-brand-blue px-3 py-2 text-sm font-semibold text-white transition-all hover:brightness-110"
					onclick={jump}
				>
					{selected.panel.id === current.panel.id ? 'Resume here →' : 'Go to this section →'}
				</button>
			</aside>
		</div>
	</div>
</dialog>

<style>
	/* --- Trigger card (window-like styling) --- */
	.focus-card {
		border-color: rgba(122, 122, 122, 0.6);
		background: transparent;
		max-width: 16rem;
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
		font-size: 13px;
		line-height: 1;
	}

	.node.done {
		background: var(--color-brand-forest, #386d4f);
		border-color: var(--color-brand-forest, #386d4f);
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

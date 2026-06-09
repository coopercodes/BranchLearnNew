<script lang="ts">
	import { topics, currentTopic } from '$lib/os/curriculum.svelte';
	import AppIcon from './AppIcon.svelte';

	let dialogEl = $state<HTMLDialogElement | null>(null);
	const current = $derived(currentTopic());

	function open() {
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
</script>

<!-- Trigger: window-styled card with a progress bar, opens the map dialog -->
<button
	type="button"
	class="focus-card relative flex h-10 min-w-0 items-center gap-2 overflow-hidden rounded-lg border px-3 transition"
	aria-haspopup="dialog"
	aria-label="Open learning map. Current topic: {current.name}, {current.progress}% complete"
	onclick={open}
>
	<span class="truncate text-sm font-semibold text-brand-off-white">{current.name}</span>
	
	<span class="bar absolute inset-x-0 bottom-0 h-1 bg-white/10">
		<span class="block h-full bg-brand-blue transition-all" style:width="{current.progress}%"></span>
	</span>
</button>

<dialog bind:this={dialogEl} class="map-dialog" aria-label="Learning map" onclick={onDialogClick}>
	<div class="map-inner flex flex-col gap-1 rounded-xl border border-brand-blue/40 bg-brand-charcoal p-5">
		<header class="mb-3 flex items-center justify-between">
			<div>
				<h2 class="text-lg font-bold text-brand-off-white">Learning Map</h2>
				<p class="text-xs tracking-widest text-brand-gray-mid uppercase">Trigonometry path</p>
			</div>
			<button
				type="button"
				class="ctrl bg-brand-crimson"
				aria-label="Close learning map"
				onclick={close}
			></button>
		</header>

		<div class="path">
			{#each topics as t, i (t.id)}
				<div
					class="row"
					class:done={t.status === 'done'}
					class:current={t.status === 'current'}
					class:locked={t.status === 'locked'}
				>
					<div class="rail">
						<span class="line top" class:hidden={i === 0}></span>
						<span class="node">
							{#if t.status === 'done'}
								<svg viewBox="0 0 12 12" width="13" height="13" aria-hidden="true">
									<polyline
										points="1.5,6.5 4.5,9.5 10.5,3"
										fill="none"
										stroke="white"
										stroke-width="2.2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							{:else if t.status === 'locked'}
								<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
									<rect x="5" y="11" width="14" height="9" rx="2" />
									<path d="M8 11V8a4 4 0 0 1 8 0v3" />
								</svg>
							{/if}
						</span>
						<span class="line bot" class:hidden={i === topics.length - 1}></span>
					</div>

					<div class="topic">
						<div class="flex items-center justify-between gap-3">
							<span class="name">{t.name}</span>
							<span class="pct">{t.status === 'locked' ? 'Locked' : `${t.progress}%`}</span>
						</div>
						<div class="track">
							<span style:width="{t.progress}%"></span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</dialog>

<style>
	/* --- Trigger card (window-like styling) --- */
	.focus-card {
		border-color: color-mix(in srgb, var(--color-brand-blue, #0573e6) 35%, transparent);
		background: linear-gradient(180deg, #2b3340 0%, #232a35 100%);
		max-width: 16rem;
	}
	.focus-card:hover {
		border-color: var(--color-brand-blue, #0573e6);
		box-shadow: 0 0 14px rgba(5, 115, 230, 0.45);
		transform: translateY(-1px);
	}
	.icon-square {
		background: var(--color-brand-gray-light, #bcbfbe);
	}
	.bar > span {
		box-shadow: 0 0 8px rgba(5, 115, 230, 0.7);
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
	.map-inner {
		width: min(92vw, 440px);
		box-shadow:
			0 24px 70px rgba(0, 0, 0, 0.55),
			0 0 26px rgba(5, 115, 230, 0.25);
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

	/* --- Path / nodes --- */
	.row {
		display: grid;
		grid-template-columns: 32px 1fr;
		gap: 0.75rem;
	}
	.rail {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.line {
		width: 2px;
		flex: 1;
		min-height: 10px;
		background: #3a3f3d;
	}
	.line.hidden {
		visibility: hidden;
	}
	.node {
		display: flex;
		height: 26px;
		width: 26px;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
		border: 2px solid #3a3f3d;
		background: #232524;
		color: #898881;
	}

	.done .line {
		background: var(--color-brand-forest, #386d4f);
	}
	.done .node {
		background: var(--color-brand-forest, #386d4f);
		border-color: var(--color-brand-forest, #386d4f);
	}

	.current .node {
		background: var(--color-brand-blue, #0573e6);
		border-color: var(--color-brand-blue, #0573e6);
		box-shadow: 0 0 0 4px rgba(5, 115, 230, 0.25);
		animation: ring 1.8s ease-in-out infinite;
	}
	@keyframes ring {
		50% {
			box-shadow: 0 0 0 7px rgba(5, 115, 230, 0.12);
		}
	}

	.topic {
		padding: 0.35rem 0 0.85rem;
		min-width: 0;
	}
	.name {
		font-size: 0.9rem;
		font-weight: 600;
		color: #f8faec;
	}
	.locked .name {
		color: #898881;
	}
	.pct {
		font-size: 0.7rem;
		font-variant-numeric: tabular-nums;
		color: #898881;
	}
	.track {
		margin-top: 0.4rem;
		height: 5px;
		overflow: hidden;
		border-radius: 9999px;
		background: rgba(255, 255, 255, 0.08);
	}
	.track > span {
		display: block;
		height: 100%;
		border-radius: 9999px;
		background: var(--color-brand-blue, #0573e6);
		transition: width 0.3s ease;
	}
	.done .track > span {
		background: var(--color-brand-forest, #386d4f);
	}
</style>

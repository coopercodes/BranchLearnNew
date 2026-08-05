<script lang="ts">
	import SectionProgressRing from '$lib/trig/SectionProgressRing.svelte';
	import { trigSession } from '$lib/trig/session.svelte';
	import { TOPICS } from '$lib/trig/panels';

	// Dead simple: the three topics, each with its % complete. Nothing else.
	// The current topic (whatever panel the learner is on) is highlighted.
	let currentTopic = $derived(trigSession.panel.topic ?? TOPICS[TOPICS.length - 1]);
	let currentPercent = $derived(trigSession.topicPercent(currentTopic));

	let dialogEl = $state<HTMLDialogElement | null>(null);

	function open() {
		dialogEl?.showModal();
	}
	function close() {
		dialogEl?.close();
	}
	function onDialogClick(e: MouseEvent) {
		if (e.target === dialogEl) close();
	}
</script>

<!-- Trigger: current-topic badge with a gradient progress ring, opens the map -->
<button
	type="button"
	class="focus-card relative flex h-10 min-w-0 cursor-pointer items-center gap-2.5 overflow-hidden rounded-lg border px-2.5 text-brand-off-white transition"
	aria-haspopup="dialog"
	aria-label="Open topic map. Current topic: {currentTopic}, {currentPercent}% complete"
	onclick={open}
>
	<SectionProgressRing percent={currentPercent} size={30} stroke={3.5} />
	<span class="flex items-center gap-1 leading-none tabular-nums">
		{#each TOPICS as topic, i (topic)}
			<span
				class="text-[10px] font-bold tracking-wide uppercase {topic === currentTopic
					? 'text-brand-gold'
					: 'text-brand-gray-mid'}"
			>
				{topic}
			</span>
			{#if i < TOPICS.length - 1}
				<span class="text-[10px] text-brand-gray-mid">·</span>
			{/if}
		{/each}
	</span>
</button>

<dialog bind:this={dialogEl} class="map-dialog" aria-label="Topic map" onclick={onDialogClick}>
	<div class="map-inner overflow-hidden rounded-xl border border-brand-gray-light/70">
		<header
			class="flex items-center justify-between border-b border-brand-gray-light/50 bg-white/80 px-5 py-3 backdrop-blur-sm"
		>
			<h2 class="text-base font-bold text-brand-charcoal">SOH · CAH · TOA</h2>
			<button type="button" class="ctrl bg-brand-crimson" aria-label="Close topic map" onclick={close}
			></button>
		</header>

		<div class="flex flex-col gap-3 px-5 py-5">
			{#each TOPICS as topic (topic)}
				{@const percent = trigSession.topicPercent(topic)}
				<div
					class="flex items-center gap-4 rounded-lg border border-brand-gray-light/50 bg-white/75 px-4 py-3"
				>
					<SectionProgressRing {percent} size={44} stroke={4.5} />
					<span
						class="rounded bg-brand-navy px-2 py-1 text-sm font-black tracking-wide text-white uppercase"
					>
						{topic}
					</span>
					<span class="ml-auto text-sm font-semibold text-brand-charcoal tabular-nums">
						{percent}% complete
					</span>
				</div>
			{/each}
		</div>
	</div>
</dialog>

<style>
	.focus-card {
		border-color: rgba(122, 122, 122, 0.6);
		background: transparent;
		max-width: 18rem;
	}
	.focus-card:hover {
		border-color: var(--color-brand-gray-light, #bcbfbe);
		transform: translateY(-1px);
	}

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
		width: min(92vw, 420px);
		background-color: white;
		background-image:
			linear-gradient(to right, #e8e8e8 1px, transparent 1px),
			linear-gradient(to bottom, #e8e8e8 1px, transparent 1px);
		background-size: 30px 30px;
		background-position: -1px -1px;
		box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
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
</style>

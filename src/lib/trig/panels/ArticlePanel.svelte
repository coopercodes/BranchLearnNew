<script lang="ts">
	import { PANEL_TYPE_LABELS, type TrigPanel, type TrigSection } from '$lib/trig/types';

	// A content panel: read the article, then acknowledge to move on. `onContinue`
	// marks it read and advances (wired through the flow).
	let {
		section,
		panel,
		onContinue
	}: { section: TrigSection; panel: TrigPanel; onContinue: () => void } = $props();
</script>

<div class="scroll-chill h-full overflow-y-auto px-8 py-12">
	<div class="mx-auto flex min-h-full max-w-lg flex-col [justify-content:safe_center]">
		<p class="mb-3 text-[11px] font-bold tracking-[0.2em] text-brand-orange uppercase">
			{section.label} · {PANEL_TYPE_LABELS.article}
		</p>
		<h1 class="mb-5 text-3xl font-bold text-brand-charcoal">{section.title}</h1>

		<div
			class="mb-6 inline-block self-start rounded-full border border-brand-gray-light/60 bg-white px-4 py-1.5 font-mono text-sm text-brand-navy"
		>
			{section.formula}
		</div>

		{#each panel.body ?? [] as paragraph (paragraph)}
			<p class="mb-4 text-base leading-relaxed text-brand-charcoal/90">{paragraph}</p>
		{/each}

		<button
			type="button"
			class="mt-4 cursor-pointer self-start rounded-lg bg-brand-navy px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-near-black"
			onclick={onContinue}
		>
			Got it — keep going →
		</button>
	</div>
</div>

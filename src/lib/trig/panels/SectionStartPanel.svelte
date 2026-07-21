<script lang="ts">
	import type { TrigSection } from '$lib/trig/types';

	let { section, onContinue }: { section: TrigSection; onContinue: () => void } = $props();
</script>

<div class="flex h-full items-center justify-center px-8 py-12">
	<div class="w-full max-w-lg text-center">
		<p class="mb-3 text-[11px] font-bold tracking-[0.3em] text-brand-orange uppercase">
			{section.group}
		</p>

		<div
			class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-navy text-xl font-black tracking-wide text-white"
		>
			{section.label}
		</div>

		<h1 class="mb-3 text-3xl font-bold text-brand-charcoal">{section.title}</h1>

		<div
			class="mx-auto mb-5 inline-block rounded-full border border-brand-gray-light/60 bg-white px-4 py-1.5 font-mono text-sm text-brand-navy"
		>
			{section.formula}
		</div>

		<p class="mx-auto mb-8 max-w-md text-base leading-relaxed text-brand-charcoal/85">
			{section.overview}
		</p>

		<button
			type="button"
			class="cursor-pointer rounded-lg bg-brand-navy px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-near-black"
			onclick={onContinue}
		>
			Start {section.label} →
		</button>
	</div>
</div>

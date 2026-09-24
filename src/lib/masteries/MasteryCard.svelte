<script lang="ts">
	import MasteryBadge from './MasteryBadge.svelte';

	type Mastery = 'apprentice' | 'adept' | 'expert';
	type Level = 1 | 2 | 3 | 4 | 5;
	export type MasteryTheme = 'mastery' | 'neutral';

	let {
		title,
		subject,
		mastery = 'apprentice',
		level = 1,
		theme = 'mastery',
		reviewLabel = 'Review',
		onreview,
		class: className = ''
	}: {
		title: string;
		subject?: string;
		mastery?: Mastery;
		level?: Level;
		/** 'mastery' tints the card in the tier's metal; 'neutral' is a plain white card. */
		theme?: MasteryTheme;
		reviewLabel?: string;
		onreview?: () => void;
		class?: string;
	} = $props();

	const NUMERALS = ['I', 'II', 'III', 'IV', 'V'] as const;
	const LABELS: Record<Mastery, string> = {
		apprentice: 'Apprentice',
		adept: 'Adept',
		expert: 'Expert'
	};

	type CardStyle = {
		card: string; // background + border
		edge: string; // thin metallic strip along the left edge
		title: string;
		subject: string;
		tier: string; // the "Apprentice II" line
	};

	// Full class strings are written out so Tailwind can detect them at build time.
	const THEMED: Record<Mastery, CardStyle> = {
		apprentice: {
			card: 'bg-linear-to-br from-[#fdf5ec] via-[#f7e6d4] to-[#efd3b6] border-[#c98a55]/50',
			edge: 'bg-linear-to-b from-[#b06a32] via-[#e0a472] to-[#5e2c0f]',
			title: 'text-[#3d1c08]',
			subject: 'text-[#8a5a36]',
			tier: 'text-[#7a3f16]'
		},
		adept: {
			card: 'bg-linear-to-br from-[#f7f9fb] via-[#e9edf1] to-[#d6dce3] border-[#9aa3ad]/60',
			edge: 'bg-linear-to-b from-[#6b737c] via-[#dfe4ea] to-[#3a4048]',
			title: 'text-[#23282e]',
			subject: 'text-[#5f6770]',
			tier: 'text-[#3a4048]'
		},
		expert: {
			card: 'bg-linear-to-br from-[#fffbef] via-[#fff1c4] to-[#f6d77e] border-[#c9962b]/60',
			edge: 'bg-linear-to-b from-[#fff3b8] via-[#e3ac2c] to-[#8a5a00]',
			title: 'text-[#3a2200]',
			subject: 'text-[#8a6410]',
			tier: 'text-[#6b4700]'
		}
	};

	// Neutral keeps the card white/slate, but the tier line still carries its metal color.
	const NEUTRAL_TIER: Record<Mastery, string> = {
		apprentice: 'text-[#8a4a1c]',
		adept: 'text-[#4f5760]',
		expert: 'text-[#9a6a00]'
	};

	const style = $derived<CardStyle>(
		theme === 'neutral'
			? {
					card: 'bg-white border-slate-200',
					edge: '',
					title: 'text-slate-900',
					subject: 'text-slate-500',
					tier: NEUTRAL_TIER[mastery]
				}
			: THEMED[mastery]
	);

	const numeral = $derived(NUMERALS[Math.min(Math.max(Math.round(level), 1), 5) - 1]);
</script>

<article
	class="relative flex items-center gap-3 overflow-hidden rounded-xl border py-3 pr-3 pl-2 shadow-sm {style.card} {className}"
>
	{#if style.edge}
		<span class="absolute inset-y-0 left-0 w-1 {style.edge}" aria-hidden="true"></span>
	{/if}

	<MasteryBadge {mastery} {level} class="h-14! w-14! shrink-0 bg-transparent!" />

	<div class="min-w-0 flex-1">
		<h3 class="truncate text-base leading-tight font-bold {style.title}">{title}</h3>
		{#if subject}
			<p class="mt-0.5 truncate text-xs {style.subject}">{subject}</p>
		{/if}

        

		<!-- <div class="mt-2 flex items-center justify-between gap-3">
			<span class="text-sm font-semibold {style.tier}">{LABELS[mastery]} {numeral}</span>

			<button
				type="button"
				onclick={onreview}
				class="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:bg-blue-800"
			>
				{reviewLabel}
			</button>
		</div> -->
	</div>
</article>
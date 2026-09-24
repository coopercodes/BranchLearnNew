<script lang="ts">
	type Mastery = 'apprentice' | 'adept' | 'expert';
	type Level = 1 | 2 | 3 | 4 | 5;
	type Size = 'tiny' | 'small' | 'normal';

	let {
		mastery = 'apprentice',
		level = 1,
		size = 'normal',
		shadow = true,
		class: className = '',
        showLevel = true
	}: {
		mastery?: Mastery;
		level?: Level;
		size?: Size;
		shadow?: boolean;
		class?: string;
        showLevel?: boolean;
	} = $props();

	const NUMERALS = ['I', 'II', 'III', 'IV', 'V'] as const;

	type TierStyle = { label: string; gem: string; ring: string; shadow: string; text: string };
	type SizeStyle = { box: string; gem: string; radius: string; streak: string; text: string };

	// Gem = side length of the square before rotation.
	// Box ≈ gem × √2 so the rotated diamond's footprint fits without overflow.
	// --g scales the outer glow and drop shadow so small gems don't get swamped.
	const SIZES: Record<Size, SizeStyle> = {
		tiny: {
			box: 'size-[17px] [--g:0.5]',
			gem: 'size-3',
			radius: 'rounded-[2px]',
			streak: '-left-0.5 w-1',
			text: 'text-[9px]'
		},
		small: {
			box: 'size-5 [--g:0.65]',
			gem: 'size-3.5',
			radius: 'rounded-[2px]',
			streak: '-left-0.5 w-1.5',
			text: 'text-[12px]'
		},
		normal: {
			box: 'size-[26px] [--g:0.8]',
			gem: 'size-[18px]',
			radius: 'rounded-[3px]',
			streak: '-left-1 w-2',
			text: 'text-[12px]'
		}
	};

	// Full class strings are written out so Tailwind can detect them at build time.
	const STYLES: Record<Mastery, TierStyle> = {
		apprentice: {
			label: 'Apprentice',
			// Deep copper-brown to a warm polished bronze
			gem: 'bg-linear-155 from-[#4a220a] via-[#b06a32] to-[#5e2c0f]',
			ring: 'ring-1 ring-[#7a3f16]/60',
			// Warm copper glow plus a soft drop shadow
			shadow:
				'shadow-[0_0_calc(6px*var(--g,1))_rgb(176_106_50/0.45),0_calc(2px*var(--g,1))_calc(3px*var(--g,1))_rgb(0_0_0/0.4)]',
			text: 'text-[#fdf0e2] text-halo [--halo:rgb(40_16_2/0.15)] [--halo-glow:0_1px_2px_rgb(0_0_0/0.95)]'
		},
		adept: {
			label: 'Adept',
			// Cool gunmetal to bright steel
			gem: 'bg-linear-135 from-[#3a4048] via-[#b9c1ca] to-[#50575f]',
			ring: 'ring-1 ring-[#6b737c]/60',
			// Cool steel glow plus a soft drop shadow
			shadow:
				'shadow-[0_0_calc(7px*var(--g,1))_rgb(185_193_202/0.5),0_calc(2px*var(--g,1))_calc(3px*var(--g,1))_rgb(0_0_0/0.4)]',
			text: 'text-white text-halo [--halo:rgb(30_34_40/0.15)] [--halo-glow:0_1px_2px_rgb(0_0_0/0.95)]'
		},
		expert: {
			label: 'Expert',
			// Polished MMO gold; 135deg counters the 45deg rotation so the horizon reads horizontally
			gem: 'bg-[linear-gradient(135deg,#fff8d6_0%,#ffe68a_12%,#f9cf52_22%,#e3ac2c_50%,#ecb93c_62%,#ffd766_85%,#fff3b8_100%)]',
			// Dark bronze outer frame
			ring: 'ring-1 ring-[#5c3a00]/60',
			// Stronger gold glow plus a drop shadow
			shadow:
				'shadow-[0_0_calc(10px*var(--g,1))_rgb(255_190_40/0.6),0_calc(2px*var(--g,1))_calc(4px*var(--g,1))_rgb(0_0_0/0.45)]',
			// Engraved lettering: dark brown with a light glow
			text: 'text-[#3a2200] text-halo [--halo:rgb(255_245_190/0.15)] [--halo-glow:0_0_2px_rgb(255_240_170/0.95)]'
		}
	};

	const style = $derived(STYLES[mastery]);
	const sz = $derived(SIZES[size]);
	const numeral = $derived(NUMERALS[Math.min(Math.max(Math.round(level), 1), 5) - 1]);
</script>

<div
	class="relative inline-grid shrink-0 place-items-center align-middle {sz.box} {className}"
	role="img"
	aria-label="{style.label} {numeral}"
	title="{style.label} {numeral}"
>
	<!-- Metallic gem -->
	<div
		class="absolute rotate-45 overflow-hidden {sz.gem} {sz.radius} {style.gem} {style.ring} {shadow
			? style.shadow
			: ''}"
	>
		<!-- Sheen + bevel: light from the top, shade at the bottom -->
		<div
			class="absolute inset-0 {sz.radius} bg-linear-to-b from-white/25 via-transparent to-black/35 shadow-[inset_0_1px_0_rgb(255_255_255/0.55),inset_0_-1px_0_rgb(0_0_0/0.4)]"
		></div>
		<!-- Specular streak -->
		<div class="absolute top-0 h-full -skew-x-12 bg-white/25 blur-[0.5px] {sz.streak}"></div>
	</div>

    {#if showLevel}
	    <span class="relative z-10 leading-none font-black {sz.text} {style.text}">{numeral}</span>
    {/if}
</div>
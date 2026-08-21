<script module>
	// Unique gradient ids so multiple avatars on one page don't collide.
	let instance = 0;
</script>

<script>
	import BranchMark from "$lib/toast/BranchMark.svelte";

	let {
		size = 50,
		segments = 8,
		filled = segments,
		ringColor = '#e02f2f',
		ringShadow = '#7d1212',
		borderColor = '#ffffff',
		emptyColor = '#2a2f3a',
		bgColor = '#1b202b',
		knightColor = '#dfe5ee',
		gap = 6,
		alt = 'Knight avatar',
		...rest
	} = $props();

	const uid = `moba-avatar-${instance++}`;

	const CX = 25;
	const CY = 25;
	const R_OUT = 23;
	const R_IN = 17.6;
	const STROKE = 0.9;

	const round = (n) => Math.round(n * 100) / 100;

	function point(r, deg) {
		const rad = ((deg - 90) * Math.PI) / 180;
		return [round(CX + r * Math.cos(rad)), round(CY + r * Math.sin(rad))];
	}

	function wedge(a0, a1) {
		const [xo0, yo0] = point(R_OUT, a0);
		const [xo1, yo1] = point(R_OUT, a1);
		const [xi1, yi1] = point(R_IN, a1);
		const [xi0, yi0] = point(R_IN, a0);
		const big = a1 - a0 > 180 ? 1 : 0;
		return `M${xo0} ${yo0}A${R_OUT} ${R_OUT} 0 ${big} 1 ${xo1} ${yo1}L${xi1} ${yi1}A${R_IN} ${R_IN} 0 ${big} 0 ${xi0} ${yi0}Z`;
	}

	const pips = $derived.by(() => {
		const step = 360 / segments;
		return Array.from({ length: segments }, (_, i) => ({
			d: wedge(i * step + gap / 2, (i + 1) * step - gap / 2),
			lit: i < filled
		}));
	});
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 50 50"
	role="img"
	aria-label={alt}
	xmlns="http://www.w3.org/2000/svg"
	{...rest}
>
	<defs>
		<linearGradient id="{uid}-pip" x1="0" y1="0" x2="0" y2="1">
			<stop offset="0%" stop-color={ringColor} />
			<stop offset="100%" stop-color={ringShadow} />
		</linearGradient>
	</defs>

	<!-- segmented ring -->
	<g stroke={borderColor} stroke-width={STROKE} stroke-linejoin="round">
		{#each pips as pip}
			<path d={pip.d} fill={pip.lit ? `url(#${uid}-pip)` : emptyColor} />
		{/each}
	</g>

	<!-- portrait -->
	<circle cx={CX} cy={CY} r="15.6" fill={bgColor} />
    <BranchMark color="white"/>

</svg>
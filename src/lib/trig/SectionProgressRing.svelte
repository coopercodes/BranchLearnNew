<script lang="ts" module>
	// Module-level counter so each ring's gradient gets a unique id even when
	// several rings render on the same page.
	let uid = 0;
</script>

<script lang="ts">
	let {
		percent = 0,
		size = 34,
		stroke = 4
	}: { percent?: number; size?: number; stroke?: number } = $props();

	const gradId = `ring-grad-${uid++}`;

	let r = $derived((size - stroke) / 2);
	let circumference = $derived(2 * Math.PI * r);
	let clamped = $derived(Math.min(100, Math.max(0, Math.round(percent))));
	let offset = $derived(circumference * (1 - clamped / 100));
</script>

<svg width={size} height={size} viewBox="0 0 {size} {size}" aria-hidden="true">
	<defs>
		<linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
			<stop offset="0%" stop-color="#ffc52a" />
			<stop offset="100%" stop-color="#f35d29" />
		</linearGradient>
	</defs>

	<!-- Track -->
	<circle
		cx={size / 2}
		cy={size / 2}
		{r}
		fill="none"
		stroke="rgba(255, 255, 255, 0.16)"
		stroke-width={stroke}
	/>

	<!-- Fill -->
	<circle
		cx={size / 2}
		cy={size / 2}
		{r}
		fill="none"
		stroke="url(#{gradId})"
		stroke-width={stroke}
		stroke-linecap="round"
		stroke-dasharray={circumference}
		stroke-dashoffset={offset}
		transform="rotate(-90 {size / 2} {size / 2})"
		style="transition: stroke-dashoffset 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
	/>

	<!-- Percent label -->
	<text
		x="50%"
		y="50%"
		text-anchor="middle"
		dominant-baseline="central"
		font-size={size * 0.3}
		font-weight="700"
		fill="currentColor"
	>
		{clamped}
	</text>
</svg>

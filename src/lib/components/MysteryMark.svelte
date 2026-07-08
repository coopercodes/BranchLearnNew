<script lang="ts">
	interface Props {
		/** Rendered width/height in pixels. */
		size?: number;
		/** Whether the mark is clickable/focusable. */
		interactive?: boolean;
		label?: string;
		class?: string;
		onreveal?: () => void;
		/** Center point, in the parent SVG's coordinate space — only meaningful when nesting inside another <svg>. */
		x?: number;
		y?: number;
	}

	let {
		size = 36,
		interactive = false,
		label = 'Mystery value',
		class: className = '',
		onreveal,
		x = 0,
		y = 0
	}: Props = $props();

	const instanceId = $props.id();
	const gradientId = `mystery-metal-${instanceId}`;

	function reveal(e: MouseEvent | KeyboardEvent) {
		if (!interactive) return;
		e.stopPropagation();
		onreveal?.();
	}

	function onkeydown(e: KeyboardEvent) {
		if (!interactive) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			reveal(e);
		}
	}
</script>

{#snippet marker()}
	<defs>
		<linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
			<stop offset="0%" stop-color="#7fe3ff" />
			<stop offset="18%" stop-color="#29b6f6" />
			<stop offset="38%" stop-color="#0277bd" />
			<stop offset="50%" stop-color="#4fc3f7" />
			<stop offset="62%" stop-color="#01579b" />
			<stop offset="82%" stop-color="#039be5" />
			<stop offset="100%" stop-color="#002b4d" />
		</linearGradient>
	</defs>
	<circle class="mystery-glow" r="18" />
	<polygon points="0,-13 13,0 0,13 -13,0" class="mystery-shape" fill="url(#{gradientId})" />
	<text
		text-anchor="middle"
		dominant-baseline="central"
		font-size="14"
		font-weight="900"
		class="mystery-text">?</text
	>
{/snippet}

{#if interactive}
	<svg
		class="mystery-mark interactive {className}"
		x={x - size / 2}
		y={y - size / 2}
		width={size}
		height={size}
		viewBox="-18 -18 36 36"
		role="button"
		tabindex="0"
		aria-label={label}
		onclick={reveal}
		{onkeydown}
	>
		{@render marker()}
	</svg>
{:else}
	<svg
		class="mystery-mark {className}"
		x={x - size / 2}
		y={y - size / 2}
		width={size}
		height={size}
		viewBox="-18 -18 36 36"
		role="img"
		aria-label={label}
	>
		{@render marker()}
	</svg>
{/if}

<style>
	.mystery-mark {
		display: block;
		overflow: visible;
	}

	.mystery-mark.interactive {
		cursor: pointer;
	}

	.mystery-glow {
		fill: #29b6f6;
		opacity: 0.6;
	}

	.mystery-shape {
		stroke: #002b4d;
		stroke-width: 1.5;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45));
	}

	.mystery-text {
		fill: white;
		paint-order: stroke;
		stroke: rgba(0, 43, 77, 0.7);
		stroke-width: 1.2;
	}
</style>

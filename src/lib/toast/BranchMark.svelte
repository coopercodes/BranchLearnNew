<script lang="ts">
	// The Branch logo as a tintable mark — the artwork is masked, so whatever
	// colour you pass becomes the logo itself.
	let { color = 'currentColor', size = 26 }: { color?: string; size?: number } = $props();
</script>

<span
	class="mark"
	style:background-color={color}
	style:width="{size}px"
	style:height="{size}px"
	aria-hidden="true"
></span>

<style>
	.mark {
		display: inline-block;
		flex-shrink: 0;
		/* Vite resolves the url() at build time — no runtime custom property. */
		mask-image: url('../assets/branch.svg');
		-webkit-mask-image: url('../assets/branch.svg');
		mask-size: contain;
		-webkit-mask-size: contain;
		mask-repeat: no-repeat;
		-webkit-mask-repeat: no-repeat;
		mask-position: center;
		-webkit-mask-position: center;
	}
</style>

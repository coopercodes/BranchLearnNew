<script>
	import { sprites } from './spriteLibrary/index'

	let {
		type,
		size = 64,
		title = null,
		class: klass = '',
		...rest
	} = $props();

    // @ts-ignore
	let sprite = $derived(sprites[type]);

	$effect(() => {
		if (!sprite) console.warn(`<2DSprite>: unknown sprite type "${type}"`);
	});
</script>

{#if sprite}
	{@const Sprite = sprite.component}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox={sprite.viewBox}
		width={size}
		height={size}
		class="sprite {klass}"
		role={title ? 'img' : 'presentation'}
		aria-hidden={title ? undefined : 'true'}
		{...rest}
	>
		{#if title}<title>{title}</title>{/if}
		<Sprite />
	</svg>
{/if}

<style>
	.sprite {
		display: block;
		overflow: visible;
	}
</style>
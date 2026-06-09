<script lang="ts">
	import type { IconType } from '$lib/os/windowStore.svelte';

	let { type, size = 20 }: { type: IconType; size?: number } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.8"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if type === 'leaf'}
		<path d="M5 20c0-7 5-13 14-14 0 9-5 14-12 14a6 6 0 0 1-2 0Z" />
		<path d="M5 20c2-5 5-8 9-10" />
	{:else if type === 'scroll'}
		<path d="M7 4h9a2 2 0 0 1 2 2v12a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2V6" />
		<path d="M6 4a2 2 0 0 0-2 2v1h3" />
		<path d="M10 9h5M10 13h5" />
	{:else if type === 'orb'}
		<circle cx="12" cy="13" r="6" />
		<path d="M12 13l3-3M9 7l1.5 1.5" />
		<path d="M12 2v2M5 5l1 1M19 5l-1 1" />
	{:else if type === 'map'}
		<path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z" />
		<path d="M9 4v14M15 6v14" />
	{/if}
</svg>

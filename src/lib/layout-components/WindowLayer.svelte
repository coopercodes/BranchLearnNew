<script lang="ts">
	import { desktop } from '$lib/os/windowStore.svelte';
	import BookWindow from './BookWindow.svelte';
	import LeafWindow from './LeafWindow.svelte';
</script>

<!-- Sits over the desktop; only the windows themselves catch pointer events. -->
<div class="pointer-events-none absolute inset-0 overflow-hidden">
	{#each desktop.windows as win (win.app.id)}
		{#if !win.minimized && win.app.id !== desktop.dockedId}
			{#if win.app.id === 'book'}
				<BookWindow {win} />
			{:else if win.app.id === 'leaf'}
				<LeafWindow {win} />
			{/if}
		{/if}
	{/each}
</div>

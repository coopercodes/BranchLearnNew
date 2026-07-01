<script lang="ts">
	import { desktop } from '$lib/os/windowStore.svelte';
	import BookWindow from './BookWindow.svelte';
	import LeafWindow from './LeafWindow.svelte';

	let win = $derived(desktop.windows.find((w) => w.app.id === desktop.dockedId));
</script>

{#if win}
	<div class="relative h-full shrink-0 border-l border-black/15" style:width="{desktop.dockWidth}px">
		{#if win.app.id === 'book'}
			<BookWindow {win} docked />
		{:else if win.app.id === 'leaf'}
			<LeafWindow {win} docked />
		{/if}
	</div>
{/if}

<script lang="ts">
	import { desktop } from '$lib/os/windowStore.svelte';
	import BackpackWindow from './BackpackWindow.svelte';
	import BookWindow from './BookWindow.svelte';
	import LeafWindow from './LeafWindow.svelte';
	import QuestLogWindow from './QuestLogWindow.svelte';
</script>

<!-- Sits over the desktop; only the windows themselves catch pointer events. -->
<div class="pointer-events-none absolute inset-0 overflow-hidden z-100">
	{#each desktop.windows as win (win.app.id)}
		{#if !win.minimized && win.app.id !== desktop.dockedId}
			{#if win.app.id === 'book'}
				<BookWindow {win} />
			{:else if win.app.id === 'leaf'}
				<LeafWindow {win} />
			{:else if win.app.id === 'backpack'}
				<BackpackWindow {win} />
			{:else if win.app.id === 'quest-log'}
				<QuestLogWindow {win} />
			{/if}
		{/if}
	{/each}
</div>

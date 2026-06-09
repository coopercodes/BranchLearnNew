<script lang="ts">
	import { desktop } from '$lib/os/windowStore.svelte';
	import OSWindow from './OSWindow.svelte';
	import WindowContent from './WindowContent.svelte';
</script>

<!-- Sits over the desktop; only the windows themselves catch pointer events. -->
<div class="pointer-events-none absolute inset-0 overflow-hidden">
	{#each desktop.windows as win (win.app.id)}
		{#if !win.minimized}
			<OSWindow {win}>
				<WindowContent />
			</OSWindow>
		{/if}
	{/each}
</div>

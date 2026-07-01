<script lang="ts">
	import type { Snippet } from 'svelte';
	import OSBar from './OSBar.svelte';
	import WindowLayer from './WindowLayer.svelte';
	import DockPanel from './DockPanel.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="h-screen flex flex-col">
	<div class="desktop relative flex flex-1 grow overflow-hidden">
		<!-- Main lesson content shrinks to make room for a docked side panel. -->
		<div class="relative h-full min-w-0 flex-1 overflow-hidden">
			{@render children()}
		</div>

		<DockPanel />

		<!-- Free-floating, draggable/resizable windows -->
		<WindowLayer />
	</div>
	<OSBar />
</div>

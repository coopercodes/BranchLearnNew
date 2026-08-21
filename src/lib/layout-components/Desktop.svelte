<script lang="ts">
	import type { Snippet } from 'svelte';
	import OSBar from './OSBar.svelte';
	import WindowLayer from './WindowLayer.svelte';
	import DockPanel from './DockPanel.svelte';
	import MOBABar from '$lib/components/MOBABar.svelte';

	// `barLeft` optionally replaces the OS bar's left progress widget.
	let { children, barLeft }: { children: Snippet; barLeft?: Snippet } = $props();
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
	<MOBABar />
</div>

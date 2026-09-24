<script lang="ts">
	import type { Snippet } from 'svelte';
	import OSBar from './OSBar.svelte';
	import WindowLayer from './WindowLayer.svelte';
	import DockPanel from './DockPanel.svelte';
	import MOBABar from './moba/MOBABar.svelte';
	import RightSidebar from './RightSidebar.svelte';

	// `barLeft` optionally replaces the OS bar's left progress widget.
	let { children, barLeft }: { children: Snippet; barLeft?: Snippet } = $props();

	let sidebarOpen = $state(false);
</script>

<div class="flex">
	<div class="h-screen flex flex-col">
		<div class="desktop relative flex flex-1 grow overflow-hidden">
			<!-- Main lesson content shrinks to make room for a docked side panel. -->
			<div class="relative flex w-screen h-full min-w-0 flex-1 overflow-hidden">
				<div class="relative flex-1 grow min-w-0 h-full">
					{@render children()}
					<MOBABar />
				</div>
				{#if sidebarOpen}
					<RightSidebar />
				{/if}
				
			</div>

			<DockPanel />

			<!-- Free-floating, draggable/resizable windows -->
			<WindowLayer />
			
			<!-- <div class="bg-white w-[200px] h-screen">
			</div> -->
		</div>
		
	</div>
	
</div>
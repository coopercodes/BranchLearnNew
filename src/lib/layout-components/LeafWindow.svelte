<script lang="ts">
	import Leaf from "$lib/Leaf.svelte";
	import LeafChat from "$lib/components/LeafChat.svelte";
	import { leafSelection } from "$lib/leaf/selection.svelte";
	import { leafPanelContext } from "$lib/leaf/panelContext.svelte";
	import { desktop, type WindowState } from "$lib/os/windowStore.svelte";
	import { startWindowDrag, startWindowResize, startDockResize, RESIZE_EDGES, RESIZE_CORNERS } from "$lib/os/windowDrag";

	let { win, docked = false }: { win: WindowState; docked?: boolean } = $props();

	let focused = $derived(win.z === desktop.topZ);

	// Base scene + whatever slide the course page has published — so Leaf
	// always knows what panel the student is currently looking at.
	let context = $derived(
		'The student is working inside the BranchLearn OS desktop, studying SAT Trigonometry. ' +
			'Other windows (like the Textbook) may publish what the student has selected — if a selection is described below, ground your answer in it.' +
			(leafPanelContext.current ? `\n\n${leafPanelContext.current}` : '')
	);
</script>

<div
	class="pointer-events-auto flex flex-col border bg-[#F5EDE7] select-none {docked ? 'relative h-full w-full' : 'absolute shadow-2xl/35 rounded-sm'}"
	class:focused
	role="dialog"
	tabindex="-1"
	aria-label="Leaf window"
	style:left={docked ? undefined : `${win.x}px`}
	style:top={docked ? undefined : `${win.y}px`}
	style:width={docked ? undefined : `${win.width}px`}
	style:height={docked ? undefined : `${win.height}px`}
	style:z-index={docked ? undefined : win.z}
	onpointerdown={() => desktop.focus(win)}
>
	<div class="flex flex-col h-full">
		<div
			role="toolbar"
			tabindex="0"
			aria-label={docked ? 'Leaf panel' : 'Leaf window — drag to move'}
			class="flex bg-[#e9e1db] justify-between border-b px-2 p-1 {docked ? '' : 'rounded-t-sm cursor-grab active:cursor-grabbing'}"
			onpointerdown={docked ? undefined : (e) => startWindowDrag(win, e)}
		>
			<div class="flex items-center space-x-2">
				<div class="flex items-center space-x-2">
					<Leaf color="#386d4f" width={24} height={24}/>
					<p class='text-xs font-semibold ' >Chat</p>
					<p class='text-xs '>History</p>
					<p class='text-xs'>Settings</p>
				</div>
			</div>

			<div class="flex space-x-2 items-center">
				<button
					type="button"
					class="h-4 w-4 bg-red-800/70 cursor-pointer hover:bg-red-800 rounded-full"
					aria-label="Close Leaf"
					onpointerdown={(e) => e.stopPropagation()}
					onclick={() => desktop.close(win.app.id)}
				></button>
			</div>
		</div>

		<div class="w-full h-full min-h-0">
			<LeafChat {context} selected={leafSelection.current} showHeader={false} />
		</div>
	</div>

	<!-- Resize handles -->
	{#if docked}
		<div
			role="presentation"
			class="absolute top-0 bottom-0 left-0 w-1.5 cursor-ew-resize"
			onpointerdown={startDockResize}
		></div>
	{:else}
		{#each RESIZE_EDGES as edge (edge.dir)}
			<div
				role="presentation"
				class="absolute {edge.cls}"
				onpointerdown={(ev) => startWindowResize(win, ev, edge.dir)}
			></div>
		{/each}
		{#each RESIZE_CORNERS as corner (corner.dir)}
			<div
				role="presentation"
				class="absolute z-10 h-3.5 w-3.5 {corner.cls}"
				onpointerdown={(ev) => startWindowResize(win, ev, corner.dir)}
			></div>
		{/each}
	{/if}
</div>

<style>
	.focused {
		box-shadow:
			0 12px 40px rgba(56, 109, 79, 0.18),
			0 0 0 1.5px #386d4f;
	}
</style>

<script lang="ts">
	import Book from "$lib/Book.svelte";
	import { desktop, type WindowState } from "$lib/os/windowStore.svelte";
	import { startWindowDrag, startWindowResize, startDockResize, RESIZE_EDGES, RESIZE_CORNERS } from "$lib/os/windowDrag";

	let { win, docked = false }: { win: WindowState; docked?: boolean } = $props();

	let screen = $state("intro");
	let sidebarOpen = $state(true);

	let focused = $derived(win.z === desktop.topZ);
</script>

<div
	class="pointer-events-auto flex flex-col border bg-[#F5EDE7] select-none {docked ? 'relative h-full w-full' : 'absolute shadow-2xl/35 rounded-sm'}"
	class:focused
	role="dialog"
	tabindex="-1"
	aria-label="Textbook window"
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
			aria-label={docked ? 'Textbook panel' : 'Textbook window — drag to move'}
			class="flex bg-[#e9e1db] justify-between border-b px-2 p-1 {docked ? '' : 'rounded-t-sm cursor-grab active:cursor-grabbing'}"
			onpointerdown={docked ? undefined : (e) => startWindowDrag(win, e)}
		>
			<div class="flex items-center space-x-2">
				<div class="flex items-center space-x-2">
					<Book color="#8B5A34" width={24} height={24}/>
					<p class='text-xs font-semibold' >Textbook</p>
					<p class='text-xs'>Settings</p>
				</div>
			</div>

			<div class="flex space-x-2 items-center">
				<button
					type="button"
					class="h-4 w-4 bg-red-800/70 cursor-pointer hover:bg-red-800 rounded-full"
					aria-label="Close Textbook"
					onpointerdown={(e) => e.stopPropagation()}
					onclick={() => desktop.close(win.app.id)}
				></button>
			</div>
		</div>

		<div class="relative flex h-full min-h-0 overflow-hidden">

			<!-- Floating toggle: book icon to open, panel icon to close. Lives over the content, not the title bar. -->
			<button
				type="button"
				class="absolute top-2 left-2 z-40 flex items-center justify-center rounded-full bg-[#F5EDE7] shadow p-1.5 hover:brightness-95 cursor-pointer"
				onclick={() => (sidebarOpen = !sidebarOpen)}
				aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
			>
				{#if sidebarOpen}
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5A34" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-panel-left-close-icon lucide-panel-left-close"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/></svg>
				{:else}
					<Book color="#8B5A34" width={18} height={18}/>
				{/if}
			</button>

			<!-- Article always fills the window; the sidebar overlays on top of it -->
			<div class="w-full h-full flex flex-col items-center justify-center p-4">
				<p class="text-left font-semibold w-full">The Sine Ratio</p>
				<p class=" my-2">
					Every right triangle has two acute angles, and each one defines three basic ratios between its sides: sine, cosine, and tangent. The sine of an angle θ, written sin(θ), is the length of the side opposite θ divided by the length of the hypotenuse.
				</p>
				<p class=" my-2">
					Because every right triangle with the same angle θ is similar, this ratio never changes — only the triangle's size does. That's what makes sin(θ) useful on the SAT: memorize a handful of values, like sin(30°) = 1/2, and you can solve any right triangle that shares that angle.
				</p>
				<p class=" my-2">
					Sine and cosine are also linked by the co-function identity sin(θ) = cos(90° − θ) for any acute angle θ. That lets you rewrite a sine expression as a cosine one (or vice versa) without ever knowing the actual angle — a shortcut that shows up often on SAT trigonometry questions.
				</p>
			</div>

			{#if sidebarOpen}
				<!-- Backdrop dims the article behind the open sidebar -->
				<button
					type="button"
					class="absolute inset-0 bg-neutral-200/90 transition-opacity duration-150 cursor-default {sidebarOpen
						? 'opacity-100 pointer-events-auto'
						: 'opacity-0 pointer-events-none'}"
					aria-label="Close sidebar"
					onclick={() => (sidebarOpen = false)}
				></button>
			{/if}

			<div class="absolute inset-y-0 left-0 w-60 h-full bg-[#E4CBA6] rounded-bl p-2 pt-10 transition-transform duration-200 ease-out {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}">
				<div class="flex flex-col">
					<p class="font-medium mt-2">
						SAT Trigonometry
					</p>
				</div>
			</div>
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
			0 12px 40px rgba(139, 90, 52, 0.18),
			0 0 0 1.5px #8B5A34;
	}
</style>

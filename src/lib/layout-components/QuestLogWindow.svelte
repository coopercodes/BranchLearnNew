<script lang="ts">
	import SvelteMarkdown, { type Renderers, type RendererComponent } from "@humanspeak/svelte-markdown";
	import { markedKatex, KatexRenderer } from "@humanspeak/svelte-markdown/extensions/katex";
	import "katex/dist/katex.min.css";
	import Book from "$lib/Book.svelte";
	import { textbookSections, type TextbookSection, type a } from "$lib/content/textbookChapters";
	import { leafSelection } from "$lib/leaf/selection.svelte";
	import { desktop, type WindowState } from "$lib/os/windowStore.svelte";
	import { startWindowDrag, startWindowResize, startDockResize, RESIZE_EDGES, RESIZE_CORNERS } from "$lib/os/windowDrag";

	let { win, docked = false}: { win: WindowState; docked?: boolean } = $props();

    

</script>

<div
	class="pointer-events-auto flex flex-col border select-none {docked ? 'relative h-full w-full' : 'absolute shadow-2xl/15 border border-amber-400 rounded-sm'}"
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
	<div class="flex flex-col h-full text-white">
		<div
			role="toolbar"
			tabindex="0"
			aria-label={docked ? 'Textbook panel' : 'Textbook window — drag to move'}
			class="flex bg-brand-surface-blue-800 overflow-hidden justify-between border-b px-2 p-1 {docked ? '' : ' cursor-grab active:cursor-grabbing'}"
			onpointerdown={docked ? undefined : (e) => startWindowDrag(win, e)}
		>
			<div class="flex items-center space-x-2">
				<div class="flex items-center space-x-2">
					<Book color="#8B5A34" width={24} height={24}/>
					<p class='text-xs font-semibold' >QUEST LOG</p>
					<p class='text-xs'>Achivements</p>
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

        <div class="flex h-full bg-brand-surface-blue-800 rounded-b-sm">
            <div class="grid  grid-cols-6 divide-amber-200">
                <p>a</p>
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

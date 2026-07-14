<script lang="ts">
	import SvelteMarkdown, { type Renderers, type RendererComponent } from "@humanspeak/svelte-markdown";
	import { markedKatex, KatexRenderer } from "@humanspeak/svelte-markdown/extensions/katex";
	import "katex/dist/katex.min.css";
	import Book from "$lib/Book.svelte";
	import { textbookChapters } from "$lib/content/textbookChapters";
	import { leafSelection } from "$lib/leaf/selection.svelte";
	import { desktop, type WindowState } from "$lib/os/windowStore.svelte";
	import { startWindowDrag, startWindowResize, startDockResize, RESIZE_EDGES, RESIZE_CORNERS } from "$lib/os/windowDrag";

	let { win, docked = false }: { win: WindowState; docked?: boolean } = $props();

	let sidebarOpen = $state(true);
	let currentChapter = $state(textbookChapters[0]);

	let focused = $derived(win.z === desktop.topZ);

	const extensions = [markedKatex()];
	// Renderers doesn't know about extension tokens, so widen it for the katex keys.
	const renderers: Partial<Renderers> & Record<string, RendererComponent> = {
		inlineKatex: KatexRenderer,
		blockKatex: KatexRenderer
	};

	function openChapter(chapter: (typeof textbookChapters)[number]) {
		currentChapter = chapter;
		sidebarOpen = false;
		leafSelection.select({
			kind: 'textbook-chapter',
			label: chapter.title,
			explanation: `The student opened the "${chapter.title}" chapter of the SAT Trigonometry textbook. Chapter content (markdown with LaTeX):\n\n${chapter.markdown}`
		});
	}
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

			<!-- Floating toggle: article-lines icon to open, panel icon to close. Lives over the content, not the title bar. -->
			<button
				type="button"
				class="absolute top-2 left-2 z-40 flex items-center justify-center rounded-full bg-[#F5EDE7] shadow p-1.5 hover:brightness-95 cursor-pointer"
				onclick={() => (sidebarOpen = !sidebarOpen)}
				aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
			>
				{#if sidebarOpen}
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5A34" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-panel-left-close-icon lucide-panel-left-close"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/></svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5A34" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text-icon lucide-text"><path d="M15 18H3"/><path d="M17 6H3"/><path d="M21 12H3"/></svg>
				{/if}
			</button>

			<!-- Article always fills the window; the sidebar overlays on top of it -->
			<div class="w-full h-full min-h-0 overflow-y-auto p-4 pt-12">
				<div class="prose prose-sm max-w-none prose-headings:text-[#5a3a1e] prose-a:text-[#8B5A34]">
					{#key currentChapter.id}
						<SvelteMarkdown source={currentChapter.markdown} {extensions} {renderers} />
					{/key}
				</div>
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
					<p class="font-medium mt-2 px-2">
						SAT Trigonometry
					</p>
					<nav class="mt-2 flex flex-col gap-1" aria-label="Chapters">
						{#each textbookChapters as chapter, i (chapter.id)}
							<button
								type="button"
								class="flex items-baseline gap-2 rounded-sm px-2 py-1.5 text-left text-sm cursor-pointer hover:bg-[#d8ba8e] {chapter.id === currentChapter.id ? 'bg-[#d8ba8e] font-semibold' : ''}"
								aria-current={chapter.id === currentChapter.id ? 'page' : undefined}
								onclick={() => openChapter(chapter)}
							>
								<span class="text-xs text-[#8B5A34]">{i + 1}.</span>
								<span>{chapter.title}</span>
							</button>
						{/each}
					</nav>
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

<script lang="ts">
	import Leaf from "$lib/Leaf.svelte";
	import { desktop, type WindowState } from "$lib/os/windowStore.svelte";
	import { startWindowDrag, startWindowResize, startDockResize, RESIZE_EDGES, RESIZE_CORNERS } from "$lib/os/windowDrag";

	let { win, docked = false }: { win: WindowState; docked?: boolean } = $props();

	let screen = $state("chat");

	let focused = $derived(win.z === desktop.topZ);
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

		{#if screen == "intro"}
			<div class="w-full h-full min-h-0 flex flex-col items-center justify-center overflow-auto">
				<div class="flex items-center space-x-2">
					<Leaf color="#386d4f" width={44} height={44}/>
					<p class="text-4xl font-semibold">Leaf</p>
				</div>
				<p class="text-center font-thin text-lg my-2">Nice to meet you, I'm Leaf. <br/> Let's learn something new today.</p>

				<textarea class="text w-[300px] mt-4 text rounded-sm p-4 bg-neutral-100">What's the sine of a 30° angle in a right triangle?</textarea>
				<p class="bg-brand-blue/20  text-brand-blue px-2 rounded-sm text-xs mt-2 font-thin">1 selected</p>
			</div>
		{:else if screen == "chat"}
			<div class="w-full h-full min-h-0 flex flex-col items-start justify-start p-4 overflow-auto">
				<div class="bg-brand-forest p-4 w-full text-base rounded-sm">
					<p class="text-sm text-white">Can you explain how sin(θ) and cos(θ) relate to each other in this triangle?</p>
				</div>
				<p class="bg-brand-blue/20  text-brand-blue px-2 rounded-sm text-xs mt-2 font-thin">1 selected</p>

				<div class="mt-4">
					<div class="flex items-center mb-2">
						<Leaf color="#386d4f" width={22} height={22} />
						<div class=" grow h-[1px] bg-brand-forest ml-1"></div>
						<div class=" ml-2 mb-2">...</div>
					</div>
					<p class="text-sm">Sure! Let's start with what we already know about this triangle's two acute angles.</p>
					<p class="text-sm mt-4">Since the acute angles in a right triangle always add up to 90°, they're complementary — which means we can relate them with the equation below.</p>
					<p class="text-sm text-center font-mono mt-4">sin(θ) = cos(90° − θ)</p>
					<p class="text-sm mt-4">Once you spot that relationship, you can swap between sin and cos without ever finding the actual angle — that's the shortcut most SAT trig questions are testing.</p>
				</div>
			</div>
		{/if}
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

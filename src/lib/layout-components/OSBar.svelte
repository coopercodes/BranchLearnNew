<script lang="ts">
	import RemainingCount from './RemainingCount.svelte';
	import TopicMap from './TopicMap.svelte';
	import LayoutMenu from './LayoutMenu.svelte';
	import { desktop, APPS, type AppDef } from '$lib/os/windowStore.svelte';
	import Leaf from '$lib/Leaf.svelte';
	import Book from '$lib/Book.svelte';

	// Toggle open/closed — but restore (don't close) a minimized window.
	function dockClick(app: AppDef) {
		const w = desktop.find(app.id);
		if (w && w.minimized) {
			desktop.open(app);
		} else {
			desktop.toggle(app);
		}
	}
</script>

<div
  class="relative flex h-13 items-center justify-between border-t border-t-brand-near-black bg-brand-near-black/85 px-3 backdrop-blur"
>
  <!-- Left -->
  <TopicMap />

  <!-- Middle: pinned to true center -->
  <div class="absolute left-1/2 -translate-x-1/2">
    <RemainingCount />
  </div>

	<!-- Right: window launcher dock -->
	<div class="flex items-center gap-1.5 pr-1">
		{#each APPS as app (app.id)}
			{@const w = desktop.find(app.id)}
			{@const isOpen = !!w}
			{@const active = !!w && !w.minimized && w.z === desktop.topZ}
			<button
				type="button"
				class="dock-btn bg-brand-near-black cursor-pointer relative flex h-10 w-10 items-center justify-center rounded-lg border text-brand-gray-light transition"
				class:active
				class:is-open={isOpen}
				style:--accent={app.accent}
				aria-pressed={isOpen}
				aria-label="{app.title}{isOpen ? ' (open)' : ''}"
				title={app.title}
				onclick={() => dockClick(app)}
			>
				{#if app.id === 'leaf'}
					<Leaf width={28} height={28} />
				{:else if app.id === 'book'}
					<Book width={28} height={28} />
				{/if}
				{#if isOpen}
					<span class="open-dot mb-0.5" aria-hidden="true"></span>
				{/if}
			</button>
		{/each}
		<LayoutMenu />
	</div>
</div>

<style>
	.dock-btn {
		border-color: color-mix(in srgb, #7a7a7a 100%, transparent);
	}
	.dock-btn:hover {
		color: #fff;
		border-color: color-mix(in srgb, var(--accent) 100%, transparent);
		background: color-mix(in srgb, var(--accent) 0%, transparent);
	}
	.dock-btn.is-open {
		color: #fff;
		border-color: color-mix(in srgb, var(--accent) 45%, transparent);
	}
	.dock-btn.active {
		background: color-mix(in srgb, var(--accent) 20%, transparent);
		border-color: var(--accent);
	}

	.open-dot {
		position: absolute;
		bottom: -5px;
		left: 50%;
		height: 4px;
		width: 4px;
		transform: translateX(-50%);
		border-radius: 9999px;
		background: #4ade80;
		box-shadow: 0 0 7px rgba(74, 222, 128, 0.95);
	}
</style>

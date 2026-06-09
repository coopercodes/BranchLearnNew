<script lang="ts">
	import RemainingCount from './RemainingCount.svelte';
	import AppIcon from './AppIcon.svelte';
	import TopicMap from './TopicMap.svelte';
	import { desktop, APPS, type AppDef } from '$lib/os/windowStore.svelte';

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
	class="flex h-13 items-center justify-between border-t border-t-brand-near-black bg-brand-near-black/85 px-3 backdrop-blur"
>
	<!-- Left: current focus topic → opens the learning map -->
	<TopicMap />

	<!-- Middle: progress -->
	<div class="flex">
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
				class="dock-btn bg-brand-near-black cursor-pointer relative flex h-9 w-9 items-center justify-center rounded-lg border text-brand-gray-light transition"
				class:active
				class:is-open={isOpen}
				style:--accent={"#1a1a1a"}
				style:--glow={app.glow}
				aria-pressed={isOpen}
				aria-label="{app.title}{isOpen ? ' (open)' : ''}"
				title={app.title}
				onclick={() => dockClick(app)}
			>
				<AppIcon type={app.icon} size={18} />
				{#if isOpen}
					<span class="open-dot" aria-hidden="true"></span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.dock-btn {
		border-color: transparent;
	}
	.dock-btn:hover {
		color: #fff;
		border-color: color-mix(in srgb, var(--accent) 55%, transparent);
		background: color-mix(in srgb, var(--accent) 18%, transparent);
		transform: translateY(-1px);
	}
	.dock-btn.is-open {
		color: #fff;
		border-color: color-mix(in srgb, var(--accent) 45%, transparent);
	}
	.dock-btn.active {
		background: color-mix(in srgb, var(--accent) 30%, transparent);
		border-color: var(--accent);
		box-shadow: 0 0 14px var(--glow);
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

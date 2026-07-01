<script lang="ts">
	import { desktop, type DockMode } from '$lib/os/windowStore.svelte';

	let open = $state(false);

	const options: { mode: DockMode; label: string }[] = [
		{ mode: 'book', label: 'Open Book To Right' },
		{ mode: 'leaf', label: 'Open Leaf To Right' }
	];

	function pick(mode: DockMode) {
		desktop.openDock(mode);
		open = false;
	}
</script>

<div class="relative">
	<button
		type="button"
		class="dock-btn bg-brand-near-black cursor-pointer relative flex h-10 w-10 items-center justify-center rounded-lg border text-brand-gray-light transition"
		class:active={open}
		style:--accent="#5b8def"
		aria-haspopup="menu"
		aria-expanded={open}
		aria-label="Choose window layout"
		title="Layout"
		onclick={() => (open = !open)}
	>
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			<rect x="3" y="4" width="18" height="16" rx="2" />
			<path d="M12 4v16" />
		</svg>
	</button>

	{#if open}
		<button
			type="button"
			class="fixed inset-0 z-40 cursor-default"
			aria-label="Close layout menu"
			onclick={() => (open = false)}
		></button>
		<div
			class="absolute bottom-full right-0 z-50 mb-2 w-48 rounded-lg border border-white/10 bg-brand-near-black/95 p-1.5 shadow-xl backdrop-blur"
			role="menu"
		>
			{#each options as opt (opt.mode)}
				<button
					type="button"
					role="menuitem"
					class="menu-item w-full cursor-pointer rounded-md px-2.5 py-1.5 text-left text-sm text-brand-gray-light transition"
					onclick={() => pick(opt.mode)}
				>
					{opt.label}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.dock-btn {
		border-color: color-mix(in srgb, #7a7a7a 100%, transparent);
	}
	.dock-btn:hover {
		color: #fff;
		border-color: color-mix(in srgb, var(--accent) 100%, transparent);
	}
	.dock-btn.active {
		background: color-mix(in srgb, var(--accent) 20%, transparent);
		border-color: var(--accent);
		color: #fff;
	}

	.menu-item:hover {
		background: rgba(255, 255, 255, 0.08);
		color: #fff;
	}
</style>

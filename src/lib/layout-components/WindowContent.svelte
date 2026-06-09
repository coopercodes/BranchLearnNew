<script lang="ts">
	import { desktop, getWindowContext } from '$lib/os/windowStore.svelte';

	// No props — each instance discovers its OWN window through context.
	const win = getWindowContext();

	// --- Canopy (leaf) ---
	let leaves = $state(0);
	const canopy = $derived(Math.min(100, leaves * 8));

	// --- Atlas (map) ---
	const cols = 8;
	const rows = 6;
	let px = $state(3);
	let py = $state(2);
	function step(dx: number, dy: number) {
		px = Math.max(0, Math.min(cols - 1, px + dx));
		py = Math.max(0, Math.min(rows - 1, py + dy));
	}
</script>

{#if win.app.id === 'leaf'}
	<div class="flex h-full flex-col gap-3">
		<p class="text-sm text-brand-gray-light">
			Tend the canopy. Each leaf feeds the world tree.
		</p>
		<div class="relative flex flex-1 flex-wrap content-start gap-1 overflow-hidden rounded-lg bg-black/30 p-3">
			{#each Array(leaves) as _, i (i)}
				<span class="text-lg" style:animation="sprout 0.4s ease-out">🌿</span>
			{/each}
			{#if leaves === 0}
				<span class="m-auto text-xs text-brand-gray-mid">empty soil…</span>
			{/if}
		</div>
		<div class="h-2 overflow-hidden rounded-full bg-black/40">
			<div class="h-full rounded-full bg-brand-forest transition-all" style:width="{canopy}%"></div>
		</div>
		<button
			type="button"
			class="rounded-lg bg-brand-forest px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 active:scale-95"
			onclick={() => (leaves += 1)}
		>
			Plant a leaf 🌱
		</button>
	</div>
{:else if win.app.id === 'atlas'}
	<div class="flex h-full flex-col gap-3">
		<div class="flex items-center justify-between text-xs text-brand-gray-light">
			<span>Region map</span>
			<span class="font-mono">
				win {Math.round(win.width)}×{Math.round(win.height)} · pos {px},{py}
			</span>
		</div>
		<div
			class="grid flex-1 gap-0.5 rounded-lg bg-black/30 p-1.5"
			style:grid-template-columns="repeat({cols}, minmax(0, 1fr))"
		>
			{#each Array(rows * cols) as _, i (i)}
				{@const cx = i % cols}
				{@const cy = Math.floor(i / cols)}
				<div class="relative rounded-sm bg-brand-gold/10">
					{#if cx === px && cy === py}
						<span class="player absolute inset-0.5 rounded-full bg-brand-gold"></span>
					{/if}
				</div>
			{/each}
		</div>
		<div class="mx-auto grid w-24 grid-cols-3 gap-1 text-brand-near-black">
			<span></span>
			<button type="button" class="pad" onclick={() => step(0, -1)} aria-label="north">▲</button>
			<span></span>
			<button type="button" class="pad" onclick={() => step(-1, 0)} aria-label="west">◀</button>
			<span></span>
			<button type="button" class="pad" onclick={() => step(1, 0)} aria-label="east">▶</button>
			<span></span>
			<button type="button" class="pad" onclick={() => step(0, 1)} aria-label="south">▼</button>
			<span></span>
		</div>
	</div>
{/if}

<!-- Every window can dismiss itself via its own context. -->
<button
	type="button"
	class="mt-3 text-xs text-brand-gray-mid underline-offset-2 hover:text-brand-gray-light hover:underline"
	onclick={() => desktop.close(win.app.id)}
>
	close this window
</button>

<style>
	@keyframes sprout {
		from {
			transform: scale(0) rotate(-30deg);
			opacity: 0;
		}
		to {
			transform: scale(1) rotate(0);
			opacity: 1;
		}
	}

	.player {
		box-shadow: 0 0 10px #ffc52a;
		animation: blink 1s steps(2, jump-none) infinite;
	}
	@keyframes blink {
		50% {
			opacity: 0.4;
		}
	}

	.pad {
		border-radius: 0.375rem;
		background: #ede6dc;
		padding: 0.15rem 0;
		font-size: 0.7rem;
		line-height: 1;
		transition: filter 0.15s ease;
	}
	.pad:hover {
		filter: brightness(0.9);
	}
</style>

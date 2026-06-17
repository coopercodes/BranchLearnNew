<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { desktop, setWindowContext, type WindowState } from '$lib/os/windowStore.svelte';
	import AppIcon from './AppIcon.svelte';

	let { win, children }: { win: WindowState; children: Snippet } = $props();

	// Each window publishes its own live state to its content subtree. The
	// instance is stable for this component's life, so capture it untracked.
	setWindowContext(untrack(() => win));

	const MIN_W = 280;
	const MIN_H = 180;

	let focused = $derived(win.z === desktop.topZ);

	type Drag = (ev: PointerEvent) => void;

	/** Attach window-level listeners for the duration of a pointer gesture. */
	function track(onMove: Drag) {
		function up() {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', up);
		}
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', up);
	}

	function startDrag(e: PointerEvent) {
		if (e.button !== 0) return;
		desktop.focus(win);
		const sx = e.clientX;
		const sy = e.clientY;
		const ox = win.x;
		const oy = win.y;
		track((ev) => {
			win.x = ox + (ev.clientX - sx);
			win.y = oy + (ev.clientY - sy);
		});
	}

	function startResize(e: PointerEvent, dir: string) {
		e.stopPropagation();
		desktop.focus(win);
		const sx = e.clientX;
		const sy = e.clientY;
		const ox = win.x;
		const oy = win.y;
		const ow = win.width;
		const oh = win.height;
		track((ev) => {
			const dx = ev.clientX - sx;
			const dy = ev.clientY - sy;
			if (dir.includes('e')) win.width = Math.max(MIN_W, ow + dx);
			if (dir.includes('s')) win.height = Math.max(MIN_H, oh + dy);
			if (dir.includes('w')) {
				const nw = Math.max(MIN_W, ow - dx);
				win.x = ox + (ow - nw);
				win.width = nw;
			}
			if (dir.includes('n')) {
				const nh = Math.max(MIN_H, oh - dy);
				win.y = oy + (oh - nh);
				win.height = nh;
			}
		});
	}

	/** Keyboard nudge so the window can be moved without a pointer. */
	function nudge(e: KeyboardEvent) {
		const step = e.shiftKey ? 24 : 6;
		if (e.key === 'ArrowLeft') win.x -= step;
		else if (e.key === 'ArrowRight') win.x += step;
		else if (e.key === 'ArrowUp') win.y -= step;
		else if (e.key === 'ArrowDown') win.y += step;
		else return;
		e.preventDefault();
	}

	const lightMode = $derived(win.app.theme === 'light');

	const edges = [
		{ dir: 'n', cls: 'top-0 right-2 left-2 h-1.5 cursor-ns-resize' },
		{ dir: 's', cls: 'bottom-0 right-2 left-2 h-1.5 cursor-ns-resize' },
		{ dir: 'e', cls: 'top-2 right-0 bottom-2 w-1.5 cursor-ew-resize' },
		{ dir: 'w', cls: 'top-2 bottom-2 left-0 w-1.5 cursor-ew-resize' }
	];
	const corners = [
		{ dir: 'nw', cls: 'top-0 left-0 cursor-nwse-resize' },
		{ dir: 'ne', cls: 'top-0 right-0 cursor-nesw-resize' },
		{ dir: 'sw', cls: 'bottom-0 left-0 cursor-nesw-resize' },
		{ dir: 'se', cls: 'bottom-0 right-0 cursor-nwse-resize' }
	];
</script>

<div
	class="os-window pointer-events-auto absolute flex flex-col overflow-hidden rounded-xl border select-none {lightMode ? 'bg-white' : 'bg-brand-charcoal/95 backdrop-blur-md'}"
	class:focused
	class:light-mode={lightMode}
	role="dialog"
	tabindex="-1"
	aria-label={win.app.title}
	style:left="{win.x}px"
	style:top="{win.y}px"
	style:width="{win.width}px"
	style:height="{win.height}px"
	style:z-index={win.z}
	style:--accent={win.app.accent}
	style:--glow={win.app.glow}
	onpointerdown={() => desktop.focus(win)}
	transition:scale={{ duration: 220, start: 0.92, easing: cubicOut }}
>
	<!-- Title bar: drag surface (+ keyboard nudge) -->
	<div
		role="toolbar"
		tabindex="0"
		aria-label="{win.app.title} window — drag or use arrow keys to move"
		class="title-bar flex h-9 shrink-0 cursor-grab items-center gap-2 px-3 active:cursor-grabbing"
		onpointerdown={startDrag}
		onkeydown={nudge}
	>
		<span class="accent-chip flex h-5 w-5 items-center justify-center rounded-md text-white">
			<AppIcon type={win.app.icon} size={13} />
		</span>
		<span
			class="text-sm font-semibold"
			class:text-brand-off-white={!lightMode}
			class:text-brand-green-700={lightMode}
		>{win.app.title}</span>

		<div class="ml-auto flex items-center gap-1.5">
			<button
				type="button"
				class="ctrl bg-brand-gold/90"
				aria-label="Minimize {win.app.title}"
				onpointerdown={(e) => e.stopPropagation()}
				onclick={() => (win.minimized = true)}
			></button>
			<button
				type="button"
				class="ctrl bg-brand-crimson"
				aria-label="Close {win.app.title}"
				onpointerdown={(e) => e.stopPropagation()}
				onclick={() => desktop.close(win.app.id)}
			></button>
		</div>
	</div>

	<!-- Content -->
	<div
		class="min-h-0 flex-1 overflow-auto p-4"
		class:text-brand-off-white={!lightMode}
		class:text-brand-charcoal={lightMode}
	>
		{@render children()}
	</div>

	<!-- Resize handles -->
	{#each edges as e (e.dir)}
		<div
			role="presentation"
			class="absolute {e.cls}"
			onpointerdown={(ev) => startResize(ev, e.dir)}
		></div>
	{/each}
	{#each corners as c (c.dir)}
		<div
			role="presentation"
			class="absolute z-10 h-3.5 w-3.5 {c.cls}"
			onpointerdown={(ev) => startResize(ev, c.dir)}
		></div>
	{/each}
</div>

<style>
	.os-window {
		border-color: color-mix(in srgb, var(--accent) 45%, transparent);
		box-shadow:
			0 18px 50px rgba(0, 0, 0, 0.45),
			0 0 0 1px rgba(0, 0, 0, 0.3);
		transition:
			box-shadow 0.25s ease,
			border-color 0.25s ease;
	}

	.os-window.focused {
		border-color: var(--accent);
		box-shadow:
			0 22px 60px rgba(0, 0, 0, 0.5),
			0 0 22px var(--glow),
			0 0 0 1px var(--accent);
	}

	.title-bar {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--accent) 32%, #232524) 0%,
			#232524 100%
		);
		border-bottom: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
		touch-action: none;
	}

	.accent-chip {
		background: var(--accent);
		box-shadow: 0 0 10px var(--glow);
	}

	.ctrl {
		height: 0.7rem;
		width: 0.7rem;
		border-radius: 9999px;
		opacity: 0.85;
		transition:
			opacity 0.15s ease,
			transform 0.15s ease;
	}
	.ctrl:hover {
		opacity: 1;
		transform: scale(1.18);
	}

	/* Light-mode window overrides */
	.os-window.light-mode {
		box-shadow:
			0 8px 32px rgba(56, 109, 79, 0.12),
			0 0 0 1px rgba(56, 109, 79, 0.15);
	}
	.os-window.light-mode.focused {
		box-shadow:
			0 12px 40px rgba(56, 109, 79, 0.18),
			0 0 20px var(--glow),
			0 0 0 1.5px var(--accent);
	}
	.os-window.light-mode .title-bar {
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--accent) 10%, #ffffff) 0%,
			#f5fcf7 100%
		);
		border-bottom-color: color-mix(in srgb, var(--accent) 20%, transparent);
	}
	.os-window.light-mode .accent-chip {
		box-shadow: 0 0 8px var(--glow);
	}

</style>

import { desktop, type WindowState } from './windowStore.svelte';

export const MIN_W = 320;
export const MIN_H = 320;

type Dir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

/** Attach window-level listeners for the duration of a pointer gesture. */
function track(onMove: (ev: PointerEvent) => void) {
	function up() {
		window.removeEventListener('pointermove', onMove);
		window.removeEventListener('pointerup', up);
	}
	window.addEventListener('pointermove', onMove);
	window.addEventListener('pointerup', up);
}

/** Drag a window by its title bar. */
export function startWindowDrag(win: WindowState, e: PointerEvent) {
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

/** Resize a window from one of its edges/corners. */
export function startWindowResize(win: WindowState, e: PointerEvent, dir: Dir) {
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

/** Resize the docked side panel by dragging its left edge. */
export function startDockResize(e: PointerEvent) {
	if (e.button !== 0) return;
	e.stopPropagation();
	const sx = e.clientX;
	const ow = desktop.dockWidth;
	track((ev) => {
		desktop.setDockWidth(ow - (ev.clientX - sx));
	});
}

export const RESIZE_EDGES: { dir: Dir; cls: string }[] = [
	{ dir: 'n', cls: 'top-0 right-3 left-3 h-1.5 cursor-ns-resize' },
	{ dir: 's', cls: 'bottom-0 right-3 left-3 h-1.5 cursor-ns-resize' },
	{ dir: 'e', cls: 'top-3 right-0 bottom-3 w-1.5 cursor-ew-resize' },
	{ dir: 'w', cls: 'top-3 bottom-3 left-0 w-1.5 cursor-ew-resize' }
];

export const RESIZE_CORNERS: { dir: Dir; cls: string }[] = [
	{ dir: 'nw', cls: 'top-0 left-0 cursor-nwse-resize' },
	{ dir: 'ne', cls: 'top-0 right-0 cursor-nesw-resize' },
	{ dir: 'sw', cls: 'bottom-0 left-0 cursor-nesw-resize' },
	{ dir: 'se', cls: 'bottom-0 right-0 cursor-nwse-resize' }
];

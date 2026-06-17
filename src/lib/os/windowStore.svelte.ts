import { createContext } from 'svelte';

/** An icon the dock + titlebar know how to draw. */
export type IconType = 'leaf' | 'scroll' | 'orb' | 'map';

/** Static definition of an "app" that can live in a window. */
export interface AppDef {
	id: string;
	title: string;
	icon: IconType;
	/** Brand accent (hex) used for glow + titlebar tint. */
	accent: string;
	/** Translucent glow color for shadows. */
	glow: string;
	/** Initial window size. */
	w: number;
	h: number;
	/** Light-mode window (white background, dark text). Defaults to dark. */
	theme?: 'dark' | 'light';
}

/** The dock — each entry gets a launcher button + can spawn a window. */
export const APPS: AppDef[] = [
	{ id: 'leaf', title: 'Leaf', icon: 'leaf', accent: '#386d4f', glow: 'rgba(56, 109, 79, 0.45)', w: 420, h: 500, theme: 'light' },
	// { id: 'atlas', title: 'Atlas', icon: 'map', accent: '#ffc52a', glow: 'rgba(255, 197, 42, 0.5)', w: 480, h: 360 }
];

/** Live, per-window state. One of these is created each time a window opens. */
export class WindowState {
	readonly app: AppDef;
	x = $state(0);
	y = $state(0);
	width = $state(0);
	height = $state(0);
	z = $state(1);
	minimized = $state(false);

	constructor(app: AppDef, spawn: { x: number; y: number; z: number }) {
		this.app = app;
		this.x = spawn.x;
		this.y = spawn.y;
		this.width = app.w;
		this.height = app.h;
		this.z = spawn.z;
	}
}

/**
 * The reactive desktop. A single shared instance drives the dock and the
 * window layer — open/close/focus all flow through here so the UI stays live.
 */
export class WindowManager {
	windows = $state<WindowState[]>([]);
	#z = 10;
	#spawned = 0;

	/** Highest z currently handed out — a window matching it is "focused". */
	get topZ() {
		return this.#z;
	}

	isOpen(id: string) {
		return this.windows.some((w) => w.app.id === id);
	}

	find(id: string) {
		return this.windows.find((w) => w.app.id === id);
	}

	open(app: AppDef) {
		const existing = this.find(app.id);
		if (existing) {
			existing.minimized = false;
			this.focus(existing);
			return existing;
		}
		const offset = (this.#spawned++ % 6) * 30;
		const win = new WindowState(app, {
			x: 160 + offset,
			y: 90 + offset,
			z: ++this.#z
		});
		this.windows.push(win);
		return win;
	}

	close(id: string) {
		this.windows = this.windows.filter((w) => w.app.id !== id);
	}

	toggle(app: AppDef) {
		if (this.isOpen(app.id)) {
			this.close(app.id);
		} else {
			this.open(app);
		}
	}

	focus(win: WindowState) {
		if (win.z !== this.#z) {
			win.z = ++this.#z;
		}
	}
}

/** Shared desktop instance. */
export const desktop = new WindowManager();

/** Each <OSWindow> publishes its own WindowState so content can self-control. */
export const [getWindowContext, setWindowContext] = createContext<WindowState>();

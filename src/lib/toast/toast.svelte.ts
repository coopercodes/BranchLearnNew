import type { Component } from 'svelte';

export type ToastTone = 'success' | 'danger';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type ToastComponent = Component<any>;

export interface Toast {
	id: number;
	tone: ToastTone;
	/** Default chrome — ignored when `component` is set. */
	title?: string;
	message?: string;
	/** Render this instead, so a caller can own the whole card. */
	component?: ToastComponent;
	props?: Record<string, unknown>;
}

const DEFAULT_TTL = 4200;

/**
 * Global toast queue. `<Toaster />` is mounted once in the root layout, so any
 * route can call `toasts.success(...)` — or hand over a component of its own.
 */
class ToastStore {
	items = $state<Toast[]>([]);
	#nextId = 0;

	show(toast: Omit<Toast, 'id'>, ttl = DEFAULT_TTL): number {
		const id = ++this.#nextId;
		this.items = [...this.items, { ...toast, id }];
		if (ttl > 0) setTimeout(() => this.dismiss(id), ttl);
		return id;
	}

	success(title: string, message?: string, ttl?: number): number {
		return this.show({ title, message, tone: 'success' }, ttl);
	}

	danger(title: string, message?: string, ttl?: number): number {
		return this.show({ title, message, tone: 'danger' }, ttl);
	}

	/** Show a custom card. Props are spread into the component. */
	custom(
		component: ToastComponent,
		props: Record<string, unknown> = {},
		tone: ToastTone = 'success',
		ttl?: number
	): number {
		return this.show({ component, props, tone }, ttl);
	}

	dismiss(id: number) {
		this.items = this.items.filter((t) => t.id !== id);
	}

	clear() {
		this.items = [];
	}
}

export const toasts = new ToastStore();

// dev/inspect.ts — reflection helpers for the store inspector

export type ValueKind =
	| 'string'
	| 'number'
	| 'boolean'
	| 'null'
	| 'undefined'
	| 'date'
	| 'array'
	| 'map'
	| 'set'
	| 'object'
	| 'function';

export function kindOf(v: unknown): ValueKind {
	if (v === null) return 'null';
	if (v === undefined) return 'undefined';
	if (Array.isArray(v)) return 'array';
	if (v instanceof Date) return 'date';
	if (v instanceof Map) return 'map';
	if (v instanceof Set) return 'set';
	const t = typeof v;
	if (t === 'object') return 'object';
	return t as ValueKind;
}

export function isExpandable(v: unknown): boolean {
	const k = kindOf(v);
	return k === 'array' || k === 'object' || k === 'map' || k === 'set';
}

/**
 * Flatten any value into [key, value] entries.
 * For class instances (our stores), this also walks prototype getters so
 * $derived class fields — which compile to getters — show up alongside
 * $state fields. Functions are skipped.
 */
export function entriesOf(v: unknown): [string, unknown][] {
	if (Array.isArray(v)) return v.map((item, i) => [String(i), item]);
	if (v instanceof Map) return [...v.entries()].map(([k, val]) => [String(k), val]);
	if (v instanceof Set) return [...v].map((item, i) => [String(i), item]);

	if (typeof v === 'object' && v !== null) {
		const out: [string, unknown][] = [];
		const seen = new Set<string>();

		for (const [key, val] of Object.entries(v)) {
			if (typeof val === 'function') continue;
			out.push([key, val]);
			seen.add(key);
		}

		// Prototype getters ($derived fields on store classes)
		let proto = Object.getPrototypeOf(v);
		while (proto && proto !== Object.prototype) {
			for (const key of Object.getOwnPropertyNames(proto)) {
				if (key === 'constructor' || seen.has(key)) continue;
				const desc = Object.getOwnPropertyDescriptor(proto, key);
				if (!desc?.get) continue;
				try {
					const val = (v as Record<string, unknown>)[key];
					if (typeof val !== 'function') {
						out.push([key, val]);
						seen.add(key);
					}
				} catch {
					/* getter threw — skip */
				}
			}
			proto = Object.getPrototypeOf(proto);
		}
		return out;
	}
	return [];
}

/** Right-hand summary for expandable values: "32 in list", "4 fields", … */
export function summaryOf(v: unknown): string {
	switch (kindOf(v)) {
		case 'array': {
			const n = (v as unknown[]).length;
			return `${n} in list`;
		}
		case 'map': {
			const n = (v as Map<unknown, unknown>).size;
			return `${n} ${n === 1 ? 'entry' : 'entries'}`;
		}
		case 'set': {
			const n = (v as Set<unknown>).size;
			return `${n} in set`;
		}
		case 'object': {
			const n = entriesOf(v).length;
			return `${n} ${n === 1 ? 'field' : 'fields'}`;
		}
		default:
			return '';
	}
}

export function formatPrimitive(v: unknown): string {
	switch (kindOf(v)) {
		case 'string':
			return `"${v}"`;
		case 'number':
			return Number.isInteger(v as number)
				? String(v)
				: (v as number).toFixed(2);
		case 'boolean':
			return v ? 'true' : 'false';
		case 'null':
			return 'null';
		case 'undefined':
			return '—';
		case 'date':
			return (v as Date).toLocaleTimeString();
		default:
			return String(v);
	}
}
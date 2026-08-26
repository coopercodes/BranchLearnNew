import TrainingDummy from './TrainingDummy.svelte';
import TriangleGuy from './TriangleGuy.svelte';

/**
 * Every sprite is a component containing only the raw SVG child elements,
 * plus the square viewBox those elements were drawn in.
 *
 * @type {Record<string, { component: import('svelte').Component, viewBox: string }>}
 */
export const sprites = {
	'triangle-guy': { component: TriangleGuy, viewBox: '4.69 67.7 28 28' },
    'training-dummy': { component: TrainingDummy, viewBox: '14.18 15.05 76 76' }
};

/** Handy for demo pages / pickers. */
export const spriteTypes = Object.keys(sprites);
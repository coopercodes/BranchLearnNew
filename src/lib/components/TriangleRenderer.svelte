<script lang="ts" module>
	export type TriangleSelection = {
		kind: 'side' | 'angle';
		/** 'AB' for a side, 'B' for an angle. */
		name: string;
		/** '8.0 units' or '56°'. */
		value: string;
		/** True when this value is shown to the student as a "?" mystery mark. */
		hidden: boolean;
	};
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import MysteryMark from './MysteryMark.svelte';

	type Point = { x: number; y: number };

	const GRID_SIZE = 30;
	const width = 600;
	const height = 420;
	const VERTEX_NAMES = ['A', 'B', 'C'];
	const LABEL_OFFSET = 24;

	let {
		selected = $bindable(null),
		description = $bindable(''),
		onselect
	}: {
		selected?: TriangleSelection | null;
		/** Live plain-English summary of the triangle — this is what Leaf gets as context. */
		description?: string;
		onselect?: (selection: TriangleSelection) => void;
	} = $props();

	// Fixed right triangle (TriangleDesigner's first preset).
	const points: Point[] = [
		{ x: 120, y: 360 },
		{ x: 120, y: 120 },
		{ x: 480, y: 360 }
	];

	// One side and one angle are hidden behind mystery marks. Randomized on
	// mount (not at init) so server and client render the same initial HTML.
	let mysterySideIndex = $state(-1);
	let mysteryAngleIndex = $state(-1);
	let revealedSide = $state(false);
	let revealedAngle = $state(false);

	// Guessing a hidden value
	let guessInput = $state('');
	let guessResult = $state<'correct' | 'wrong' | null>(null);

	onMount(() => {
		mysterySideIndex = Math.floor(Math.random() * 3);
		mysteryAngleIndex = Math.floor(Math.random() * 3);
	});

	function distance(a: Point, b: Point) {
		return Math.hypot(b.x - a.x, b.y - a.y);
	}

	function formatLength(a: Point, b: Point) {
		return (distance(a, b) / GRID_SIZE).toFixed(1);
	}

	function midpoint(a: Point, b: Point) {
		return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
	}

	const centroid = {
		x: (points[0].x + points[1].x + points[2].x) / 3,
		y: (points[0].y + points[1].y + points[2].y) / 3
	};

	function outsideLabel(a: Point, b: Point) {
		const mid = midpoint(a, b);
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		const len = Math.hypot(dx, dy) || 1;
		let perp = { x: -dy / len, y: dx / len };

		const toMid = { x: mid.x - centroid.x, y: mid.y - centroid.y };
		if (perp.x * toMid.x + perp.y * toMid.y < 0) {
			perp = { x: -perp.x, y: -perp.y };
		}

		return { x: mid.x + perp.x * LABEL_OFFSET, y: mid.y + perp.y * LABEL_OFFSET };
	}

	function vertexLabelPos(p: Point) {
		const dx = p.x - centroid.x;
		const dy = p.y - centroid.y;
		const len = Math.hypot(dx, dy) || 1;
		return { x: p.x + (dx / len) * 18, y: p.y + (dy / len) * 18 };
	}

	const ARC_RADIUS = 22;
	const ARC_STEPS = 16;
	const RIGHT_ANGLE_SIZE = 16;
	const RIGHT_ANGLE_TOLERANCE = 1.5;

	function angleAt(p: Point, a: Point, b: Point) {
		const v1 = { x: a.x - p.x, y: a.y - p.y };
		const v2 = { x: b.x - p.x, y: b.y - p.y };
		const len1 = Math.hypot(v1.x, v1.y);
		const len2 = Math.hypot(v2.x, v2.y);
		const cos = (v1.x * v2.x + v1.y * v2.y) / (len1 * len2);
		const degrees = (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
		const isRight = Math.abs(degrees - 90) < RIGHT_ANGLE_TOLERANCE;

		const u1 = { x: v1.x / len1, y: v1.y / len1 };
		const u2 = { x: v2.x / len2, y: v2.y / len2 };
		const bisector = { x: u1.x + u2.x, y: u1.y + u2.y };
		const bisectorLen = Math.hypot(bisector.x, bisector.y) || 1;
		const label = {
			x: p.x + (bisector.x / bisectorLen) * 40,
			y: p.y + (bisector.y / bisectorLen) * 40
		};

		if (isRight) {
			const c1 = { x: p.x + u1.x * RIGHT_ANGLE_SIZE, y: p.y + u1.y * RIGHT_ANGLE_SIZE };
			const corner = {
				x: p.x + (u1.x + u2.x) * RIGHT_ANGLE_SIZE,
				y: p.y + (u1.y + u2.y) * RIGHT_ANGLE_SIZE
			};
			const c2 = { x: p.x + u2.x * RIGHT_ANGLE_SIZE, y: p.y + u2.y * RIGHT_ANGLE_SIZE };
			const arcPath = `M ${c1.x} ${c1.y} L ${corner.x} ${corner.y} L ${c2.x} ${c2.y}`;
			return { degrees, label, arcPath, isRight };
		}

		const angle1 = Math.atan2(u1.y, u1.x);
		const angle2 = Math.atan2(u2.y, u2.x);
		const twoPi = Math.PI * 2;
		let delta = (angle2 - angle1) % twoPi;
		if (delta > Math.PI) delta -= twoPi;
		if (delta < -Math.PI) delta += twoPi;

		let arcPath = `M ${p.x + u1.x * ARC_RADIUS} ${p.y + u1.y * ARC_RADIUS}`;
		for (let i = 1; i <= ARC_STEPS; i++) {
			const t = angle1 + (delta * i) / ARC_STEPS;
			arcPath += ` L ${p.x + Math.cos(t) * ARC_RADIUS} ${p.y + Math.sin(t) * ARC_RADIUS}`;
		}

		return { degrees, label, arcPath, isRight };
	}

	const segments = [
		[0, 1],
		[1, 2],
		[2, 0]
	].map(([i, j]) => ({
		name: `${VERTEX_NAMES[i]}${VERTEX_NAMES[j]}`,
		a: points[i],
		b: points[j],
		length: formatLength(points[i], points[j]),
		label: outsideLabel(points[i], points[j])
	}));

	const angles = [
		{ name: VERTEX_NAMES[0], ...angleAt(points[0], points[1], points[2]) },
		{ name: VERTEX_NAMES[1], ...angleAt(points[1], points[0], points[2]) },
		{ name: VERTEX_NAMES[2], ...angleAt(points[2], points[0], points[1]) }
	];

	const vertices = points.map((p, i) => ({
		name: VERTEX_NAMES[i],
		point: p,
		label: vertexLabelPos(p)
	}));

	function selectSide(index: number) {
		select({
			kind: 'side',
			name: segments[index].name,
			value: `${segments[index].length} units`,
			hidden: index === mysterySideIndex && !revealedSide
		});
	}

	function selectAngle(index: number) {
		select({
			kind: 'angle',
			name: angles[index].name,
			value: `${angles[index].degrees.toFixed(0)}°`,
			hidden: index === mysteryAngleIndex && !revealedAngle
		});
	}

	function select(selection: TriangleSelection) {
		selected = selection;
		guessInput = '';
		guessResult = null;
		onselect?.(selection);
	}

	/** Check a guess against the selected hidden value; a correct guess reveals it. */
	function checkGuess() {
		if (!selected?.hidden) return;
		const guess = parseFloat(guessInput);
		if (Number.isNaN(guess)) return;

		let correct: boolean;
		if (selected.kind === 'side') {
			correct = Math.abs(guess - parseFloat(segments[mysterySideIndex].length)) <= 0.2;
			if (correct) revealedSide = true;
		} else {
			correct = Math.abs(guess - angles[mysteryAngleIndex].degrees) <= 1.5;
			if (correct) revealedAngle = true;
		}

		guessResult = correct ? 'correct' : 'wrong';
		if (correct) {
			// Re-select as no longer hidden so the hint + Leaf context update too.
			selected = { ...selected, hidden: false };
		}
	}

	// Leaf always knows the full triangle — including the values the student can't see.
	let summary = $derived.by(() => {
		const sideText = segments.map((s) => `${s.name} = ${s.length} units`).join(', ');
		const angleText = angles.map((a) => `angle ${a.name} = ${a.degrees.toFixed(0)}°`).join(', ');
		const right = angles.find((a) => a.isRight);
		let text =
			`Triangle ABC with sides ${sideText} and angles ${angleText}.` +
			(right ? ` It is a right triangle (right angle at ${right.name}).` : '');
		if (mysterySideIndex >= 0 && mysteryAngleIndex >= 0) {
			text +=
				` Note: side ${segments[mysterySideIndex].name} and angle ${angles[mysteryAngleIndex].name}` +
				` are HIDDEN from the student (shown as "?" marks). Never state a hidden value outright,` +
				` and never state facts that give one away (e.g. naming which angle is the right angle when` +
				` that angle is hidden) — instead guide the student to work hidden values out from the visible ones.`;
		}
		return text;
	});

	$effect(() => {
		description = summary;
	});
</script>

<div class="flex flex-col gap-2">
	<svg
		class="triangle-svg"
		{width}
		{height}
		viewBox="0 0 {width} {height}"
		role="img"
		aria-label="Triangle ABC — click a side or an angle to ask Leaf about it"
	>
		{#each segments as segment, i (segment.name)}
			{@const isSelected = selected?.kind === 'side' && selected.name === segment.name}
			<!-- Visible side -->
			<line
				x1={segment.a.x}
				y1={segment.a.y}
				x2={segment.b.x}
				y2={segment.b.y}
				stroke={isSelected ? '#386d4f' : 'rgba(255, 140, 0, 1)'}
				stroke-width={isSelected ? 5 : 2}
				stroke-linecap="round"
			/>
			<!-- Wide invisible hit area so sides are easy to click -->
			<line
				x1={segment.a.x}
				y1={segment.a.y}
				x2={segment.b.x}
				y2={segment.b.y}
				stroke="transparent"
				stroke-width="22"
				class="cursor-pointer focus:outline-none"
				role="button"
				tabindex="0"
				aria-label="Side {segment.name}"
				onclick={() => selectSide(i)}
				onkeydown={(e) => e.key === 'Enter' && selectSide(i)}
			/>
			{#if i === mysterySideIndex}
				<MysteryMark x={segment.label.x} y={segment.label.y} interactive label="Hidden side {segment.name}" onreveal={() => selectSide(i)} />
			{:else}
				<text
					x={segment.label.x}
					y={segment.label.y}
					text-anchor="middle"
					dominant-baseline="middle"
					dy="4"
					font-size="15"
					font-weight="700"
					fill={isSelected ? '#386d4f' : 'black'}>{segment.name} = {segment.length}</text
				>
			{/if}
		{/each}

		{#each angles as { name, degrees, label, arcPath, isRight }, i (name)}
			{@const isSelected = selected?.kind === 'angle' && selected.name === name}
			{#if i === mysteryAngleIndex}
				<MysteryMark x={label.x} y={label.y} interactive label="Hidden angle {name}" onreveal={() => selectAngle(i)} />
			{:else}
				<path
					d={arcPath}
					fill="none"
					stroke={isSelected ? '#386d4f' : isRight ? '#e53935' : 'rgba(255, 140, 0, 1)'}
					stroke-width={isSelected ? 3 : isRight ? 2 : 1.5}
				/>
				<text
					x={label.x}
					y={label.y}
					text-anchor="middle"
					dominant-baseline="middle"
					dy="4"
					font-size="12"
					font-weight="700"
					fill={isSelected ? '#386d4f' : 'black'}>{degrees.toFixed(0)}°</text
				>
				<!-- Invisible hit area so angles are easy to click -->
				<circle
					cx={label.x}
					cy={label.y}
					r="20"
					fill="transparent"
					class="cursor-pointer focus:outline-none"
					role="button"
					tabindex="0"
					aria-label="Angle {name}"
					onclick={() => selectAngle(i)}
					onkeydown={(e) => e.key === 'Enter' && selectAngle(i)}
				/>
			{/if}
		{/each}

		{#each vertices as { name, point, label } (name)}
			<circle cx={point.x} cy={point.y} r="4" fill="rgba(255, 140, 0, 1)" />
			<text
				x={label.x}
				y={label.y}
				text-anchor="middle"
				dominant-baseline="middle"
				dy="4"
				font-size="14"
				font-weight="700"
				fill="black">{name}</text
			>
		{/each}
	</svg>

	<p class="hint">
		{#if selected}
			{selected.kind === 'side' ? 'Side' : 'Angle'} <strong>{selected.name}</strong>
			{selected.hidden ? '(hidden value)' : `(${selected.value})`} selected — ask Leaf about it!
		{:else}
			Click a side or an angle — the 🔍 "?" marks are hidden values Leaf can help you figure out.
		{/if}
	</p>
</div>

<style>
	.triangle-svg {
		width: 600px;
		height: 420px;
		border: 1px solid rgba(255, 140, 0, 1);
		border-radius: 2px;
		background-color: white;
		background-image:
			linear-gradient(to right, #e8e8e8 1px, transparent 1px),
			linear-gradient(to bottom, #e8e8e8 1px, transparent 1px);
		background-size: 30px 30px;
		background-position: -1px -1px;
	}

	.hint {
		font-size: 13px;
		color: #555;
	}
</style>

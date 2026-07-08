<script lang="ts">
	import { onMount } from "svelte";
	import MysteryMark from "./MysteryMark.svelte";

	type Point = { x: number; y: number };

	const GRID_SIZE = 30;
	const width = 600;
	const height = 420;

	const PRESET_TRIANGLES: Point[][] = [
		[
			{ x: 120, y: 360 },
			{ x: 120, y: 120 },
			{ x: 480, y: 360 }
		],
		[
			{ x: 80, y: 340 },
			{ x: 260, y: 90 },
			{ x: 500, y: 300 }
		],
		[
			{ x: 150, y: 340 },
			{ x: 420, y: 140 },
			{ x: 420, y: 340 }
		],
		[
			{ x: 150, y: 330 },
			{ x: 330, y: 90 },
			{ x: 480, y: 330 }
		]
	];

	let triangleIndex = $state(0);
	let autoplay = $state(true);
	let points: Point[] = $state(PRESET_TRIANGLES[0]);
	let intervalId: ReturnType<typeof setInterval> | undefined;

	let mysterySideIndex = $state(0);
	let mysteryAngleIndex = $state(0);
	let revealedSide = $state(false);
	let revealedAngle = $state(false);

	function randomizeMystery() {
		mysterySideIndex = Math.floor(Math.random() * 3);
		mysteryAngleIndex = Math.floor(Math.random() * 3);
		revealedSide = false;
		revealedAngle = false;
	}

	function cycleTriangle() {
		triangleIndex = (triangleIndex + 1) % PRESET_TRIANGLES.length;
		points = PRESET_TRIANGLES[triangleIndex];
		randomizeMystery();
	}

	onMount(() => {
		randomizeMystery();
		intervalId = setInterval(cycleTriangle, 3500);
		return () => clearInterval(intervalId);
	});

	function placePoint(e: MouseEvent) {
		if (autoplay) {
			autoplay = false;
			clearInterval(intervalId);
		}

		const target = e.currentTarget as SVGSVGElement;
		const rect = target.getBoundingClientRect();
		const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };

		if (points.length >= 3) {
			points = [point];
		} else {
			points = [...points, point];
			if (points.length === 3) {
				randomizeMystery();
			}
		}
	}

	function clear() {
		points = [];
	}

	function distance(a: Point, b: Point) {
		return Math.hypot(b.x - a.x, b.y - a.y);
	}

	function formatLength(a: Point, b: Point) {
		return (distance(a, b) / GRID_SIZE).toFixed(1);
	}

	function midpoint(a: Point, b: Point) {
		return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
	}

	const VERTEX_NAMES = ["A", "B", "C"];
	const LABEL_OFFSET = 24;

	function outsideLabel(a: Point, b: Point, centroid: Point | null) {
		const mid = midpoint(a, b);
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		const len = Math.hypot(dx, dy) || 1;
		let perp = { x: -dy / len, y: dx / len };

		if (centroid) {
			const toMid = { x: mid.x - centroid.x, y: mid.y - centroid.y };
			if (perp.x * toMid.x + perp.y * toMid.y < 0) {
				perp = { x: -perp.x, y: -perp.y };
			}
		}

		return { x: mid.x + perp.x * LABEL_OFFSET, y: mid.y + perp.y * LABEL_OFFSET };
	}

	function centroidOf(pts: Point[]) {
		return { x: (pts[0].x + pts[1].x + pts[2].x) / 3, y: (pts[0].y + pts[1].y + pts[2].y) / 3 };
	}

	let segments = $derived(
		points.length < 2
			? []
			: points.length === 2
				? [
						{
							a: points[0],
							b: points[1],
							label: outsideLabel(points[0], points[1], null)
						}
					]
				: (() => {
						const centroid = centroidOf(points);
						return [
							{
								a: points[0],
								b: points[1],
								label: outsideLabel(points[0], points[1], centroid)
							},
							{
								a: points[1],
								b: points[2],
								label: outsideLabel(points[1], points[2], centroid)
							},
							{
								a: points[2],
								b: points[0],
								label: outsideLabel(points[2], points[0], centroid)
							}
						];
					})()
	);

	function vertexLabelPos(p: Point, pts: Point[]) {
		if (pts.length === 3) {
			const centroid = centroidOf(pts);
			const dx = p.x - centroid.x;
			const dy = p.y - centroid.y;
			const len = Math.hypot(dx, dy) || 1;
			return { x: p.x + (dx / len) * 18, y: p.y + (dy / len) * 18 };
		}
		return { x: p.x - 14, y: p.y - 14 };
	}

	let vertices = $derived(
		points.map((p, i) => ({ name: VERTEX_NAMES[i], point: p, label: vertexLabelPos(p, points) }))
	);

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

	let angles = $derived(
		points.length === 3
			? [
					{ name: VERTEX_NAMES[0], ...angleAt(points[0], points[1], points[2]) },
					{ name: VERTEX_NAMES[1], ...angleAt(points[1], points[0], points[2]) },
					{ name: VERTEX_NAMES[2], ...angleAt(points[2], points[0], points[1]) }
				]
			: []
	);
</script>

{#snippet mysteryMark(x: number, y: number, onReveal: () => void)}
	<MysteryMark {x} {y} interactive onreveal={onReveal} />
{/snippet}

<div class="graph-wrapper">
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<svg
		class="graph-container"
		{width}
		{height}
		viewBox="0 0 {width} {height}"
		role="img"
		aria-label="Click to place points and draw triangle sides"
		onclick={placePoint}
	>
		{#each segments as { a, b, label }, i (i)}
			<line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(255, 140, 0, 1)" stroke-width="2" />
			{#if i === mysterySideIndex && !revealedSide}
				{@render mysteryMark(label.x, label.y, () => (revealedSide = true))}
			{:else}
				<text
					x={label.x}
					y={label.y}
					text-anchor="middle"
					dominant-baseline="middle"
					dy="4"
					font-size="15"
					font-weight="700"
					fill="black">{formatLength(a, b)}</text
				>
			{/if}
		{/each}

		{#each angles as { name, degrees, label, arcPath, isRight }, i (name)}
			{#if i === mysteryAngleIndex && !revealedAngle}
				{@render mysteryMark(label.x, label.y, () => (revealedAngle = true))}
			{:else if isRight}
				<path d={arcPath} fill="none" stroke="#e53935" stroke-width="2" />
				{#if i === mysteryAngleIndex}
					<text
						x={label.x}
						y={label.y}
						text-anchor="middle"
						dominant-baseline="middle"
						dy="4"
						font-size="12"
						font-weight="700"
						fill="black">90°</text
					>
				{/if}
			{:else}
				<path d={arcPath} fill="none" stroke="rgba(255, 140, 0, 1)" stroke-width="1.5" />
				<text
					x={label.x}
					y={label.y}
					text-anchor="middle"
					dominant-baseline="middle"
					dy="4"
					font-size="12"
					font-weight="700"
					fill="black">{degrees.toFixed(0)}°</text
				>
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

	<div class="controls">
		<span class="hint">
			{#if autoplay}
				Auto-cycling demo triangles — click anywhere to draw your own
			{:else if points.length === 0}
				Click to place the first point
			{:else if points.length < 3}
				Click to place point {points.length + 1} of 3
			{:else}
				Triangle complete — click anywhere to start a new one
			{/if}
		</span>
		{#if points.length > 0}
			<button type="button" onclick={clear}>Clear</button>
		{/if}
	</div>
	<p class="mystery-hint">🔍 Click the glowing "?" marks to reveal the hidden side and angle!</p>
</div>

<style>
	.graph-wrapper {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.graph-container {
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
		cursor: crosshair;
	}

	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 13px;
		color: #555;
	}

	.mystery-hint {
		margin: 0;
		font-size: 12px;
		color: #8a5a00;
	}

	button {
		border: 1px solid rgba(255, 140, 0, 1);
		background: white;
		color: rgba(255, 140, 0, 1);
		border-radius: 4px;
		padding: 4px 10px;
		font-size: 12px;
		cursor: pointer;
	}

	button:hover {
		background: rgba(255, 140, 0, 0.1);
	}

</style>

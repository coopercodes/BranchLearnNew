<script lang="ts">
	import type { SideName, TriangleSpec } from '../panel-content';

	// Purpose-built figure for triangle panels: a fixed right triangle (right
	// angle at C) rendered from a TriangleSpec — θ position, side labels, known
	// angles, and an optional gold highlight. Purely presentational.
	let { spec }: { spec: TriangleSpec } = $props();

	type Point = { x: number; y: number };

	const WIDTH = 600;
	const HEIGHT = 400;

	// A above the right angle, B out to the right — CA and CB are the legs.
	const A: Point = { x: 140, y: 78 };
	const C: Point = { x: 140, y: 330 };
	const B: Point = { x: 520, y: 330 };
	const VERTICES: Record<'A' | 'B' | 'C', Point> = { A, B, C };

	const SIDES: { name: SideName; a: Point; b: Point }[] = [
		{ name: 'AB', a: A, b: B },
		{ name: 'BC', a: B, b: C },
		{ name: 'CA', a: C, b: A }
	];

	const centroid: Point = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };

	/** Label position pushed outward from the triangle, perpendicular to the side. */
	function sideLabelPos(a: Point, b: Point, offset = 26): Point {
		const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		const len = Math.hypot(dx, dy) || 1;
		let perp = { x: -dy / len, y: dx / len };
		const toMid = { x: mid.x - centroid.x, y: mid.y - centroid.y };
		if (perp.x * toMid.x + perp.y * toMid.y < 0) perp = { x: -perp.x, y: -perp.y };
		return { x: mid.x + perp.x * offset, y: mid.y + perp.y * offset };
	}

	function unit(from: Point, to: Point): Point {
		const dx = to.x - from.x;
		const dy = to.y - from.y;
		const len = Math.hypot(dx, dy) || 1;
		return { x: dx / len, y: dy / len };
	}

	/** Arc between the two sides meeting at `p`, plus a label spot on the bisector. */
	function angleArc(p: Point, toward1: Point, toward2: Point, radius = 34) {
		const u1 = unit(p, toward1);
		const u2 = unit(p, toward2);

		const a1 = Math.atan2(u1.y, u1.x);
		const a2 = Math.atan2(u2.y, u2.x);
		const twoPi = Math.PI * 2;
		let delta = (a2 - a1) % twoPi;
		if (delta > Math.PI) delta -= twoPi;
		if (delta < -Math.PI) delta += twoPi;

		const steps = 16;
		let path = `M ${p.x + u1.x * radius} ${p.y + u1.y * radius}`;
		for (let i = 1; i <= steps; i++) {
			const t = a1 + (delta * i) / steps;
			path += ` L ${p.x + Math.cos(t) * radius} ${p.y + Math.sin(t) * radius}`;
		}

		const bis = { x: u1.x + u2.x, y: u1.y + u2.y };
		const bisLen = Math.hypot(bis.x, bis.y) || 1;
		const label = {
			x: p.x + (bis.x / bisLen) * (radius + 26),
			y: p.y + (bis.y / bisLen) * (radius + 26)
		};
		return { path, label };
	}

	// Right-angle square at C.
	const RA = 18;
	const raU1 = unit(C, A);
	const raU2 = unit(C, B);
	const rightAnglePath =
		`M ${C.x + raU1.x * RA} ${C.y + raU1.y * RA}` +
		` L ${C.x + (raU1.x + raU2.x) * RA} ${C.y + (raU1.y + raU2.y) * RA}` +
		` L ${C.x + raU2.x * RA} ${C.y + raU2.y * RA}`;

	// θ arc at whichever acute vertex the spec puts it.
	let thetaArc = $derived.by(() => {
		const p = VERTICES[spec.theta];
		const others = (['A', 'B', 'C'] as const).filter((v) => v !== spec.theta);
		return angleArc(p, VERTICES[others[0]], VERTICES[others[1]]);
	});

	let thetaText = $derived.by(() => {
		const known = spec.angles?.[spec.theta];
		return known ? `θ = ${known}` : 'θ';
	});

	/** Angle labels for non-θ acute vertices the spec declares. */
	let otherAngles = $derived(
		(['A', 'B'] as const)
			.filter((v) => v !== spec.theta && spec.angles?.[v])
			.map((v) => {
				const others = (['A', 'B', 'C'] as const).filter((o) => o !== v);
				return {
					text: spec.angles![v]!,
					arc: angleArc(VERTICES[v], VERTICES[others[0]], VERTICES[others[1]])
				};
			})
	);

	const vertexLabels = (['A', 'B', 'C'] as const).map((name) => {
		const p = VERTICES[name];
		const dx = p.x - centroid.x;
		const dy = p.y - centroid.y;
		const len = Math.hypot(dx, dy) || 1;
		return { name, point: p, label: { x: p.x + (dx / len) * 20, y: p.y + (dy / len) * 20 } };
	});
</script>

<svg
	class="triangle-svg"
	viewBox="0 0 {WIDTH} {HEIGHT}"
	role="img"
	aria-label="Right triangle ABC with the right angle at C and θ at vertex {spec.theta}"
>
	{#each SIDES as side (side.name)}
		{@const highlighted = spec.highlight === side.name}
		{@const label = spec.sides?.[side.name]}
		<line
			x1={side.a.x}
			y1={side.a.y}
			x2={side.b.x}
			y2={side.b.y}
			stroke={highlighted ? '#ffc52a' : 'rgba(255, 140, 0, 1)'}
			stroke-width={highlighted ? 6 : 2.5}
			stroke-linecap="round"
		/>
		{#if label}
			{@const pos = sideLabelPos(side.a, side.b)}
			<text
				x={pos.x}
				y={pos.y}
				text-anchor="middle"
				dominant-baseline="middle"
				font-size="17"
				font-weight="700"
				fill={highlighted ? '#b8860b' : 'black'}>{label}</text
			>
		{/if}
	{/each}

	<!-- Right angle at C -->
	<path d={rightAnglePath} fill="none" stroke="#e53935" stroke-width="2" />

	<!-- θ -->
	<path d={thetaArc.path} fill="none" stroke="#386d4f" stroke-width="2.5" />
	<text
		x={thetaArc.label.x}
		y={thetaArc.label.y}
		text-anchor="middle"
		dominant-baseline="middle"
		font-size="16"
		font-weight="700"
		fill="#386d4f">{thetaText}</text
	>

	{#each otherAngles as other (other.text)}
		<path d={other.arc.path} fill="none" stroke="rgba(255, 140, 0, 1)" stroke-width="1.5" />
		<text
			x={other.arc.label.x}
			y={other.arc.label.y}
			text-anchor="middle"
			dominant-baseline="middle"
			font-size="13"
			font-weight="700"
			fill="black">{other.text}</text
		>
	{/each}

	{#each vertexLabels as vertex (vertex.name)}
		<circle cx={vertex.point.x} cy={vertex.point.y} r="4" fill="rgba(255, 140, 0, 1)" />
		<text
			x={vertex.label.x}
			y={vertex.label.y}
			text-anchor="middle"
			dominant-baseline="middle"
			font-size="14"
			font-weight="700"
			fill="black">{vertex.name}</text
		>
	{/each}
</svg>

<style>
	.triangle-svg {
		width: 100%;
		max-width: 560px;
		height: auto;
		border: 1px solid rgba(255, 140, 0, 1);
		border-radius: 2px;
		background-color: white;
		background-image:
			linear-gradient(to right, #e8e8e8 1px, transparent 1px),
			linear-gradient(to bottom, #e8e8e8 1px, transparent 1px);
		background-size: 30px 30px;
		background-position: -1px -1px;
	}
</style>

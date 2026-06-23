<script lang="ts">
	import { onMount } from 'svelte';

	interface Point {
		x: number;
		y: number;
	}

	interface TriangleData {
		name: string;
		sides?: [number, number, number];
		angles?: [number, number, number];
	}

	const width = 700;
	const height = 400;
	const gridSize = 25;
	const orangeColor = '#FF6600';
	const lightOrangeColor = '#FFB84D';

	const triangleDefinitions: TriangleData[] = [
		{ name: 'Equilateral', sides: [120, 120, 120] },
		{ name: 'Right Triangle', angles: [90, 60, 30] },
		{ name: 'Isosceles', sides: [100, 100, 140] },
		{ name: 'Scalene', sides: [80, 110, 140] },
		{ name: 'Obtuse', angles: [120, 35, 25] }
	];

	let currentTriangleIndex = 0;
	let triangle: [Point, Point, Point] = [
		{ x: 350, y: 100 },
		{ x: 150, y: 350 },
		{ x: 550, y: 350 }
	];

	function degreesToRadians(degrees: number): number {
		return (degrees * Math.PI) / 180;
	}

	function generateTriangleFromSides(sides: [number, number, number]): [Point, Point, Point] {
		const [a, b, c] = sides;
		const scale = 1.5;

		const p1: Point = { x: width / 2 - (c * scale) / 2, y: height - 80 };
		const p2: Point = { x: width / 2 + (c * scale) / 2, y: height - 80 };

		const cosAngleA = (b * b + c * c - a * a) / (2 * b * c);
		const angleA = Math.acos(Math.max(-1, Math.min(1, cosAngleA)));

		const p3: Point = {
			x: p1.x + b * scale * Math.cos(angleA),
			y: p1.y - b * scale * Math.sin(angleA)
		};

		return [p3, p1, p2];
	}

	function generateTriangleFromAngles(angles: [number, number, number]): [Point, Point, Point] {
		const [angleA, angleB, angleC] = angles;
		const sideLength = 130;
		const scale = 1.2;

		const p1: Point = { x: width / 2 - (sideLength * scale) / 2, y: height - 80 };
		const p2: Point = { x: width / 2 + (sideLength * scale) / 2, y: height - 80 };

		const radianA = degreesToRadians(angleA);
		const p3: Point = {
			x: p1.x + sideLength * scale * Math.cos(radianA),
			y: p1.y - sideLength * scale * Math.sin(radianA)
		};

		return [p3, p1, p2];
	}

	function generateTriangleFromData(data: TriangleData): [Point, Point, Point] {
		if (data.sides) {
			return generateTriangleFromSides(data.sides);
		} else if (data.angles) {
			return generateTriangleFromAngles(data.angles);
		}
		return triangle;
	}

	function generateGridLines() {
		const lines = [];
		for (let x = 0; x <= width; x += gridSize) {
			lines.push({ x1: x, y1: 0, x2: x, y2: height });
		}
		for (let y = 0; y <= height; y += gridSize) {
			lines.push({ x1: 0, y1: y, x2: width, y2: y });
		}
		return lines;
	}

	const gridLines = generateGridLines();

	function getTrianglePathD() {
		const [p1, p2, p3] = triangle;
		return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} Z`;
	}

	function cycleTriangle() {
		currentTriangleIndex = (currentTriangleIndex + 1) % triangleDefinitions.length;
		triangle = generateTriangleFromData(triangleDefinitions[currentTriangleIndex]);
		updateUI();
	}

	function updateUI() {
		// Update triangle name
		const nameEl = document.querySelector('[data-triangle-name]');
		if (nameEl) {
			nameEl.textContent = triangleDefinitions[currentTriangleIndex].name;
		}

		// Update SVG path
		const path = document.querySelector('[data-triangle-path]');
		if (path) {
			path.setAttribute('d', getTrianglePathD());
		}

		// Update circle positions
		const circles = document.querySelectorAll('[data-triangle-vertex]');
		triangle.forEach((point, i) => {
			if (circles[i]) {
				circles[i].setAttribute('cx', String(point.x));
				circles[i].setAttribute('cy', String(point.y));
			}
		});
	}

	// Initialize and start auto-cycling
	onMount(() => {
		const interval = setInterval(cycleTriangle, 3000);
		return () => clearInterval(interval);
	});
</script>

<div class="flex flex-col items-center justify-center p-8 gap-4">
	<svg {width} {height} class="border border-gray-200 shadow-lg" viewBox="0 0 {width} {height}">
		<!-- White background -->
		<rect {width} {height} fill="white" />

		<!-- Grid lines -->
		<g stroke="#E5E7EB" stroke-width="1" stroke-linecap="round">
			{#each gridLines as line (line.x1 + line.y1)}
				<line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
			{/each}
		</g>

		<!-- Triangle -->
		<path
			data-triangle-path
			d={getTrianglePathD()}
			fill={lightOrangeColor}
			fill-opacity="0.4"
			stroke={orangeColor}
			stroke-width="3"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>

		<!-- Triangle vertices -->
		<g fill={orangeColor}>
			{#each triangle as point (point.x + point.y)}
				<circle data-triangle-vertex cx={point.x} cy={point.y} r="4" />
			{/each}
		</g>
	</svg>

	<div class="flex items-center gap-4">
		<p data-triangle-name class="text-lg font-semibold text-gray-800">
			{triangleDefinitions[currentTriangleIndex].name}
		</p>
		<button
			onclick={cycleTriangle}
			class="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
		>
			Next Triangle
		</button>
	</div>
</div>

<style>
	:global(body) {
		background-color: #f9fafb;
	}
</style>

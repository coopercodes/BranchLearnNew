<!--
  Atlas.svelte — a LOTRO-style hierarchical map.

  World  →  Zone  →  Region. No dragging, no free panning: you are always
  standing somewhere, and you either step to a neighbour (N/S/E/W), zoom out
  to the thing that contains you, or zoom in to something inside you.

  Svelte 5 runes. Drop it in and use: <Atlas />  or  <Atlas start={['middle-earth','eriador','bree-land']} />
-->

<script>
	/* ─────────────────────────  the map  ───────────────────────── */
	// area = {x, y, w, h} in the parent's grid. grid = size of this node's own map.

	const MAP = {
		id: 'middle-earth',
		name: 'Middle-earth',
		kind: 'world',
		blurb: 'Ten lands between the Sundering Sea and the ash of the east.',
		grid: { cols: 12, rows: 8 },
		children: [
			{
				id: 'forodwaith', name: 'Forodwaith', kind: 'zone', terrain: 'ice',
				blurb: 'The cold that outlived the war that made it.',
				area: { x: 1, y: 0, w: 7, h: 1 }, grid: { cols: 3, rows: 2 },
				children: [
					{ id: 'ice-bay', name: 'Ice Bay', kind: 'region', terrain: 'water', levels: '44–50', blurb: 'Pack ice grinding against a black shore.', area: { x: 0, y: 0, w: 1, h: 2 } },
					{ id: 'forochel', name: 'Forochel', kind: 'region', terrain: 'ice', levels: '44–50', blurb: 'Lossoth camps, seal-oil lamps, and very long nights.', area: { x: 1, y: 0, w: 2, h: 1 } },
					{ id: 'northern-waste', name: 'Northern Waste', kind: 'region', terrain: 'ice', levels: '50+', blurb: 'Nothing grows. Something still hunts.', area: { x: 1, y: 1, w: 2, h: 1 } }
				]
			},
			{
				id: 'lindon', name: 'Lindon', kind: 'zone', terrain: 'forest',
				blurb: 'The last coast, and the harbours that empty it.',
				area: { x: 0, y: 1, w: 2, h: 3 }, grid: { cols: 3, rows: 3 },
				children: [
					{ id: 'forlindon', name: 'Forlindon', kind: 'region', terrain: 'forest', levels: '30–40', blurb: 'Salt woods north of the firth.', area: { x: 0, y: 0, w: 3, h: 1 } },
					{ id: 'mithlond', name: 'Mithlond', kind: 'region', terrain: 'city', levels: '—', blurb: 'Grey quays. Ships leave; none come back.', area: { x: 0, y: 1, w: 1, h: 1 } },
					{ id: 'ered-luin', name: 'Ered Luin', kind: 'region', terrain: 'mountain', levels: '1–20', blurb: 'Dwarf-halls, blue stone, and a very patient forge.', area: { x: 1, y: 1, w: 2, h: 1 } },
					{ id: 'harlindon', name: 'Harlindon', kind: 'region', terrain: 'forest', levels: '30–40', blurb: 'Quiet southern shore, quieter people.', area: { x: 0, y: 2, w: 3, h: 1 } }
				]
			},
			{
				id: 'eriador', name: 'Eriador', kind: 'zone', terrain: 'plain',
				blurb: 'Empty roads between the ruins of a kingdom nobody rebuilt.',
				area: { x: 2, y: 1, w: 4, h: 3 }, grid: { cols: 6, rows: 4 },
				children: [
					{ id: 'evendim', name: 'Evendim', kind: 'region', terrain: 'water', levels: '20–30', blurb: 'A lake with a drowned city in it.', area: { x: 0, y: 0, w: 2, h: 1 } },
					{ id: 'angmar', name: 'Angmar', kind: 'region', terrain: 'shadow', levels: '40–50', blurb: 'Old malice, kept cold so it lasts.', area: { x: 2, y: 0, w: 2, h: 1 } },
					{ id: 'ettenmoors', name: 'Ettenmoors', kind: 'region', terrain: 'mountain', levels: '40–50', blurb: 'Moorland that changes hands most evenings.', area: { x: 4, y: 0, w: 2, h: 1 } },
					{ id: 'the-shire', name: 'The Shire', kind: 'region', terrain: 'plain', levels: '5–20', blurb: 'Hedges, mills, and a strong view on mealtimes.', area: { x: 0, y: 1, w: 2, h: 1 } },
					{ id: 'north-downs', name: 'North Downs', kind: 'region', terrain: 'plain', levels: '25–35', blurb: 'Chalk ridges and one watchtower worth holding.', area: { x: 2, y: 1, w: 2, h: 1 } },
					{ id: 'trollshaws', name: 'Trollshaws', kind: 'region', terrain: 'forest', levels: '30–40', blurb: 'Boulders that snore.', area: { x: 4, y: 1, w: 2, h: 1 } },
					{ id: 'tower-hills', name: 'Tower Hills', kind: 'region', terrain: 'mountain', levels: '15–25', blurb: 'Three towers, one very long view west.', area: { x: 0, y: 2, w: 1, h: 1 } },
					{ id: 'bree-land', name: 'Bree-land', kind: 'region', terrain: 'plain', levels: '10–20', blurb: 'Crossroads of the west: ale, rain, rumour.', area: { x: 1, y: 2, w: 2, h: 1 } },
					{ id: 'lone-lands', name: 'Lone-lands', kind: 'region', terrain: 'plain', levels: '25–32', blurb: 'Broken walls, long road, wolves at dusk.', area: { x: 3, y: 2, w: 2, h: 1 } },
					{ id: 'rivendell', name: 'Rivendell', kind: 'region', terrain: 'city', levels: '35–45', blurb: 'A hidden valley that runs on song and long counsel.', area: { x: 5, y: 2, w: 1, h: 1 } },
					{ id: 'swanfleet', name: 'Swanfleet', kind: 'region', terrain: 'swamp', levels: '40–48', blurb: 'Reeds where the river forgot its bed.', area: { x: 1, y: 3, w: 2, h: 1 } },
					{ id: 'eregion', name: 'Eregion', kind: 'region', terrain: 'forest', levels: '45–50', blurb: 'Holly woods over the graves of smiths.', area: { x: 3, y: 3, w: 2, h: 1 } }
				]
			},
			{
				id: 'misty-mountains', name: 'Misty Mountains', kind: 'zone', terrain: 'mountain',
				blurb: 'A wall with three ways through, all of them bad.',
				area: { x: 6, y: 1, w: 1, h: 3 }, grid: { cols: 3, rows: 3 },
				children: [
					{ id: 'high-pass', name: 'High Pass', kind: 'region', terrain: 'mountain', levels: '35–45', blurb: 'Goblin-gate country. Keep moving.', area: { x: 0, y: 0, w: 3, h: 1 } },
					{ id: 'moria', name: 'Moria', kind: 'region', terrain: 'shadow', levels: '50–58', blurb: 'Delved too greedily. Still delving.', area: { x: 0, y: 1, w: 3, h: 1 } },
					{ id: 'redhorn', name: 'Redhorn Pass', kind: 'region', terrain: 'mountain', levels: '45–52', blurb: 'Snow with an opinion about travellers.', area: { x: 0, y: 2, w: 3, h: 1 } }
				]
			},
			{
				id: 'rhovanion', name: 'Rhovanion', kind: 'zone', terrain: 'forest',
				blurb: 'Wilderland: three rivers, one mountain of gold, one wood that lies.',
				area: { x: 7, y: 1, w: 5, h: 3 }, grid: { cols: 5, rows: 4 },
				children: [
					{ id: 'grey-mountains', name: 'Grey Mountains', kind: 'region', terrain: 'mountain', levels: '55–62', blurb: 'Abandoned holds, and the reason they were abandoned.', area: { x: 0, y: 0, w: 3, h: 1 } },
					{ id: 'withered-heath', name: 'Withered Heath', kind: 'region', terrain: 'ash', levels: '60+', blurb: 'Where the worms go to hatch.', area: { x: 3, y: 0, w: 2, h: 1 } },
					{ id: 'vales-of-anduin', name: 'Vales of Anduin', kind: 'region', terrain: 'plain', levels: '50–58', blurb: 'River meadows under bear-warded eaves.', area: { x: 0, y: 1, w: 1, h: 2 } },
					{ id: 'north-mirkwood', name: 'North Mirkwood', kind: 'region', terrain: 'forest', levels: '58–65', blurb: 'Elven halls, barrels, and a river best not drunk from.', area: { x: 1, y: 1, w: 2, h: 1 } },
					{ id: 'erebor', name: 'Erebor', kind: 'region', terrain: 'mountain', levels: '60–70', blurb: 'A hill with a treasury inside it.', area: { x: 3, y: 1, w: 1, h: 1 } },
					{ id: 'dale', name: 'Dale', kind: 'region', terrain: 'city', levels: '60–70', blurb: 'Market town rebuilt on a burnt one.', area: { x: 4, y: 1, w: 1, h: 1 } },
					{ id: 'mirkwood', name: 'Mirkwood', kind: 'region', terrain: 'forest', levels: '52–60', blurb: 'No path holds still long enough to follow.', area: { x: 1, y: 2, w: 2, h: 1 } },
					{ id: 'long-lake', name: 'Long Lake', kind: 'region', terrain: 'water', levels: '55–62', blurb: 'Stilt-houses over cold, deep water.', area: { x: 3, y: 2, w: 2, h: 1 } },
					{ id: 'lothlorien', name: 'Lothlórien', kind: 'region', terrain: 'forest', levels: '58–62', blurb: 'Gold leaves that never fall. Time does odd things here.', area: { x: 0, y: 3, w: 2, h: 1 } },
					{ id: 'dol-guldur', name: 'Dol Guldur', kind: 'region', terrain: 'shadow', levels: '62–70', blurb: 'The hill that watches the wood.', area: { x: 2, y: 3, w: 2, h: 1 } },
					{ id: 'east-bight', name: 'East Bight', kind: 'region', terrain: 'plain', levels: '55–60', blurb: 'A bite taken out of the forest by axes.', area: { x: 4, y: 3, w: 1, h: 1 } }
				]
			},
			{
				id: 'enedwaith', name: 'Enedwaith', kind: 'zone', terrain: 'swamp',
				blurb: 'The middle country, claimed by no one who mattered.',
				area: { x: 2, y: 4, w: 3, h: 2 }, grid: { cols: 3, rows: 2 },
				children: [
					{ id: 'minhiriath', name: 'Minhiriath', kind: 'region', terrain: 'forest', levels: '45–52', blurb: 'Stumps to the horizon. The fleets needed timber.', area: { x: 0, y: 0, w: 2, h: 1 } },
					{ id: 'nan-curunir', name: 'Nan Curunír', kind: 'region', terrain: 'ash', levels: '58–65', blurb: 'A green valley, until the furnaces.', area: { x: 2, y: 0, w: 1, h: 1 } },
					{ id: 'gwathlo', name: 'Gwathló', kind: 'region', terrain: 'swamp', levels: '45–52', blurb: 'Grey water, grey fen, grey weather.', area: { x: 0, y: 1, w: 2, h: 1 } },
					{ id: 'dunland', name: 'Dunland', kind: 'region', terrain: 'plain', levels: '58–65', blurb: 'Hill-clans with a long list of grievances.', area: { x: 2, y: 1, w: 1, h: 1 } }
				]
			},
			{
				id: 'rohan', name: 'Rohan', kind: 'zone', terrain: 'plain',
				blurb: 'Grass, horses, and a hall of gold at the centre of it.',
				area: { x: 5, y: 4, w: 3, h: 2 }, grid: { cols: 4, rows: 3 },
				children: [
					{ id: 'fangorn', name: 'Fangorn', kind: 'region', terrain: 'forest', levels: '70–78', blurb: 'The oldest wood, and it is awake.', area: { x: 0, y: 0, w: 2, h: 1 } },
					{ id: 'the-wold', name: 'The Wold', kind: 'region', terrain: 'plain', levels: '68–75', blurb: 'Open range where the herds summer.', area: { x: 2, y: 0, w: 2, h: 1 } },
					{ id: 'westemnet', name: 'Westemnet', kind: 'region', terrain: 'plain', levels: '72–80', blurb: 'Fords, beacons, and hard riding.', area: { x: 0, y: 1, w: 2, h: 1 } },
					{ id: 'eastemnet', name: 'Eastemnet', kind: 'region', terrain: 'plain', levels: '72–80', blurb: 'Wind, grass, and smoke on the eastern edge.', area: { x: 2, y: 1, w: 2, h: 1 } },
					{ id: 'westfold', name: 'Westfold', kind: 'region', terrain: 'mountain', levels: '78–85', blurb: 'A deep and a wall worth more than both.', area: { x: 0, y: 2, w: 1, h: 1 } },
					{ id: 'entwash-vale', name: 'Entwash Vale', kind: 'region', terrain: 'city', levels: '75–82', blurb: 'Edoras on its green hill above the river.', area: { x: 1, y: 2, w: 2, h: 1 } },
					{ id: 'eastfold', name: 'Eastfold', kind: 'region', terrain: 'plain', levels: '78–85', blurb: 'Last good farmland before the mountains close.', area: { x: 3, y: 2, w: 1, h: 1 } }
				]
			},
			{
				id: 'rhun', name: 'Rhûn', kind: 'zone', terrain: 'plain',
				blurb: 'An inland sea and the wide, unmapped grass around it.',
				area: { x: 8, y: 4, w: 4, h: 1 }, grid: { cols: 3, rows: 2 },
				children: [
					{ id: 'dorwinion', name: 'Dorwinion', kind: 'region', terrain: 'forest', levels: '65–72', blurb: 'Terraced vineyards. The wine is famously unwise.', area: { x: 0, y: 0, w: 1, h: 2 } },
					{ id: 'sea-of-rhun', name: 'Sea of Rhûn', kind: 'region', terrain: 'water', levels: '70–78', blurb: 'Fresh water so wide it has weather of its own.', area: { x: 1, y: 0, w: 2, h: 1 } },
					{ id: 'steppes', name: 'The Steppes', kind: 'region', terrain: 'plain', levels: '70–78', blurb: 'Wain-camps that are gone by morning.', area: { x: 1, y: 1, w: 2, h: 1 } }
				]
			},
			{
				id: 'mordor', name: 'Mordor', kind: 'zone', terrain: 'ash',
				blurb: 'A plain of cinders inside a ring of mountains.',
				area: { x: 8, y: 5, w: 4, h: 3 }, grid: { cols: 4, rows: 3 },
				children: [
					{ id: 'udun', name: 'Udûn', kind: 'region', terrain: 'ash', levels: '100+', blurb: 'The forge-floor, still warm.', area: { x: 0, y: 0, w: 2, h: 1 } },
					{ id: 'cirith-gorgor', name: 'Cirith Gorgor', kind: 'region', terrain: 'shadow', levels: '100+', blurb: 'The gate. It was never meant to be opened from outside.', area: { x: 2, y: 0, w: 2, h: 1 } },
					{ id: 'morgul-vale', name: 'Morgul Vale', kind: 'region', terrain: 'shadow', levels: '95–105', blurb: 'A city lit the wrong colour.', area: { x: 0, y: 1, w: 1, h: 1 } },
					{ id: 'gorgoroth', name: 'Gorgoroth', kind: 'region', terrain: 'ash', levels: '105+', blurb: 'Ash, clinker, and one mountain doing all the talking.', area: { x: 1, y: 1, w: 2, h: 1 } },
					{ id: 'dark-tower', name: 'The Dark Tower', kind: 'region', terrain: 'shadow', levels: '110+', blurb: 'Iron and adamant, and the eye on top of it.', area: { x: 3, y: 1, w: 1, h: 1 } },
					{ id: 'nurn', name: 'Núrn', kind: 'region', terrain: 'water', levels: '100+', blurb: 'Slave-fields feeding the army that owns them.', area: { x: 0, y: 2, w: 4, h: 1 } }
				]
			},
			{
				id: 'gondor', name: 'Gondor', kind: 'zone', terrain: 'city',
				blurb: 'Seven levels of white stone, and the fiefs that keep it fed.',
				area: { x: 4, y: 6, w: 4, h: 2 }, grid: { cols: 4, rows: 3 },
				children: [
					{ id: 'anorien', name: 'Anórien', kind: 'region', terrain: 'plain', levels: '95–102', blurb: 'Beacon hills, lit one after another.', area: { x: 0, y: 0, w: 2, h: 1 } },
					{ id: 'north-ithilien', name: 'North Ithilien', kind: 'region', terrain: 'forest', levels: '100–105', blurb: 'Ranger country. Beautiful, and held by nobody.', area: { x: 2, y: 0, w: 2, h: 1 } },
					{ id: 'lossarnach', name: 'Lossarnach', kind: 'region', terrain: 'forest', levels: '95–100', blurb: 'Orchards and stone-cutters.', area: { x: 0, y: 1, w: 1, h: 1 } },
					{ id: 'pelennor', name: 'Pelennor', kind: 'region', terrain: 'city', levels: '100–110', blurb: 'Walled fields below the White City.', area: { x: 1, y: 1, w: 1, h: 1 } },
					{ id: 'lebennin', name: 'Lebennin', kind: 'region', terrain: 'plain', levels: '95–102', blurb: 'Five rivers, all of them in a hurry.', area: { x: 2, y: 1, w: 1, h: 1 } },
					{ id: 'south-ithilien', name: 'South Ithilien', kind: 'region', terrain: 'forest', levels: '100–108', blurb: 'Crossroads where the statue lost its head.', area: { x: 3, y: 1, w: 1, h: 1 } },
					{ id: 'lamedon', name: 'Lamedon', kind: 'region', terrain: 'mountain', levels: '95–100', blurb: 'Goat tracks and a door into the hill.', area: { x: 0, y: 2, w: 1, h: 1 } },
					{ id: 'dor-en-ernil', name: 'Dor-en-Ernil', kind: 'region', terrain: 'plain', levels: '98–104', blurb: "The prince's land, and his horses.", area: { x: 1, y: 2, w: 1, h: 1 } },
					{ id: 'belfalas', name: 'Belfalas', kind: 'region', terrain: 'water', levels: '98–105', blurb: 'Swan-ships and a very long beach.', area: { x: 2, y: 2, w: 2, h: 1 } }
				]
			}
		]
	};

	/* ─────────────────────────  state  ───────────────────────── */

	let { start = ['middle-earth'] } = $props();

	/** where the traveller is: a path of ids from the world down */
	let path = $state([...start]);
	/** every id ever stood on */
	let visited = $state({ [start[start.length - 1]]: true });

	function nodeAt(p) {
		let n = MAP;
		for (const id of p.slice(1)) n = n.children.find((c) => c.id === id) ?? n;
		return n;
	}

	const here = $derived(nodeAt(path));
	const parent = $derived(path.length > 1 ? nodeAt(path.slice(0, -1)) : null);
	const isLeaf = $derived(!here.children?.length);
	/** the map actually drawn: your own if you contain places, otherwise your parent's */
	const view = $derived(isLeaf ? parent : here);
	const cells = $derived(view.children);

	const centre = (a) => ({ x: a.x + a.w / 2, y: a.y + a.h / 2 });

	function neighbour(dir) {
		if (!parent) return null;
		const from = centre(here.area);
		let best = null;
		let bestScore = Infinity;
		for (const sib of parent.children) {
			if (sib.id === here.id) continue;
			const to = centre(sib.area);
			const dx = to.x - from.x;
			const dy = to.y - from.y;
			const [along, across] =
				dir === 'west' ? [-dx, Math.abs(dy)]
				: dir === 'east' ? [dx, Math.abs(dy)]
				: dir === 'north' ? [-dy, Math.abs(dx)]
				: [dy, Math.abs(dx)];
			if (along <= 0) continue; // not actually that way
			const score = along + across * 2.5; // straight ahead beats diagonal
			if (score < bestScore) { bestScore = score; best = sib; }
		}
		return best;
	}

	const moves = $derived({
		north: neighbour('north'),
		south: neighbour('south'),
		east: neighbour('east'),
		west: neighbour('west')
	});

	/** the child closest to the middle — what "zoom in" picks when you don't click */
	const heart = $derived.by(() => {
		if (isLeaf) return null;
		const mid = { x: here.grid.cols / 2, y: here.grid.rows / 2 };
		return here.children.reduce((best, c) => {
			const p = centre(c.area);
			const d = Math.hypot(p.x - mid.x, p.y - mid.y);
			return !best || d < best.d ? { c, d } : best;
		}, null).c;
	});

	const total = $derived.by(() => {
		let n = 0;
		const walk = (x) => { n++; x.children?.forEach(walk); };
		walk(MAP);
		return n - 1;
	});
	const found = $derived(Object.keys(visited).length);

	/* ─────────────────────────  movement  ───────────────────────── */

	function arrive(p) {
		path = p;
		visited[p[p.length - 1]] = true;
	}
	function travel(dir) {
		const n = moves[dir];
		if (n) arrive([...path.slice(0, -1), n.id]);
	}
	function tap(cell) {
		// on a region map the cells are your neighbours; otherwise they're inside you
		if (isLeaf) arrive([...path.slice(0, -1), cell.id]);
		else arrive([...path, cell.id]);
	}
	function zoomOut() {
		if (path.length > 1) arrive(path.slice(0, -1));
	}
	function zoomIn() {
		if (heart) arrive([...path, heart.id]);
	}

	function key(e) {
		if (e.metaKey || e.ctrlKey || e.altKey) return;
		const k = e.key;
		const dir =
			k === 'ArrowUp' || k === 'w' ? 'north'
			: k === 'ArrowDown' || k === 's' ? 'south'
			: k === 'ArrowLeft' || k === 'a' ? 'west'
			: k === 'ArrowRight' || k === 'd' ? 'east'
			: null;
		if (dir) { e.preventDefault(); travel(dir); }
		else if (k === 'Escape' || k === 'Backspace' || k === '-') { e.preventDefault(); zoomOut(); }
		else if (k === 'Enter' || k === '+' || k === '=') { e.preventDefault(); zoomIn(); }
	}
</script>

<svelte:window onkeydown={key} />

<section class="atlas">
	<nav class="trail" aria-label="Where you are">
		{#each path as id, i}
			{@const n = nodeAt(path.slice(0, i + 1))}
			{#if i > 0}<span class="sep" aria-hidden="true">›</span>{/if}
			<button class="crumb" class:now={i === path.length - 1} onclick={() => arrive(path.slice(0, i + 1))}>
				{n.name}
			</button>
		{/each}
	</nav>

	<div class="board">
		<figure class="frame">
			{#key view.id}
				<div class="map" style="--cols:{view.grid.cols}; --rows:{view.grid.rows}">
					{#each cells as cell (cell.id)}
						{@const mine = cell.id === here.id}
						<button
							class="place t-{cell.terrain}"
							class:standing={mine}
							class:seen={visited[cell.id]}
							style="grid-column:{cell.area.x + 1} / span {cell.area.w}; grid-row:{cell.area.y + 1} / span {cell.area.h}"
							onclick={() => tap(cell)}
							aria-current={mine ? 'location' : undefined}
						>
							<span class="place-name">{cell.name}</span>
							{#if cell.levels}<span class="place-levels">{cell.levels}</span>{/if}
						</button>
					{/each}
				</div>
			{/key}
			<figcaption>{view.name}{isLeaf ? ' · you are the marked land' : ''}</figcaption>
		</figure>

		<aside class="cartouche">
			<p class="kind">{here.kind}</p>
			<h2>{here.name}</h2>
			<p class="blurb">{here.blurb}</p>
			{#if here.levels}<p class="levels">Levels {here.levels}</p>{/if}

			<div class="rose-wrap">
				<svg class="rose" viewBox="0 0 200 200" aria-hidden="true">
					<circle class="ring" cx="100" cy="100" r="92" />
					<circle class="ring thin" cx="100" cy="100" r="78" />
					{#each [0, 45, 90, 135, 180, 225, 270, 315] as a}
						<line class="tick" x1="100" y1="8" x2="100" y2="20" transform="rotate({a} 100 100)" />
					{/each}
					<path class="pt {moves.north ? '' : 'dead'}" d="M100 22 L112 92 L100 100 L88 92 Z" />
					<path class="pt {moves.south ? '' : 'dead'}" d="M100 178 L112 108 L100 100 L88 108 Z" />
					<path class="pt {moves.east ? '' : 'dead'}" d="M178 100 L108 112 L100 100 L108 88 Z" />
					<path class="pt {moves.west ? '' : 'dead'}" d="M22 100 L92 112 L100 100 L92 88 Z" />
					<circle class="hub" cx="100" cy="100" r="17" />
				</svg>

				<div class="pad">
					<button class="p n" disabled={!moves.north} onclick={() => travel('north')} title={moves.north?.name ?? 'Nothing north'} aria-label="Go north{moves.north ? `: ${moves.north.name}` : ''}"></button>
					<button class="p w" disabled={!moves.west} onclick={() => travel('west')} title={moves.west?.name ?? 'Nothing west'} aria-label="Go west{moves.west ? `: ${moves.west.name}` : ''}"></button>
					<button class="p c" disabled={path.length === 1} onclick={zoomOut} title={parent ? `Zoom out to ${parent.name}` : 'Already at the world'} aria-label="Zoom out"></button>
					<button class="p e" disabled={!moves.east} onclick={() => travel('east')} title={moves.east?.name ?? 'Nothing east'} aria-label="Go east{moves.east ? `: ${moves.east.name}` : ''}"></button>
					<button class="p s" disabled={!moves.south} onclick={() => travel('south')} title={moves.south?.name ?? 'Nothing south'} aria-label="Go south{moves.south ? `: ${moves.south.name}` : ''}"></button>
				</div>
			</div>

			<div class="zooms">
				<button onclick={zoomOut} disabled={path.length === 1}>
					{parent ? `Out to ${parent.name}` : 'Out'}
				</button>
				<button onclick={zoomIn} disabled={!heart}>
					{heart ? `In to ${heart.name}` : 'In'}
				</button>
			</div>

			<p class="tally">{found} of {total} lands walked</p>
			<p class="hint">Arrows or WASD to travel · Enter to zoom in · Esc to zoom out</p>
		</aside>
	</div>
</section>

<style>
	.atlas {
		--oak: #171310;
		--ink: #2a2015;
		--vellum: #e7d7b1;
		--vellum-deep: #d0b98c;
		--brass: #c2903c;
		--verdigris: #4f7f6f;
		--sea: #26414a;

		font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif;
		color: var(--vellum);
		background:
			radial-gradient(120% 90% at 30% 0%, #241d17 0%, var(--oak) 70%);
		padding: clamp(0.9rem, 2.5vw, 1.6rem);
		border: 1px solid #3a2f23;
		border-radius: 2px;
	}

	/* breadcrumb trail */
	.trail {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.35rem;
		margin-bottom: clamp(0.8rem, 2vw, 1.2rem);
		padding-bottom: 0.7rem;
		border-bottom: 1px solid #382d21;
	}
	.crumb {
		font: inherit;
		font-size: 0.95rem;
		background: none;
		border: 0;
		padding: 0.1rem 0.15rem;
		color: #a3916f;
		cursor: pointer;
		border-bottom: 1px solid transparent;
	}
	.crumb:hover { color: var(--vellum); }
	.crumb.now { color: var(--brass); border-bottom-color: var(--brass); cursor: default; }
	.sep { color: #5a4a36; }

	.board {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(230px, 290px);
		gap: clamp(1rem, 2.5vw, 1.8rem);
		align-items: start;
	}

	/* the map itself */
	.frame { margin: 0; }
	.map {
		display: grid;
		grid-template-columns: repeat(var(--cols), 1fr);
		grid-template-rows: repeat(var(--rows), 1fr);
		gap: 3px;
		aspect-ratio: var(--cols) / var(--rows);
		width: 100%;
		max-width: calc(64vh * var(--cols) / var(--rows));
		padding: clamp(6px, 1.2vw, 12px);
		container-type: inline-size;
		background:
			repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.035) 0 2px, transparent 2px 7px),
			radial-gradient(90% 70% at 50% 40%, #33525c 0%, var(--sea) 100%);
		border: 3px solid #4a3a26;
		outline: 1px solid #7a6034;
		outline-offset: -8px;
		box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.55);
		animation: unfurl 260ms ease-out;
	}
	@keyframes unfurl {
		from { opacity: 0; transform: scale(0.985); }
		to { opacity: 1; transform: none; }
	}

	.place {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.15em;
		min-width: 0;
		padding: 2px;
		font: inherit;
		line-height: 1.15;
		text-align: center;
		color: var(--ink);
		background: var(--tint, var(--vellum));
		border: 1px solid rgba(40, 30, 18, 0.45);
		border-radius: 1px;
		cursor: pointer;
		transition: filter 120ms ease, box-shadow 120ms ease;
	}
	.place::after {
		content: '';
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(0deg, rgba(70, 52, 28, 0.09) 0 1px, transparent 1px 4px);
		pointer-events: none;
	}
	.place:hover { filter: brightness(1.08) saturate(1.1); }
	.place:focus-visible { outline: 2px solid var(--brass); outline-offset: 2px; z-index: 3; }
	.place-name {
		font-size: clamp(0.5rem, 2.1cqi, 0.95rem);
		max-width: 100%;
		overflow-wrap: anywhere;
	}
	.place-levels {
		font-size: clamp(0.42rem, 1.4cqi, 0.68rem);
		font-style: italic;
		color: rgba(42, 32, 21, 0.62);
	}

	.place:not(.seen) { filter: grayscale(0.55) brightness(0.82); }
	.place:not(.seen):hover { filter: grayscale(0.2) brightness(0.95); }

	.standing {
		z-index: 2;
		box-shadow: 0 0 0 2px var(--brass), 0 0 22px rgba(194, 144, 60, 0.45);
		filter: none;
	}
	.standing::before {
		content: '✦';
		position: absolute;
		top: 2px;
		right: 4px;
		font-size: clamp(0.45rem, 1.6cqi, 0.8rem);
		color: #8a5a1d;
	}

	/* terrain washes */
	.t-plain { --tint: #ddc794; }
	.t-forest { --tint: #9fae77; }
	.t-mountain { --tint: #b7a68c; }
	.t-water { --tint: #93b3b8; }
	.t-swamp { --tint: #9aa679; }
	.t-ice { --tint: #c6d2cf; }
	.t-ash { --tint: #9a8f86; }
	.t-shadow { --tint: #7e7168; }
	.t-city { --tint: #e6d8b6; }

	figcaption {
		margin-top: 0.55rem;
		font-size: 0.8rem;
		font-style: italic;
		color: #8d7c5e;
	}

	/* side panel */
	.cartouche {
		border-left: 1px solid #382d21;
		padding-left: clamp(0.9rem, 2vw, 1.4rem);
	}
	.kind {
		margin: 0;
		font-size: 0.78rem;
		font-style: italic;
		letter-spacing: 0.02em;
		color: var(--verdigris);
	}
	.cartouche h2 {
		margin: 0.1rem 0 0.5rem;
		font-size: clamp(1.4rem, 3vw, 1.9rem);
		font-weight: 500;
		letter-spacing: 0.01em;
		color: var(--vellum);
	}
	.blurb {
		margin: 0 0 0.5rem;
		max-width: 32ch;
		font-size: 0.95rem;
		line-height: 1.6;
		color: #b6a583;
	}
	.levels {
		margin: 0;
		font-size: 0.85rem;
		color: var(--brass);
	}

	/* compass rose, doubling as the d-pad */
	.rose-wrap {
		position: relative;
		width: min(210px, 100%);
		margin: 1.4rem 0 1.1rem;
	}
	.rose { display: block; width: 100%; height: auto; }
	.ring { fill: none; stroke: #4a3c2a; stroke-width: 2; }
	.ring.thin { stroke: #37 2c 20; stroke: #372c20; stroke-width: 1; }
	.tick { stroke: #6b5637; stroke-width: 2; }
	.pt {
		fill: var(--brass);
		stroke: #6d4d18;
		stroke-width: 1;
		transition: fill 140ms ease;
	}
	.pt.dead { fill: #4a4238; stroke: #3a342c; }
	.hub { fill: #2e2519; stroke: #6b5637; stroke-width: 2; }

	.pad {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(3, 1fr);
	}
	.p {
		border: 0;
		background: transparent;
		cursor: pointer;
		border-radius: 50%;
	}
	.p:disabled { cursor: default; }
	.p:not(:disabled):hover { background: rgba(194, 144, 60, 0.14); }
	.p:focus-visible { outline: 2px solid var(--verdigris); outline-offset: -4px; }
	.n { grid-area: 1 / 2; }
	.w { grid-area: 2 / 1; }
	.c { grid-area: 2 / 2; }
	.e { grid-area: 2 / 3; }
	.s { grid-area: 3 / 2; }

	.zooms { display: flex; gap: 0.5rem; flex-wrap: wrap; }
	.zooms button {
		flex: 1 1 auto;
		font: inherit;
		font-size: 0.85rem;
		padding: 0.45rem 0.7rem;
		color: var(--vellum);
		background: #241d15;
		border: 1px solid #4a3c2a;
		border-radius: 2px;
		cursor: pointer;
	}
	.zooms button:not(:disabled):hover { border-color: var(--brass); color: var(--brass); }
	.zooms button:disabled { opacity: 0.35; cursor: default; }
	.zooms button:focus-visible { outline: 2px solid var(--brass); outline-offset: 2px; }

	.tally {
		margin: 1rem 0 0.2rem;
		font-size: 0.82rem;
		color: var(--verdigris);
	}
	.hint {
		margin: 0;
		font-size: 0.75rem;
		line-height: 1.5;
		color: #6f6047;
	}

	@media (max-width: 720px) {
		.board { grid-template-columns: 1fr; }
		.cartouche { border-left: 0; border-top: 1px solid #382d21; padding: 1rem 0 0; }
		.map { max-width: 100%; }
	}
	@media (prefers-reduced-motion: reduce) {
		.map { animation: none; }
		.place, .pt, .zooms button { transition: none; }
	}
</style>
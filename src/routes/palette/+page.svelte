<script lang="ts">
	const swatches = [
		{ name: 'brand-white', hex: '#FFFFFF', label: 'White', dark: false },
		{ name: 'brand-off-white', hex: '#F8FAEC', label: 'Off White', dark: false },
		{ name: 'brand-cream', hex: '#EDE6DC', label: 'Cream', dark: false },
		{ name: 'brand-gray-light', hex: '#BCBFBE', label: 'Gray Light', dark: false },
		{ name: 'brand-gray-mid', hex: '#898881', label: 'Gray Mid', dark: true },
		{ name: 'brand-navy', hex: '#262D38', label: 'Navy', dark: true },
		{ name: 'brand-charcoal', hex: '#232524', label: 'Charcoal', dark: true },
		{ name: 'brand-near-black', hex: '#1A1A1A', label: 'Near Black', dark: true },
		{ name: 'brand-espresso', hex: '#2D2727', label: 'Espresso', dark: true },
		{ name: 'brand-black', hex: '#000000', label: 'Black', dark: true },
		{ name: 'brand-sky', hex: '#0395D7', label: 'Sky', dark: true },
		{ name: 'brand-blue', hex: '#0573E6', label: 'Blue', dark: true },
		{ name: 'brand-forest', hex: '#386D4F', label: 'Forest', dark: true },
		{ name: 'brand-gold', hex: '#FFC52A', label: 'Gold', dark: false },
		{ name: 'brand-orange', hex: '#F35D29', label: 'Orange', dark: true },
		{ name: 'brand-crimson', hex: '#D42622', label: 'Crimson', dark: true },
		{ name: 'brand-crimson-dark', hex: '#6B090B', label: 'Crimson Dark', dark: true },
	];

	const gradients = [
		{
			name: 'Sunset',
			style: 'linear-gradient(135deg, #FFC52A, #F35D29, #D42622)',
			text: '#fff',
		},
		{
			name: 'Ocean',
			style: 'linear-gradient(135deg, #F8FAEC, #0395D7, #0573E6, #262D38)',
			text: '#fff',
		},
		{
			name: 'Ember',
			style: 'linear-gradient(135deg, #D42622, #6B090B)',
			text: '#fff',
		},
		{
			name: 'Canopy',
			style: 'linear-gradient(135deg, #EDE6DC, #386D4F, #1A1A1A)',
			text: '#fff',
		},
		{
			name: 'Dusk',
			style: 'linear-gradient(135deg, #FFC52A, #F35D29, #262D38)',
			text: '#fff',
		},
		{
			name: 'Stone',
			style: 'linear-gradient(135deg, #F8FAEC, #BCBFBE, #898881, #232524)',
			text: '#fff',
		},
		{
			name: 'Horizon',
			style: 'linear-gradient(135deg, #EDE6DC, #0395D7, #0573E6)',
			text: '#fff',
		},
		{
			name: 'Forge',
			style: 'linear-gradient(135deg, #F35D29, #2D2727)',
			text: '#fff',
		},
	];
</script>

<div class="min-h-screen bg-brand-cream px-8 py-12">
	<div class="mx-auto max-w-5xl">

		<!-- Header -->
		<div class="mb-12">
			<h1 class="text-brand-navy mb-2 text-4xl font-bold tracking-tight">Color Palette</h1>
			<p class="text-brand-gray-mid text-sm font-mono">
				17 custom colors — use as <code class="bg-brand-gray-light/40 rounded px-1">bg-brand-*</code>, <code class="bg-brand-gray-light/40 rounded px-1">text-brand-*</code>, <code class="bg-brand-gray-light/40 rounded px-1">border-brand-*</code>
			</p>
		</div>

		<!-- Swatches -->
		<section class="mb-16">
			<h2 class="text-brand-espresso mb-6 text-xs font-semibold uppercase tracking-widest">Swatches</h2>
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{#each swatches as swatch (swatch.name)}
					<div class="overflow-hidden rounded-xl shadow-sm">
						<div
							class="h-24 w-full"
							style="background-color: {swatch.hex}; outline: 1px solid rgba(0,0,0,0.06);"
						></div>
						<div class="bg-brand-white border-brand-gray-light/30 border-t px-3 py-2">
							<p class="text-brand-charcoal text-xs font-semibold">{swatch.label}</p>
							<p class="text-brand-gray-mid font-mono text-xs">{swatch.hex}</p>
							<p class="text-brand-gray-light font-mono text-xs">bg-{swatch.name}</p>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Gradients -->
		<section class="mb-16">
			<h2 class="text-brand-espresso mb-6 text-xs font-semibold uppercase tracking-widest">Gradient Ideas</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
				{#each gradients as grad (grad.name)}
					<div class="overflow-hidden rounded-xl shadow-sm">
						<div
							class="flex h-28 items-end p-3"
							style="background: {grad.style};"
						>
							<span class="rounded bg-black/20 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
								{grad.name}
							</span>
						</div>
						<div class="bg-brand-white px-3 py-2">
							<p class="text-brand-gray-mid font-mono text-xs break-all">{grad.style}</p>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- UI Pairing Examples -->
		<section>
			<h2 class="text-brand-espresso mb-6 text-xs font-semibold uppercase tracking-widest">UI Pairings</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<!-- Dark card -->
				<div class="bg-brand-navy rounded-xl p-6">
					<p class="text-brand-gold mb-1 text-xs font-semibold uppercase tracking-widest">Navy + Gold</p>
					<p class="text-brand-gray-light text-sm">A strong, authoritative pairing. Good for headers, dashboards, or premium UI.</p>
					<button class="bg-brand-gold text-brand-navy mt-4 rounded-lg px-4 py-2 text-sm font-bold">
						Call to Action
					</button>
				</div>

				<!-- Light card -->
				<div class="bg-brand-off-white rounded-xl p-6 outline outline-1 outline-brand-gray-light/40">
					<p class="text-brand-orange mb-1 text-xs font-semibold uppercase tracking-widest">Off-white + Orange</p>
					<p class="text-brand-charcoal text-sm">Warm and energetic. Works well for editorial or marketing content.</p>
					<button class="bg-brand-orange mt-4 rounded-lg px-4 py-2 text-sm font-bold text-white">
						Call to Action
					</button>
				</div>

				<!-- Forest card -->
				<div class="bg-brand-forest rounded-xl p-6">
					<p class="text-brand-cream mb-1 text-xs font-semibold uppercase tracking-widest">Forest + Cream</p>
					<p class="text-brand-cream/80 text-sm">Earthy and grounded. Great for sustainability, nature, or calm UIs.</p>
					<button class="bg-brand-cream text-brand-forest mt-4 rounded-lg px-4 py-2 text-sm font-bold">
						Call to Action
					</button>
				</div>
			</div>
		</section>

	</div>
</div>

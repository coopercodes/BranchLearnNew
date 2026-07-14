<script lang="ts">
	import TriangleRenderer, { type TriangleSelection } from '$lib/components/TriangleRenderer.svelte';
	import LeafChat from '$lib/components/LeafChat.svelte';
	import Leaf from '$lib/Leaf.svelte';
	import type { SelectedElement } from '$lib/leaf/selection.svelte';

	let leafOpen = $state(false);
	let selection = $state<TriangleSelection | null>(null);
	let triangleDescription = $state('');

	// Lift the triangle-specific click into the generalized shape Leaf understands.
	let selectedElement = $derived.by<SelectedElement | null>(() => {
		if (!selection) return null;
		const noun = selection.kind === 'side' ? 'Side' : 'Angle';
		return {
			kind: `triangle-${selection.kind}`,
			label: `${noun} ${selection.name}`,
			value: selection.value,
			hidden: selection.hidden,
			explanation: selection.hidden
				? `The student clicked this ${selection.kind} on the triangle, but its value is hidden behind a "?" mystery mark — help them work it out, don't just reveal it.`
				: `The student clicked this ${selection.kind} on the triangle — it is what they are asking about.`
		};
	});

	let context = $derived(`The student is looking at this triangle: ${triangleDescription}`);
</script>

<div class="flex h-screen items-center justify-center gap-8 bg-brand-near-black/5 px-8">
	<TriangleRenderer
		bind:selected={selection}
		bind:description={triangleDescription}
		onselect={() => (leafOpen = true)}
	/>

	{#if leafOpen}
		<div class="h-[560px] w-[400px]">
			<LeafChat {context} selected={selectedElement} onclose={() => (leafOpen = false)} />
		</div>
	{:else}
		<button
			type="button"
			class="flex cursor-pointer items-center gap-2 rounded-lg border border-brand-forest bg-white px-4 py-3 shadow hover:bg-brand-forest/10"
			onclick={() => (leafOpen = true)}
		>
			<Leaf color="#386d4f" width={28} height={28} />
			<span class="font-semibold text-brand-forest">Open Leaf</span>
		</button>
	{/if}
</div>

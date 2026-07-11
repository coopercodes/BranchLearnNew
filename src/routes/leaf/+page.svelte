<script lang="ts">
	import TriangleRenderer, { type TriangleSelection } from '$lib/components/TriangleRenderer.svelte';
	import LeafChat from '$lib/components/LeafChat.svelte';
	import Leaf from '$lib/Leaf.svelte';

	let leafOpen = $state(false);
	let selection = $state<TriangleSelection | null>(null);
	let triangleDescription = $state('');
</script>

<div class="flex h-screen items-center justify-center gap-8 bg-brand-near-black/5 px-8">
	<TriangleRenderer
		bind:selected={selection}
		bind:description={triangleDescription}
		onselect={() => (leafOpen = true)}
	/>

	{#if leafOpen}
		<div class="h-[560px] w-[400px]">
			<LeafChat {triangleDescription} {selection} onclose={() => (leafOpen = false)} />
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

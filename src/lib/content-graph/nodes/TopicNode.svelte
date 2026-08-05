<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import type { FlowData } from '../flow';
	import { game } from '../gameState.svelte';

	let { data }: NodeProps & { data: FlowData } = $props();
	let node = $derived(data.graphNode);
	let isCurrent = $derived(game.currentID === node.id);
</script>

<div
	class="w-[280px] rounded-xl bg-brand-navy px-4 py-3 shadow-sm ring-2 {isCurrent
		? 'ring-brand-orange'
		: 'ring-transparent'}"
>
	<p class="text-[10px] tracking-widest text-brand-gray-light uppercase">Topic</p>
	<p class="text-[15px] leading-tight font-bold text-white">{node.title}</p>
	{#if node.summary}
		<p class="mt-1 text-[11px] leading-snug text-brand-gray-light">{node.summary}</p>
	{/if}
	<Handle type="source" position={Position.Bottom} id="next" />
</div>

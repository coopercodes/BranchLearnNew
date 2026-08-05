<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import type { FlowData } from '../flow';
	import { game } from '../gameState.svelte';
	import type { PanelNode } from '../types';

	let { data }: NodeProps & { data: FlowData } = $props();
	let node = $derived(data.graphNode as PanelNode);
	let isCurrent = $derived(game.currentID === node.id);
	let awaitingAnswer = $derived(game.pendingPanel?.id === node.id);
	let result = $derived(game.resultFor(node.id));
	let correct = $derived(game.correctFor(node.id));
	let satisfied = $derived(game.isSatisfied(node));
</script>

<div
	class="w-[178px] rounded-lg px-3 py-2 shadow-sm ring-2 {isCurrent
		? 'ring-brand-orange'
		: satisfied
			? 'ring-brand-forest'
			: result === 'incorrect'
				? 'ring-brand-crimson'
				: 'ring-brand-gray-light/60'} {satisfied ? 'bg-brand-green-50' : 'bg-brand-white'}"
>
	<div class="flex items-baseline justify-between gap-1">
		<p class="text-[9px] tracking-widest text-brand-gray-mid uppercase">
			Panel {data.loopIndex}/{data.loopSize}
		</p>
		{#if awaitingAnswer}
			<span class="animate-pulse text-[9px] font-bold text-brand-orange">ANSWERING…</span>
		{:else if result}
			<span
				class="text-[10px] font-bold {result === 'correct'
					? 'text-brand-forest'
					: 'text-brand-crimson'}"
			>
				{result === 'correct' ? '✓' : '✕'}
			</span>
		{/if}
	</div>
	<p class="text-[12px] leading-tight font-semibold text-brand-near-black">{node.title}</p>

	<!-- Correct-answer quota -->
	<div class="mt-1.5 flex items-center gap-1.5">
		<div class="flex gap-[3px]">
			{#each { length: node.requiredCorrect }, i (i)}
				<span
					class="h-1.5 w-3 rounded-full {i < correct
						? satisfied
							? 'bg-brand-forest'
							: 'bg-brand-gold'
						: 'bg-brand-gray-light/50'}"
				></span>
			{/each}
		</div>
		<p
			class="font-mono text-[9px] font-bold {satisfied
				? 'text-brand-forest'
				: 'text-brand-gray-mid'}"
		>
			{Math.min(correct, node.requiredCorrect)}/{node.requiredCorrect}
		</p>
	</div>

	<Handle type="target" position={Position.Left} id="in" />
	<Handle type="source" position={Position.Right} id="out" />
	<Handle type="source" position={Position.Bottom} id="loop-back" />
</div>

<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import type { FlowData } from '../flow';
	import { game, hitRateFor, MAX_ELO, type Rank } from '../gameState.svelte';

	const RANK_CLASS: Record<Rank, string> = {
		Beginner: 'bg-brand-cream text-brand-gray-mid',
		Intermediate: 'bg-brand-gold/30 text-brand-near-black',
		Expert: 'bg-brand-sky/20 text-brand-blue',
		Mastery: 'bg-brand-green-100 text-brand-green-700'
	};

	let { data }: NodeProps & { data: FlowData } = $props();
	let node = $derived(data.graphNode);
	let isCurrent = $derived(game.currentID === node.id);
	let elo = $derived(game.eloFor(node.id));
	let mastered = $derived(game.isMastered(node.id));
	let satisfied = $derived(game.satisfiedCount(node.id));
	let panelCount = $derived(game.panelCount(node.id));
	let rank = $derived(game.rankOf(node.id));
</script>

<div
	class="w-[280px] rounded-xl bg-brand-white px-4 py-3 shadow-sm ring-2 {isCurrent
		? 'ring-brand-orange'
		: mastered
			? 'ring-brand-forest'
			: 'ring-brand-gray-light/70'}"
>
	<div class="flex items-baseline justify-between">
		<p class="text-[10px] tracking-widest text-brand-gray-mid uppercase">Subtopic</p>
		<p
			class="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase {RANK_CLASS[
				rank
			]}"
		>
			{mastered ? 'Mastered' : rank}
		</p>
	</div>
	<p class="text-[15px] leading-tight font-bold text-brand-navy">{node.title}</p>

	<!-- ELO, out of 100 -->
	<div class="mt-2 flex items-center gap-2">
		<div class="h-2 flex-1 overflow-hidden rounded-full bg-brand-cream">
			<div
				class="h-full rounded-full transition-all duration-300 {mastered
					? 'bg-brand-forest'
					: 'bg-brand-gold'}"
				style="width: {elo}%"
			></div>
		</div>
		<p class="w-14 text-right font-mono text-[11px] font-bold text-brand-near-black">
			{elo}<span class="text-brand-gray-mid">/{MAX_ELO}</span>
		</p>
	</div>
	<div class="mt-1 flex items-baseline justify-between text-[10px]">
		<span class="tracking-wide text-brand-gray-mid uppercase">ELO</span>
		<span class="text-brand-gray-mid">
			panels reinforced
			<span class="font-mono font-bold {satisfied === panelCount ? 'text-brand-forest' : ''}">
				{satisfied}/{panelCount}
			</span>
			· hit rate
			<span class="font-mono font-bold">{Math.round(hitRateFor(elo) * 100)}%</span>
		</span>
	</div>

	<Handle type="target" position={Position.Top} id="in" />
	<Handle type="source" position={Position.Right} id="loop-start" style="top: 30%" />
	<Handle type="target" position={Position.Right} id="loop-end" style="top: 75%" />
	<Handle type="source" position={Position.Bottom} id="next" />
</div>

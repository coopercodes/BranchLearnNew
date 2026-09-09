<script lang="ts">
	import Self from './JsonNode.svelte';

	type Props = { name: string; value: unknown; depth?: number };
	let { name, value, depth = 0 }: Props = $props();

	const isObj = (v: unknown) => typeof v === 'object' && v !== null;

	let entries = $derived(isObj(value) ? Object.entries(value as object) : []);
	let expandable = $derived(entries.length > 0);
	let open = $state(depth < 2);

	let preview = $derived(
		Array.isArray(value)
			? `Array(${value.length})`
			: isObj(value)
				? `{ ${Object.keys(value as object).length} }`
				: ''
	);

	function color(v: unknown) {
		if (typeof v === 'string') return 'text-emerald-400';
		if (typeof v === 'number') return 'text-amber-400';
		if (typeof v === 'boolean') return 'text-sky-400';
		return 'text-neutral-500';
	}

	function fmt(v: unknown) {
		return typeof v === 'string' ? `"${v}"` : String(v);
	}
</script>

<div style="padding-left: {depth === 0 ? 0 : 12}px">
	{#if isObj(value)}
		<button
			class="flex w-full items-center gap-1 rounded px-1 text-left hover:bg-neutral-800"
			onclick={() => (open = !open)}
			disabled={!expandable}
		>
			<span class="w-3 shrink-0 text-neutral-500">
				{expandable ? (open ? '▾' : '▸') : ''}
			</span>
			<span class="text-neutral-300">{name}</span>
			<span class="text-neutral-600">{preview}</span>
		</button>

		{#if open}
			{#each entries as [k, v] (k)}
				<Self name={k} value={v} depth={depth + 1} />
			{/each}
		{/if}
	{:else}
		<div class="flex gap-2 px-1 pl-4">
			<span class="text-neutral-400">{name}:</span>
			<span class={color(value)}>{fmt(value)}</span>
		</div>
	{/if}
</div>
<script lang="ts">
	// dev/TreeNode.svelte — one row of the inspector; recurses for children
	import TreeNode from './TreeNode.svelte';
	import { kindOf, entriesOf, summaryOf, isExpandable, formatPrimitive } from './inspect.svelte';

	let {
		label,
		value,
		depth = 0
	}: { label: string; value: unknown; depth?: number } = $props();

	let open = $state(true);

	const expandable = $derived(isExpandable(value));
	const kind = $derived(kindOf(value));
	const children = $derived(expandable && open ? entriesOf(value) : []);
</script>

{#if expandable}
	<button
		class="row clickable"
		style:padding-left="{10 + depth * 14}px"
		onclick={() => (open = !open)}
		aria-expanded={open}
	>
		<span class="toggle" class:open>{open ? '−' : '+'}</span>
		<span class="label">{label}</span>
		<span class="meta">{summaryOf(value)}</span>
	</button>
	{#if open}
		{#each children as [key, child] (key)}
			<TreeNode label={key} value={child} depth={depth + 1} />
		{/each}
		{#if children.length === 0}
			<div class="row" style:padding-left="{10 + (depth + 1) * 14}px">
				<span class="meta">empty</span>
			</div>
		{/if}
	{/if}
{:else}
	<div class="row" style:padding-left="{10 + depth * 14}px">
		<span class="toggle spacer"></span>
		<span class="label">{label}</span>
		<span class="value {kind}">{formatPrimitive(value)}</span>
	</div>
{/if}

<style>
	.row {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		min-height: 26px;
		padding-right: 10px;
		border: 0;
		background: transparent;
		font: inherit;
		text-align: left;
		color: inherit;
	}
	.clickable {
		cursor: pointer;
	}
	.clickable:hover {
		background: #eeeeeb;
	}
	.toggle {
		flex: 0 0 auto;
		width: 14px;
		height: 14px;
		display: grid;
		place-items: center;
		border: 1px solid #c9c9c4;
		border-radius: 50%;
		font-size: 11px;
		line-height: 1;
		color: #6b6b66;
		background: #fff;
	}
	.toggle.open {
		border-color: #e25303;
		color: #e25303;
	}
	.toggle.spacer {
		border: 0;
		background: transparent;
	}
	.label {
		flex: 0 1 auto;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: #2b2b28;
	}
	.meta {
		margin-left: auto;
		flex: 0 0 auto;
		font-size: 10px;
		letter-spacing: 0.04em;
		color: #8a8a85;
		font-variant-numeric: tabular-nums;
	}
	.value {
		margin-left: auto;
		flex: 0 1 auto;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-family: 'SF Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace;
		font-size: 11px;
		font-variant-numeric: tabular-nums;
		color: #2b2b28;
	}
	.value.number {
		color: #e25303;
	}
	.value.string {
		color: #3d5a45;
	}
	.value.boolean {
		color: #34506e;
	}
	.value.null,
	.value.undefined {
		color: #a5a5a0;
	}
</style>
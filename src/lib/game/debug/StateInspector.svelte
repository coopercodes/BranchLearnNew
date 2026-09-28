<script lang="ts">
	import JsonNode from './JsonNode.svelte';

	let { get }: { get: () => unknown } = $props();

	let snapshot = $derived(get());
	let raw = $derived(JSON.stringify(snapshot, null, 2));

	let mode = $state<'tree' | 'raw'>('tree');
	let collapsed = $state(true);
	let dialog = $state<HTMLDialogElement>();
	let copied = $state(false);

	async function copy() {
		await navigator.clipboard.writeText(raw);
		copied = true;
		setTimeout(() => (copied = false), 1200);
	}
</script>

{#snippet body()}
	<div class="flex-1 overflow-auto p-2 font-mono text-xs leading-5">
		{#if mode === 'tree'}
			{#each Object.entries(snapshot as object) as [k, v] (k)}
				<JsonNode name={k} value={v} />
			{/each}
		{:else}
			<pre class="whitespace-pre-wrap break-all text-neutral-300">{raw}</pre>
		{/if}
	</div>
{/snippet}

{#snippet toolbar(expanded: boolean)}
	<button onclick={() => (collapsed = !collapsed)} class="flex cursor-pointer items-center gap-1 px-2 py-1">
		<span class="mr-auto font-mono text-xs text-neutral-300">dev</span>

		{#if expanded}
			<button
				class="rounded px-1.5 py-0.5 text-xs text-neutral-300 hover:bg-neutral-700"
				onclick={() => (mode = mode === 'tree' ? 'raw' : 'tree')}
			>
				{mode === 'tree' ? 'raw' : 'tree'}
			</button>

			<button
				class="rounded px-1.5 py-0.5 text-xs text-neutral-300 hover:bg-neutral-700"
				onclick={copy}
			>
				{copied ? '✓' : 'copy'}
			</button>
		{/if}

		<!-- {#if expanded}
			<button
				class="rounded px-1.5 py-0.5 text-xs text-neutral-300 hover:bg-neutral-700"
				onclick={() => dialog?.close()}>✕</button
			>
		{:else}
			<button
				class="rounded px-1.5 py-0.5 text-xs text-neutral-300 hover:bg-neutral-700"
				onclick={() => dialog?.showModal()}>⛶</button
			>
			<button
				class="rounded px-1.5 py-0.5 text-xs text-neutral-300 hover:bg-neutral-700"
				>{collapsed ? '▴' : '▾'}</button
			>
		{/if} -->
		</button>
{/snippet}

<div
	class="fixed bottom-4 left-4 z-50 flex w-[320px] flex-col overflow-hidden rounded-lg"
	class:h-[400px]={!collapsed}
	class:bg-neutral-800={!collapsed}
>
	{@render toolbar(false)}
	{#if !collapsed}
		{@render body()}
	{/if}
</div>

<dialog
	bind:this={dialog}
	class="m-auto h-[80vh] w-[min(900px,90vw)] rounded-lg border border-neutral-700 bg-neutral-900 p-0 backdrop:bg-black/60"
	onclick={(e) => e.target === dialog && dialog.close()}
>
	<div class="flex h-full flex-col">
		{@render toolbar(true)}
		{@render body()}
	</div>
</dialog>
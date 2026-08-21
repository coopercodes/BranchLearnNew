<script lang="ts">
	// dev/StoreInspector.svelte — fixed dev panel, top-left.
	// Mount once in your root layout, AFTER setBranchContext():
	//
	//   {#if import.meta.env.DEV}
	//     <StoreInspector />
	//   {/if}
	import { getBranchContext } from '../BranchContext.svelte';
	import TreeNode from './TreeNode.svelte';

	import { env } from '$env/dynamic/public';


	const ctx = getBranchContext();

	type Section = { name: string; store: unknown; reset: () => void };

	const sections: Section[] = [
		{ name: 'Game', store: ctx.game, reset: () => ctx.game.reset() },
		{ name: 'User', store: ctx.user, reset: () => ctx.user.reset() },
		{ name: 'Events', store: ctx.eventLog, reset: () => ctx.eventLog.reset() },
		{ name: 'Graph', store: ctx.graph, reset: () => ctx.graph.reset() }
	];

	let panelOpen = $state(true);
	// Which store sections are expanded; Game open by default
	let openSections = $state<Record<string, boolean>>({ Game: true });

	function resetAll() {
		sections.forEach((s) => s.reset());
	}
</script>

{#if env.PUBLIC_DEV_MODE_ON == "true"}
<aside class="inspector" class:collapsed={!panelOpen}>
	<div class="header">
		<button class="header-main" onclick={() => (panelOpen = !panelOpen)} aria-expanded={panelOpen}>
			<span class="dot"></span>
			<span class="title">Stores</span>
		</button>
		{#if panelOpen}
			<button class="reset" onclick={resetAll} title="Reset every store">reset all</button>
		{/if}
		<button class="hint" onclick={() => (panelOpen = !panelOpen)}>
			{panelOpen ? 'hide' : 'show'}
		</button>
	</div>

	{#if panelOpen}
		<div class="body">
			{#each sections as { name, store, reset } (name)}
				<section>
					<div class="section-header">
						<button
							class="section-main"
							onclick={() => (openSections[name] = !openSections[name])}
							aria-expanded={!!openSections[name]}
						>
							<span class="section-toggle" class:open={openSections[name]}>
								{openSections[name] ? '−' : '+'}
							</span>
							<span class="section-name">{name}</span>
						</button>
						<button class="reset" onclick={reset} title="Reset {name} store">reset</button>
					</div>
					{#if openSections[name]}
						<div class="section-body">
							<TreeNode label={name} value={store} depth={0} />
						</div>
					{/if}
				</section>
			{/each}
		</div>
	{/if}
</aside>
{/if}

<style>
	.inspector {
		position: fixed;
		top: 12px;
		left: 12px;
		z-index: 9999;
		width: 300px;
		max-height: calc(100vh - 24px);
		display: flex;
		flex-direction: column;
		background: #f7f7f4;
		border: 1px solid #dcdcd7;
		border-radius: 6px;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.08);
		font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
		font-size: 12px;
		color: #2b2b28;
		overflow: hidden;
	}
	.inspector.collapsed {
		width: auto;
	}

	button {
		border: 0;
		background: transparent;
		font: inherit;
		color: inherit;
		cursor: pointer;
		text-align: left;
	}

	/* Panel header */
	.header {
		display: flex;
		align-items: center;
		border-bottom: 1px solid #e4e4df;
		background: #fdfdfb;
	}
	.collapsed .header {
		border-bottom: 0;
	}
	.header-main {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		padding: 8px 12px;
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #e25303;
	}
	.title {
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.hint {
		padding: 8px 12px 8px 4px;
		font-size: 10px;
		color: #a5a5a0;
	}
	.hint:hover {
		color: #2b2b28;
	}

	/* Reset buttons */
	.reset {
		flex: 0 0 auto;
		padding: 3px 8px;
		border: 1px solid #dcdcd7;
		border-radius: 999px;
		font-size: 10px;
		letter-spacing: 0.06em;
		color: #8a8a85;
		background: #fff;
	}
	.reset:hover {
		border-color: #e25303;
		color: #e25303;
	}
	.reset:active {
		background: #e25303;
		border-color: #e25303;
		color: #fff;
	}

	/* Body + sections */
	.body {
		overflow-y: auto;
	}
	section + section {
		border-top: 1px solid #e4e4df;
	}
	.section-header {
		display: flex;
		align-items: center;
		padding-right: 10px;
	}
	.section-header:hover {
		background: #eeeeeb;
	}
	.section-main {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		padding: 7px 10px;
	}
	.section-toggle {
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
	.section-toggle.open {
		border-color: #e25303;
		color: #e25303;
	}
	.section-name {
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.section-body {
		padding-bottom: 4px;
	}
</style>
<script lang="ts">
	import StoreInspector from '$lib/context/storeViewer/StoreInspector.svelte'
	import { onMount } from 'svelte';
	import { game } from '$lib/game/index.svelte';
	import { load, startAutosave } from '$lib/game/persist.svelte';
	import StateInspector from '$lib/game/debug/StateInspector.svelte';
	let { children } = $props();
	let ready = $state(false);

	onMount(() => {
		load(game);
		ready = true;
		return startAutosave(game); // cleanup on unmount
	});

</script>

{#if import.meta.env.DEV}
	<StoreInspector />
{/if}


{#if true}
	<StateInspector get={() => game.toJSON()} />
{/if}
{@render children()}
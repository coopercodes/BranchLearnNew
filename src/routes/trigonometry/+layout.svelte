<script lang="ts">
	import { setBranchContext } from '$lib/context/BranchContext.svelte';
	import StoreInspector from '$lib/context/storeViewer/StoreInspector.svelte'
	let { children } = $props();
	setBranchContext();
</script>

{#if import.meta.env.DEV}
	<StoreInspector />
{/if}
{@render children()}
<script lang="ts">
	import StoreInspector from '$lib/context/storeViewer/StoreInspector.svelte'
	let { children } = $props();
</script>

{#if import.meta.env.DEV}
	<StoreInspector />
{/if}
{@render children()}
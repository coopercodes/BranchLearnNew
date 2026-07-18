<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon1.svg';
	import AlgoDevTools from '$lib/algo/AlgoDevTools.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Branch SAT</title>
</svelte:head>
{@render children()}
<AlgoDevTools />

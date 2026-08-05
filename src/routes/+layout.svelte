<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon1.svg';
	import Toaster from '$lib/toast/Toaster.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Branch SAT</title>
</svelte:head>
{@render children()}
<Toaster />

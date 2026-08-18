<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon1.svg';
	import Toaster from '$lib/toast/Toaster.svelte';
	import { setBranchContext } from '$lib/context/BranchContext.svelte';
	import { persistBranchContext } from '$lib/context/Persistence.svelte';

	let { children } = $props();

	const ctx = setBranchContext();
	persistBranchContext(ctx);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Branch SAT</title>
</svelte:head>
{@render children()}
<Toaster />

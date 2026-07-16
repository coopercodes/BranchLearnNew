<script lang="ts">
	import BranchLogo from "$lib/assets/branch.svg"
	import Book from "$lib/Book.svelte";
	import Leaf from "$lib/Leaf.svelte";
</script>

<style>
	.black-filter {
		filter: brightness(0);
	}
</style>


<div class="h-screen w-screen">

	<div class="text-3xl flex items-center justify-center h-full">
		<div class="flex flex-col items-center">
		
			<div class="flex items-center space-x-4">
				<img src={BranchLogo} class="h-14 w-14 black-filter"/>
				<p class="font-bold text-5xl ">Branch</p>
			</div>
			<p class="text-sm mt-2">learning can be beautiful</p>

			<button class="text-sm px-4 py-1 bg-blue-600 text-white font-bold mt-4 rounded-sm border border-blue-500 shadow-7xl shadow-blue-900/50">Get Started </button>
		</div>
	</div>
</div>
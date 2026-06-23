
<script lang="ts">
	import TriangleDesigner from "$lib/components/TriangleDesigner.svelte";
	import OSBar from "$lib/layout-components/OSBar.svelte";
	import WindowLayer from "$lib/layout-components/WindowLayer.svelte";
</script>

<div class="h-screen flex flex-col">
	<div class="desktop relative flex-1 grow overflow-hidden">
		<div class="h-full flex items-center justify-center px-16">
			<TriangleDesigner />
		</div>

		<!-- Draggable, resizable windows -->
		<WindowLayer />
	</div>
	<OSBar />
</div>

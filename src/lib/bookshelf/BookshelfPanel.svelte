<script>
    import { game } from "$lib/game/index.svelte";
</script>

<div class="w-full h-screen flex items-center justify-center pb-24 ">
    <button onclick={() => game.renderer.state = "camp"} class="text-brand-gold bg-brand-surface-blue-900 rounded-sm px-2 py-1 text-sm font-semibold">Back to Camp</button>
</div>
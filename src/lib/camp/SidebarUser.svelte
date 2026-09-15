<script>
	import { GameState, game } from "$lib/game/index.svelte";
	import MOBABar from "$lib/layout-components/moba/MOBABar.svelte";
	import BranchMark from "$lib/toast/BranchMark.svelte";

</script>
<div class="h-full bg-brand-surface-blue-800 rounded-md border border-brand-blue/70 shadow-lg shadow-brand-blue-600/30 w-72 flex flex-col">
    <div class="flex flex-col gap-2 h-ful p-4">
        <!-- <p class="text-xs text-neutral-500">Afternoon adventurer.</p> -->
        <div class="flex items-center justify-between">
            <!-- TODO: EXPAND upon this idea -->
            <div class="flex items-center gap-2">
                <!-- bg-radial to-neutral-100 to-[600%]  -->
                <div class="w-10 h-10 bg-brand-blue flex items-center justify-center text-white from-neutral border border-neutral-400 hover:border-blue-400 cursor-pointer rounded-md">
                    <!-- <Sprite type="training-dummy"/> -->
                        <BranchMark />
                </div>
                
                <div class="flex flex-col text-left ">
                    <p class="font-semibold text-white flex items-center gap-2">cooperwl 
                        <!-- <span class="text-neutral-300 text-xs text-[10px] font-light">#0001</span> -->
                </p>
                    <p class="text-neutral-200 text-xs cursor-pointer hover:text-blue-300">Ranger Of The Greenwoods</p>
                </div>
            </div>
            
            <!-- <div class="bg-neutral-500 border cursor-pointer border-neutral-400 px-2 text-xs py-1 text-[10px] text-neutral-50 rounded-md">
                x
            </div> -->
        </div>

        <div class="h-[1px] w-full bg-brand-surface-blue-600 mt-1"></div>

        <div class="flex flex-col gap-1.5">
            <!-- TODO: Consolidate (?) design -->
            <div class="flex items-end justify-between">
                <p class="font-extrabold text-xs text-white">Level 2</p>
                <p class="text-neutral-300 text-xs text-[10px]">1,250 XP until next level</p>
            </div>
            <div class="relative h-3">
                <div class="absolute z-10 w-full h-3 bg-blue-300 bg-linear-to-t from-neutral-800 saturate-200 via-neutral-700 to-white to-300% rounded-sm border border-neutral-500"></div>
                <div class="absolute z-20 w-[28%]  h-3 bg-brand-sky bg-linear-to-b from-brand-green-800  via-blue-600 to-white to-400% rounded-sm rounded-r-none border border-neutral-500 border-r-white"></div>

                <div class="absolute inset-0 z-30 flex justify-evenly pointer-events-none border-none saturate-200">
                    <div class="w-px h-full bg-blue-600/90"></div>
                    <div class="w-px h-full bg-blue-600/90"></div>
                    <div class="w-px h-full bg-blue-600/90"></div>
                    <div class="w-px h-full bg-blue-600/90"></div>
                </div>
            </div>
        </div>

        <!-- <button onclick={() => (game.renderer.state = "encounter")}>SWITCH TO ENCOUNTER</button> -->
        <!-- ok this kinda shit lmao ill look into it -->
    </div>
</div>
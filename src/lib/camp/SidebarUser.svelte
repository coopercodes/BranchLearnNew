<script>
	import { GameState, game } from "$lib/game/index.svelte";
	import MOBABar from "$lib/layout-components/moba/MOBABar.svelte";
	import BranchMark from "$lib/toast/BranchMark.svelte";

</script>
<div class="h-full bg-brand-surface-blue-900 rounded-md border border-brand-blue/70 shadow-lg shadow-brand-blue-600/30 w-72 flex flex-col">
    <div class="flex flex-col gap-2 h-full p-4">
        <!-- <p class="text-xs text-neutral-500">Afternoon adventurer.</p> -->
        <div class="flex items-center justify-between">
            <!-- TODO: EXPAND upon this idea -->
            <div class="flex items-center gap-2">
                <!-- bg-radial to-neutral-100 to-[600%]  -->
                 
                <div class="relative w-10 h-10 bg-brand-blue flex items-center justify-center text-white from-neutral border border-neutral-400 hover:border-blue-400 cursor-pointer rounded-md">
                    <!-- <Sprite type="training-dummy"/> -->
                        <BranchMark />
                        <!-- <div class="absolute flex items-center top-8 justify-center font-bold  z-40 h-4 w-10  bg-brand-surface-blue-700 bg-linear-to-tr text-neutral-50 border border-neutral-500 saturate-200  via-neutral-600 to-blue-950 to-300% rounded-sm">
                            3
                        </div> -->
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

        <div class="flex flex-col gap-2">
            <!-- TODO: Consolidate (?) design -->
            
            <div class="relative flex items-center h-2.5 mt-1">
                <!-- <div class="absolute flex items-center justify-center font-bold left-0 z-40 h-5 w-10  bg-brand-surface-blue-700 bg-linear-to-tr text-neutral-50 border border-neutral-500 saturate-200  via-neutral-600 to-blue-950 to-300% rounded-sm">
                    3
                </div> -->
                <div class="absolute z-10 w-full h-2.5 bg-blue-300 bg-linear-to-t from-neutral-800 saturate-200 via-neutral-700 to-white to-300% rounded-sm border border-neutral-500"></div>
                <div class="absolute z-20 w-[28%]  h-2.5 bg-brand-sky bg-linear-to-b from-brand-green-800 saturate-150  via-blue-600 to-white to-400% rounded-sm rounded-r-none border border-neutral-500 border-r-blue-300"></div>

                <div class="absolute inset-0 z-30 flex justify-evenly pointer-events-none border-none saturate-200">
                    <div class="w-px h-full bg-blue-600/90"></div>
                    <div class="w-px h-full bg-blue-600/90"></div>
                    <div class="w-px h-full bg-blue-600/90"></div>
                    <div class="w-px h-full bg-blue-600/90"></div>
                </div>
            </div>
            <div class="flex items-center justify-between">
                <!-- <p class="font-extrabold text-xs text-white">Level 2</p> -->
                 <!-- until next level-->
             
                    <!-- <div class=" flex items-center justify-center font-bold  text-xs  z-40 h-4  px-2 bg-brand-surface-blue-700 bg-linear-to-tr text-neutral-50 border border-neutral-500 saturate-200  via-neutral-600 to-blue-950 to-300% rounded-sm">
                        Level 3
                    </div> -->

                    <div class=" flex items-center justify-center font-bold  text-xs  z-40 h-4 text-white rounded-sm">
                        Level 3
                    </div>
                       
               
                


                <!-- TODO: I like the idea of some type of XP bar related functionality here -->
                <!-- <p class="text-blue-200/80  text-xs text-[10px] cursor-pointer">Edit</p> -->
                 <p class="text-neutral-300 text-xs text-[10px]">1,250 XP remaining</p>
                <!-- <p class="text-neutral-300 mt-1 text-xs text-[10px] bg-brand-surface-blue-600 border cursor-pointer hover:bg-brand-surface-blue-700 border-blue-600/50 px-2 rounded-sm py-0.5">Edit Profile</p> -->
            </div>
        </div>


        

        <div class="h-[1px] w-full bg-brand-surface-blue-600 my-2"></div>


         <div class="flex mb-1">
            <p class=" text-xs text-[10px]  text-neutral-300">Activity</p>
        </div>
        <div class="flex flex-col gap-3">
           



            <div class="flex w-full items-center gap-2">
                <div class="flex items-center w-full gap-2">
                    <div class="rounded-sm bg-brand-surface-blue-700 border border-brand-gold h-7 w-7">

                    </div>
                    
                    <div class="flex flex-col justify-between">
                        <p class="text-xs text-neutral-100">Quest Completed</p>
                        <p class="text-xs italic text-neutral-300 text-[10px]">Training Grounds</p>
                    </div>
                </div>
                <p class=" text-xs text-neutral-400 text-nowrap font-light text-[10px]">2m ago</p>
            </div>

            <div class="flex w-full items-center gap-2">
                <div class="flex items-center w-full gap-2">
                    <div class="rounded-sm bg-brand-surface-blue-700 border border-brand-blue h-7 w-7">

                    </div>
                    
                    <div class="flex flex-col justify-between">
                        <p class="text-xs text-neutral-100">Area Unlocked</p>
                        <p class="text-xs italic text-neutral-300 text-[10px]">The Caves Of Triangulus</p>
                    </div>
                </div>
                <p class=" text-xs text-neutral-400 text-nowrap font-light text-[10px]">1h ago</p>
            </div>

            <div class="flex w-full items-center gap-2">
                <div class="flex items-center w-full gap-2">
                    <div class="rounded-sm bg-brand-surface-blue-700 border border-brand-crimson h-7 w-7">

                    </div>
                    
                    <div class="flex flex-col justify-between">
                        <p class="text-xs text-neutral-100">Encounter Completed</p>
                        <p class="text-xs italic text-neutral-300 text-[10px]">Overly Confident Triangle</p>
                    </div>
                </div>
                <p class=" text-xs text-neutral-400 text-nowrap font-light text-[10px]">2m ago</p>
            </div>
        </div>

        <div class="h-[1px] w-full bg-brand-surface-blue-600 my-2 mt-10"></div>


         <div class="flex grow mb-1">
            <p class=" text-xs text-[10px]  text-neutral-300">Masteries</p>
        </div>

        <div class="flex h-full gap-12">
            <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2">
                    <!-- TODO: make this shit the emerald one-->
                    <div class="w-2 h-2 rotate-45 bg-blue-600 border border-blue-300"></div>
                    <p class="text-xs text-white">0</p>
                </div>

                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rotate-45 bg-brand-orange border border-white"></div>
                    <p class="text-xs text-white">4</p>
                </div>

                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rotate-45 bg-neutral-600 border border-neutral-400"></div>
                    <p class="text-xs text-white">2</p>
                </div>
            </div>
            <div class="flex w-full bg-brand-surface-blue-700 border border-brand-surface-blue-600 p-2">
                <p class="text-neutral-100 font-extrabold text-xs text-[10px]">Focus</p>
            </div>
        </div>
        

        <!-- <button onclick={() => (game.renderer.state = "encounter")}>SWITCH TO ENCOUNTER</button> -->
        <!-- ok this kinda shit lmao ill look into it -->
    </div>
</div>
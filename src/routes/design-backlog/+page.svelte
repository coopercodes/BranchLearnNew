<script>
	import MasteryBadge from "$lib/masteries/MasteryBadge.svelte";
	import MasteryCard from "$lib/masteries/MasteryCard.svelte";

</script>



<div class="flex flex-col gap-6 p-6 h-[2500px]">
    <p class="text-xs font-semibold">Window</p>

        <div class="w-64 h-72 bg-brand-surface-blue-900 rounded-sm border border-neutral-500">
            <div class="flex items-center justify-between select-none w-full border-b p-1.5 px-2 border-b-neutral-500  cursor-grab">
                <div class="flex items-center gap-2"> 
                    <div class="rotate-45 ml-1 bg-brand-gold h-1.5 w-1.5 ring ring-amber-300"></div>
                    <p class="text-white text-xs">Active Quest</p>
                </div>

                <div class="flex items-center gap-2">
                <!-- bg-blue-600 text-blue-200 -->
                    <!-- 
                    <div class=" text-xs text-[10px] rounded-sm text-neutral-300 ">Pin</div>
                    <div class="flex text-xs text-[10px] font-extrabold items-center justify-center rounded-sm border cursor-pointer h-5 w-5 bg-brand-blue text-white border-brand-surface-blue-600">X</div> 
                    -->

                    <div class="flex text-xs text-[10px] font-extrabold items-center justify-center rounded-sm border cursor-pointer h-4.5 w-4.5 bg-brand-crimson/60 hover:bg-brand-crimson text-red-400 hover:text-red-100 border-brand-crimson-dark">X</div>
                </div>
            </div>
        </div>

    <p class="text-xs font-semibold">Masteries</p>

    <div class="relative flex  w-24 h-24 bg-amber-50">
        <div class="flex items-center justify-center mx-auto">

            <div class="rotate-45 absolute w-6 h-6 bg-linear-0 from-blue-700 to-brand-blue rounded-sm ring ring-blue-200">

            </div>
            <p class="absolute text-xs z-20 text-white font-black">IV</p>
        </div>
    </div>
    <MasteryBadge size="tiny" level={4} mastery="expert" />

    <MasteryBadge level={1} mastery="adept" />
    <MasteryBadge level={5} mastery="apprentice" />

    <div class="w-[400px] ">
        <MasteryCard title="Right Triangles" subject="Trigonometry" mastery="apprentice" level={2} theme="mastery" />
    </div>
    
</div>
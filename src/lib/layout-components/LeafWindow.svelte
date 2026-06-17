<script>
	import Leaf from "$lib/Leaf.svelte";

    let screen = $state("chat");

</script>



<div class="h-[500px] w-[400px] shadow-2xl/35 border-black border rounded-sm bg-[#F5EDE7] fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
    <div class="flex flex-col h-full">
        <div class="flex bg-[#e9e1db] rounded-t-sm justify-between border-b px-2 p-1">
            <div class="flex items-center space-x-2">
                <!-- <p class="text-sm font-semibold text-neutral-800">Leaf</p> -->
                <div class="flex items-center space-x-2">
                <Leaf color="#386d4f" width={26} height={26}/>
                    <p class='text-xs font-semibold' >Chat</p>
                    <p class='text-xs'>History</p>
                    <p class='text-xs'>Settings</p>
                </div>
            </div>

            <div class="flex space-x-2 items-center">
                <div class="h-4 w-4 bg-red-800/70 cursor-pointer hover:bg-red-800 rounded-full"> </div>
            </div>
        </div>

        {#if screen == "intro"}
            <div class="w-full h-full flex flex-col items-center justify-center">
                <div class="flex items-center space-x-2">
                    <Leaf color="#386d4f" width={44} height={44}/>
                    <p class="text-4xl font-semibold">Leaf</p>
                </div>  
                <p class="text-center font-thin text-lg my-2">Nice to meet you, I'm Leaf. <br/> Let's learn something new today.</p>

                <textarea class="text w-[300px] mt-4 text rounded-sm p-4 bg-neutral-100">asdf</textarea>
                <p class="bg-brand-blue/20  text-brand-blue px-2 rounded-sm text-xs mt-2 font-thin">1 selected</p>
            </div>
        {:else if screen == "chat"}
            <div class="w-full h-full flex flex-col items-start justify-start p-4">
                <div class="bg-brand-forest p-4 w-full text-base rounded-sm">
                    <p class="text-sm text-white">Can you explain the basic of how I can use the COS() operator in this problem?</p>
                </div>
                <p class="bg-brand-blue/20  text-brand-blue px-2 rounded-sm text-xs mt-2 font-thin">1 selected</p>

                <div class="mt-4">
                    <div class="flex items-center mb-2">
                        <Leaf color="#386d4f" width={22} height={22} /> 
                        <div class=" grow h-[1px] bg-brand-forest ml-1"></div>
                        <div class=" ml-2 mb-2">...</div>
                    </div>
                    <p class="text-sm">Sure! The first thing we need to understand is that the cos() operator you're talking about is the right thing to talk about.</p>
                    <p class="text-sm mt-4">We can figure this out by using the equation below.</p>
                    <p class="text-sm text-center font-mono mt-4">E = mc*(dood)</p>
                    <p class="text-sm mt-4">This equation helps us understand that the DOOD is a scalar property upon energy. Uhhhh, anyone seen the dood recently!</p>
                </div>
            </div>
        {/if}
    </div>
</div>
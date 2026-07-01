<script>
	import Book from "$lib/Book.svelte";
	import Leaf from "$lib/Leaf.svelte";

    let screen = $state("intro");
    let sidebarOpen = $state(true);

</script>



<div class="h-[700px] w-[500px] shadow-2xl/35 border-black border rounded-sm bg-[#F5EDE7] fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
    <div class="flex flex-col h-full">
        <div class="flex bg-[#e9e1db] rounded-t-sm justify-between border-b px-2 p-1">
            <div class="flex items-center space-x-2">
                <!-- <p class="text-sm font-semibold text-neutral-800">Leaf</p> -->
                <div class="flex items-center space-x-2">
                    <Book color="#8B5A34" width={24} height={24}/>
                    <p class='text-xs font-semibold' >Textbook</p>
                    <p class='text-xs'>Settings</p>
                </div>
            </div>

            <div class="flex space-x-2 items-center">
                <div class="h-4 w-4 bg-red-800/70 cursor-pointer hover:bg-red-800 rounded-full"> </div>
            </div>
        </div>

        <div class="relative flex h-full overflow-hidden">

            <!-- Floating toggle: book icon to open, panel icon to close. Lives over the content, not the title bar. -->
            <button
                type="button"
                class="absolute top-2 left-2 z-40 flex items-center justify-center rounded-full bg-[#F5EDE7] shadow p-1.5 hover:brightness-95 cursor-pointer"
                onclick={() => (sidebarOpen = !sidebarOpen)}
                aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
                {#if sidebarOpen}
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5A34" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-panel-left-close-icon lucide-panel-left-close"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/></svg>
                {:else}
                    <Book color="#8B5A34" width={18} height={18}/>
                {/if}
            </button>

            <!-- Article always fills the window; the sidebar overlays on top of it -->
            <div class="w-full h-full flex flex-col items-center justify-center p-4">
                <p class="text-left font-semibold w-full">Introduction</p>
                <p class=" my-2">
                    This is an introduction article which currently has no real content. The goal is to have full articles that the user can read here.
                </p>
                <p class=" my-2">
                    This is a second piece of text that the user can read. Also cool, also chill.
                </p>
            </div>

            {#if sidebarOpen}
                <!-- Backdrop dims the article behind the open sidebar -->
                <button
                    type="button"
                    class="absolute inset-0 bg-black/40 cursor-default"
                    aria-label="Close sidebar"
                    onclick={() => (sidebarOpen = false)}
                ></button>
            {/if}

            <div class="absolute inset-y-0 left-0 w-60 h-full bg-[#E4CBA6] rounded-bl p-2 pt-10 transition-transform duration-200 ease-out {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}">
                <div class="flex flex-col">
                    <p class="font-medium">
                        SAT Trigonometry
                    </p>
                </div>
            </div>
        </div>
        
    </div>
</div>
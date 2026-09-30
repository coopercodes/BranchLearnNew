
<script lang="ts">
    import { desktop, type AppDef, APPS } from "$lib/os/windowStore.svelte";
    
    let questLog = { id: 'quest-log', label: 'Quest Log', title: "BACKPACK LEAF", app: APPS[3] }

    function dockClick(app: AppDef) {
		const w = desktop.find(app.id);
		if (w && w.minimized) {
			desktop.open(app);
		} else {
			desktop.toggle(app);
		}
	}
</script>

<button onclick={() => dockClick(questLog.app)} class=" bg-brand-surface-blue-800 text-left hover:bg-brand-surface-blue-700 bg-linear-to-br cursor-pointer flex gap-1 flex-col w-full rounded-sm p-2 border  border-brand-gold/70 m-2">
    <div class="flex items-center gap-2">
        <div class="w-1.5 h-1.5 bg-amber-400 rotate-45"></div>
        <p class="text-[9px] text-sm font-bold text-amber-400">Active Quest</p>
                            <!-- <div class="w-1.5 h-1.5 bg-amber-400 rotate-45"></div> -->

    </div>
    <div class="text-neutral-100 text-sm italic text-[8px]">Training For Triangulon </div>
    <p class="text-neutral-300 leading-4 text-[10px]"><span class="rounded-sm mr-[2px] py-0 text-[10px] font-extrabold">0 / 1</span> Defeat the Training Dummy</p>
</button>
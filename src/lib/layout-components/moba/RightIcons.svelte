<script lang="ts">
	// import Leaf from '$lib/icons/Leaf.svelte';
	// import Textbook from '$lib/icons/Textbook.svelte';
	// import Backpack from '$lib/icons/Backpack.svelte';
    import { desktop, APPS, type AppDef } from '$lib/os/windowStore.svelte';

	// import Avatar from '$lib/icons/Avatar.svelte';
    import Leaf from '$lib/Leaf.svelte';
    import Book from '$lib/Book.svelte';

	let open = $state({
		leaf: false,
		textbook: false,
		backpack: false,
		profile: false
	});

	const slots = [
		{ id: 'leaf', label: 'AI Tutor', title: "AI TUTOR LEAF"},
		{ id: 'textbook', label: 'Textbook', title: "TEXTBOOK LEAF"},
		{ id: 'backpack', label: 'Backpack', title: "BACKPACK LEAF" }
	] as const;

	const toggle = (id: string) => (open[id] = !open[id]);

    function dockClick(app: AppDef) {
		const w = desktop.find(app.id);
		if (w && w.minimized) {
			desktop.open(app);
		} else {
			desktop.toggle(app);
		}
	}
</script>

{#snippet leafIcon()}
    <Leaf width="26" height="26" />
{/snippet}

{#snippet textbookIcon()}
    <Book width="26" height="26" />
{/snippet}

{#snippet backpackIcon()}
	<svg viewBox="0 0 24 24" class="relative h-[18px] w-[18px] [filter:drop-shadow(0_1px_1px_#000)]"
	     fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
		<path d="M6 21a2 2 0 0 1-2-2v-8a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v8a2 2 0 0 1-2 2Z" />
		<path d="M9 5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
		<path d="M8 21v-5.5A1.5 1.5 0 0 1 9.5 14h5a1.5 1.5 0 0 1 1.5 1.5V21" />
		<path d="M11 17h2" />
	</svg>
{/snippet}

{#snippet avatarIcon()}
	<svg viewBox="0 0 24 24" class="relative h-[13px] w-[13px] shrink-0 [filter:drop-shadow(0_1px_1px_#000)]"
	     fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
		<circle cx="12" cy="8.5" r="3.5" />
		<path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
	</svg>
{/snippet}

<div class="my-2 mx-2 flex w-[150px] flex-col gap-[4px] rounded-tr-md">
	<div class="flex gap-[3px]">
		{#each slots as slot (slot.id)}
			{@const Icon =
				slot.id === 'leaf' ? leafIcon : slot.id === 'textbook' ? textbookIcon : backpackIcon}
			{@const w = desktop.find(slot.id)}
            {@const isOpen = !!w}
            {@const active = !!w && !w.minimized && w.z === desktop.topZ}

            <button
				class="group cursor-pointer relative flex-1 rounded-[3px] bg-brand-surface-blue-600 p-[2px]
				       shadow-[0_1px_2px_rgba(0,0,0,0.7)] ring-1 ring-black"
				onclick={() => dockClick(slot)}
				class:is-open={isOpen}
				style:--accent={"#1A1A1A"}
				aria-pressed={isOpen}
				aria-label="{slot.title}{isOpen ? ' (open)' : ''}"
				title={slot.title}
			>
				<span
					class="relative flex h-[32px] items-center justify-center overflow-hidden rounded-[2px]
					       bg-[#050b16] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]
					       transition-colors duration-150 group-hover:bg-[#0b1526]"
					class:text-blue-50={open[slot.id]}
					class:text-blue-100={!open[slot.id]}
					class:opacity-60={!open[slot.id]}
				>
					<span
						class="absolute inset-0 transition-opacity duration-200 ease-out
						       bg-gradient-to-t from-blue-600 via-blue-700 to-blue-800"
						class:opacity-0={!open[slot.id]}
					>
						<span class="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-white/0"></span>
					</span>
					{@render Icon()}
				</span>

				<span
					class="pointer-events-none absolute inset-0 rounded-[3px] ring-1 ring-inset
					       transition-colors duration-200"
					class:ring-blue-600={open[slot.id]}
					class:ring-neutral-600={!open[slot.id]}
				></span>
			</button>
		{/each}
        
	</div>

	<button
		class="group cursor-pointer relative rounded-[3px] h-[34px] bg-brand-surface-blue-600 p-[2px]
		       shadow-[0_1px_2px_rgba(0,0,0,0.)] ring-1 ring-black"
		onclick={() => toggle('profile')}
		aria-pressed={open.profile}
		title="Profile"
	>
		<span
			class="relative flex h-full items-center gap-[5px] overflow-hidden rounded-[2px] px-[6px]
			       bg-[#050b16] shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]
			       transition-colors duration-150 group-hover:bg-[#0b1526]"
			class:text-blue-200={open.profile}
			class:text-blue-100={!open.profile}
			class:opacity-60={!open.profile}
		>
			<span
				class="absolute inset-0 transition-opacity duration-200 ease-out
				       bg-gradient-to-t from-blue-600 via-blue-700 to-blue-800"
				class:opacity-0={!open.profile}
			>
				<span class="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-white/0"></span>
			</span>
			{@render avatarIcon()}
			<span
				class="relative text-[10px] font-extrabold uppercase leading-none tracking-[0.08em]
				       [text-shadow:0_1px_1px_#000]"
			>
				Profile
			</span>
		</span>

		<span
			class="pointer-events-none absolute inset-0 rounded-[3px] ring-1 ring-inset
			       transition-colors duration-200"
			class:ring-blue-600={open.profile}
			class:ring-neutral-600={!open.profile}
		></span>
	</button>
</div>
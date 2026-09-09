<script>
  import { slide } from 'svelte/transition';
  import { SvelteSet } from 'svelte/reactivity';

  // Swap this for real data / a store as needed.
  const categories = [
    {
      name: 'Daily Quests',
      daily: true,
      quests: [
        { name: 'Triangulon Training', time: '25m est', type: 'encounter' },
        { name: 'Morning Patrol', time: '10m est', type: 'friendly' }
      ]
    },
    {
      name: 'Pythagorean Marshes',
      daily: false,
      quests: [
        { name: 'Reeds and Ruin', time: '40m est', type: 'encounter' },
        { name: "The Cartographer's Request", time: '15m est', type: 'friendly' }
      ]
    },
    {
      name: 'Tutorial',
      daily: false,
      quests: [
        { name: 'Training For Triangulon', time: '20m est', type: 'friendly' }
      ]
    }
  ];

  // SvelteSet is already reactive on its own — no $state() wrapper needed,
  // and .add()/.delete() now correctly trigger updates (this is the fix
  // for the dropdowns not opening/closing).
  let openSections = new SvelteSet(['Daily Quests']);
  let selectedQuest = $state(null);

  function toggleSection(name) {
    if (openSections.has(name)) {
      openSections.delete(name);
    } else {
      openSections.add(name);
    }
  }

  function questKey(category, quest) {
    return `${category.name}::${quest.name}`;
  }

  function selectQuest(key) {
    selectedQuest = selectedQuest === key ? null : key;
  }
</script>

<div class="h-full bg-brand-surface-blue-800 rounded-md border border-brand-gold/70 shadow-lg shadow-brand-surface-blue-600/30 w-72 flex flex-col">
  <div class="px-4 py-3 border-b border-brand-gold/20">
    <h2 class="text-sm uppercase tracking-wide text-brand-gold font-semibold">Quest Log</h2>
  </div>

  <div class="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
    {#each categories as category (category.name)}
      <div class="flex flex-col">
        <button
          type="button"
          class="flex items-center justify-between w-full py-2"
          onclick={() => toggleSection(category.name)}
          aria-expanded={openSections.has(category.name)}
        >
          <div class="flex items-center gap-2">
            <div
              class="w-2 h-2 rotate-45 border shrink-0 transition-colors
                {category.daily ? 'border-brand-gold' : 'border-neutral-500'}
                {openSections.has(category.name) ? (category.daily ? 'bg-brand-gold' : 'bg-neutral-500') : ''}"
            ></div>
            <span
              class="text-xs uppercase tracking-wide font-semibold
                {category.daily ? 'text-brand-gold' : 'text-neutral-300'}"
            >
              {category.name}
            </span>
          </div>
          <svg
            class="w-3 h-3 text-neutral-500 transition-transform {openSections.has(category.name) ? 'rotate-180' : ''}"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        {#if openSections.has(category.name)}
          <div class="flex flex-col gap-1.5 pb-3 pl-1" transition:slide={{ duration: 150 }}>
            {#each category.quests as quest (quest.name)}
              {@const key = questKey(category, quest)}
              {@const isSelected = selectedQuest === key}
              <button
                type="button"
                class="flex flex-col gap-1 w-full text-left rounded-sm px-1.5 py-1 -mx-1.5 transition-colors
                  {isSelected ? 'bg-brand-surface-blue-700/60' : 'hover:bg-brand-surface-blue-700/30'}"
                onclick={() => selectQuest(key)}
                aria-pressed={isSelected}
              >
                <div class="flex items-center gap-2">
                  {#if quest.type === 'encounter'}
                    <div class="w-3 h-3 rotate-45 bg-red-500 shrink-0 flex items-center justify-center">
                      <div class="-rotate-45 flex items-center justify-center">
                        <svg class="w-1.5 h-1.5" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M8 2.2c-2.6 0-4.6 1.9-4.6 4.5 0 1.6.8 2.7 1.4 3.4v2c0 .3.2.5.5.5h1v-1h.9v1h1.6v-1h.9v1h1c.3 0 .5-.2.5-.5v-2c.6-.7 1.4-1.8 1.4-3.4 0-2.6-2-4.5-4.6-4.5Z"
                            fill="white"
                          />
                          <circle cx="6.1" cy="6.8" r="1" fill="#ef4444" />
                          <circle cx="9.9" cy="6.8" r="1" fill="#ef4444" />
                        </svg>
                      </div>
                    </div>
                  {:else}
                    <div class="w-3 h-3 rotate-45 bg-emerald-500 shrink-0"></div>
                  {/if}
                  <span class="text-sm {isSelected ? 'text-brand-gold' : 'text-neutral-100'}">{quest.name}</span>
                </div>

                <div class="flex items-center gap-1.5 text-neutral-400 pl-3.5">
                  <svg class="w-3 h-3" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2" />
                    <path d="M8 4.5V8L10.2 9.6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
                  </svg>
                  <span class="text-[11px] tabular-nums">{quest.time}</span>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
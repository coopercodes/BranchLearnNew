<script>
	import Sprite from "./sprites/Sprite.svelte";
  import MobHealthBar from "$lib/layout-components/moba/MobHealthBar.svelte";
  // QuestionChip.svelte — Svelte 5 (runes)
  //
  // Fixed chip near the top of the screen, tracking time-on-question.
  //
  //   'timer'  — just the timer tab (a small pill with the digits)
  //   'enemy'  — a blank card grows above it, and the timer tab slides up
  //              to notch over the card's bottom edge like a physical tab
  //
  // The card body is intentionally empty: pass an `enemy` snippet to fill it.

  let {
    mode = $bindable('enemy'), // 'timer' | 'enemy'
    enemy, // snippet rendered inside the card
  } = $props();

  const isEnemy = $derived(mode === 'enemy');

  // ---- timer -------------------------------------------------------------
  let seconds = $state(0);

  $effect(() => {
    const t = setInterval(() => (seconds += 1), 1000);
    return () => clearInterval(t);
  });

  const mm = $derived(String(Math.floor(seconds / 60)).padStart(2, '0'));
  const ss = $derived(String(seconds % 60).padStart(2, '0'));

  export function reset() {
    seconds = 0;
  }

  const EASE = 'ease-[cubic-bezier(0.3,0.9,0.3,1)]';
</script>

<div
  class="fixed top-2 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center
         text-black"
>
<!-- card grows above the timer tab (0fr -> 1fr height morph) -->

  <div class="min-h-0 overflow-hidden">
    <div class="flex bg-white overflow-hidden to-white w-[262px] h-[52px] rounded-sm border border-neutral-500">
        <div class="flex relative rounded-l-sm w-[52px]">
          <div class="absolute left-0 bottom-0 w-16 h-full bg-linear-to-r from-neutral-300 to-tranparent">

          </div>
          <Sprite
            type="training-dummy"
            class="z-40 relative items-center justify-center -left-1 rotate-1"
          />
        </div>
        <div class="flex flex-col p-2 gap-1 grow justify-between">
          <div class="flex w-full grow justify-between">
            <p class="text-xs font-semibold">Training Dummy</p>
            <div class="flex">
              <div class="h-4 w-4 flex items-center justify-center bg-brand-crimson-dark border border-brand-crimson rounded-sm text-white">
                <p class="text-[12px] font-extrabold">1</p>
              </div>
            </div>
          </div>
          <div class="flex">
            <div class="bg-neutral-300 w-full h-[16px] rounded-sm">
              <MobHealthBar  />
              <!-- hp={mob.hp} maxHp={mob.maxHp} label={mob.name} -->
            </div>
          </div>
        </div>
    </div>
    
    <!-- pb-5 leaves room for the tab to notch into -->
    
    
  </div>
</div>

<!-- timer tab: the whole chip in timer mode, notched into the card in enemy mode -->
{#if !isEnemy}
  <div
    class="relative z-[1] w-[72px] grid h-[24px] place-items-center rounded-lg border border-black/10
          bg-white px-3 shadow-sm transition-[margin-top] duration-[400ms] {EASE}
          motion-reduce:transition-none {isEnemy ? '-mt-[12px]' : 'mt-0'}"
  >
    <span class="text-[11px] font-medium tracking-[0.06em] tabular-nums">{mm}:{ss}</span>
  </div>
{/if}

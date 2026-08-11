<script>
  // QuestionChip.svelte — Svelte 5 (runes)
  //
  // Small fixed chip near the top of the screen tracking time-on-question.
  // 'timer'  — just the timer tab (a small cream pill with the digits)
  // 'enemy'  — a quiet frame (portrait, name, level, thin HP bar) grows
  //            above, and the same timer tab slides up to hang off its
  //            bottom edge, notched over the border like a physical tab.
  //
  // FX:
  // - level badge sits on the bottom-right of the portrait
  // - damage triggers a 1-2 double slash + particles bursting left/right/up
  // - a red ring fills around the portrait; when it completes, the enemy
  //   lunges and "hits" the player (slash across the timer tab + shake)
  // - player attacks have a 50% crit chance -> WoW-style CRITICAL HIT toast
  // - full-screen gradient + particle layer reacts to every action:
  //     player deals damage  -> blue
  //     player gets hit      -> red
  //     critical hit         -> red vignette + gold particle burst

  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import { fade, fly } from 'svelte/transition';

  // ---- hardcoded for now -------------------------------------------------
  const userLevel = 12;
  const enemy = { name: 'Triangulus The Third', level: 14, maxHp: 100 };
  const ATTACK_MS = 8000; // time for the ring to fill before the enemy strikes
  const CRIT_CHANCE = 0.5;

  // ---- state -------------------------------------------------------------
  let mode = $state('timer'); // 'timer' | 'enemy'
  let hp = $state(75);
  let seconds = $state(0);
  let shaking = $state(false);
  let healing = $state(false);
  let hits = $state([]); // floating combat numbers
  let hitId = 0;

  // damage FX (inside the frame)
  let slashes = $state([]); // double-slash overlays
  let slashId = 0;
  let particles = $state([]); // burst particles
  let particleId = 0;

  // enemy attack cycle
  let attackProgress = $state(0); // 0..1, drives the red ring
  let attacking = $state(false); // true while the lunge/hit plays

  // crit toasts + full-screen FX
  let toasts = $state([]);
  let toastId = 0;
  let screenFx = $state([]); // [{ id, kind: 'player'|'enemy'|'crit', particles }]
  let screenFxId = 0;

  // Fast bar = actual HP. Ghost bar lags behind on damage.
  const hpBar = new Tween(75, { duration: 160, easing: cubicOut });
  const hpGhost = new Tween(75, { duration: 600, easing: cubicOut });

  // ---- timer -------------------------------------------------------------
  $effect(() => {
    const t = setInterval(() => (seconds += 1), 1000);
    return () => clearInterval(t);
  });

  // ---- enemy attack ring -------------------------------------------------
  $effect(() => {
    if (mode !== 'enemy') {
      attackProgress = 0;
      attacking = false;
      return;
    }
    let raf;
    let last = performance.now();
    const tick = (now) => {
      if (!attacking) {
        attackProgress = Math.min(1, attackProgress + (now - last) / ATTACK_MS);
        if (attackProgress >= 1) enemyAttack();
      }
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });

  const mm = $derived(String(Math.floor(seconds / 60)).padStart(2, '0'));
  const ss = $derived(String(seconds % 60).padStart(2, '0'));

  // Difficulty color relative to the user's level, from the brand palette.
  const diff = $derived(enemy.level - userLevel);
  const levelColor = $derived(
    diff >= 3 ? '#D42622' : diff >= 1 ? '#F35D29' : diff >= -2 ? '#898881' : '#386D4F'
  );

  // ring geometry (r=16.5 inside a 36x36 viewBox)
  const RING_C = 2 * Math.PI * 16.5;

  // ---- full-screen FX ----------------------------------------------------
  const GOLDS = ['#fff1b8', '#ffd34d', '#f5b325', '#e09112'];
  const BLUES = ['#a9cbe8', '#5b9bd5', '#2f6fb5', '#1d4e89'];
  const REDS = ['#f0a29e', '#f35d29', '#d42622', '#8f1512'];

  function makeScreenParticles(kind) {
    const count = kind === 'crit' ? 26 : 16;
    const palette = kind === 'crit' ? GOLDS : kind === 'player' ? BLUES : REDS;
    return Array.from({ length: count }, (_, id) => {
      const base = {
        id,
        color: palette[Math.floor(Math.random() * palette.length)],
        size: 3 + Math.random() * 5,
        delay: Math.random() * 180,
        dur: 750 + Math.random() * 550,
        spin: (Math.random() * 2 - 1) * 300,
        sparkle: kind === 'crit' && Math.random() < 0.55,
      };
      if (kind === 'crit') {
        // gold burst radiating from the toast
        const angle = Math.random() * Math.PI * 2;
        const dist = 16 + Math.random() * 32;
        return {
          ...base,
          size: base.size + 2,
          x: 50 + (Math.random() * 6 - 3),
          y: 40 + (Math.random() * 6 - 3),
          dx: `${Math.cos(angle) * dist}vmin`,
          dy: `${Math.sin(angle) * dist}vmin`,
        };
      }
      if (kind === 'player') {
        // blue motes rising from the bottom edge
        return {
          ...base,
          x: Math.random() * 100,
          y: 102,
          dx: `${(Math.random() * 2 - 1) * 8}vw`,
          dy: `${-(28 + Math.random() * 45)}vh`,
        };
      }
      // enemy: red shards raining from the top edge
      return {
        ...base,
        x: Math.random() * 100,
        y: -4,
        dx: `${(Math.random() * 2 - 1) * 8}vw`,
        dy: `${28 + Math.random() * 45}vh`,
      };
    });
  }

  function flashScreen(kind) {
    const id = ++screenFxId;
    screenFx = [...screenFx, { id, kind, particles: makeScreenParticles(kind) }];
    setTimeout(() => (screenFx = screenFx.filter((f) => f.id !== id)), 1500);
  }

  function showCritToast() {
    const id = ++toastId;
    toasts = [...toasts, { id }];
    setTimeout(() => (toasts = toasts.filter((t) => t.id !== id)), 1300);
  }

  // ---- actions -----------------------------------------------------------
  function toggleMode() {
    mode = mode === 'timer' ? 'enemy' : 'timer';
  }

  function playerAttack() {
    const crit = Math.random() < CRIT_CHANCE;
    if (crit) {
      showCritToast();
      flashScreen('crit');
    } else {
      flashScreen('player');
    }
    changeHp(crit ? -24 : -12, crit); // crits hit for double
  }

  function enemyAttack() {
    attacking = true;
    attackProgress = 0;
    // impact lands mid-lunge
    setTimeout(() => {
      shaking = true;
      flashScreen('enemy'); // the player takes the hit -> red wash
      setTimeout(() => (shaking = false), 300);
    }, 220);
    setTimeout(() => (attacking = false), 700);
  }

  function spawnDamageFx(crit = false) {
    // 1-2 double slash (second streak is delayed in CSS)
    const sid = ++slashId;
    slashes = [...slashes, { id: sid, crit }];
    setTimeout(() => (slashes = slashes.filter((s) => s.id !== sid)), 700);

    // particles fanning left / up / right
    const dirs = [
      { dx: -30, dy: -4 },
      { dx: -22, dy: -18 },
      { dx: -10, dy: -28 },
      { dx: 0, dy: -32 },
      { dx: 10, dy: -28 },
      { dx: 22, dy: -18 },
      { dx: 30, dy: -4 },
    ];
    const source = crit ? [...dirs, ...dirs] : dirs; // crits throw twice as many
    const spawned = source.map((d, i) => ({
      id: ++particleId,
      dx: d.dx + (Math.random() * 10 - 5),
      dy: d.dy + (Math.random() * 8 - 4),
      delay: Math.random() * 90,
      size: 2 + Math.round(Math.random() * 2),
      gold: crit && i % 2 === 0,
    }));
    particles = [...particles, ...spawned];
    const ids = new Set(spawned.map((p) => p.id));
    setTimeout(() => (particles = particles.filter((p) => !ids.has(p.id))), 950);
  }

  function changeHp(delta, crit = false) {
    const next = Math.max(0, Math.min(enemy.maxHp, hp + delta));
    const applied = next - hp;
    if (applied === 0) return;
    hp = next;

    if (applied < 0) {
      // damage: real bar snaps, ghost drains after a beat
      hpBar.set(next, { duration: 140 });
      hpGhost.set(next, { duration: 600, delay: 220 });
      shaking = true;
      setTimeout(() => (shaking = false), crit ? 450 : 300);
      spawnDamageFx(crit);
    } else {
      // heal: ghost leads, real bar catches up smoothly
      hpGhost.set(next, { duration: 140 });
      hpBar.set(next, { duration: 450 });
      healing = true;
      setTimeout(() => (healing = false), 450);
    }

    const id = ++hitId;
    hits = [...hits, { id, amount: applied, crit }];
    setTimeout(() => (hits = hits.filter((h) => h.id !== id)), 850);
  }
</script>

<!-- ======================= full-screen FX layer ======================= -->
{#each screenFx as fx (fx.id)}
  <div class="screen-fx {fx.kind}" aria-hidden="true">
    <div class="vignette"></div>
    {#each fx.particles as p (p.id)}
      <span
        class="sp"
        class:sparkle={p.sparkle}
        style:left="{p.x}%"
        style:top="{p.y}%"
        style:width="{p.size}px"
        style:height="{p.size}px"
        style:background={p.color}
        style:--dx={p.dx}
        style:--dy={p.dy}
        style:--spin="{p.spin}deg"
        style:animation-delay="{p.delay}ms"
        style:animation-duration="{p.dur}ms"
      ></span>
    {/each}
  </div>
{/each}

<!-- ======================= CRITICAL HIT toast ======================= -->
{#each toasts as t (t.id)}
  <div class="crit-toast" aria-live="polite">
    <span class="crit-text">CRITICAL HIT!</span>
  </div>
{/each}

<!-- ======================= the chip ======================= -->
<div class="chip" class:enemy={mode === 'enemy'} class:shake={shaking}>
  <!-- enemy frame grows above the timer tab -->
  <div class="grow">
    <div class="clip">
      {#if mode === 'enemy'}
        <div class="frame" in:fade={{ duration: 220, delay: 140 }} out:fade={{ duration: 100 }}>
          <!-- portrait: flat geometric mark + attack ring + level badge -->
          <div class="portrait" class:attacking>
            <!-- red attack ring filling clockwise from the top -->
            <svg class="ring" viewBox="0 0 36 36" aria-hidden="true">
              <circle
                class="ring-fill"
                cx="18"
                cy="18"
                r="16.5"
                style:stroke-dasharray={RING_C}
                style:stroke-dashoffset={RING_C * (1 - attackProgress)}
              />
            </svg>

            <svg class="face" viewBox="0 0 32 32" aria-hidden="true">
              <circle cx="16" cy="16" r="16" fill="#EDE6DC" />
              <path d="M16 7 26 24H6z" fill="#262D38" />
              <circle cx="13" cy="20" r="1.2" fill="#F8FAEC" />
              <circle cx="19" cy="20" r="1.2" fill="#F8FAEC" />
            </svg>

            <!-- level marker, bottom-right of the profile -->
            <span class="badge" style:background={levelColor}>{enemy.level}</span>
          </div>

          <!-- name + health -->
          <div class="unit">
            <div class="name-row" in:fly={{ y: -4, duration: 240, delay: 200 }}>
              <span class="name">{enemy.name}</span>
              <!-- <span class="hp-num">{hp}</span> -->
            </div>

            <div class="hp-track" class:healing in:fly={{ y: 3, duration: 240, delay: 240 }}>
              <div class="hp-ghost" style:width="{hpGhost.current}%"></div>
              <div class="hp-fill" style:width="{hpBar.current}%"></div>
            </div>
          </div>

          <!-- floating combat numbers -->
          {#each hits as hit (hit.id)}
            <span class="hit" class:heal={hit.amount > 0} class:crit={hit.crit}>
              {hit.amount > 0 ? `+${hit.amount}` : hit.amount}
            </span>
          {/each}

          <!-- 1-2 double slash on damage -->
          {#each slashes as s (s.id)}
            <div class="slash-fx" class:crit={s.crit}>
              <span class="slash s1"></span>
              <span class="slash s2"></span>
            </div>
          {/each}

          <!-- burst particles on damage -->
          {#each particles as p (p.id)}
            <span
              class="particle"
              class:gold={p.gold}
              style:--dx="{p.dx}px"
              style:--dy="{p.dy}px"
              style:width="{p.size}px"
              style:height="{p.size}px"
              style:animation-delay="{p.delay}ms"
            ></span>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <!-- timer tab: the whole chip in timer mode; notches over the frame's bottom edge in enemy mode -->
  <div class="tab" class:struck={attacking}>
    <span class="digits">{mm}:{ss}</span>
    {#if attacking}
      <span class="tab-slash" aria-hidden="true"></span>
    {/if}
  </div>
</div>

<!-- ======================= demo controls ======================= -->
<div class="demo">
  <button class="btn primary" onclick={toggleMode}>
    {mode === 'timer' ? 'Encounter' : 'Timer'}
  </button>
  <button class="btn" onclick={playerAttack} disabled={mode !== 'enemy'}>−12</button>
  <button class="btn" onclick={() => changeHp(8)} disabled={mode !== 'enemy'}>+8</button>
</div>

<style>
  /* ---------- brand tokens ---------- */
  .chip,
  .demo,
  .screen-fx,
  .crit-toast {
    --white: #ffffff;        /* brand-white */
    --off-white: #f8faec;    /* brand-off-white */
    --cream: #ede6dc;        /* brand-cream */
    --gray-light: #bcbfbe;   /* brand-gray-light */
    --gray-mid: #898881;     /* brand-gray-mid */
    --navy: #262d38;         /* brand-navy */
    --near-black: #1a1a1a;   /* brand-near-black */
    --crimson: #d42622;      /* brand-crimson */
    --forest: #386d4f;       /* brand-forest */
    /* combat FX accents */
    --gold: #f5b325;
    --gold-deep: #e09112;
    --gold-light: #fff1b8;
    --blue: #2f6fb5;
    --blue-deep: #1d4e89;
    --crimson-deep: #8f1512;
    --hairline: color-mix(in srgb, var(--gray-light) 55%, transparent);
    font-family: 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif;
  }

  /* ---------- full-screen FX layer ---------- */
  .screen-fx {
    position: fixed;
    inset: 0;
    z-index: 40; /* under the chip (50) and the toast (60) */
    pointer-events: none;
    overflow: hidden;
  }
  .vignette {
    position: absolute;
    inset: 0;
    opacity: 0;
    animation: vignette-flash 1s ease-out forwards;
  }
  /* player deals damage -> cool blue wash rising from the edges */
  .screen-fx.player .vignette {
    background:
      linear-gradient(0deg, color-mix(in srgb, var(--blue) 30%, transparent), transparent 40%),
      radial-gradient(
        120% 95% at 50% 50%,
        transparent 55%,
        color-mix(in srgb, var(--blue) 22%, transparent) 82%,
        color-mix(in srgb, var(--blue-deep) 40%, transparent) 100%
      );
  }
  /* player gets hit -> red pain vignette pressing in from the top */
  .screen-fx.enemy .vignette {
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--crimson) 32%, transparent), transparent 40%),
      radial-gradient(
        120% 95% at 50% 50%,
        transparent 52%,
        color-mix(in srgb, var(--crimson) 26%, transparent) 80%,
        color-mix(in srgb, var(--crimson-deep) 48%, transparent) 100%
      );
  }
  /* critical hit -> red edges + a gold bloom behind the toast */
  .screen-fx.crit .vignette {
    background:
      radial-gradient(
        55% 40% at 50% 40%,
        color-mix(in srgb, var(--gold) 30%, transparent),
        transparent 70%
      ),
      radial-gradient(
        120% 95% at 50% 50%,
        transparent 48%,
        color-mix(in srgb, var(--crimson) 30%, transparent) 78%,
        color-mix(in srgb, var(--crimson-deep) 55%, transparent) 100%
      );
    animation-duration: 1.2s;
  }
  @keyframes vignette-flash {
    0%   { opacity: 0; }
    15%  { opacity: 1; }
    100% { opacity: 0; }
  }

  /* screen particles */
  .sp {
    position: absolute;
    border-radius: 50%;
    opacity: 0;
    transform: translate(-50%, -50%);
    animation: sp-fly 0.9s cubic-bezier(0.15, 0.6, 0.4, 1) forwards;
  }
  .sp.sparkle {
    border-radius: 0;
    /* four-point star for the gold crit sparkles */
    clip-path: polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%);
    scale: 1.8;
  }
  @keyframes sp-fly {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) rotate(var(--spin))
        scale(0.3);
    }
  }

  /* ---------- CRITICAL HIT toast ---------- */
  .crit-toast {
    position: fixed;
    left: 50%;
    top: 22%;
    z-index: 60;
    translate: -50% 0;
    pointer-events: none;
    animation: crit-linger 1.3s ease-out forwards;
  }
  .crit-text {
    display: block;
    font-size: clamp(34px, 7vw, 62px);
    font-weight: 800;
    font-style: italic;
    letter-spacing: 0.01em;
    white-space: nowrap;
    background: linear-gradient(
      180deg,
      var(--gold-light) 0%,
      #ffd34d 38%,
      var(--gold) 62%,
      var(--gold-deep) 100%
    );
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    -webkit-text-stroke: 1.5px var(--crimson-deep);
    filter: drop-shadow(0 2px 0 var(--crimson-deep))
      drop-shadow(0 6px 14px color-mix(in srgb, var(--crimson-deep) 50%, transparent));
    animation: crit-punch 0.5s cubic-bezier(0.2, 1.7, 0.4, 1) both;
  }
  /* WoW-style number punch: slams in huge, settles with a wobble */
  @keyframes crit-punch {
    0%   { opacity: 0; transform: scale(2.7) rotate(-7deg); }
    55%  { opacity: 1; transform: scale(0.92) rotate(2deg); }
    100% { opacity: 1; transform: scale(1) rotate(-2deg); }
  }
  @keyframes crit-linger {
    0%, 62% { opacity: 1; translate: -50% 0; }
    100%    { opacity: 0; translate: -50% -26px; }
  }

  /* ---------- shell: transparent column, tab carries its own surface ---------- */
  .chip {
    position: fixed;
    top: 8px;
    left: 50%;
    translate: -50% 0;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--near-black);
  }

  .chip.shake {
    animation: shake 0.3s ease-out;
  }
  @keyframes shake {
    25% { translate: calc(-50% - 2px) 0; }
    50% { translate: calc(-50% + 2px) 0; }
    75% { translate: calc(-50% - 1px) 0; }
  }

  /* ---------- growing frame (pure-CSS height morph) ---------- */
  .grow {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.4s cubic-bezier(0.3, 0.9, 0.3, 1);
  }
  .chip.enemy .grow {
    grid-template-rows: 1fr;
  }
  .clip {
    overflow: hidden;
    min-height: 0;
  }

  .frame {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 232px;
    padding: 12px 14px 20px; /* extra bottom room for the notched tab */
    background: var(--white);
    border: 1px solid var(--hairline);
    border-radius: 14px;
  }

  /* ---------- portrait + ring + badge ---------- */
  .portrait {
    position: relative;
    flex: 0 0 auto;
    width: 36px;
    height: 36px;
  }
  .portrait .face {
    position: absolute;
    inset: 3px; /* leaves a gutter for the ring */
    width: auto;
    height: auto;
    display: block;
  }
  .portrait.attacking .face {
    animation: lunge 0.6s cubic-bezier(0.5, -0.3, 0.3, 1.2);
  }
  @keyframes lunge {
    0%   { transform: translate(0, 0) scale(1); }
    30%  { transform: translate(-2px, -3px) scale(0.94); }  /* wind up */
    50%  { transform: translate(4px, 5px) scale(1.22); }    /* strike down toward the tab */
    70%  { transform: translate(3px, 4px) scale(1.15); }
    100% { transform: translate(0, 0) scale(1); }
  }

  .ring {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg); /* fill starts at 12 o'clock */
  }
  .ring-fill {
    fill: none;
    stroke: var(--crimson);
    stroke-width: 2;
    stroke-linecap: round;
  }
  .portrait.attacking .ring-fill {
    animation: ring-flash 0.6s ease-out;
  }
  @keyframes ring-flash {
    0%   { stroke-dashoffset: 0; opacity: 1; }
    100% { stroke-dashoffset: 0; opacity: 0; }
  }

  .badge {
    position: absolute;
    right: -4px;
    bottom: -4px;
    z-index: 1;
    min-width: 15px;
    height: 15px;
    padding: 0 3px;
    display: grid;
    place-items: center;
    border-radius: 8px;
    border: 1.5px solid var(--white);
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--white);
    font-variant-numeric: tabular-nums;
  }

  /* ---------- name + hp ---------- */
  .unit {
    flex: 1;
    min-width: 0;
  }
  .name-row {
    display: flex;
    align-items: baseline;
    gap: 6px;
  }
  .name {
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hp-num {
    margin-left: auto;
    font-size: 10px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: var(--gray-mid);
  }

  .hp-track {
    position: relative;
    margin-top: 4px;
    height: 6px;
    border-radius: 2px;
    background: var(--cream);
    overflow: hidden;
  }
  .hp-ghost {
    position: absolute;
    inset: 0 auto 0 0;
    background: var(--gray-light); /* quiet drain trail on damage */
  }
  .hp-fill {
    position: absolute;
    inset: 0 auto 0 0;
    background: var(--crimson);
  }
  .hp-track.healing .hp-ghost {
    background: color-mix(in srgb, var(--forest) 45%, var(--cream));
  }

  /* ---------- floating combat numbers ---------- */
  .hit {
    position: absolute;
    right: 14px;
    top: 6px;
    font-size: 10px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: var(--crimson);
    pointer-events: none;
    animation: float-up 0.85s ease-out forwards;
  }
  .hit.heal {
    color: var(--forest);
  }
  .hit.crit {
    font-size: 13px;
    font-weight: 700;
    color: var(--gold-deep);
    -webkit-text-stroke: 0.5px var(--crimson-deep);
  }
  @keyframes float-up {
    0% { opacity: 0; transform: translateY(3px); }
    20% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }

  /* ---------- SLASH! double hit ---------- */
  .slash-fx {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    overflow: hidden;
    pointer-events: none;
  }
  .slash {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 130%;
    height: 2px;
    border-radius: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--crimson) 70%, var(--near-black)) 35%,
      var(--near-black) 50%,
      color-mix(in srgb, var(--crimson) 70%, var(--near-black)) 65%,
      transparent 100%
    );
    opacity: 0;
    transform-origin: left center;
  }
  /* crit slashes cut gold */
  .slash-fx.crit .slash {
    height: 3px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--gold-deep) 35%,
      var(--gold-light) 50%,
      var(--gold-deep) 65%,
      transparent 100%
    );
  }
  .slash.s1 {
    transform: translate(-50%, -50%) rotate(-28deg) scaleX(0);
    animation: slash-sweep 0.26s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
  }
  .slash.s2 {
    height: 2.5px;
    transform: translate(-50%, -50%) rotate(22deg) scaleX(0);
    animation: slash-sweep 0.26s cubic-bezier(0.2, 0.8, 0.3, 1) 0.13s forwards; /* the "2" of the 1-2 */
  }
  @keyframes slash-sweep {
    0%   { opacity: 1; transform: translate(-50%, -50%) rotate(var(--a, 0deg)) scaleX(0); }
    45%  { opacity: 1; }
    60%  { transform: translate(-50%, -50%) rotate(var(--a, 0deg)) scaleX(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--a, 0deg)) scaleX(1); }
  }
  .slash.s1 { --a: -28deg; }
  .slash.s2 { --a: 22deg; }

  /* ---------- burst particles (left / up / right) ---------- */
  .particle {
    position: absolute;
    left: 50%;
    top: 55%;
    border-radius: 50%;
    background: var(--crimson);
    opacity: 0;
    pointer-events: none;
    animation: particle-fly 0.7s cubic-bezier(0.15, 0.6, 0.4, 1) forwards;
  }
  .particle:nth-child(even) {
    background: var(--near-black);
  }
  .particle.gold,
  .particle.gold:nth-child(even) {
    background: var(--gold);
  }
  @keyframes particle-fly {
    0%   { opacity: 1; transform: translate(0, 0) scale(1); }
    100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.35); }
  }

  /* ---------- timer tab ---------- */
  .tab {
    position: relative; /* creates stacking context so the tab layers above the frame */
    z-index: 1;
    display: grid;
    place-items: center;
    height: 26px;
    padding: 0 12px;
    overflow: hidden;
    background: var(--white);
    border: 1px solid var(--hairline);
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(26, 26, 26, 0.06);
    transition: margin-top 0.4s cubic-bezier(0.3, 0.9, 0.3, 1);
  }
  /* notch the tab over the frame's bottom border */
  .chip.enemy .tab {
    margin-top: -13px;
  }

  /* the enemy's strike lands on the tab (the "user" side) */
  .tab.struck {
    animation: struck-flash 0.5s ease-out 0.2s;
  }
  @keyframes struck-flash {
    0%   { background: var(--white); }
    25%  { background: color-mix(in srgb, var(--crimson) 18%, var(--white)); border-color: var(--crimson); }
    100% { background: var(--white); }
  }
  .tab-slash {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 140%;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--crimson), transparent);
    transform: translate(-50%, -50%) rotate(-18deg) scaleX(0);
    transform-origin: left center;
    animation: tab-slash-sweep 0.3s cubic-bezier(0.2, 0.8, 0.3, 1) 0.2s forwards;
    pointer-events: none;
  }
  @keyframes tab-slash-sweep {
    0%   { opacity: 1; transform: translate(-50%, -50%) rotate(-18deg) scaleX(0); }
    60%  { opacity: 1; transform: translate(-50%, -50%) rotate(-18deg) scaleX(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) rotate(-18deg) scaleX(1); }
  }

  .digits {
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.06em;
    font-variant-numeric: tabular-nums;
  }

  /* ---------- demo controls ---------- */
  .demo {
    position: fixed;
    bottom: 28px;
    left: 50%;
    translate: -50% 0;
    display: flex;
    gap: 8px;
    z-index: 50;
  }
  .btn {
    padding: 7px 14px;
    font: inherit;
    font-size: 12px;
    font-weight: 500;
    color: var(--near-black);
    background: var(--white);
    border: 1px solid var(--hairline);
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.15s ease, opacity 0.2s ease;
  }
  .btn:hover:not(:disabled) {
    background: var(--off-white);
  }
  .btn:disabled {
    opacity: 0.35;
    cursor: default;
  }
  .btn.primary {
    background: var(--near-black);
    color: var(--white);
    border-color: var(--near-black);
  }
  .btn.primary:hover {
    background: var(--navy);
  }
  .btn:focus-visible {
    outline: 2px solid var(--navy);
    outline-offset: 2px;
  }

  /* ---------- reduced motion ---------- */
  @media (prefers-reduced-motion: reduce) {
    .grow,
    .tab {
      transition-duration: 0.01ms;
    }
    .chip.shake,
    .hit,
    .slash,
    .particle,
    .tab-slash,
    .tab.struck,
    .portrait.attacking .face,
    .portrait.attacking .ring-fill,
    .vignette,
    .sp,
    .crit-toast {
      animation: none;
    }
    .crit-text {
      animation: none;
      opacity: 1;
    }
  }
</style>
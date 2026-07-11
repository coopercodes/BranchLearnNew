
<script lang="ts">
  import { responses } from '$lib/question/responsesState.svelte';

  type Particle = { id: number; tx: number; ty: number; delay: number; size: number };

  let particles = $state<Particle[]>([]);
  let uid = 0;
  let punchKey = $state(0);

  function pop() {
    const count = 7;
    const startDeg = 210;
    const arcSpan = 120;
    const step = arcSpan / (count - 1);

    const fresh: Particle[] = Array.from({ length: count }, (_, i) => {
      const jitter = Math.random() * 10 - 5;
      const deg = startDeg + step * i + jitter;
      const dist = 80 + Math.random() * 45;
      const rad = (deg * Math.PI) / 180;
      return {
        id: uid++,
        tx: Math.cos(rad) * dist,
        ty: Math.sin(rad) * dist,
        delay: i * 25,
        size: 18 + Math.floor(Math.random() * 6),
      };
    });

    particles = [...particles, ...fresh];
    punchKey++;

    const ids = new Set(fresh.map(p => p.id));
    setTimeout(() => {
      particles = particles.filter(p => !ids.has(p.id));
    }, 950);
  }

  let totalQuestions = $derived(responses.totalQuestions);
  let remaining = $derived(Math.max(0, totalQuestions - responses.answeredCount));
  let isFinal = $derived(totalQuestions > 0 && remaining === 0);

  // Celebrate every time a question moves from unanswered to correctly answered.
  let prevAnsweredCount = responses.answeredCount;
  $effect(() => {
    const count = responses.answeredCount;
    if (count > prevAnsweredCount) pop();
    prevAnsweredCount = count;
  });
</script>

<div class="relative flex justify-center items-center">
  {#each particles as p (p.id)}
    <div
      class="bubble absolute top-1/2 left-1/2 pointer-events-none"
      style:--tx="{p.tx}px"
      style:--ty="{p.ty}px"
      style:animation-delay="{p.delay}ms"
    >
      <div
        class="rounded-full bg-brand-forest flex items-center justify-center shadow-lg"
        style:width="{p.size}px"
        style:height="{p.size}px"
      >
        <svg
          viewBox="0 0 12 12"
          style:width="{p.size * 0.55}px"
          style:height="{p.size * 0.55}px"
        >
          <polyline
            points="1.5,6.5 4.5,9.5 10.5,3"
            fill="none"
            stroke="white"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    </div>
  {/each}

  {#key punchKey}
    <div
      class="relative flex justify-center items-center space-x-2 p-1 px-4 rounded-md h-max select-none overflow-hidden
             {isFinal ? 'continue-btn sheen-flash' : ''}
             {punchKey > 0 && !isFinal ? 'punching sheen-flash' : ''}"
    >
      <span class="sheen-bar" aria-hidden="true"></span>
      <p class="relative z-10 {isFinal ? 'text-white font-semibold' : 'text-white'}">
        {isFinal ? 'Continue' : `${remaining} remaining`}
      </p>
    </div>
  {/key}
</div>

<style>
  @keyframes pop-fly {
    0%   { transform: translate(-50%, -50%) scale(0); opacity: 0; }
    18%  { transform: translate(calc(-50% + var(--tx) * 0.2), calc(-50% + var(--ty) * 0.2)) scale(1.4); opacity: 1; }
    70%  { transform: translate(calc(-50% + var(--tx) * 0.8), calc(-50% + var(--ty) * 0.8)) scale(1); opacity: 0.85; }
    100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.3); opacity: 0; }
  }

  @keyframes punch {
    0%, 100% { transform: scale(1); }
    25%       { transform: scale(1.12); }
    55%       { transform: scale(0.93); }
  }

  @keyframes sheen-once {
    0%   { transform: translateX(-200%) skewX(-15deg); }
    100% { transform: translateX(300%) skewX(-15deg); }
  }

  @keyframes sheen-sweep {
    0%   { transform: translateX(-200%) skewX(-15deg); }
    100% { transform: translateX(300%) skewX(-15deg); }
  }

  .bubble {
    animation: pop-fly 0.85s cubic-bezier(0.22, 0.61, 0.36, 1) both;
  }

  .punching {
    animation: punch 0.3s ease-out;
  }

  .sheen-bar {
    position: absolute;
    top: 0;
    left: 0;
    width: 45%;
    height: 100%;
    pointer-events: none;
    z-index: 5;
    transform: translateX(-200%) skewX(-15deg);
  }

  .sheen-flash .sheen-bar {
    background: linear-gradient(
      to right,
      transparent 0%,
      rgba(56, 109, 79, 0.5) 50%,
      transparent 100%
    );
    animation: sheen-once 1.5s cubic-bezier(0.4, 0, 0.2, 1) downwards;
  }

  .continue-btn {
    background-color: #386d4f;
    box-shadow: 0 2px 14px rgba(56, 109, 79, 0.55), 0 1px 3px rgba(0, 0, 0, 0.25);
  }

  .continue-btn .sheen-bar {
    background: linear-gradient(
      to right,
      transparent 0%,
      rgba(255, 255, 255, 0.28) 50%,
      transparent 100%
    );
  }

  .sheen-loop .sheen-bar {
    animation: sheen-sweep 2.2s ease-in-out infinite;
    animation-delay: 0.6s;
  }
</style>

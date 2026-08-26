<script lang="ts">
	/**
	 * MOBA-style skill HUD — fixed, bottom-center dock.
	 * - Dock is position:fixed and centered; it never participates in page flow,
	 *   so it can't trigger scroll.
	 * - Slots share one muted grey crosshair frame; accents live only inside
	 *   (glyph + tint). Cooldown renders as a scrim that recedes upward, i.e. the
	 *   ready area rises from the bottom like a filling rectangle.
	 * - LoL-style hover card: a plain rectangle that tracks the cursor (no
	 *   animation) showing name, description, and inventory count.
	 * - HP bar is independent of osBar — hardcoded to 75% for now via `hp`.
	 *   Swap that constant for your HP store when it exists.
	 *
	 * When osBar.isComplete, a green Continue overlay covers the whole HUD —
	 * clicking ANYWHERE on the HUD advances.
	 *
	 * Drop-in: <SkillHud onCast={(id) => ...} />
	 */
	import { osBar } from '$lib/os/osBarProgress.svelte';
	import MysteryMark from '$lib/components/MysteryMark.svelte';
	import Avatar from './Avatar.svelte';
	import HealthBar from './HealthBar.svelte';
	import RightIcons from './RightIcons.svelte';

	export interface Skill {
		id: string;
		name: string;
		hotkey: string;
		/** seconds */
		cooldown: number;
		/** css color for the accent (icon tint) */
		color: string;
		/** shown in the hover card */
		description?: string;
		/** consumable count in inventory; shown bottom-right + in hover card */
		count?: number;
		charges?: number;
		maxCharges?: number;
		locked?: boolean;
	}

	interface Props {
		skills?: Skill[];
		onCast?: (id: string) => void;
		showHotkeys?: boolean;
		hotkeysEnabled?: boolean;
		/** 0..1 — placeholder until real HP state is wired up */
		hp?: number;
	}

	let {
		skills = [
			{ id: 'potion', name: 'Potion', hotkey: '1', cooldown: 45, color: '#4ade80', description: 'Restore a chunk of HP over 8s.', count: 5, charges: 2, maxCharges: 3 },
			{ id: 'insight', name: 'Insight', hotkey: '2', cooldown: 20, color: '#60a5fa', description: 'Reveal a hint for the current question.', count: 3 },
			{ id: 'focus', name: 'Focus', hotkey: '3', cooldown: 60, color: '#eab308', description: 'Slow the timer for 10s.', count: 2 },
			{ id: 'rage', name: 'Rage', hotkey: '4', cooldown: 90, color: '#f97316', description: 'Double points on your next correct answer.', count: 1 }
		],
		onCast = () => {},
		showHotkeys = true,
		hotkeysEnabled = true,
		hp = 0.75
	}: Props = $props();

	/* ---------- original osBar wiring (questions-remaining pill + Continue) ---------- */
	let remaining = $derived(osBar.remaining);
	let isFinal = $derived(osBar.isComplete);
	let clickable = $derived(isFinal && osBar.onContinue !== null);

	/* HP is its own thing now — clamped 0..1, hardcoded via the `hp` prop default */
	let hpPct = $derived(Math.max(0, Math.min(1, hp)) * 100);

	let punchKey = $state(0);
	let celebrateKey = $state(0);

	function pop() {
		punchKey++;
		celebrateKey++;
	}

	// Celebrate every time a question moves from unanswered to correctly answered.
	let prevAnsweredCount = osBar.answered;
	$effect(() => {
		const count = osBar.answered;
		if (count > prevAnsweredCount) pop();
		prevAnsweredCount = count;
	});

	/* ---------- cooldowns ---------- */
	let readyAt = $state<Record<string, number>>({});
	let flashing = $state<Record<string, number>>({});
	let tick = $state(0);
	let raf = 0;

	function pump() {
		tick = performance.now();
		const active = Object.values(readyAt).some((t) => t > tick);
		raf = active ? requestAnimationFrame(pump) : 0;
	}

	function cd(s: Skill) {
		const end = readyAt[s.id] ?? 0;
		const ms = Math.max(0, end - tick);
		return { ms, frac: s.cooldown > 0 ? ms / (s.cooldown * 1000) : 0, secs: Math.ceil(ms / 1000) };
	}

	export function cast(id: string) {
		if (isFinal) return; // Continue overlay owns the HUD now
		const s = skills.find((k) => k.id === id);
		if (!s || s.locked) return;
		if ((readyAt[s.id] ?? 0) > performance.now()) return;
		readyAt[s.id] = performance.now() + s.cooldown * 1000;
		flashing[s.id] = (flashing[s.id] ?? 0) + 1;
		if (!raf) raf = requestAnimationFrame(pump);
		onCast(s.id);
	}

	function onKey(e: KeyboardEvent) {
		if (!hotkeysEnabled || isFinal) return;
		if (e.metaKey || e.ctrlKey || e.altKey) return;
		const t = e.target as HTMLElement | null;
		if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
		const hit = skills.find((s) => s.hotkey.toLowerCase() === e.key.toLowerCase());
		if (hit) {
			e.preventDefault();
			cast(hit.id);
		}
	}

	/* ---------- LoL-style hover card (no animation — it just appears) ---------- */
	let hover = $state<{ skill: Skill; x: number; y: number } | null>(null);

	function onSlotMove(e: MouseEvent, s: Skill) {
		if (isFinal) return;
		// clamp so the card never leaves the viewport horizontally
		const half = 110; // ~half the card width
		const x = Math.max(half + 8, Math.min(window.innerWidth - half - 8, e.clientX));
		hover = { skill: s, x, y: e.clientY };
	}

	function onSlotLeave() {
		hover = null;
	}

	$effect(() => {
		if (isFinal) hover = null;
	});

	$effect(() => () => {
		if (raf) cancelAnimationFrame(raf);
	});
</script>

<svelte:window on:keydown={onKey} />

<div class="flex gap-2 hud-dock h-[96px] bg-brand-surface-blue-900 rounded-tl-md rounded-tr-md">
	<div class="w-[150px] flex rounded-tl-md">
		<!-- <div class=" w-full h-full flex items-center justify-center">
			<div class="flex items-center justify-center bg-neutral-700 rounded-full p-0.5">
				<Avatar bgColor="" size={62}/>
			</div>
		</div> -->

		<div class="bg-brand-surface-blue-800 flex items-center w-full rounded-sm p-2 border  border-brand-gold/70 m-2">
			
			<div class="h-[24px] bg-amber-300 w-[1px] "></div>
			<div class="flex flex-col">
				<p class="text-neutral-100 text-sm text-[10px] ml-2">Stacking Sats</p>
				<p class="text-neutral-300 text-sm text-[10px] ml-2">0 / 3 completed</p>
			</div>
		</div>
	</div>

	<div class="w-[1px] h-[50%] my-auto bg-brand-surface-blue-600">
		
	</div>

	<div class="w-[250px] ">
		<div class="flex flex-col">
			<div class="flex space-x-1 justify-center mt-1.5">
				{#each [0, 1, 2, 3, 4] as slot (slot)}
					<div
						class="group relative w-[44px] h-[44px] aspect-square rounded-sm
							border transition-colors duration-150
							{slot === 0
								? 'border-blue-400/45 bg-neutral-900/60 shadow-[inset_0_2px_5px_rgba(0,0,0,0.7),inset_0_0_0_1px_rgba(96,165,250,0.15),0_0_6px_-1px_rgba(59,130,246,0.5)] hover:border-blue-300/70'
								: 'border-white/15 bg-neutral-900/60 shadow-[inset_0_2px_5px_rgba(0,0,0,0.7),inset_0_0_0_1px_rgba(255,255,255,0.04)] hover:border-white/35 hover:bg-neutral-800/70'}"
					>
						{#if slot === 0}
							<div
								class="absolute inset-0 rounded-sm bg-gradient-to-b from-blue-400/25 via-blue-600/10 to-transparent"
							></div>

							<svg
								viewBox="0 0 24 24"
								class="absolute left-1/2 top-1/2 h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2
									[filter:drop-shadow(0_1px_1px_rgba(0,0,0,0.8))]"
								aria-hidden="true"
							>
								<defs>
									<linearGradient id="potion-liquid-1" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stop-color="#f87171" />
										<stop offset="55%" stop-color="#dc2626" />
										<stop offset="100%" stop-color="#7f1d1d" />
									</linearGradient>
									<clipPath id="potion-clip-1">
										<path
											d="M10 3.5h4v4.6c2.9 1.3 4.8 4 4.8 7.1A6.8 6.8 0 0 1 5.2 15.2c0-3.1 1.9-5.8 4.8-7.1V3.5z"
										/>
									</clipPath>
								</defs>

								<path
									d="M10 3.5h4v4.6c2.9 1.3 4.8 4 4.8 7.1A6.8 6.8 0 0 1 5.2 15.2c0-3.1 1.9-5.8 4.8-7.1V3.5z"
									fill="#93c5fd"
									fill-opacity="0.14"
									stroke="#1e3a5f"
									stroke-width="1"
								/>

								<g clip-path="url(#potion-clip-1)">
									<rect x="0" y="10" width="24" height="14" fill="url(#potion-liquid-1)" />
									<ellipse cx="12" cy="10" rx="7" ry="1.1" fill="#fca5a5" fill-opacity="0.55" />
								</g>

								<path
									d="M8.6 13.5c-.6 1.4-.7 2.8-.3 4"
									stroke="#fff"
									stroke-opacity="0.35"
									stroke-width="1.6"
									stroke-linecap="round"
									fill="none"
								/>

								<rect x="9.2" y="1.4" width="5.6" height="2.6" rx="0.8" fill="#78350f" />
								<rect x="9.2" y="1.4" width="5.6" height="1" rx="0.5" fill="#a16207" />
							</svg>

							<span
								class="absolute bottom-[1px] right-[2px] text-[9px] font-semibold leading-none
									text-white [text-shadow:0_1px_1px_#000,0_0_2px_#000]"
							>
								3
							</span>
						{/if}

						<span
							class="absolute left-[2px] top-[1px] text-[8px] font-semibold leading-none
								text-white/45 [text-shadow:0_1px_1px_#000]"
						>
							{slot + 1}
						</span>
					</div>
				{/each}
			</div>
			<HealthBar />
		</div>
	</div>

	<div class="w-[1px] h-[50%] my-auto bg-brand-surface-blue-600">

	</div>

		<RightIcons />
	{#if isFinal}
		<button
			type="button"
			class="continue-overlay sheen-flash"
			disabled={!clickable}
			onclick={() => osBar.onContinue?.()}
		>
			<span class="sheen-bar" aria-hidden="true"></span>
			<p class="relative z-10 text-white font-semibold overlay-label">Continue</p>
		</button>
	{/if}
</div>


<!--
	<div class="flex items-center ml-1">
					
		<div class="h-[18px] bg-amber-300 w-[1px] mr-1"></div>
		<div class="flex flex-col">
			<p class="text-neutral-100 text-xs text-[10px] ml-1">Stacking Sats</p>
			<p class="text-neutral-300 text-xs text-[8px] ml-1">0 / 3 completed</p>
		</div>
	</div>

	<div class="relative flex justify-center items-center">

		{#key punchKey}
			<span
				class="pill select-none overflow-hidden
					{punchKey > 0 && !isFinal ? 'punching sheen-flash' : ''}"
			>
				<MysteryMark size={20} class="relative z-10" label="Questions remaining" />
				<p class="relative z-10 text-white pill-count">{remaining}</p>
			</span>
		{/key}
	</div>
-->



<style>
	/* Fixed to the viewport: out of document flow, so no scroll is created. */
	.hud-dock {
		position: absolute !important;
		bottom: 0px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 50;
		overflow:hidden;
	}

	.pill-count {
		font-size: 12px;
		font-weight: 800;
		margin: 0;
	}

	.pill {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 6px;
		padding: 0px 8px;
		border-radius: 4px;
		height: max-content;
		/* background: linear-gradient(180deg, #24405f, #1b2c40);
		border: 1px solid rgba(96, 165, 250, 0.45); */
	}
	

	/* ---- full-HUD Continue overlay ---- */
	.continue-overlay {
		position: absolute;
		inset: 0;
		z-index: 30;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 0;
		padding: 0;
		font: inherit;
		cursor: pointer;
		overflow: hidden;
		border-radius: var(--radius);
		background: linear-gradient(135deg, rgba(16, 108, 158, 0.94) 0%, rgba(31, 118, 168, 0.94) 55%,rgba(22, 95, 135, 0.96)) 100%;

		animation: linear 0.32s ease-out;
		border-radius: 6px 6px 0px 0px !important ;
	}
	.continue-overlay:disabled {
		cursor: default;
	}
	.continue-overlay:focus-visible {
		outline: 2px solid #fff;
		outline-offset: -3px;
	}
	.overlay-label {
		font-size: 14px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		margin: 0;
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
			rgba(255, 255, 255, 0.28) 50%,
			transparent 100%
		);
		animation: sheen-once 1.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}
	.pill.sheen-flash .sheen-bar {
		background: linear-gradient(
			to right,
			transparent 0%,
			rgba(56, 109, 79, 0.5) 50%,
			transparent 100%
		);
	}

	@keyframes cast-flash {
		to {
			opacity: 0;
		}
	}
	@keyframes punch {
		0%,
		100% {
			transform: scale(1);
		}
		25% {
			transform: scale(1.12);
		}
		55% {
			transform: scale(0.93);
		}
	}
	@keyframes sheen-once {
		0% {
			transform: translateX(-200%) skewX(-15deg);
		}
		100% {
			transform: translateX(300%) skewX(-15deg);
		}
	}
	@keyframes check-rise {
		0% {
			transform: translate(-50%, -30%) scale(0.4);
			opacity: 0;
		}
		25% {
			transform: translate(-50%, -90%) scale(1.05);
			opacity: 1;
		}
		40% {
			transform: translate(-50%, -95%) scale(1);
			opacity: 1;
		}
		80% {
			transform: translate(-50%, -110%) scale(1);
			opacity: 1;
		}
		100% {
			transform: translate(-50%, -135%) scale(0.85);
			opacity: 0;
		}
	}
	@keyframes glow-fade {
		0% {
			opacity: 0;
			transform: scale(0.4);
		}
		30% {
			opacity: 1;
			transform: scale(1.15);
		}
		100% {
			opacity: 0;
			transform: scale(1.5);
		}
	}
	@keyframes circle-grow {
		0% {
			transform: scale(0);
		}
		70% {
			transform: scale(1.12);
		}
		100% {
			transform: scale(1);
		}
	}
	@keyframes draw-tick {
		to {
			stroke-dashoffset: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.continue-overlay,
		.punching,
		.sheen-flash .sheen-bar,
		.checkmark-pop {
			animation: none;
		}
	}
</style>
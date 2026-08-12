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

<div class="hud-dock">
	<div class="hud-plate" class:final={isFinal}>
		<div class="hud-rim" aria-hidden="true"></div>

		<div class="hud-slots">
			{#each skills as s (s.id)}
				{@const c = cd(s)}
				<button
					type="button"
					class="slot"
					class:on-cd={c.ms > 0}
					class:locked={s.locked}
					style="--accent: {s.color}"
					aria-label="{s.name}{c.ms > 0 ? ` — ${c.secs}s cooldown` : ''}"
					disabled={s.locked || c.ms > 0 || isFinal}
					tabindex={isFinal ? -1 : 0}
					onclick={() => cast(s.id)}
					
				>
					<span class="slot-face" aria-hidden="true"></span>
					<span class="slot-tint" aria-hidden="true"></span>
					<!-- crosshair frame: shared muted grey, edge-midpoint segments, open corners -->
					<span class="slot-frame" aria-hidden="true"></span>

					<span class="glyph" aria-hidden="true">
						{#if s.id === 'potion'}
							<span class="g-cross"></span>
						{:else if s.id === 'insight'}
							<span class="g-diamond"></span>
						{:else if s.id === 'focus'}
							<span class="g-ring"></span>
						{:else}
							<span class="g-tri"></span>
						{/if}
					</span>

					{#if s.maxCharges}
						<span class="stacks" aria-hidden="true">
							{#each Array(s.maxCharges) as _, i}
								<span class="pip" class:filled={i < (s.charges ?? 0)}></span>
							{/each}
						</span>
					{/if}

					<!-- cooldown: scrim recedes upward → ready area rises from the bottom -->
					<span
						class="cd-scrim"
						aria-hidden="true"
						style="opacity:{c.ms > 0 ? 1 : 0};height:{c.frac * 100}%"
					></span>
					{#if c.ms > 0}<span class="cd-secs">{c.secs}</span>{/if}

					{#if s.count !== undefined}
						<span class="slot-count" aria-hidden="true">{s.count}</span>
					{/if}

					{#key flashing[s.id]}
						{#if flashing[s.id]}<span class="cast-flash" aria-hidden="true"></span>{/if}
					{/key}

					{#if showHotkeys}<span class="slot-key">{s.hotkey}</span>{/if}
				</button>
			{/each}
		</div>

		<!-- footer: HEALTH BAR (independent of questions) + questions-remaining pill -->
		<div class="hud-foot">
			<div
				class="track"
				role="progressbar"
				aria-label="Health"
				aria-valuenow={Math.round(hpPct)}
				aria-valuemin="0"
				aria-valuemax="100"
			>
				<div class="fill" style="width:{hpPct}%">
					<span class="fill-gloss" aria-hidden="true"></span>
				</div>
				<span class="track-ticks" aria-hidden="true"></span>
			</div>

			<div class="relative flex justify-center items-center">
				<!-- {#if celebrateKey > 0}
					{#key celebrateKey}
						<div class="checkmark-pop absolute left-1/2 top-1/2 pointer-events-none" aria-hidden="true">
							<span class="checkmark-glow"></span>
							<span class="checkmark-bg">
								<svg class="checkmark-svg" viewBox="0 0 40 40">
									<path
										class="checkmark-tick"
										d="M12 21 L17 26 L28 14"
										fill="none"
										stroke="white"
										stroke-width="5"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</span>
						</div>
					{/key}
				{/if} -->

				{#key punchKey}
					<span
						class="pill select-none overflow-hidden
							{punchKey > 0 && !isFinal ? 'punching sheen-flash' : ''}"
					>
						<span class="sheen-bar" aria-hidden="true"></span>
						<MysteryMark size={12} class="relative z-10" label="Questions remaining" />
						<p class="relative z-10 text-white pill-count">{remaining}</p>
					</span>
				{/key}
			</div>
		</div>

		<!-- full-HUD Continue overlay: click anywhere to advance -->
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
</div>

<!-- hover card: fixed to viewport, snaps to cursor, no animation -->
{#if hover}
	<div class="hover-card" style="left:{hover.x}px;top:{hover.y}px" role="tooltip">
		<div class="hc-head">
			<span class="hc-name" style="--accent:{hover.skill.color}">{hover.skill.name}</span>
			<span class="hc-key">{hover.skill.hotkey}</span>
		</div>
		{#if hover.skill.description}
			<p class="hc-desc">{hover.skill.description}</p>
		{/if}
		{#if hover.skill.count !== undefined}
			<p class="hc-count">In inventory: <strong>{hover.skill.count}</strong></p>
		{/if}
	</div>
{/if}

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

	.hud-plate {
		--radius: 12px;
		position: relative;
		overflow: hidden;
		padding: 8px;
		border-radius: var(--radius);
		background: linear-gradient(180deg, #2b3542, #171d26);
		box-shadow: 0 6px 15px rgba(15, 20, 27, 0.38);
	}
	.hud-rim {
		position: absolute;
		inset: 0;
		border-radius: inherit;
		border: 1px solid rgba(226, 197, 143, 0.22);
		pointer-events: none;
	}

	.hud-slots {
		display: flex;
		gap: 8px;
		justify-content: center;
	}

	/* ---- slot ---- */
	.slot {
		--slot-r: 9px;
		--frame: rgba(196, 203, 211, 0.34); /* shared muted grey frame */
		position: relative;
		width: 42px;
		height: 42px;
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
		color: inherit;
		font: inherit;
		transition: transform 0.12s ease;
	}
	.slot:not(:disabled):hover {
		transform: translateY(-1px);
	}
	.slot:not(:disabled):hover .slot-frame {
		border-color: rgba(214, 220, 227, 0.55);
	}
	.slot:not(:disabled):active {
		transform: translateY(0) scale(0.97);
	}
	.slot:disabled {
		cursor: default;
	}
	.slot.locked {
		filter: grayscale(1) brightness(0.7);
	}
	/* .slot:focus-visible {
		outline: 2px solid var(--frame);
		outline-offset: 2px;
		border-radius: var(--slot-r);
	} */

	.slot-face,
	.slot-tint,
	.slot-frame,
	.cd-scrim,
	.cast-flash {
		position: absolute;
		display: block;
		pointer-events: none;
		border-radius: var(--slot-r);
	}
	.slot-face {
		inset: 0;
		background: radial-gradient(120% 110% at 50% 0, #2e3a48, #141a22 72%);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
	}
	.slot-tint {
		inset: 0;
		background: linear-gradient(180deg, color-mix(in oklab, var(--accent) 20%, transparent), transparent 55%);
	}
	/*
	 * Crosshair frame: full 1px border masked so only the middle ~55% of each
	 * edge renders — corners stay open. One shared grey; accents stay inside.
	 */
	.slot-frame {
		inset: 0;
		border: 1px solid var(--frame);
		
		-webkit-mask-composite: source-over;
	}

	/*
	 * Cooldown scrim: anchored to the top, its height = remaining fraction.
	 * As it shrinks, the ready area "fills" upward from the bottom.
	 * The bottom edge carries a soft gradient so the rise reads as a sweep.
	 */
	.cd-scrim {
		top: 0;
		left: 0;
		right: 0;
		border-radius: var(--slot-r) var(--slot-r) 0 0;
		background: linear-gradient(
			180deg,
			rgba(8, 12, 18, 0.78) 0%,
			rgba(8, 12, 18, 0.78) 82%,
			rgba(8, 12, 18, 0.25) 100%
		);
		transition: opacity 0.18s linear;
	}
	.cast-flash {
		inset: 0;
		background: rgba(255, 246, 232, 0.85);
		animation: cast-flash 0.42s ease-out forwards;
	}

	.glyph {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		pointer-events: none;
	}
	.g-cross {
		position: relative;
		width: 14px;
		height: 14px;
		background: var(--accent);
		clip-path: polygon(
			38% 0,
			62% 0,
			62% 38%,
			100% 38%,
			100% 62%,
			62% 62%,
			62% 100%,
			38% 100%,
			38% 62%,
			0 62%,
			0 38%,
			38% 38%
		);
	}
	.g-diamond {
		width: 13px;
		height: 13px;
		border-radius: 2px;
		background: var(--accent);
		transform: rotate(45deg);
		box-shadow: inset 0 0 0 3px rgba(20, 26, 34, 0.62);
	}
	.g-ring {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		border: 2px solid var(--accent);
		position: relative;
	}
	.g-ring::after {
		content: '';
		position: absolute;
		inset: 3px;
		border-radius: 50%;
		background: var(--accent);
	}
	.g-tri {
		width: 15px;
		height: 13px;
		background: var(--accent);
		clip-path: polygon(50% 0, 100% 100%, 0 100%);
	}

	/* charge pips: top edge */
	.stacks {
		position: absolute;
		top: 4px;
		left: 0;
		right: 0;
		display: flex;
		gap: 2px;
		justify-content: center;
		pointer-events: none;
	}
	.pip {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.18);
	}
	.pip.filled {
		background: var(--accent);
	}

	/* countdown: small and muted — the scrim already tells the story */
	.cd-secs {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-weight: 500;
		font-size: 10px;
		line-height: 1;
		color: rgba(244, 239, 231, 0.55);
		pointer-events: none;
	}

	/* consumable count: LoL-style corner tally, bottom-right */
	.slot-count {
		position: absolute;
		bottom: 1px;
		right: 3px;
		font-size: 8px;
		font-weight: 600;
		line-height: 1;
		font-family: ui-monospace, 'IBM Plex Mono', monospace;
		color: rgba(244, 239, 231, 0.85);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
		pointer-events: none;
	}

	/* hotkey: quiet, bottom-center */
	.slot-key {
		position: absolute;
		bottom: 2px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 8px;
		font-weight: 600;
		line-height: 1;
		letter-spacing: 0.04em;
		font-family: ui-monospace, 'IBM Plex Mono', monospace;
		color: rgba(244, 239, 231, 0.6);
		pointer-events: none;
	}

	/* ---- footer: health bar + questions remaining ---- */
	.hud-foot {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 7px;
	}

	/* MMO health bar: dark recessed trough, glossy red fill, segment ticks */
	.track {
		position: relative;
		flex: 1;
		height: 9px;
		border-radius: 5px;
		background: linear-gradient(180deg, #0b0f14, #1a2029);
		border: 1px solid rgba(0, 0, 0, 0.55);
		box-shadow:
			inset 0 1px 3px rgba(0, 0, 0, 0.7),
			0 1px 0 rgba(255, 255, 255, 0.05);
		overflow: hidden;
	}
	.fill {
		position: absolute;
		inset: 0 auto 0 0;
		border-radius: 4px 0 0 4px;
		background: linear-gradient(
			180deg,
			#ff7a6b 0%,
			#e03a2b 45%,
			#a31307 100%
		);
		box-shadow:
			inset 0 0 4px rgba(255, 190, 170, 0.35),
			0 0 6px rgba(224, 58, 43, 0.45);
		transition: width 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.fill-gloss {
		position: absolute;
		inset: 1px 0 auto 0;
		height: 40%;
		border-radius: 3px 3px 0 0;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.05));
		pointer-events: none;
	}
	.track-ticks {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			90deg,
			transparent 0,
			transparent calc(10% - 1px),
			rgba(0, 0, 0, 0.4) calc(10% - 1px),
			rgba(0, 0, 0, 0.4) 10%
		);
		pointer-events: none;
	}

	.pill {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 4px;
		padding: 1px 8px;
		border-radius: 6px;
		height: max-content;
		background: linear-gradient(180deg, #24405f, #1b2c40);
		border: 1px solid rgba(96, 165, 250, 0.45);
	}
	.pill-count {
		font-size: 11px;
		margin: 0;
	}

	/* ---- hover card (LoL-style, no animation) ---- */
	.hover-card {
		position: fixed;
		z-index: 60;
		width: 220px;
		transform: translate(-50%, calc(-100% - 16px));
		padding: 8px 10px;
		border-radius: 8px;
		background: linear-gradient(180deg, #222b36, #141a22);
		border: 1px solid rgba(196, 203, 211, 0.28);
		box-shadow: 0 8px 20px rgba(10, 14, 19, 0.55);
		pointer-events: none;
	}
	.hc-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px;
	}
	.hc-name {
		font-size: 12px;
		font-weight: 600;
		color: color-mix(in oklab, var(--accent) 65%, #f4efe7);
	}
	.hc-key {
		font-size: 9px;
		font-family: ui-monospace, 'IBM Plex Mono', monospace;
		color: rgba(244, 239, 231, 0.5);
	}
	.hc-desc {
		margin: 4px 0 0;
		font-size: 10.5px;
		line-height: 1.35;
		color: rgba(228, 232, 236, 0.82);
	}
	.hc-count {
		margin: 5px 0 0;
		font-size: 10px;
		color: rgba(244, 239, 231, 0.6);
	}
	.hc-count strong {
		color: #f4efe7;
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
		background: linear-gradient(135deg, rgba(52, 217, 122, 0.94) 0%, rgba(31, 168, 99, 0.94) 55%, rgba(22, 135, 77, 0.96) 100%);
		box-shadow:
			0 2px 16px rgba(52, 217, 122, 0.55),
			0 1px 3px rgba(0, 0, 0, 0.25);
		animation: linear 0.32s ease-out;
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

	/* ---- checkmark pop (original) ---- */
	.checkmark-pop {
		top: calc(50% - 26px);
		z-index: 40;
		animation: check-rise 1.1s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
	}
	.checkmark-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 40px;
		height: 40px;
		margin: -20px 0 0 -20px;
		border-radius: 50%;
		background: radial-gradient(
			circle closest-side,
			rgba(74, 222, 128, 0.85) 0%,
			rgba(74, 222, 128, 0.3) 45%,
			transparent 100%
		);
		animation: glow-fade 0.9s ease-out forwards;
	}
	.checkmark-bg {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 22px;
		height: 22px;
		margin: -11px 0 0 -11px;
		display: block;
		border-radius: 50%;
		background: #386d4f;
		border: 1.5px solid #4ade80;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
		animation: circle-grow 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
	}
	.checkmark-svg {
		display: block;
		width: 100%;
		height: 100%;
	}
	.checkmark-tick {
		stroke-dasharray: 24;
		stroke-dashoffset: 24;
		animation: draw-tick 0.3s ease-out forwards;
		animation-delay: 0.28s;
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
			rgba(255, 255, 255, 0.28) 50%,
			transparent 100%
		);
		animation: sheen-once 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
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
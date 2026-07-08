<script lang="ts">
	import { osBar } from '$lib/os/osBarProgress.svelte';
	import MysteryMark from '$lib/components/MysteryMark.svelte';

	let punchKey = $state(0);
	let celebrateKey = $state(0);

	function pop() {
		punchKey++;
		celebrateKey++;
	}

	let remaining = $derived(osBar.remaining);
	let isFinal = $derived(osBar.isComplete);
	let clickable = $derived(isFinal && osBar.onContinue !== null);

	// Celebrate every time a question moves from unanswered to correctly answered.
	let prevAnsweredCount = osBar.answered;
	$effect(() => {
		const count = osBar.answered;
		if (count > prevAnsweredCount) pop();
		prevAnsweredCount = count;
	});
</script>

<div class="relative flex justify-center items-center">
	{#if celebrateKey > 0}
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
	{/if}

	{#key punchKey}
		<button
			type="button"
			disabled={!clickable}
			onclick={() => osBar.onContinue?.()}
			class="relative flex justify-center items-center space-x-2 p-1 px-4 rounded-md h-max select-none overflow-hidden
             {clickable ? 'cursor-pointer' : 'disabled:cursor-default'}
             {isFinal ? 'continue-btn sheen-flash' : ''}
             {punchKey > 0 && !isFinal ? 'punching sheen-flash' : ''}"
		>
			<span class="sheen-bar" aria-hidden="true"></span>
			{#if isFinal}
				<p class="relative z-10 text-white font-semibold">Continue</p>
			{:else}
				<MysteryMark size={22} class="relative z-10" label="Questions remaining" />
				<p class="relative z-10 text-white">{remaining}</p>
			{/if}
		</button>
	{/key}
</div>

<style>
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

	@keyframes sheen-sweep {
		0% {
			transform: translateX(-200%) skewX(-15deg);
		}
		100% {
			transform: translateX(300%) skewX(-15deg);
		}
	}

	.checkmark-pop {
		top: calc(50% - 40px);
		z-index: 20;
		animation: check-rise 1.1s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
	}

	.checkmark-glow {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 60px;
		height: 60px;
		margin: -30px 0 0 -30px;
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
		width: 34px;
		height: 34px;
		margin: -17px 0 0 -17px;
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
			rgba(56, 109, 79, 0.5) 50%,
			transparent 100%
		);
		animation: sheen-once 1.5s cubic-bezier(0.4, 0, 0.2, 1) downwards;
	}

	.continue-btn {
		background: linear-gradient(135deg, #34d97a 0%, #1fa863 55%, #16874d 100%);
		box-shadow:
			0 2px 16px rgba(52, 217, 122, 0.55),
			0 1px 3px rgba(0, 0, 0, 0.25);
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

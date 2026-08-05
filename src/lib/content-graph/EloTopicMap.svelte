<script lang="ts">
	import SectionProgressRing from '$lib/trig/SectionProgressRing.svelte';
	import { game, hitRateFor, MAX_ELO, type Rank } from './gameState.svelte';
	import { ContentGraph } from './graph-content';

	// The OS bar's left widget for graph-driven routes, MMO-style: a profile
	// block (avatar + level badge) welded to an XP bar showing the active
	// subtopic's ELO as nine skewed segments — thirds match the rank bands.
	// Clicking opens a dialog with two tabs: the full ELO map and a profile.

	const subtopics = ContentGraph.filter((n) => n.type === 'subtopic');
	const panels = ContentGraph.filter((n) => n.type === 'panel');

	/** Segment count for the XP bar — thirds line up with the rank thresholds. */
	const SEGMENTS = 9;
	const SEGMENT_INDEXES = [...Array(SEGMENTS).keys()];
	/** Total ELO needed per level; totals span 0..subtopics×MAX_ELO. */
	const ELO_PER_LEVEL = 30;

	function shortName(subtopicID: string): string {
		return (subtopicID.split(':')[1] ?? subtopicID).toUpperCase();
	}

	const TIER_CLASS: Record<Rank, string> = {
		Beginner: 'tier-beginner',
		Intermediate: 'tier-intermediate',
		Expert: 'tier-expert',
		Mastery: 'tier-mastery'
	};

	/** Fill color per third of the bar: yellow → orange → green. */
	const SEG_CLASS = ['seg-yellow', 'seg-orange', 'seg-green'];

	/** The subtopic whose training loop the walker is inside right now. */
	let activeID = $derived.by(() => {
		const node = game.pendingPanel ?? game.current;
		if (node?.type === 'panel') return node.subtopicID;
		if (node?.type === 'subtopic') return node.id;
		return subtopics[0]?.id ?? '';
	});

	let activeElo = $derived(activeID ? game.eloFor(activeID) : 0);
	let activeRank = $derived(activeID ? game.rankOf(activeID) : 'Beginner');
	let filledSegments = $derived(Math.round((activeElo / MAX_ELO) * SEGMENTS));

	// Profile stats, all derived from the shared game state.
	let totalElo = $derived(subtopics.reduce((sum, s) => sum + game.eloFor(s.id), 0));
	let maxTotalElo = subtopics.length * MAX_ELO;
	let level = $derived(1 + Math.floor(totalElo / ELO_PER_LEVEL));
	let masteredCount = $derived(subtopics.filter((s) => game.isMastered(s.id)).length);
	let totalAttempts = $derived(panels.reduce((sum, p) => sum + game.attemptsFor(p.id), 0));
	let totalCorrect = $derived(panels.reduce((sum, p) => sum + game.correctFor(p.id), 0));

	let tab = $state<'map' | 'profile'>('map');
	let dialogEl = $state<HTMLDialogElement | null>(null);

	function open() {
		dialogEl?.showModal();
	}
	function close() {
		dialogEl?.close();
	}
	function onDialogClick(e: MouseEvent) {
		if (e.target === dialogEl) close();
	}
</script>

{#snippet avatar(size: number)}
	<!-- Boilerplate avatar: plain silhouette on the gray block, for now. -->
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<circle cx="12" cy="8.2" r="4" fill="#8A8A87" />
		<path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="#8A8A87" />
	</svg>
{/snippet}

<!-- Trigger: MMO profile block + XP bar for the active subtopic -->
<button
	type="button"
	class="mmo-trigger"
	aria-haspopup="dialog"
	aria-label="Open profile and ELO map. Current subtopic: {shortName(
		activeID
	)}, {activeElo} of {MAX_ELO} ELO, rank {activeRank}"
	onclick={open}
>
	<span class="profile-icon">
		<span class="profile-picture">{@render avatar(26)}</span>
	</span>
	<span class="xp-bar-container">
		<span class="header-row">
			<span class="section-label">Trigonometry — {shortName(activeID)}</span>
			<span class="tier-indicator {TIER_CLASS[activeRank]}">{activeRank}</span>
		</span>
		<span class="rams-progress">
			{#each SEGMENT_INDEXES as i (i)}
				<span class="progress-segment {i < filledSegments ? SEG_CLASS[Math.floor(i / 3)] : ''}"
				></span>
			{/each}
		</span>
	</span>
</button>

<dialog
	bind:this={dialogEl}
	class="map-dialog"
	aria-label="Profile and subtopic ELO map"
	onclick={onDialogClick}
>
	<div class="map-inner overflow-hidden rounded-xl border border-brand-gray-light/70">
		<header
			class="flex items-center justify-between border-b border-brand-gray-light/50 bg-white/80 px-5 py-3 backdrop-blur-sm"
		>
			<div class="flex items-center gap-4">
				<h2 class="text-base font-bold text-brand-charcoal">
					{tab === 'map' ? 'Subtopic ELO' : 'Profile'}
				</h2>
				<div class="flex gap-1" role="tablist" aria-label="Choose a view">
					<button
						type="button"
						role="tab"
						aria-selected={tab === 'map'}
						class="tab-btn {tab === 'map' ? 'tab-active' : ''}"
						onclick={() => (tab = 'map')}
					>
						ELO map
					</button>
					<button
						type="button"
						role="tab"
						aria-selected={tab === 'profile'}
						class="tab-btn {tab === 'profile' ? 'tab-active' : ''}"
						onclick={() => (tab = 'profile')}
					>
						Profile
					</button>
				</div>
			</div>
			<button type="button" class="ctrl bg-brand-crimson" aria-label="Close dialog" onclick={close}
			></button>
		</header>

		{#if tab === 'map'}
			<div class="flex flex-col gap-3 px-5 py-5">
				{#each subtopics as subtopic (subtopic.id)}
					{@const elo = game.eloFor(subtopic.id)}
					{@const rank = game.rankOf(subtopic.id)}
					{@const mastered = game.isMastered(subtopic.id)}
					<div
						class="rounded-lg border px-4 py-3 {subtopic.id === activeID
							? 'border-brand-gold/70 bg-white/90'
							: 'border-brand-gray-light/50 bg-white/75'}"
					>
						<div class="flex items-center gap-4">
							<span class="text-brand-charcoal">
								<SectionProgressRing percent={elo} size={44} stroke={4.5} />
							</span>
							<span
								class="rounded bg-brand-navy px-2 py-1 text-sm font-black tracking-wide text-white uppercase"
							>
								{shortName(subtopic.id)}
							</span>
							<span class="ml-auto text-right">
								<span
									class="block text-sm font-bold {mastered
										? 'text-brand-forest'
										: 'text-brand-charcoal'}"
								>
									{rank}
									{#if mastered}✓{/if}
								</span>
								<span class="block font-mono text-xs text-brand-gray-mid tabular-nums">
									{elo}/{MAX_ELO} ELO
								</span>
							</span>
						</div>
						<div class="rams-progress mt-3">
							{#each SEGMENT_INDEXES as i (i)}
								<span
									class="progress-segment {i < Math.round((elo / MAX_ELO) * SEGMENTS)
										? SEG_CLASS[Math.floor(i / 3)]
										: ''}"
								></span>
							{/each}
						</div>
						<p class="mt-1.5 text-[11px] text-brand-gray-mid">
							{game.satisfiedCount(subtopic.id)}/{game.panelCount(subtopic.id)} panels reinforced · hit
							rate {Math.round(hitRateFor(elo) * 100)}%
						</p>
					</div>
				{/each}
			</div>
		{:else}
			<div class="flex flex-col gap-4 px-5 py-5">
				<!-- Identity -->
				<div class="flex items-center gap-4">
					<span class="profile-big">
						{@render avatar(44)}
					</span>
					<span>
						<span class="block text-base font-bold text-brand-charcoal">Learner</span>
						<span class="block text-xs text-brand-gray-mid">
							Level {level} · {totalElo}/{maxTotalElo} total ELO
						</span>
					</span>
				</div>

				<!-- Level progress toward the next level -->
				<div>
					<div
						class="mb-1 flex justify-between text-[10px] font-bold text-brand-gray-mid uppercase"
					>
						<span>Level {level}</span>
						<span>{totalElo % ELO_PER_LEVEL}/{ELO_PER_LEVEL} XP to level {level + 1}</span>
					</div>
					<div class="rams-progress">
						{#each SEGMENT_INDEXES as i (i)}
							<span
								class="progress-segment {i <
								Math.round(((totalElo % ELO_PER_LEVEL) / ELO_PER_LEVEL) * SEGMENTS)
									? SEG_CLASS[Math.floor(i / 3)]
									: ''}"
							></span>
						{/each}
					</div>
				</div>

				<!-- Stats -->
				<div class="grid grid-cols-3 gap-2 text-center">
					<div class="rounded-lg border border-brand-gray-light/50 bg-white/75 py-3">
						<p class="font-mono text-xl font-bold text-brand-charcoal">
							{masteredCount}<span class="text-sm text-brand-gray-mid">/{subtopics.length}</span>
						</p>
						<p class="text-[10px] tracking-wide text-brand-gray-mid uppercase">Mastered</p>
					</div>
					<div class="rounded-lg border border-brand-gray-light/50 bg-white/75 py-3">
						<p class="font-mono text-xl font-bold text-brand-forest">{totalCorrect}</p>
						<p class="text-[10px] tracking-wide text-brand-gray-mid uppercase">Correct</p>
					</div>
					<div class="rounded-lg border border-brand-gray-light/50 bg-white/75 py-3">
						<p class="font-mono text-xl font-bold text-brand-charcoal">{totalAttempts}</p>
						<p class="text-[10px] tracking-wide text-brand-gray-mid uppercase">Attempts</p>
					</div>
				</div>

				<!-- Per-subtopic tiers at a glance -->
				<div class="flex flex-col gap-1.5">
					{#each subtopics as subtopic (subtopic.id)}
						{@const rank = game.rankOf(subtopic.id)}
						<div
							class="flex items-center gap-3 rounded-lg border border-brand-gray-light/50 bg-white/75 px-3 py-2"
						>
							<span class="text-xs font-black tracking-wide text-brand-navy uppercase">
								{shortName(subtopic.id)}
							</span>
							<span class="ml-auto font-mono text-xs text-brand-gray-mid tabular-nums">
								{game.eloFor(subtopic.id)}/{MAX_ELO}
							</span>
							<span class="tier-indicator {TIER_CLASS[rank]}">{rank}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</dialog>

<style>
	/* ── MMO trigger block ─────────────────────────────────────────────── */
	.mmo-trigger {
		display: flex;
		align-items: center;
		padding: 0;
		border: none;
		background: transparent;
		cursor: pointer;
		transition: transform 0.15s ease;
	}
	.mmo-trigger:hover {
		transform: translateY(-1px);
	}
	.mmo-trigger:hover .profile-icon,
	.mmo-trigger:hover .xp-bar-container {
		border-color: #7a7a7a;
	}

	/* Dark chrome so the block sits flush with the near-black OS bar. */
	.profile-icon {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 46px;
		height: 46px;
		background-color: #232524;
		border: solid 1px #4a4a47;
		border-radius: 6px 0 0 6px;
	}

	.profile-picture {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		background-color: #3a3a37;
		border-radius: 4px;
		overflow: hidden;
	}

	.xp-bar-container {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		box-sizing: border-box;
		width: 240px;
		height: 46px;
		padding: 5px 9px;
		background-color: #232524;
		border: solid 1px #4a4a47;
		border-left: none;
		border-radius: 0 6px 6px 0;
	}

	.header-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 6px;
	}

	.section-label {
		overflow: hidden;
		font-size: 10px;
		font-weight: 700;
		color: #d5d3cc;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.tier-indicator {
		padding: 1px 4px;
		font-size: 9px;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		border-radius: 2px;
	}

	.tier-beginner {
		color: #8f7200;
		background-color: #fcf3cf;
	}
	.tier-intermediate {
		color: #a04000;
		background-color: #fdebd0;
	}
	.tier-expert {
		color: #145a32;
		background-color: #d4efdf;
	}
	.tier-mastery {
		color: #ffffff;
		background-color: #386d4f;
	}

	/* ── Rams segmented XP bar (thirds = rank bands) ───────────────────── */
	.rams-progress {
		display: flex;
		align-items: center;
		gap: 3px;
		height: 12px;
		padding: 2px 4px;
		background-color: #aab7bf;
		border-radius: 3px;
	}

	.progress-segment {
		flex: 1;
		height: 6px;
		background-color: #c5c3be;
		transform: skewX(-15deg);
		transition: background-color 0.3s ease;
	}

	/* Darker track on the trigger so the bar melts into the OS bar; the
	   dialog's bars keep the light track. */
	.mmo-trigger .rams-progress {
		background-color: #101211;
	}
	.mmo-trigger .progress-segment {
		background-color: #4a4a47;
	}
	.mmo-trigger .seg-yellow {
		background-color: #ffe600;
	}
	.mmo-trigger .seg-orange {
		background-color: #ff6600;
	}
	.mmo-trigger .seg-green {
		background-color: #00cc44;
	}

	.seg-yellow {
		background-color: #ffe600;
		box-shadow: 0 0 4px rgba(255, 230, 0, 0.5);
	}
	.seg-orange {
		background-color: #ff6600;
		box-shadow: 0 0 4px rgba(255, 102, 0, 0.5);
	}
	.seg-green {
		background-color: #00cc44;
		box-shadow: 0 0 4px rgba(0, 204, 68, 0.5);
	}

	/* ── Profile tab ───────────────────────────────────────────────────── */
	.profile-big {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		background-color: #c5c3be;
		border: solid 1px #8a8a87;
		border-radius: 8px;
	}

	/* ── Dialog chrome ─────────────────────────────────────────────────── */
	.tab-btn {
		padding: 3px 10px;
		font-size: 11px;
		font-weight: 700;
		color: var(--color-brand-gray-mid, #898881);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		background: transparent;
		border: 1px solid rgba(137, 136, 129, 0.4);
		border-radius: 9999px;
		cursor: pointer;
		transition:
			color 0.15s ease,
			border-color 0.15s ease,
			background-color 0.15s ease;
	}
	.tab-btn:hover {
		color: var(--color-brand-charcoal, #232524);
	}
	.tab-active {
		color: white;
		background-color: var(--color-brand-navy, #262d38);
		border-color: var(--color-brand-navy, #262d38);
	}

	.map-dialog {
		margin: auto;
		border: none;
		padding: 0;
		background: transparent;
		color: inherit;
		max-height: 85vh;
		overflow: visible;
	}
	.map-dialog::backdrop {
		background: rgba(10, 12, 10, 0.6);
		backdrop-filter: blur(3px);
	}
	.map-dialog[open] {
		animation: pop 0.2s cubic-bezier(0.2, 0.8, 0.3, 1);
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: scale(0.94);
		}
	}

	.map-inner {
		width: min(92vw, 440px);
		background-color: white;
		background-image:
			linear-gradient(to right, #e8e8e8 1px, transparent 1px),
			linear-gradient(to bottom, #e8e8e8 1px, transparent 1px);
		background-size: 30px 30px;
		background-position: -1px -1px;
		box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
	}

	.ctrl {
		height: 0.8rem;
		width: 0.8rem;
		border-radius: 9999px;
		opacity: 0.85;
		transition:
			opacity 0.15s ease,
			transform 0.15s ease;
	}
	.ctrl:hover {
		opacity: 1;
		transform: scale(1.15);
	}
</style>

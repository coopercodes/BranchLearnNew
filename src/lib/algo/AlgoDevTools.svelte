<script lang="ts">
	import { algoGame, type AlgoEvent } from './gameState.svelte';
	import { algoSections } from './content';
	import { PANEL_TYPE_LABELS, PANEL_TYPE_ORDER, REQUIRED_CORRECT } from './types';

	let open = $state(false);

	let recentEvents = $derived([...algoGame.events].reverse().slice(0, 40));

	function eventTone(event: AlgoEvent): string {
		if (event.type === 'response_correct' || event.type === 'question_correct')
			return 'bg-[#3d8b5f]';
		if (event.type === 'response_incorrect' || event.type === 'question_incorrect')
			return 'bg-[#c73a2e]';
		if (event.type === 'panel_completed' || event.type === 'section_completed')
			return 'bg-[#f35d29]';
		return 'bg-[#b8b8b4]';
	}

	function timestamp(at: number): string {
		return new Date(at).toLocaleTimeString([], {
			hour12: false,
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	function resetState() {
		if (confirm('Wipe the entire algo game state from localStorage?')) algoGame.reset();
	}
</script>

<!-- Global dev tools: fixed overlay, orange/white, functional-grid Rams style. -->
<div class="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 font-sans">
	{#if open}
		<div
			class="flex max-h-[72vh] w-[26rem] flex-col overflow-hidden rounded-sm border border-[#e5e2dc] bg-white shadow-2xl"
		>
			<!-- Header -->
			<div class="flex items-center justify-between bg-[#f35d29] px-4 py-3">
				<div>
					<p class="text-[10px] font-semibold tracking-[0.2em] text-white/80 uppercase">
						Branch · Dev Tools
					</p>
					<p class="text-sm font-bold text-white">Game State</p>
				</div>
				<span class="h-2.5 w-2.5 rounded-full bg-white"></span>
			</div>

			<div class="scroll-chill flex-1 divide-y divide-[#eeece7] overflow-y-auto">
				<!-- Storage -->
				<section class="px-4 py-3">
					<p class="mb-2 text-[10px] font-semibold tracking-[0.2em] text-[#f35d29] uppercase">
						01 · Storage
					</p>
					<dl class="space-y-1 text-xs text-[#3a3a37]">
						<div class="flex justify-between gap-4">
							<dt class="text-[#9a9891]">Key</dt>
							<dd class="truncate font-mono">{algoGame.storageKey}</dd>
						</div>
						<div class="flex justify-between gap-4">
							<dt class="text-[#9a9891]">Started</dt>
							<dd class="font-mono">
								{algoGame.startedAt ? new Date(algoGame.startedAt).toLocaleString() : '—'}
							</dd>
						</div>
						<div class="flex justify-between gap-4">
							<dt class="text-[#9a9891]">Events logged</dt>
							<dd class="font-mono">{algoGame.events.length}</dd>
						</div>
						<div class="flex justify-between gap-4">
							<dt class="text-[#9a9891]">Overall progress</dt>
							<dd class="font-mono">{algoGame.overallPercent(algoSections)}%</dd>
						</div>
					</dl>
				</section>

				<!-- Learner model -->
				<section class="px-4 py-3">
					<div class="mb-2 flex items-center justify-between">
						<p class="text-[10px] font-semibold tracking-[0.2em] text-[#f35d29] uppercase">
							02 · Learner Model
						</p>
						<p class="font-mono text-[10px] text-[#9a9891]">weight ×{algoGame.aptitude}</p>
					</div>
					<div class="space-y-2">
						{#each algoSections as section (section.id)}
							{@const chance = algoGame.chanceFor(section.id)}
							<div class="flex items-center gap-3 text-xs">
								<span class="w-8 font-bold text-[#3a3a37] uppercase">{section.title}</span>
								<div class="h-1.5 flex-1 rounded-full bg-[#f1efe9]">
									<div
										class="h-1.5 rounded-full bg-[#f35d29]"
										style:width="{Math.round(chance * 100)}%"
									></div>
								</div>
								<span class="w-16 text-right font-mono text-[#3a3a37]">
									{Math.round(chance * 100)}% · {algoGame.sectionAttempts(section.id)}a
								</span>
							</div>
						{/each}
					</div>
				</section>

				<!-- Progress matrix -->
				<section class="px-4 py-3">
					<p class="mb-2 text-[10px] font-semibold tracking-[0.2em] text-[#f35d29] uppercase">
						03 · Progress
					</p>
					<table class="w-full text-left text-xs">
						<thead>
							<tr class="text-[10px] text-[#9a9891] uppercase">
								<th class="pb-1 font-medium">Panel</th>
								{#each algoSections as section (section.id)}
									<th class="pb-1 text-right font-medium">
										{section.title}{algoGame.isSectionComplete(section) ? ' ✓' : ''}
									</th>
								{/each}
							</tr>
						</thead>
						<tbody class="text-[#3a3a37]">
							{#each PANEL_TYPE_ORDER as type (type)}
								<tr class="border-t border-[#f1efe9]">
									<td class="py-1 pr-2">{PANEL_TYPE_LABELS[type]}</td>
									{#each algoSections as section (section.id)}
										{@const stats = algoGame.stats(`${section.id}:${type}`)}
										{@const done = stats.correct >= REQUIRED_CORRECT[type]}
										<td class="py-1 text-right font-mono">
											<span class={done ? 'text-[#3d8b5f]' : ''}>
												{Math.min(REQUIRED_CORRECT[type], stats.correct)}/{REQUIRED_CORRECT[type]}
											</span>
											{#if stats.incorrect > 0}
												<span class="text-[#c73a2e]">·{stats.incorrect}✗</span>
											{/if}
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</section>

				<!-- Event log -->
				<section class="px-4 py-3">
					<p class="mb-2 text-[10px] font-semibold tracking-[0.2em] text-[#f35d29] uppercase">
						04 · Event Log
					</p>
					{#if recentEvents.length === 0}
						<p class="text-xs text-[#9a9891]">No events yet — hit “Next Choice” on /algo.</p>
					{:else}
						<ol class="space-y-1.5">
							{#each recentEvents as event (event.at + event.type + event.detail)}
								<li class="flex items-start gap-2 text-[11px] leading-tight">
									<span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full {eventTone(event)}"></span>
									<span class="shrink-0 font-mono text-[#9a9891]">{timestamp(event.at)}</span>
									<span class="text-[#3a3a37]">
										<span class="font-mono text-[10px] text-[#f35d29] uppercase">{event.type}</span>
										{event.detail}
									</span>
								</li>
							{/each}
						</ol>
					{/if}
				</section>
			</div>

			<!-- Footer -->
			<div
				class="flex items-center justify-between border-t border-[#eeece7] bg-[#faf9f6] px-4 py-2.5"
			>
				<p class="text-[10px] text-[#9a9891] uppercase">localStorage · live</p>
				<button
					onclick={resetState}
					class="rounded-sm border border-[#f35d29] px-3 py-1 text-[10px] font-semibold tracking-[0.15em] text-[#f35d29] uppercase transition-colors hover:bg-[#f35d29] hover:text-white"
				>
					Reset State
				</button>
			</div>
		</div>
	{/if}

	<button
		onclick={() => (open = !open)}
		aria-label="Toggle dev tools"
		class="flex h-11 w-11 items-center justify-center rounded-sm bg-[#f35d29] text-[10px] font-bold tracking-widest text-white uppercase shadow-lg transition-transform hover:scale-105"
	>
		{open ? '×' : 'DEV'}
	</button>
</div>

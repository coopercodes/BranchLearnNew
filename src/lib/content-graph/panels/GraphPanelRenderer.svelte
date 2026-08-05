<script lang="ts">
	import type { PanelContent } from '../panel-content';
	import GraphMultipleChoicePanel from './GraphMultipleChoicePanel.svelte';
	import GraphLightningPanel from './GraphLightningPanel.svelte';
	import GraphFlashcardPanel from './GraphFlashcardPanel.svelte';
	import TriangleRendererPanel from './TriangleRendererPanel.svelte';

	// Dispatch on the panel-content kind. Add a new kind by extending the
	// PanelContent union in panel-content.ts and adding a branch here.
	let {
		content,
		title,
		visit,
		onResult
	}: {
		content: PanelContent | null;
		/** Graph node title, for the missing-content fallback. */
		title: string;
		visit: number;
		onResult: (correct: boolean) => void;
	} = $props();

	let selfReported = $state(false);
</script>

{#if content === null}
	<!-- Graph node with no dictionary entry yet — keep the loop walkable. -->
	<div class="flex h-full items-center justify-center px-8 py-12">
		<div class="w-full max-w-md text-center">
			<p class="mb-2 text-xs font-semibold tracking-widest text-brand-orange uppercase">
				Content coming soon
			</p>
			<p class="mb-6 text-xl font-semibold text-brand-near-black">{title}</p>
			<p class="mb-6 text-sm text-brand-gray-mid">
				No entry in panel-content.ts for this panel yet — review it on your own, then report how it
				went.
			</p>
			{#if !selfReported}
				<div class="flex justify-center gap-3">
					<button
						type="button"
						class="cursor-pointer rounded-lg border border-brand-forest bg-brand-forest/10 px-5 py-2.5 text-sm font-bold text-brand-forest hover:bg-brand-forest/20"
						onclick={() => {
							selfReported = true;
							onResult(true);
						}}
					>
						✓ Had it
					</button>
					<button
						type="button"
						class="cursor-pointer rounded-lg border border-brand-crimson bg-brand-crimson/10 px-5 py-2.5 text-sm font-bold text-brand-crimson hover:bg-brand-crimson/20"
						onclick={() => {
							selfReported = true;
							onResult(false);
						}}
					>
						✗ Missed it
					</button>
				</div>
			{:else}
				<p class="text-xs text-brand-gray-mid">Press Continue in the bar below to keep moving.</p>
			{/if}
		</div>
	</div>
{:else if content.type === 'multiple-choice'}
	<GraphMultipleChoicePanel {content} {visit} {onResult} />
{:else if content.type === 'lightning'}
	<GraphLightningPanel {content} {visit} {onResult} />
{:else if content.type === 'flashcard'}
	<GraphFlashcardPanel {content} {visit} {onResult} />
{:else if content.type === 'triangle'}
	<TriangleRendererPanel {content} {visit} {onResult} />
{/if}

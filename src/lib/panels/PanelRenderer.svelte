<script lang="ts">
	import type { Panel } from '$lib/content/types';
	import MultipleChoicePanel from './MultipleChoicePanel.svelte';
	import LightningRoundPanel from './LightningRoundPanel.svelte';
	import LeafQuestionPanel from './LeafQuestionPanel.svelte';

	let { panel }: { panel: Panel } = $props();
</script>

{#if panel.type === 'multiple-choice'}
	<MultipleChoicePanel {panel} />
{:else if panel.type === 'lightning-round'}
	<LightningRoundPanel {panel} />
{:else if panel.type === 'leaf-question'}
	<LeafQuestionPanel {panel} />
{/if}

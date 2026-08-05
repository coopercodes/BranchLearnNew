<script lang="ts">
	import type { Panel } from '$lib/trig/panels';
	import ReadingPanel from './ReadingPanel.svelte';
	import QuestionPanel from './QuestionPanel.svelte';
	import DonePanel from './DonePanel.svelte';

	// Renders the current panel and forwards its events up to the page:
	//   onAnswer   → a question option was clicked
	//   onContinue → a reading / solved question wants to move on
	//   restart    → the finish screen wants to wipe and start over
	let {
		panel,
		onAnswer,
		onContinue,
		restart
	}: {
		panel: Panel;
		onAnswer: (label: string) => void;
		onContinue: () => void;
		restart: () => void;
	} = $props();
</script>

{#if panel.type === 'reading'}
	<ReadingPanel {panel} {onContinue} />
{:else if panel.type === 'question'}
	<QuestionPanel {panel} {onAnswer} />
{:else if panel.type === 'done'}
	<DonePanel onRestart={restart} />
{/if}

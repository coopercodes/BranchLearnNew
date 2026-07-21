<script lang="ts">
	import { isContentPanel, type FlowPanel } from '$lib/trig/types';
	import SectionStartPanel from './SectionStartPanel.svelte';
	import ArticlePanel from './ArticlePanel.svelte';
	import QuestionPanel from './QuestionPanel.svelte';
	import SectionCompletePanel from './SectionCompletePanel.svelte';
	import CourseCompletePanel from './CourseCompletePanel.svelte';

	// `advance` moves the flow forward (used by intro/outro/article buttons and
	// the OS-bar Continue). `restart` wipes the session from the finish screen.
	let {
		panel,
		advance,
		restart
	}: { panel: FlowPanel; advance: () => void; restart: () => void } = $props();
</script>

{#if panel.kind === 'section-start'}
	<SectionStartPanel section={panel.section} onContinue={advance} />
{:else if panel.kind === 'panel'}
	{#if isContentPanel(panel.panel.type)}
		<ArticlePanel section={panel.section} panel={panel.panel} onContinue={advance} />
	{:else if panel.question}
		<QuestionPanel section={panel.section} panel={panel.panel} question={panel.question} />
	{/if}
{:else if panel.kind === 'section-complete'}
	<SectionCompletePanel section={panel.section} onContinue={advance} />
{:else if panel.kind === 'course-complete'}
	<CourseCompletePanel onRestart={restart} />
{/if}

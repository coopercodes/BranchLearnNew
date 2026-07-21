<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Desktop from '$lib/layout-components/Desktop.svelte';
	import FlowRenderer from '$lib/trig/panels/FlowRenderer.svelte';
	import TrigDevTools from '$lib/trig/TrigDevTools.svelte';
	import { trigSections } from '$lib/trig/content';
	import { trigSession } from '$lib/trig/session.svelte';
	import { initialPosition, nextPosition, resolvePanel } from '$lib/trig/algorithm';
	import { describePanelForLeaf } from '$lib/trig/leafContext';
	import { isContentPanel } from '$lib/trig/types';
	import { osBar } from '$lib/os/osBarProgress.svelte';
	import { leafPanelContext } from '$lib/leaf/panelContext.svelte';

	// The session's saved position is the single source of truth. The recommender
	// turns it into a concrete panel; advancing asks it for the next position and
	// writes it back. Everything below derives from `panel`.
	let panel = $derived(resolvePanel(trigSections, trigSession, trigSession.position));

	// Persist an initial position the first time in (rendering already falls back
	// to it, so this only matters for a durable save).
	$effect(() => {
		if (trigSession.position === null) trigSession.setPosition(initialPosition(trigSections));
	});

	function advance() {
		const pos = trigSession.position ?? initialPosition(trigSections);
		// Leaving an article counts as reading it, so the recommender moves on.
		if (panel.kind === 'panel' && isContentPanel(panel.panel.type)) {
			trigSession.markRead(panel.panel.id);
		}
		// setPosition serves the target question — bumping to a fresh attempt when
		// it's a re-serve — so the panel remounts clean instead of resurrecting the
		// previous responses.
		trigSession.setPosition(nextPosition(trigSections, trigSession, pos));
	}

	function restart() {
		trigSession.reset();
		trigSession.setPosition(initialPosition(trigSections));
	}

	// The OS bar is the universal "advance" control. A question gates Continue
	// behind a correct answer; intro/outro/article panels make it available now.
	$effect(() => {
		if (panel.kind === 'panel' && !isContentPanel(panel.panel.type)) {
			const solved = !!panel.question && trigSession.isSolved(panel.question.id);
			osBar.total = 1;
			osBar.answered = solved ? 1 : 0;
			osBar.onContinue = solved ? advance : null;
		} else if (panel.kind === 'course-complete') {
			osBar.total = 0;
			osBar.answered = 0;
			osBar.onContinue = null;
		} else {
			osBar.total = 1;
			osBar.answered = 1;
			osBar.onContinue = advance;
		}
	});
	onDestroy(() => osBar.reset());

	// Keep Leaf aware of what the learner is looking at.
	$effect(() => {
		leafPanelContext.set(describePanelForLeaf(panel));
	});
	onDestroy(() => leafPanelContext.clear());
</script>

<Desktop>
	<!-- Keyed on the panel identity so advancing crossfades with a fade+drift:
	     the old panel sinks out, the new one rises in. Both absolutely
	     positioned so the swap never reflows the Desktop chrome. -->
	{#key panel.key}
		<div
			class="absolute inset-0"
			in:fly={{ y: 20, duration: 350, delay: 525, easing: cubicOut }}
			out:fly={{ y: 20, duration: 350, easing: cubicOut }}
		>
			<FlowRenderer {panel} {advance} {restart} />
		</div>
	{/key}
</Desktop>

<TrigDevTools />

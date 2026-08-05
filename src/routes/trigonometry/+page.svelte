<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Desktop from '$lib/layout-components/Desktop.svelte';
	import FlowRenderer from '$lib/trig/panels/FlowRenderer.svelte';
	import TrigDevTools from '$lib/trig/TrigDevTools.svelte';
	import { trigSession } from '$lib/trig/session.svelte';
	import { describePanelForLeaf } from '$lib/trig/leafContext';
	import { osBar } from '$lib/os/osBarProgress.svelte';
	import { leafPanelContext } from '$lib/leaf/panelContext.svelte';

	// The panel on screen is just `panels[index]`. The store owns the index and
	// persists it to localStorage; everything below derives from this.
	let panel = $derived(trigSession.panel);

	// ╔══════════════════════════════════════════════════════════════════════╗
	// ║  YOUR ALGORITHM LIVES HERE                                             ║
	// ║                                                                        ║
	// ║  advance() is the ONE place that decides where the learner goes next.  ║
	// ║  Right now it's a plain linear walk: go to the next panel in the array.║
	// ║                                                                        ║
	// ║  Swap the body to build your own logic. You have everything you need:  ║
	// ║    • trigSession.index                → where they are now             ║
	// ║    • trigSession.goTo(i)              → send them to panel i           ║
	// ║    • trigSession.answerFor(id).wrong  → wrong tries on a question      ║
	// ║    • trigSession.topicPercent('SOH')  → progress in a topic            ║
	// ║  e.g. skip ahead, repeat a topic, branch on how many wrong answers.    ║
	// ╚══════════════════════════════════════════════════════════════════════╝
	function advance() {
		trigSession.goTo(trigSession.index + 1);
	}

	// ── Event catching ──────────────────────────────────────────────────────
	// Panels don't decide anything themselves; they just report what happened
	// and these handlers respond. Hook your own side effects in here.

	/** A reading was acknowledged, or a solved question's "Continue" was hit. */
	function handleContinue() {
		if (panel.type === 'reading') trigSession.markRead(panel.id);
		advance();
	}

	/** The learner clicked an option on a question panel. */
	function handleAnswer(label: string) {
		trigSession.answer(panel, label);
		// (fires on every click — right or wrong. Add per-answer logic here.)
	}

	function restart() {
		trigSession.reset();
	}

	// The OS bar's "Continue" pill is the universal advance control. A question
	// gates it behind a correct answer; readings make it available right away.
	$effect(() => {
		if (panel.type === 'question') {
			const solved = trigSession.isCorrect(panel.id);
			osBar.total = 1;
			osBar.answered = solved ? 1 : 0;
			osBar.onContinue = solved ? handleContinue : null;
		} else if (panel.type === 'done') {
			osBar.total = 0;
			osBar.answered = 0;
			osBar.onContinue = null;
		} else {
			osBar.total = 1;
			osBar.answered = 1;
			osBar.onContinue = handleContinue;
		}
	});
	onDestroy(() => osBar.reset());

	// Keep Leaf (the tutor) aware of what the learner is looking at.
	$effect(() => {
		leafPanelContext.set(describePanelForLeaf(panel));
	});
	onDestroy(() => leafPanelContext.clear());
</script>

<Desktop>
	<!-- Keyed on the panel id so advancing crossfades with a fade+drift: the old
	     panel sinks out, the new one rises in. Both absolutely positioned so the
	     swap never reflows the Desktop chrome. -->
	{#key panel.id}
		<div
			class="absolute inset-0"
			in:fly={{ y: 20, duration: 350, delay: 525, easing: cubicOut }}
			out:fly={{ y: 20, duration: 350, easing: cubicOut }}
		>
			<FlowRenderer {panel} onAnswer={handleAnswer} onContinue={handleContinue} {restart} />
		</div>
	{/key}
</Desktop>

<TrigDevTools />

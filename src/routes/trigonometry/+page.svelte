<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Desktop from '$lib/layout-components/Desktop.svelte';
	import PanelRenderer from '$lib/panels/PanelRenderer.svelte';
	import { trigonometryCourse as course } from '$lib/content/trigonometry';
	import { findLesson } from '$lib/content/types';
	import { describePanelForLeaf, leafPanelContext } from '$lib/leaf/panelContext.svelte';
	import { osBar } from '$lib/os/osBarProgress.svelte';
	import { userProgress } from '$lib/progress/userProgress.svelte';

	// UserProgress.position is the single source of truth for where the learner
	// is — this page, the OS bar Continue, and the learning map all move it, and
	// everything below derives from it (falling back to the first panel).
	let lesson = $derived.by(() => {
		const pos = userProgress.position;
		return (pos && findLesson(course, pos.lessonId)) || course.lessons[0];
	});
	let panelIndex = $derived.by(() => {
		const pos = userProgress.position;
		if (!pos || pos.lessonId !== lesson.id) return 0;
		return Math.min(pos.panelIndex, lesson.panels.length - 1);
	});
	let panel = $derived(lesson.panels[panelIndex]);

	// Persist the resolved position (no-ops when it already matches).
	$effect(() => {
		userProgress.setPosition(lesson.id, panelIndex);
	});

	// The OS bar is the whole interface: it counts down the current panel's
	// questions, and its Continue pill advances once the panel is complete.
	// A leaf-question panel has no gradeable questions — its one "item" is
	// asking Leaf something, so it counts as a single task.
	$effect(() => {
		if (panel.type === 'leaf-question') {
			osBar.total = 1;
			osBar.answered = userProgress.isComplete(panel) ? 1 : 0;
		} else {
			osBar.total = panel.questions.length;
			osBar.answered = userProgress.settledCount(panel);
		}
		osBar.onContinue = userProgress.isComplete(panel) ? next : null;
	});
	onDestroy(() => osBar.reset());

	// Publish the current slide's content so Leaf — docked, floating, or
	// embedded in a Question panel — knows exactly what the student is seeing.
	$effect(() => {
		leafPanelContext.set(describePanelForLeaf(lesson, panel));
	});
	onDestroy(() => leafPanelContext.clear());

	function next() {
		if (panelIndex < lesson.panels.length - 1) {
			userProgress.setPosition(lesson.id, panelIndex + 1);
			return;
		}
		const lessonIdx = course.lessons.indexOf(lesson);
		if (lessonIdx < course.lessons.length - 1) {
			userProgress.setPosition(course.lessons[lessonIdx + 1].id, 0);
			return;
		}
		// Course finished — hand off to the progress viewer.
		goto(resolve('/progress-viewer'));
	}
</script>

<Desktop>
	<!-- Keyed on the panel so Continue swaps content with a fade+drift: the old
	     panel sinks out, the new one rises in. Both are absolutely positioned so
	     the crossfade never reflows the Desktop chrome (OS bar, dock, windows). -->
	{#key panel}
		<div
			class="absolute inset-0"
			in:fly={{ y: 20, duration: 350, delay: 525, easing: cubicOut }}
			out:fly={{ y: 20, duration: 350, easing: cubicOut }}
		>
			<PanelRenderer {panel} />
		</div>
	{/key}
</Desktop>

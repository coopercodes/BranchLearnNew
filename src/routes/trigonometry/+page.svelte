<script lang="ts">
	import { onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Desktop from '$lib/layout-components/Desktop.svelte';
	import PanelRenderer from '$lib/panels/PanelRenderer.svelte';
	import { trigonometryCourse as course } from '$lib/content/trigonometry';
	import { findLesson } from '$lib/content/types';
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
	$effect(() => {
		osBar.total = panel.questions.length;
		osBar.answered = userProgress.settledCount(panel);
		osBar.onContinue = userProgress.isComplete(panel) ? next : null;
	});
	onDestroy(() => osBar.reset());

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
	<PanelRenderer {panel} />
</Desktop>

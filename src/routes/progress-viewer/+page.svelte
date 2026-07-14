<script lang="ts">
	import { resolve } from '$app/paths';
	import { trigonometryCourse as course } from '$lib/content/trigonometry';
	import type { Panel, Question } from '$lib/content/types';
	import { userProgress } from '$lib/progress/userProgress.svelte';

	type QuestionState = 'correct' | 'missed' | 'in-progress' | 'untouched';

	function questionState(panel: Panel, question: Question): QuestionState {
		const record = userProgress.answer(panel.id, question.id);
		if (record.correct) return 'correct';
		if (record.locked) return 'missed';
		if (record.incorrectAnswers.length > 0) return 'in-progress';
		return 'untouched';
	}

	const chipStyles: Record<QuestionState, string> = {
		correct: 'bg-brand-forest text-white',
		missed: 'bg-brand-crimson text-white',
		'in-progress': 'bg-brand-gold text-brand-near-black',
		untouched: 'bg-brand-gray-light/50 text-brand-gray-mid'
	};

	function chipTitle(panel: Panel, question: Question): string {
		const record = userProgress.answer(panel.id, question.id);
		const wrong = record.incorrectAnswers.length;
		const status = record.correct
			? `correct (${wrong} wrong ${wrong === 1 ? 'guess' : 'guesses'} first)`
			: record.locked
				? record.selected === null
					? 'timed out'
					: `missed — picked ${record.selected}`
				: wrong > 0
					? `${wrong} wrong ${wrong === 1 ? 'guess' : 'guesses'} so far`
					: 'not attempted';
		return `${question.prompt}\n${status}`;
	}

	let totals = $derived.by(() => {
		const questions = course.lessons.flatMap((l) =>
			l.panels.flatMap((p) => p.questions.map((q) => userProgress.answer(p.id, q.id)))
		);
		return {
			questions: questions.length,
			correct: questions.filter((a) => a.correct).length,
			wrongGuesses: questions.reduce((sum, a) => sum + a.incorrectAnswers.length, 0),
			attempted: questions.filter((a) => a.locked || a.incorrectAnswers.length > 0).length
		};
	});

	let position = $derived(userProgress.position);

	function positionLabel(): string {
		if (!position) return 'Not started yet';
		const lesson = course.lessons.find((l) => l.id === position.lessonId);
		const panel = lesson?.panels[position.panelIndex];
		return lesson && panel ? `${lesson.title} · ${panel.title}` : 'Not started yet';
	}

	function formatTime(ts: number | null): string {
		return ts === null ? '—' : new Date(ts).toLocaleString();
	}

	function resetAll() {
		if (confirm('Wipe all saved progress? This cannot be undone.')) userProgress.reset();
	}
</script>

<div class="min-h-screen bg-brand-cream px-8 py-12">
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-8 flex items-end justify-between">
			<div>
				<h1 class="text-4xl font-bold tracking-tight text-brand-navy">Progress Viewer</h1>
				<p class="mt-1 text-sm text-brand-gray-mid">
					Everything saved in UserProgress · last active {formatTime(userProgress.lastActiveAt)}
				</p>
			</div>
			<a
				href={resolve('/trigonometry')}
				class="text-sm font-semibold text-brand-blue hover:underline"
			>
				← Back to course
			</a>
		</div>

		<!-- Summary cards -->
		<div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
			<div class="rounded-xl bg-brand-navy p-5">
				<p class="text-xs font-semibold uppercase tracking-widest text-brand-gold">Mastery</p>
				<p class="mt-1 text-3xl font-bold text-white">{userProgress.coursePercent(course)}%</p>
			</div>
			<div class="rounded-xl bg-brand-white p-5 outline outline-1 outline-brand-gray-light/40">
				<p class="text-xs font-semibold uppercase tracking-widest text-brand-forest">Correct</p>
				<p class="mt-1 text-3xl font-bold text-brand-near-black">
					{totals.correct}<span class="text-lg text-brand-gray-mid">/{totals.questions}</span>
				</p>
			</div>
			<div class="rounded-xl bg-brand-white p-5 outline outline-1 outline-brand-gray-light/40">
				<p class="text-xs font-semibold uppercase tracking-widest text-brand-crimson">
					Wrong guesses
				</p>
				<p class="mt-1 text-3xl font-bold text-brand-near-black">{totals.wrongGuesses}</p>
			</div>
			<div class="rounded-xl bg-brand-white p-5 outline outline-1 outline-brand-gray-light/40">
				<p class="text-xs font-semibold uppercase tracking-widest text-brand-sky">Attempted</p>
				<p class="mt-1 text-3xl font-bold text-brand-near-black">
					{totals.attempted}<span class="text-lg text-brand-gray-mid">/{totals.questions}</span>
				</p>
			</div>
		</div>

		<!-- Current position -->
		<div
			class="mb-10 flex items-center gap-3 rounded-xl border border-brand-gold/50 bg-brand-gold/10 px-5 py-4"
		>
			<span class="text-xl">📍</span>
			<div>
				<p class="text-xs font-semibold uppercase tracking-widest text-brand-orange">
					Currently at
				</p>
				<p class="text-sm font-semibold text-brand-near-black">{positionLabel()}</p>
			</div>
		</div>

		<!-- Per-lesson breakdown -->
		{#each course.lessons as lesson, li (lesson.id)}
			<section class="mb-8">
				<div class="mb-3 flex items-center justify-between">
					<h2 class="text-lg font-bold text-brand-espresso">{li + 1}. {lesson.title}</h2>
					<span class="text-sm font-semibold text-brand-gray-mid">
						{userProgress.lessonPercent(lesson)}%
					</span>
				</div>
				<div class="mb-3 h-1.5 overflow-hidden rounded-full bg-brand-gray-light/40">
					<div
						class="h-full rounded-full bg-brand-forest transition-all duration-500"
						style="width: {userProgress.lessonPercent(lesson)}%"
					></div>
				</div>

				<div class="flex flex-col gap-3">
					{#each lesson.panels as panel, pi (panel.id)}
						{@const progress = userProgress.panel(panel.id)}
						{@const isHere = position?.lessonId === lesson.id && position?.panelIndex === pi}
						<div
							class="rounded-xl bg-brand-white p-4 outline outline-1 {isHere
								? 'outline-2 outline-brand-gold'
								: 'outline-brand-gray-light/40'}"
						>
							<div class="mb-3 flex items-center justify-between gap-3">
								<div class="flex items-center gap-2">
									<span class="text-sm">{panel.type === 'lightning-round' ? '⚡' : panel.type === 'leaf-question' ? '🍃' : '📖'}</span>
									<p class="text-sm font-semibold text-brand-charcoal">{panel.title}</p>
									{#if isHere}
										<span
											class="rounded-full bg-brand-gold px-2 py-0.5 text-xs font-bold text-brand-navy"
										>
											you are here
										</span>
									{/if}
								</div>
								<p class="text-xs text-brand-gray-mid">
									{#if progress.completedAt}
										completed {formatTime(progress.completedAt)}
									{:else if progress.startedAt}
										started {formatTime(progress.startedAt)}
									{:else}
										not started
									{/if}
								</p>
							</div>
							<div class="flex flex-wrap gap-2">
								{#each panel.questions as question, qi (question.id)}
									<span
										title={chipTitle(panel, question)}
										class="flex h-7 w-7 cursor-help items-center justify-center rounded-full text-xs font-bold {chipStyles[
											questionState(panel, question)
										]}"
									>
										{qi + 1}
									</span>
								{/each}
								<span class="ml-1 self-center text-xs text-brand-gray-mid">
									{#if panel.type === 'leaf-question'}
										chat with Leaf {progress.completedAt ? '· question asked' : '· no question yet'}
									{:else}
										{userProgress.correctCount(panel)}/{panel.questions.length} correct ·
										{userProgress.incorrectCount(panel)} wrong
									{/if}
								</span>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/each}

		<!-- Danger zone -->
		<div class="mt-12 border-t border-brand-gray-light/40 pt-6">
			<button
				type="button"
				class="cursor-pointer rounded-lg border border-brand-crimson/40 bg-brand-crimson/10 px-4 py-2 text-sm font-semibold text-brand-crimson transition-all hover:bg-brand-crimson/20"
				onclick={resetAll}
			>
				Reset all progress
			</button>
		</div>
	</div>
</div>

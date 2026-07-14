<script lang="ts">
	import Leaf from '$lib/Leaf.svelte';
	import LeafChat from '$lib/components/LeafChat.svelte';
	import type { LeafQuestionPanel } from '$lib/content/types';
	import { leafPanelContext } from '$lib/leaf/panelContext.svelte';
	import { userProgress } from '$lib/progress/userProgress.svelte';
	import { untrack } from 'svelte';

	let { panel }: { panel: LeafQuestionPanel } = $props();

	let chat = $state<ReturnType<typeof LeafChat> | null>(null);

	$effect(() => {
		const id = panel.id;
		untrack(() => userProgress.beginPanel(id));
	});

	// The course page publishes this slide's content into leafPanelContext, so
	// the embedded chat gets the same grounding as the desktop Leaf window.
	let context = $derived(
		'The student is working through the BranchLearn Trigonometry course and has reached a "Question" slide, ' +
			'where they are prompted to talk the section through with you.' +
			(leafPanelContext.current ? `\n\n${leafPanelContext.current}` : '')
	);

	let complete = $derived(userProgress.isComplete(panel));
</script>

<div class="flex h-full">
	<!-- Left: the nudge — what to ask Leaf and why -->
	<div class="scroll-chill h-full min-w-0 flex-1 overflow-y-auto">
		<div class="flex min-h-full flex-col items-end py-16 pr-8 pl-16 [justify-content:safe_center]">
			<div class="w-full max-w-lg">
				<div class="mb-4 flex items-center gap-3">
					<Leaf color="#386d4f" width={40} height={40} />
					<p class="text-brand-forest text-xs font-semibold tracking-widest uppercase">Question</p>
				</div>
				<h1 class="mb-6 text-5xl font-bold text-black">{panel.title.replace(/^Question:\s*/, '')}</h1>
				<p class="mb-6 text-base text-black">{panel.prompt}</p>

				<p class="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
					Try one of these
				</p>
				<div class="flex flex-col items-start gap-2">
					{#each panel.suggestions as suggestion (suggestion)}
						<button
							type="button"
							class="border-brand-forest/30 bg-brand-forest/5 text-brand-forest hover:bg-brand-forest/15 cursor-pointer rounded-full border px-4 py-2 text-left text-sm transition-colors"
							onclick={() => chat?.ask(suggestion)}
						>
							{suggestion}
						</button>
					{/each}
				</div>

				<p class="mt-6 text-xs text-gray-500">
					{complete
						? 'Nice — question asked. Continue whenever you feel ready.'
						: 'Ask Leaf at least one question to complete this section.'}
				</p>
			</div>
		</div>
	</div>

	<!-- Divider -->
	<div class="bg-brand-gray-light/60 h-6 w-px shrink-0 self-center"></div>

	<!-- Right: embedded Leaf chat, grounded in this slide's content -->
	<div class="h-full min-w-0 flex-1 overflow-hidden py-10 pr-16 pl-8">
		<div class="border-brand-gray-light/60 h-full w-full overflow-hidden rounded-lg border bg-[#F5EDE7] shadow-sm">
			<LeafChat
				bind:this={chat}
				{context}
				showHeader={false}
				onfirstmessage={() => userProgress.completePanel(panel.id)}
			/>
		</div>
	</div>
</div>

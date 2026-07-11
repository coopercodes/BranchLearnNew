<script lang="ts">
	import SvelteMarkdown from '@humanspeak/svelte-markdown';
	import Leaf from '$lib/Leaf.svelte';
	import type { TriangleSelection } from './TriangleRenderer.svelte';

	type ChatMessage = { role: 'user' | 'assistant'; text: string };

	let {
		triangleDescription,
		selection,
		onclose
	}: {
		triangleDescription: string;
		selection: TriangleSelection | null;
		onclose: () => void;
	} = $props();

	let messages = $state<ChatMessage[]>([]);
	let input = $state('');
	let busy = $state(false);

	async function sendMessage() {
		const text = input.trim();
		if (!text || busy) return;

		input = '';
		busy = true;

		// 1. Add the user's message, plus an empty assistant message to stream into.
		messages.push({ role: 'user', text });
		messages.push({ role: 'assistant', text: '' });
		const reply = messages[messages.length - 1];

		try {
			// 2. Send the whole conversation (minus the empty placeholder) + triangle context.
			const res = await fetch('/api/leaf', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					messages: messages.slice(0, -1),
					context: contextForLeaf()
				})
			});
			if (!res.ok || !res.body) throw new Error(await res.text());

			// 3. Stream Claude's reply into the assistant message as plain text chunks.
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				reply.text += decoder.decode(value, { stream: true });
			}
		} catch (err) {
			reply.text = `Sorry, something went wrong: ${err instanceof Error ? err.message : err}`;
		} finally {
			busy = false;
		}
	}

	/** What Leaf knows about the triangle when this message is sent. */
	function contextForLeaf() {
		let context = `The student is looking at this triangle: ${triangleDescription}`;
		if (selection) {
			const label = `${selection.kind} ${selection.name}`;
			context += selection.hidden
				? ` The student has clicked the HIDDEN ${label} (its real value is ${selection.value}, but the student only sees a "?") — help them work it out, don't just reveal it.`
				: ` The student has clicked ${label} (${selection.value}) — that is what they are asking about.`;
		}
		return context;
	}
</script>

<div class="flex h-full w-full flex-col border bg-[#F5EDE7] shadow-2xl/35 rounded-sm" role="dialog" aria-label="Leaf chat">
	<!-- Titlebar, styled after LeafWindow -->
	<div class="flex items-center justify-between border-b bg-[#e9e1db] px-2 py-1 rounded-t-sm">
		<div class="flex items-center space-x-2">
			<Leaf color="#386d4f" width={24} height={24} />
			<p class="text-xs font-semibold">Chat</p>
		</div>
		<button
			type="button"
			class="h-4 w-4 cursor-pointer rounded-full bg-red-800/70 hover:bg-red-800"
			aria-label="Close Leaf"
			onclick={onclose}
		></button>
	</div>

	<!-- Messages -->
	<div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
		{#if messages.length === 0}
			<div class="flex h-full flex-col items-center justify-center">
				<div class="flex items-center space-x-2">
					<Leaf color="#386d4f" width={36} height={36} />
					<p class="text-2xl font-semibold">Leaf</p>
				</div>
				<p class="my-2 text-center text-sm font-thin">
					Click a side of the triangle,<br />then ask me anything about it.
				</p>
			</div>
		{/if}

		{#each messages as message, i (i)}
			{#if message.role === 'user'}
				<div class="w-full rounded-sm bg-brand-forest p-4">
					<p class="text-sm text-white">{message.text}</p>
				</div>
			{:else}
				<div>
					<div class="mb-2 flex items-center">
						<Leaf color="#386d4f" width={22} height={22} />
						<div class="ml-1 h-[1px] grow bg-brand-forest"></div>
					</div>
					<div class="prose prose-sm max-w-none text-sm">
						<SvelteMarkdown source={message.text} streaming={true} streamId={`message-${i}`} />
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<!-- Input -->
	<div class="border-t p-3">
		{#if selection}
			<p class="mb-2 inline-block rounded-sm bg-brand-blue/20 px-2 text-xs font-thin text-brand-blue">
				{selection.kind === 'side' ? 'Side' : 'Angle'} {selection.name}
				{selection.hidden ? '(hidden)' : ''} selected
			</p>
		{/if}
		<form
			class="flex gap-2"
			onsubmit={(e) => {
				e.preventDefault();
				sendMessage();
			}}
		>
			<input
				type="text"
				bind:value={input}
				placeholder={selection
					? `Ask about ${selection.kind} ${selection.name}...`
					: 'Ask Leaf about the triangle...'}
				class="min-w-0 flex-1 rounded-sm border-neutral-300 bg-neutral-100 p-2 text-sm"
			/>
			<button
				type="submit"
				disabled={busy}
				class="cursor-pointer rounded-sm bg-brand-forest px-4 text-sm text-white disabled:opacity-50"
			>
				{busy ? '...' : 'Send'}
			</button>
		</form>
	</div>
</div>

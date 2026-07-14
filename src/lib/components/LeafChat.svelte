<script lang="ts">
	import SvelteMarkdown, { type Renderers, type RendererComponent } from '@humanspeak/svelte-markdown';
	import { markedKatex, KatexRenderer } from '@humanspeak/svelte-markdown/extensions/katex';
	import 'katex/dist/katex.min.css';
	import Leaf from '$lib/Leaf.svelte';
	import { describeSelectedElement, type SelectedElement } from '$lib/leaf/selection.svelte';

	type ChatMessage = { role: 'user' | 'assistant'; text: string };

	let {
		context,
		selected = null,
		onclose,
		showHeader = true,
		onfirstmessage
	}: {
		/** What the student is looking at overall — the scene Leaf grounds its answers in. */
		context: string;
		/** The specific element the student has focused, if any. */
		selected?: SelectedElement | null;
		onclose?: () => void;
		/** Hide the titlebar when embedding inside a host that already has one (e.g. LeafWindow). */
		showHeader?: boolean;
		/** Fires once, when the student sends their first message of this chat. */
		onfirstmessage?: () => void;
	} = $props();

	const extensions = [markedKatex()];
	// Renderers doesn't know about extension tokens, so widen it for the katex keys.
	const renderers: Partial<Renderers> & Record<string, RendererComponent> = {
		inlineKatex: KatexRenderer,
		blockKatex: KatexRenderer
	};

	let messages = $state<ChatMessage[]>([]);
	let input = $state('');
	let busy = $state(false);

	/** Send a message on the student's behalf, e.g. from a suggestion chip. */
	export function ask(text: string) {
		input = text;
		sendMessage();
	}

	async function sendMessage() {
		const text = input.trim();
		if (!text || busy) return;

		input = '';
		busy = true;

		// 1. Add the user's message, plus an empty assistant message to stream into.
		if (messages.length === 0) onfirstmessage?.();
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

	/** What Leaf knows about the scene + selection when this message is sent. */
	function contextForLeaf() {
		return selected ? `${context}\n\n${describeSelectedElement(selected)}` : context;
	}
</script>

<div class="flex h-full w-full flex-col {showHeader ? 'border bg-[#F5EDE7] shadow-2xl/35 rounded-sm' : ''}" role="dialog" aria-label="Leaf chat">
	{#if showHeader}
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
	{/if}

	<!-- Messages -->
	<div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
		{#if messages.length === 0}
			<div class="flex h-full flex-col items-center justify-center">
				<div class="flex items-center space-x-2">
					<Leaf color="#386d4f" width={36} height={36} />
					<p class="text-2xl font-semibold">Leaf</p>
				</div>
				<p class="my-2 text-center text-sm font-thin">
					Nice to meet you, I'm Leaf.<br />Let's learn something new today.
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
						<SvelteMarkdown source={message.text} streaming={true} streamId={`message-${i}`} {extensions} {renderers} />
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<!-- Input -->
	<div class="border-t p-3">
		{#if selected}
			<p class="mb-2 inline-block rounded-sm bg-brand-blue/20 px-2 text-xs font-thin text-brand-blue">
				{selected.label} {selected.hidden ? '(hidden)' : ''} selected
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
				placeholder={selected ? `Ask about ${selected.label}...` : 'Ask Leaf anything...'}
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

<script lang="ts">
	import { desktop, getWindowContext } from '$lib/os/windowStore.svelte';

	// No props — each instance discovers its OWN window through context.
	const win = getWindowContext();

	// --- Leaf (AI tutor) ---
	type Message = { from: 'leaf' | 'user'; text: string };

	let messages = $state<Message[]>([
		{ from: 'leaf', text: "Hi! I'm Leaf — your AI learning guide. What topic would you like to explore today? 🌱" },
	]);
	let draft = $state('');
	let thinking = $state(false);
	let chatEl = $state<HTMLElement | null>(null);

	const leafReplies = [
		"Great question! Let's break it down. Think of it like finding a word in a dictionary — you never start at page 1 every time.",
		"Exactly right! You're building strong intuition. The key insight is: every step eliminates half the remaining possibilities.",
		"Good thinking. Let's try a concrete example. Imagine searching for \"mango\" in a sorted list of 1,000 fruits — how many checks does it take? 🌿",
		"You've got it! The magic here is we're never doing redundant work. Every comparison is meaningful.",
		"Interesting angle — that connects to the broader concept of divide-and-conquer. Want to go deeper into that?",
		"Nice! Now try thinking about what happens if the list *isn't* sorted. How would your approach change?",
	];

	let replyIndex = 0;

	async function send(e: Event) {
		e.preventDefault();
		if (!draft.trim() || thinking) return;
		messages = [...messages, { from: 'user', text: draft.trim() }];
		draft = '';
		thinking = true;
		await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
		messages = [...messages, { from: 'leaf', text: leafReplies[replyIndex % leafReplies.length] }];
		replyIndex++;
		thinking = false;
	}

	$effect(() => {
		void messages.length;
		void thinking;
		if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
	});

	// --- Atlas (map) ---
	const cols = 8;
	const rows = 6;
	let px = $state(3);
	let py = $state(2);
	function step(dx: number, dy: number) {
		px = Math.max(0, Math.min(cols - 1, px + dx));
		py = Math.max(0, Math.min(rows - 1, py + dy));
	}
</script>

{#if win.app.id === 'leaf'}
	<div class="flex h-full flex-col">
		<!-- Tutor header -->
		<div class="mb-3 flex items-center gap-2.5 border-b border-brand-green-100 pb-3">
			<div
				class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-forest text-sm font-bold text-white"
			>
				L
			</div>
			<div class="min-w-0">
				<p class="text-sm font-semibold text-brand-green-700">Leaf</p>
				<p class="text-xs text-brand-gray-mid">AI Learning Guide</p>
			</div>
			<div class="ml-auto flex items-center gap-1.5 text-xs text-brand-green-700">
				<span class="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
				<span>Active</span>
			</div>
		</div>

		<!-- Chat messages -->
		<div
			bind:this={chatEl}
			class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1"
		>
			{#each messages as msg (msg)}
				{#if msg.from === 'leaf'}
					<div class="flex items-end gap-2">
						<div
							class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-forest text-xs font-bold text-white"
						>
							L
						</div>
						<div
							class="max-w-[82%] rounded-2xl rounded-bl-sm border border-brand-green-100 bg-brand-green-50 px-3 py-2 text-sm leading-relaxed text-brand-charcoal"
						>
							{msg.text}
						</div>
					</div>
				{:else}
					<div class="flex items-end justify-end">
						<div
							class="max-w-[82%] rounded-2xl rounded-br-sm bg-brand-forest px-3 py-2 text-sm leading-relaxed text-white"
						>
							{msg.text}
						</div>
					</div>
				{/if}
			{/each}

			{#if thinking}
				<div class="flex items-end gap-2">
					<div
						class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-forest text-xs font-bold text-white"
					>
						L
					</div>
					<div
						class="flex gap-1 rounded-2xl rounded-bl-sm border border-brand-green-100 bg-brand-green-50 px-3 py-2.5"
					>
						<span class="typing-dot" style:animation-delay="0ms"></span>
						<span class="typing-dot" style:animation-delay="160ms"></span>
						<span class="typing-dot" style:animation-delay="320ms"></span>
					</div>
				</div>
			{/if}
		</div>

		<!-- Input -->
		<form class="mt-3 flex items-center gap-2 border-t border-brand-green-100 pt-3" onsubmit={send}>
			<input
				type="text"
				bind:value={draft}
				placeholder="Ask Leaf anything…"
				class="min-w-0 flex-1 rounded-xl border border-brand-green-200 bg-brand-green-50 px-3 py-2 text-sm text-brand-charcoal placeholder:text-brand-gray-mid transition focus:border-brand-forest focus:ring-2 focus:ring-brand-forest/20 focus:outline-none"
			/>
			<button
				type="submit"
				disabled={!draft.trim() || thinking}
				class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-forest text-white transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
				aria-label="Send"
			>
				<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
					<path d="M7 12V2M2 7l5-5 5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
		</form>
	</div>

{:else if win.app.id === 'atlas'}
	<div class="flex h-full flex-col gap-3">
		<div class="flex items-center justify-between text-xs text-brand-gray-light">
			<span>Region map</span>
			<span class="font-mono">
				win {Math.round(win.width)}×{Math.round(win.height)} · pos {px},{py}
			</span>
		</div>
		<div
			class="grid flex-1 gap-0.5 rounded-lg bg-black/30 p-1.5"
			style:grid-template-columns="repeat({cols}, minmax(0, 1fr))"
		>
			{#each Array(rows * cols) as _, i (i)}
				{@const cx = i % cols}
				{@const cy = Math.floor(i / cols)}
				<div class="relative rounded-sm bg-brand-gold/10">
					{#if cx === px && cy === py}
						<span class="player absolute inset-0.5 rounded-full bg-brand-gold"></span>
					{/if}
				</div>
			{/each}
		</div>
		<div class="mx-auto grid w-24 grid-cols-3 gap-1 text-brand-near-black">
			<span></span>
			<button type="button" class="pad" onclick={() => step(0, -1)} aria-label="north">▲</button>
			<span></span>
			<button type="button" class="pad" onclick={() => step(-1, 0)} aria-label="west">◀</button>
			<span></span>
			<button type="button" class="pad" onclick={() => step(1, 0)} aria-label="east">▶</button>
			<span></span>
			<button type="button" class="pad" onclick={() => step(0, 1)} aria-label="south">▼</button>
			<span></span>
		</div>
	</div>

	<button
		type="button"
		class="mt-3 text-xs text-brand-gray-mid underline-offset-2 hover:text-brand-gray-light hover:underline"
		onclick={() => desktop.close(win.app.id)}
	>
		close this window
	</button>
{/if}

<style>
	.typing-dot {
		height: 0.4rem;
		width: 0.4rem;
		border-radius: 9999px;
		background: var(--color-brand-green-200, #a3d9b5);
		animation: bounce 1.2s ease-in-out infinite;
	}

	@keyframes bounce {
		0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
		40% { transform: translateY(-4px); opacity: 1; }
	}

	.player {
		box-shadow: 0 0 10px #ffc52a;
		animation: blink 1s steps(2, jump-none) infinite;
	}
	@keyframes blink {
		50% { opacity: 0.4; }
	}

	.pad {
		border-radius: 0.375rem;
		background: #ede6dc;
		padding: 0.15rem 0;
		font-size: 0.7rem;
		line-height: 1;
		transition: filter 0.15s ease;
	}
	.pad:hover {
		filter: brightness(0.9);
	}
</style>

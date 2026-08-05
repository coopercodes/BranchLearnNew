<script lang="ts">
	import { fly } from 'svelte/transition';
	import BranchMark from './BranchMark.svelte';
	import { toasts } from './toast.svelte';
</script>

<!-- Bottom-centre, above everything, click-through except the toasts themselves -->
<div
	class="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4"
	aria-live="polite"
>
	{#each toasts.items as toast (toast.id)}
		{@const Custom = toast.component}
		<div class="pointer-events-auto" transition:fly={{ y: 28, duration: 220 }}>
			{#if Custom}
				<!-- The caller owns the whole card; clicking anywhere dismisses it. -->
				<button
					type="button"
					class="block cursor-pointer text-left"
					onclick={() => toasts.dismiss(toast.id)}
				>
					<Custom {...toast.props} />
				</button>
			{:else}
				<div
					class="flex items-center gap-3 rounded-xl bg-brand-navy py-3 pr-4 pl-4 shadow-xl ring-1 ring-white/10"
				>
					<BranchMark
						color={toast.tone === 'danger'
							? 'var(--color-brand-crimson)'
							: 'var(--color-brand-green-200)'}
					/>
					<div class="min-w-0">
						<p class="text-sm leading-tight font-bold text-white">{toast.title}</p>
						{#if toast.message}
							<p class="text-xs leading-tight text-brand-gray-light">{toast.message}</p>
						{/if}
					</div>
					<button
						onclick={() => toasts.dismiss(toast.id)}
						class="ml-2 shrink-0 text-brand-gray-light hover:text-white"
						aria-label="Dismiss"
					>
						✕
					</button>
				</div>
			{/if}
		</div>
	{/each}
</div>

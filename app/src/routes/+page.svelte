<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '/workspace/Fli-Light/app/src/supabaseClient';
	import type { AuthSession } from '@supabase/supabase-js';
	import Account from '/workspace/Fli-Light/app/src/lib/Account.svelte';
	import Auth from '/workspace/Fli-Light/app/src/lib/Auth.svelte';

	let session: AuthSession;

	onMount(() => {
		supabase.auth.getSession().then(({ data }) => {
			session = data.session;
		});

		supabase.auth.onAuthStateChange((_event, _session) => {
			session = _session;
		});
	});
</script>

<div class="container h-full mx-auto flex justify-center items-center">
	<div class="space-y-10 text-center flex flex-col items-center">
		<h2 class="h2">Welcome to Skeleton.</h2>
		<!-- Login -->
		<div class="container" style="padding: 50px 0 100px 0">
			{#if !session}
				<Auth />
			{:else}
				<Account {session} />
			{/if}
		</div>
		<!-- / -->
		<div class="flex justify-center space-x-2">
			<a class="btn variant-filled" href="https://skeleton.dev/" target="_blank" rel="noreferrer">
				Launch Documentation
			</a>
		</div>
		<div class="space-y-2">
			<p>Try editing the following:</p>
			<p><code class="code">/src/routes/+layout.svelte</code></p>
			<p><code class="code">/src/routes/+page.svelte</code></p>
		</div>
	</div>
</div>

<style lang="postcss">
	figure {
		@apply flex relative flex-col;
	}
	figure svg,
	.img-bg {
		@apply w-64 h-64 md:w-80 md:h-80;
	}
	.img-bg {
		@apply absolute z-[-1] rounded-full blur-[50px] transition-all;
		animation: pulse 5s cubic-bezier(0, 0, 0, 0.5) infinite, glow 5s linear infinite;
	}
	@keyframes glow {
		0% {
			@apply bg-primary-400/50;
		}
		33% {
			@apply bg-secondary-400/50;
		}
		66% {
			@apply bg-tertiary-400/50;
		}
		100% {
			@apply bg-primary-400/50;
		}
	}
	@keyframes pulse {
		50% {
			transform: scale(1.5);
		}
	}
</style>

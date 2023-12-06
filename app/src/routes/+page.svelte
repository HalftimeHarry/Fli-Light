<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '../supabaseClient';
	import type { AuthSession } from '@supabase/supabase-js';
	import Account from '$lib/Account.svelte';
	import Auth from '$lib/Auth.svelte';

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
		<!-- Login -->
		<div class="container" style="padding: 50px 0 100px 0">
			{#if !session}
				<Auth />
			{:else}
				<Account {session} />
			{/if}
		</div>
	</div>
</div>

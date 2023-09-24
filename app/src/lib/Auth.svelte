<script lang="ts">
	import { supabase } from '../supabaseClient';
	import Icon from '@iconify/svelte';

	let loading = false;
	let email = '';

	const handleLogin = async () => {
		try {
			loading = true;
			const { error } = await supabase.auth.signInWithOtp({ email });
			if (error) throw error;
			alert('Check your email for login link!');
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	};
</script>

<div class="row flex-center flex">
	<div class="col-6 form-widget" aria-live="polite">
		<h2 class="h2 mx-auto mb-6">Where Disc Golf Takes Flight!</h2>
		<Icon icon="tabler:disc-golf" class="mx-auto text-4xl" />
		<p class="description mb-2">Sign in via magic link with your email below</p>
		<form class="form-widget" on:submit|preventDefault={handleLogin}>
			<div class="flex items-center">
				<input
					id="email"
					class="inputField text-black flex-grow ml-2"
					type="email"
					placeholder="Your email@mail.com"
					bind:value={email}
				/>
			</div>
			<div class="mt-4">
				<button
					type="submit"
					class="block w-full py-1 px-3 bg-green-700 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50 disabled:opacity-50"
					aria-live="polite"
					disabled={loading}
				>
					{#if loading}
						Loading
					{:else}
						<span class="flex items-center justify-center">
							<Icon icon="mdi:magic" class="mr-2" />
							Send magic link
							<Icon icon="mdi:magic" class="ml-2" />
						</span>
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>

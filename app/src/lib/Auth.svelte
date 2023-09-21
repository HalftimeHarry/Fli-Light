<script lang="ts">
	import { supabase } from '../supabaseClient';

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
		<p class="description">Sign in via magic link with your email below</p>
		<form class="form-widget" on:submit|preventDefault={handleLogin}>
			<div>
				<label for="email">Email</label>
				<input
					id="email"
					class="inputField text-black"
					type="email"
					placeholder="Your email"
					bind:value={email}
				/>
			</div>
			<div>
				<button
					type="submit"
					class="block w-full py-1 px-3 mt-4 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50 disabled:opacity-50"
					aria-live="polite"
					disabled={loading}
				>
					<span>{loading ? 'Loading' : 'Send magic link'}</span>
				</button>
			</div>
		</form>
	</div>
</div>

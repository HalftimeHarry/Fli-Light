<script lang="ts">
	import { supabase } from '../supabaseClient';
	import { fly } from 'svelte/transition';
	import authStore from '../lib/AuthStore';

	let loading = false;
	let email = '';
	let password = '';
	let formType = ''; // Can be 'register' or 'login'

	authStore.subscribe((state) => {
		formType = state.formType;
	});

	const handleSignUp = async () => {
		try {
			loading = true;
			const { user, error: signUpError } = await supabase.auth.signUp({
				email: email,
				password: password
			});
			if (signUpError) throw signUpError;
			if (user) {
				const { error: updateError } = await supabase.from('profiles').upsert([
					{
						id: user.id,
						role: 'Participant'
					}
				]);
				if (updateError) throw updateError;
			}
			alert('Check your email for the confirmation link!');
		} catch (error) {
			alert(error.message);
		} finally {
			loading = false;
		}
	};

	const handleLogin = async () => {
		try {
			loading = true;
			const { data, error } = await supabase.auth.signInWithPassword({
				email: email, // use the email variable
				password: password // use the password variable
			});
			if (error) throw error;
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	};

	const signOut = async () => {
		try {
			await supabase.auth.signOut();
			// add navigation to login or home page if needed
		} catch (error) {
			console.error('Error signing out: ', error);
		}
	};
</script>

{#if formType === 'register'}
	<!-- Registration form -->
	<div in:fly={{ x: -600, duration: 800 }} out:fly={{ x: 600, duration: 800 }}>
		<!-- The rest of your RegistrationForm content goes here -->
		<div class="flex justify-center items-center flex-col">
			<div class="col-6 form-widget" aria-live="polite">
				<h1 class="header">
					<p class="description">Register with your email and password below</p>
					<form class="form-widget" on:submit|preventDefault={handleSignUp}>
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
							<label for="password">Password</label>
							<input
								id="password"
								class="inputField text-black"
								type="password"
								placeholder="Your password"
								bind:value={password}
							/>
						</div>
						<div>
							<button
								type="submit"
								class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
								aria-live="polite"
								disabled={loading}
							>
								<span>{loading ? 'Loading' : 'Register'}</span>
							</button>
						</div>
					</form>
				</h1>
			</div>
		</div>
	</div>
{/if}

{#if formType === 'login'}
	<div in:fly={{ x: -600, duration: 800 }} out:fly={{ x: 600, duration: 800 }}>
		<div class="flex justify-center items-center flex-col">
			<div class="col-6 form-widget" aria-live="polite">
				<p class="description">Sign in with your email and password below</p>
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
						<label for="password">Password</label>
						<input
							id="password"
							class="inputField text-black"
							type="password"
							placeholder="Your password"
							bind:value={password}
						/>
					</div>
					<div>
						<button
							type="submit"
							class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
							aria-live="polite"
							disabled={loading}
						>
							<span>{loading ? 'Loading' : 'Login'}</span>
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}

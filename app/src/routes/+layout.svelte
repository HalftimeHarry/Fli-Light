<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import Footer from '$lib/components/Footer.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import SubscribePopUp from '$lib/components/SubscribePopUp.svelte';
	import { overlayStore } from '$lib/overlayStore.ts';
	import authStore from '$lib/AuthStore';
	import { onMount } from 'svelte';
	import type { AuthSession } from '@supabase/supabase-js';
	import { supabase } from '../supabaseClient';
	import { page } from '$app/stores';
	import AdminDashboard from '../lib/AdminDashboard.svelte';
	import ParticipantDashboard from '../lib/ParticipantDashboard.svelte';
	import SubscribertDashboard from '../lib/SubscriberDashboard.svelte';
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	import { tick } from 'svelte';
	import UpdatePasswordForm from '/workspace/Fli-Light/app/src/lib/components/updatePasswordForm.svelte';
	import { fly } from 'svelte/transition';

	let url;

	$: ({ url } = $page);
	$: console.log(url);
	let session: AuthSession | null = null;
	let role: 'Admin' | 'Participant' | 'Subscriber' | null = null;
	let showUpdatePasswordForm = false;
	let newPassword = '';

	onMount(async () => {
		const { data, error } = await supabase.auth.getSession();

		if (error) {
			console.error('Error fetching session: ', error);
		} else {
			session = data?.session;
		}

		supabase.auth.onAuthStateChange((event, sessionData) => {
			session = sessionData;

			if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
				authStore.update((state) => {
					state.isLoggedIn = true;
					return state;
				});
			} else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
				authStore.update((state) => {
					state.isLoggedIn = false;
					return state;
				});
			}
		});
	});

	let isLoggedIn = false;
	let formType;
	authStore.subscribe((state) => {
		isLoggedIn = state.isLoggedIn;
		formType = state.formType;
	});

	async function setFormToRegister() {
		await tick(); // Wait for the DOM to update
		authStore.update((state) => {
			state.formType = 'register';
			return state;
		});
	}

	function setFormToLogin() {
		authStore.update((state) => {
			state.formType = 'login';
			return state;
		});
	}

	async function handlePasswordResetRequest() {
		if (session && session.user?.email) {
			const { data, error } = await supabase.auth.resetPasswordForEmail(session.user?.email, {
				redirectTo:
					'https://neon-shortbread-5fe77d.netlify.app//api/auth/callback?next=/account/update-password'
			});

			if (error) {
				console.error('Error sending password reset:', error.message);
			} else {
				console.log('Password reset email sent:', data);
			}
		}
	}

	async function handleUpdatePasswordEvent(event) {
		const { currentPassword, newPassword } = event.detail;

		// Check if you want to use the current password in some way for validation
		// Otherwise, continue with the existing logic

		if (newPassword && session) {
			const { data, error } = await supabase.auth.updateUser({ password: newPassword });

			if (error) {
				console.error('Error updating password:', error.message);
			} else {
				console.log('Password updated successfully:', data);
				showUpdatePasswordForm = false;
			}
		}
	}

	function toggleOverlayForm(formType: 'subscribe' | 'register') {
		if ($overlayStore.visible && $overlayStore.formType === formType) {
			overlayStore.set({ visible: false, formType: null });
		} else {
			overlayStore.set({ visible: true, formType: formType });
		}
	}

	function toggleRegister() {
		const currentRoute = window.location.pathname;

		if (currentRoute !== '/' && currentRoute !== '/index.html') {
			// Redirect to the root with a special query parameter
			window.location.href = '/?showRegister=true';
		} else {
			// If already on the root, just show the registration form
			setFormToRegister();
		}
	}

	function toggleSubscribePopUp() {
		toggleOverlayForm('subscribe');
	}

	function showPasswordUpdateForm() {
		showUpdatePasswordForm = true;
	}

	let showRegister: boolean = false;

	$: {
		const query = new URLSearchParams($page.query);
		showRegister = query.get('showRegister') === 'true';

		if (showRegister) {
			setFormToRegister();

			// Optional: Clean up the URL after showing the form
			const cleanURL = window.location.pathname;
			window.history.replaceState(null, '', cleanURL);
		}
	}
</script>

<AppShell>
	<svelte:fragment slot="header">
		<AppBar>
			<svelte:fragment slot="lead">
				<a href="/">
					<img src="/FLI_BLK.png" alt="FLI GOLF Logo" class="logo-class" />
				</a>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<a
					class="btn btn-sm lg:btn-md xl:btn-lg bg-blue-500 hover:bg-blue-700 mr-24 cursor-pointer text-white font-bold"
					on:click={toggleSubscribePopUp}
				>
					Subscription<br />
					<Icon icon="pixelarticons:subscriptions" />
				</a>

				{#if !session}
					<button class="btn btn-lg variant-ghost-surface" on:click={toggleRegister}>
						Register
					</button>
					<button class="btn btn-lg variant-ghost-surface" on:click={setFormToLogin}>
						Sign In
					</button>
				{:else}
					<button class="btn btn-lg variant-ghost-surface" on:click={() => supabase.auth.signOut()}>
						Sign Out
					</button>
					<button class="btn btn-lg variant-ghost-surface" on:click={handlePasswordResetRequest}>
						Reset Password
					</button>
				{/if}
				<button class="btn btn-lg variant-ghost-surface" on:click={showPasswordUpdateForm}>
					Update Password
				</button>
			</svelte:fragment>
		</AppBar>
		<NavBar />
	</svelte:fragment>

	<div class="mt-4">
		{#if showUpdatePasswordForm}
			<div in:fly={{ x: 300, duration: 300 }} out:fly={{ x: 300, duration: 300 }}>
				<UpdatePasswordForm on:updatepassword={handleUpdatePasswordEvent} />
			</div>
		{:else if $overlayStore.visible}
			<SubscribePopUp />
		{/if}

		<slot />
	</div>

	<Footer />
</AppShell>

<style>
	.cursor-pointer {
		cursor: pointer;
	}
</style>

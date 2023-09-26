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
	import Icon from '@iconify/svelte';

	let url;

	$: ({ url } = $page);
	$: console.log(url);

	let session: AuthSession | null = null;
	let role: 'Admin' | 'Participant' | 'Subscriber' | null = null;

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

	function setFormToRegister() {
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

	async function handleUpdatePassword() {
		if (session && session.user?.email) {
			try {
				const { data, error } = await supabase.auth.resetPasswordForEmail(session.user.email, {
					redirectTo: '#'
				});

				if (error) {
					console.error('Error sending password reset email:', error.message);
				} else {
					console.log('Password reset email sent:', data);
					authStore.update((state) => {
						state.formType = 'updatePassword';
						return state;
					});
				}
			} catch (error) {
				console.error('Exception caught:', error);
			}
		} else {
			console.error('No user session available or email missing from session');
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
		if (currentRoute === '/' || currentRoute === '/index.html') {
			setFormToRegister();
		} else {
			toggleOverlayForm('register');
		}
	}

	function toggleSubscribePopUp() {
		toggleOverlayForm('subscribe');
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
					<button class="btn btn-lg variant-ghost-surface" on:click={handleUpdatePassword}>
						Update Password
					</button>
				{/if}
			</svelte:fragment>
		</AppBar>
		<NavBar />
	</svelte:fragment>

	<div class="mt-4">
		{#if $overlayStore.visible}
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

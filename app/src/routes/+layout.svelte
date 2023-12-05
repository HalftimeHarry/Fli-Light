<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import Footer from '$lib/components/Footer.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import SubscribePopUp from '$lib/components/SubscribePopUp.svelte';
	import { overlayStore } from '$lib/overlayStore';
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
	import UpdatePasswordForm from '$lib/components/updatePasswordForm.svelte';
	import { fly } from 'svelte/transition';

	let url: { pathname: string };
	let showNavBar = false;
	let isHomePage = false;

	let session: AuthSession | null = null;
	let role:
		| 'Admin'
		| 'Participant'
		| 'Pro'
		| 'Subscriber'
		| 'Venue'
		| 'Team'
		| 'Scorer'
		| 'Past Subscriber'
		| null = null;
	let showUpdatePasswordForm = false;
	let newPassword = '';
	let userRole = null;
	let hasSigned = null;

	async function fetchUserRoleAndSignStatus(userId: any) {
		const { data, error } = await supabase
			.from('profiles')
			.select('role, has_signed, subscriber')
			.eq('id', userId)
			.single();

		if (error) {
			console.error('Error fetching user role:', error);
			return;
		}

		userRole = data.role;
		hasSigned = data.has_signed;
		console.log('User role is:', userRole);
		console.log(123);

		// Redirect based on user role I do not think it runs this code it does that below
		switch (userRole) {
			case 'Scorer':
				goto('/scoring'); // Redirect Scorer to the scoring page
				break;
			case 'Subscriber':
				goto('/fantasy'); // Redirect Subscriber to the fantasy page
				break;
			case 'Pro':
				if (!hasSigned) {
					goto('/intent'); // Redirect to the 'intent' route for Pros who haven't signed
				}
				break;
			default:
				goto('/'); // Redirect to the home page for other roles or conditions
				break;
		}
	}

	async function fetchUserRole(userId: string) {
		const { data, error } = await supabase
			.from('profiles')
			.select('role')
			.eq('id', userId) // id is the column that relates to the auth user's id
			.single();

		if (error) {
			console.error('Error fetching user role:', error);
			return null;
		}

		if (!data) {
			console.warn(`No profile found for user with id: ${userId}`);
			return null;
		}

		return data.role;
	}

	function toggleNavBar() {
		showNavBar = !showNavBar;
	}

	async function fetchUserProfile(userId: string) {
		const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

		if (error) {
			console.error('Error fetching user profile:', error);
			return null;
		}

		return data;
	}

	supabase.auth.onAuthStateChange(async (event, newSession) => {
		session = newSession;
		console.log('Session updated:', session);

		if (session) {
			// Update the user's role and signed status
			const userProfile = await fetchUserProfile(session.user.id);
			role = userProfile?.role || null;
			hasSigned = userProfile?.has_signed || false;

			// Use a function to determine redirection based on role
			// This function should consider the current route to avoid unnecessary redirects
			handleRoleBasedRedirect(role, hasSigned);
		}
	});

	function handleRoleBasedRedirect(role, hasSigned) {
		const currentRoute = window.location.pathname;

		// Add logic here to determine if a redirect is needed based on role and current route
		if (role === 'Scorer' && currentRoute !== '/scoring') {
			goto('/scoring');
		} else if (role === 'Pro' && !hasSigned && currentRoute !== '/intent') {
			goto('/intent');
		} // Add other conditions as needed
	}

	let isBrowser = typeof window !== 'undefined'; // Check if in a browser environment

	let isSmallScreen = typeof window !== 'undefined' && window.innerWidth <= 768;

	$: console.log('Current session:', session);
	$: ({ url } = $page);
	$: isHomePage = url.pathname === '/';
	$: console.log(url.pathname);
	$: console.log('URL value:', url);
	console.log('NavBar rendered');
	$: {
		console.log('Reactive statement ran', isSmallScreen, isHomePage);
	}

	// Check the screen size on component mount and whenever the window is resized
	onMount(() => {
		function checkScreenSize() {
			isSmallScreen = window.innerWidth <= 768;
		}

		window.addEventListener('resize', checkScreenSize);

		return () => {
			window.removeEventListener('resize', checkScreenSize);
		};
	});

	let isLoggedIn = false;
	let formType;
	authStore.subscribe((state) => {
		formType = state.formType;
	});

	async function setFormToRegister() {
		await tick(); // Wait for the DOM to update
		authStore.update((state) => {
			state.formType = 'register';
			return state;
		});
	}

	const signOut = async () => {
		try {
			await supabase.auth.signOut();
			session = null;
			userRole = null;
			// Navigate user to a desired location after sign out, if necessary:
			// window.location.href = '/login';
		} catch (error) {
			console.error('Error signing out: ', error);
		}
	};

	function setFormToLogin() {
		authStore.update((state) => {
			state.formType = 'login';
			return state;
		});
	}

	async function handlePasswordResetRequest() {
		if (session && session.user?.email) {
			const { data, error } = await supabase.auth.resetPasswordForEmail(session.user?.email, {
				redirectTo: 'https://fligolf.netlify.app/api/auth/callback?next=/account/update-password'
			});

			if (error) {
				console.error('Error sending password reset:', error.message);
			} else {
				console.log('Password reset email sent:', data);
			}
		}
	}

	async function handleUpdatePasswordEvent(event: {
		detail: { currentPassword: any; newPassword: any };
	}) {
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
	$: {
		const query = new URLSearchParams($page.query);
		const showRegister = query.get('showRegister') === 'true';

		if (showRegister) {
			setFormToRegister();
			window.history.replaceState(null, '', window.location.pathname); // Clean up the URL
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
		</AppBar>
		<!-- Place the NavBar logic directly here, outside of a fragment -->
		{#if isHomePage}
			<!-- Full NavBar for Home Page -->
			<NavBar />
			{#if !session}
				<!-- Your existing code for larger screens -->
			{/if}
		{:else if isSmallScreen}
			<!-- Mini Menu (Icon) for small screens not on Home Page -->
			<button class="icon-button" on:click={toggleNavBar}>
				<div class="ml-8"><Icon icon="mdi:menu" /></div>
			</button>
			{#if showNavBar}
				<NavBar />
			{/if}
		{:else}
			<!-- Full NavBar for large screens not on Home Page -->
			<NavBar />
			{#if !session}
				<!-- Your existing code for larger screens -->
			{/if}
		{/if}
	</svelte:fragment>

	<div class="mt-2 mr-16 ml-16">
		{#if !session}
			<!-- User is not logged in -->
			<div class="flex justify-center items-center py-3">
				<button class="btn btn-lg variant-ghost-surface p-2 flex-1 mr-1" on:click={toggleRegister}>
					Register
				</button>
				<button class="btn btn-lg variant-ghost-surface p-2 flex-1 ml-1" on:click={setFormToLogin}>
					Sign In
				</button>
			</div>
		{:else}
			<!-- User is logged in -->
			<button class="btn btn-lg variant-ghost-surface p-2 flex-1 ml-1" on:click={signOut}>
				Sign Out
			</button>
			<button
				class="btn btn-lg variant-ghost-surface p-2 flex-1 mr-1"
				on:click={handlePasswordResetRequest}
			>
				Reset Password
			</button>
			<button
				class="btn btn-lg variant-ghost-surface p-2 flex-1 ml-1"
				on:click={toggleSubscribePopUp}
			>
				Subscribe
			</button>
		{/if}
		{#if showUpdatePasswordForm}
			<div in:fly={{ x: 300, duration: 300 }} out:fly={{ x: 300, duration: 300 }}>
				<UpdatePasswordForm on:updatepassword={handleUpdatePasswordEvent} />
			</div>
		{:else if $overlayStore.visible}
			<div class="overlay">
				<SubscribePopUp />
			</div>
		{/if}

		<slot />
	</div>
	<Footer />
</AppShell>

<style>
	.cursor-pointer {
		cursor: pointer;
	}

	.padded-button {
		padding: 8px;
	}
	.overlay {
		z-index: 1000; /* or any sufficiently high value */
		position: relative; /* or absolute, depending on your needs */
	}
</style>

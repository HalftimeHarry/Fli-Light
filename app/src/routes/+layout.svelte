<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import Footer from '$lib/components/Footer.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import SubscribePopUp from '$lib/components/SubscribePopUp.svelte'; // Import the popup
	import { overlayStore } from '$lib/overlayStore.ts';
	import Icon from '@iconify/svelte';

	function toggleSubscribePopUp() {
		if ($overlayStore) {
			overlayStore.set(false);
		} else {
			overlayStore.set(true);
		}
	}
</script>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
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
			</svelte:fragment>
		</AppBar>
		<NavBar />
	</svelte:fragment>

	<div class="mt-4">
		{#if $overlayStore}
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

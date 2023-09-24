<script lang="ts">
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import Footer from '$lib/components/Footer.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import SubscribePopUp from '$lib/components/SubscribePopUp.svelte'; // Import the popup
	import { overlayStore } from '$lib/overlayStore.ts';

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
					class="btn btn-sm lg:btn-md xl:btn-lg variant-ghost-surface"
					on:click={toggleSubscribePopUp}
				>
					Subscription
				</a>
			</svelte:fragment>
		</AppBar>
		<div class="mb-4">
			<NavBar />
		</div>
	</svelte:fragment>

	<div class="mt-4">
		{#if $overlayStore}
			<SubscribePopUp />
		{/if}
		<slot />
	</div>

	<Footer />
</AppShell>

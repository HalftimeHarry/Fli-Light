<script>
	import VegasPopUp from '$lib/components/VegasPopUp.svelte';
	import { overlayStore } from '$lib/overlayStore.ts';

	let continuousText = '... Placeholder text for the ticker...';

	let menuOpen = false;

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function toggleVegasPopUp() {
		if ($overlayStore === 'vegas') {
			overlayStore.set('');
		} else {
			overlayStore.set('vegas');
		}
	}

	function closeVegasPopUp() {
		overlayStore.set('');
	}
</script>

<div class="container mx-auto p-4 border-t border-white z-10">
	<div class="top-row flex flex-row space-x-4 mb-8 justify-between md:justify-start">
		<!-- Hamburger Menu (visible on small screens) -->
		<button class="md:hidden p-2 mr-4" on:click={toggleMenu}> ☰ </button>

		<!-- Main Menu Links -->
		<div class={`space-x-4 ${menuOpen ? 'block' : 'hidden'} md:flex`}>
			<a href="pros" class="hover:underline">Standings</a>
			<a href="partners" class="hover:underline">Partners</a>
			<a href="tournaments" class="hover:underline">Tournaments</a>
			<a href="info" class="hover:underline">Information</a>
			<button
				class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
				on:click={toggleVegasPopUp}
			>
				Vegas
			</button>
		</div>
		{#if $overlayStore === 'vegas'}
			<VegasPopUp on:close={closeVegasPopUp} />
		{/if}
	</div>
</div>

<script lang="ts">
	import VegasPopUp from '$lib/components/VegasPopUp.svelte';
	import { overlayStore } from '$lib/overlayStore.ts';
	import Icon from '@iconify/svelte';

	let continuousText = '... Placeholder text for the ticker...';

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

	function navigateTo(url) {
		window.location.href = url;
	}
</script>

<div class="container mx-auto p-4 border-t border-white z-10">
	<div
		class="top-row flex flex-row flex-wrap space-x-2 sm:space-x-4 mb-4 sm:mb-8 justify-between md:justify-start"
	>
		<!-- Main Menu Links -->
		<div class="space-x-2 sm:space-x-4 w-full sm:w-auto mb-4 sm:mb-0 md:flex">
			<button
				class="flex items-center bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline mb-2 w-full sm:w-auto"
				on:click={() => navigateTo('pros')}
			>
				<Icon icon="mdi:order-bool-ascending" class="mr-2" />
				<span>Standings</span>
			</button>

			<button
				class="flex items-center bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline mb-2 w-full sm:w-auto"
				on:click={() => navigateTo('partners')}
			>
				<Icon icon="mdi:partnership-outline" class="mr-2" />
				<span>Partners</span>
			</button>

			<button
				class="flex items-center bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline mb-2 w-full sm:w-auto"
				on:click={() => navigateTo('tournaments')}
			>
				<Icon icon="pixelarticons:tournament" class="mr-2" />
				<span>Tournaments</span>
			</button>

			<button
				class="flex items-center bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline mb-2 w-full sm:w-auto"
				on:click={() => navigateTo('info')}
			>
				<Icon icon="carbon:information" class="mr-2" />
				<span>Information</span>
			</button>

			<button
				class="flex items-center bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline mb-2 w-full sm:w-auto"
				on:click={toggleVegasPopUp}
			>
				<Icon icon="fa-solid:dice" class="mr-2" />
				Vegas
				<Icon icon="ion:ticket-sharp" class="mr-2 ml-2" />
			</button>
		</div>

		{#if $overlayStore === 'vegas'}
			<VegasPopUp on:close={closeVegasPopUp} />
		{/if}
	</div>
</div>

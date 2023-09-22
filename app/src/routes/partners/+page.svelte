<script lang="ts">
	import { onMount } from 'svelte';
	import SponsorCard from '$lib/components/SponsorCard.svelte';
	import VenueCard from '$lib/components/VenueCard.svelte';
	import { supabase } from '../../supabaseClient';

	let selectedTab: 'venues' | 'sponsors' = 'venues'; // Default to venues as they're the parent.
	let sponsors = [];
	let venues = [];
	let isLoading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			const venuesResponse = await supabase.from('venues').select('*');
			const sponsorsResponse = await supabase.from('sponsors').select('*');

			if (venuesResponse.error) throw venuesResponse.error;
			if (sponsorsResponse.error) throw sponsorsResponse.error;

			venues = venuesResponse.data;
			sponsors = sponsorsResponse.data.map((sponsor) => {
				const associatedVenue = venues.find((venue) => venue.venue_id === sponsor.venue_id);
				return {
					...sponsor,
					venue: associatedVenue ? associatedVenue.name : 'No Venue'
				};
			});
		} catch (err) {
			error = err.message;
		} finally {
			isLoading = false;
		}
	});
</script>

<div class="p-6">
	<h1 class="text-5xl sm:text-7xl md:text-9xl font-bold mb-4 uppercase">Partners</h1>

	<div class="flex flex-wrap space-x-4 mb-4">
		<!-- Venues button moved to the left as they're the parent -->
		<button
			class="flex-1 px-2 py-1 sm:px-4 sm:py-2"
			class:bg-green-500={selectedTab === 'venues'}
			class:text-white={selectedTab === 'venues'}
			class:bg-gray-800={selectedTab !== 'venues'}
			on:click={() => (selectedTab = 'venues')}
		>
			Venues
		</button>
		<!-- Sponsors button -->
		<button
			class="flex-1 px-2 py-1 sm:px-4 sm:py-2"
			class:bg-blue-500={selectedTab === 'sponsors'}
			class:text-white={selectedTab === 'sponsors'}
			class:bg-gray-800={selectedTab !== 'sponsors'}
			on:click={() => (selectedTab = 'sponsors')}
		>
			Sponsors
		</button>
	</div>

	{#if isLoading}
		<p>Loading...</p>
	{:else if error}
		<p>{error}</p>
	{:else if selectedTab === 'venues'}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each venues as venue}
				<VenueCard
					name={venue.name}
					location={venue.location}
					venueImageUrl={venue.venue_image_url}
				/>
			{/each}
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each sponsors as sponsor}
				<SponsorCard
					name={sponsor.name}
					sponsorImageUrl={sponsor.sponsor_image_url}
					venueName={sponsor.venue}
				/>
			{/each}
		</div>
	{/if}
</div>

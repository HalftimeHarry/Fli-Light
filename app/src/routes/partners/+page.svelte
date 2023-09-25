<script lang="ts">
	import { onMount } from 'svelte';
	import SponsorCard from '$lib/components/SponsorCard.svelte';
	import VenueCard from '$lib/components/VenueCard.svelte';
	import { supabase } from '../../supabaseClient';

	let selectedTab: 'venues' | 'sponsors' = 'venues'; // Default to venues as they're the parent.
	let sponsors = [];
	let venues = [];
	let tournaments = [];
	let isLoading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			const tournamentsResponse = await supabase.from('tournaments').select('*');
			if (tournamentsResponse.error) throw tournamentsResponse.error;
			tournaments = tournamentsResponse.data;
			const venuesResponse = await supabase.from('venues').select('*');
			const sponsorsResponse = await supabase.from('sponsors').select('*');

			if (venuesResponse.error) throw venuesResponse.error;
			if (sponsorsResponse.error) throw sponsorsResponse.error;

			venues = venuesResponse.data;
			sponsors = sponsorsResponse.data.map((sponsor) => {
				const associatedTournament = tournaments.find(
					(tournament) => tournament.sponsor_id === sponsor.sponsor_id
				);
				return {
					...sponsor
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
			class="flex-1 px-2 py-1 sm:px-4 sm:py-2 transition duration-300 ease-in-out hover:bg-blue-700 font-bold"
			class:bg-blue-500={selectedTab === 'venues'}
			class:text-white={selectedTab === 'venues'}
			class:bg-gray-800={selectedTab !== 'venues'}
			on:click={() => (selectedTab = 'venues')}
		>
			Venues
		</button>

		<!-- Sponsors button -->
		<button
			class="flex-1 px-2 py-1 sm:px-4 sm:py-2 transition duration-300 ease-in-out hover:bg-blue-700 font-bold"
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
				/>
			{/each}
		</div>
	{/if}
</div>

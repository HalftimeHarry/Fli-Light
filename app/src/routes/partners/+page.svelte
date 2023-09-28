<script lang="ts">
	import { onMount } from 'svelte';
	import SponsorCard from '$lib/components/SponsorCard.svelte';
	import VenueCard from '$lib/components/VenueCard.svelte';
	import { supabase } from '../../supabaseClient';

	let selectedTab: 'venues' | 'sponsors' = 'venues';
	let sponsors = [];
	let venues = [];
	let tournaments = [];
	let isLoading = true;
	let error: string | null = null;

	async function fetchData() {
		try {
			const { data: tournamentsData, error: tournamentsError } = await supabase
				.from('tournaments')
				.select('*');
			const { data: venuesData, error: venuesError } = await supabase.from('venues').select('*');
			const { data: sponsorsData, error: sponsorsError } = await supabase
				.from('sponsors')
				.select('*');

			if (tournamentsError || venuesError || sponsorsError) {
				throw new Error(
					tournamentsError?.message || venuesError?.message || sponsorsError?.message
				);
			}

			tournaments = tournamentsData;
			venues = venuesData;
			sponsors = sponsorsData.map((sponsor) => {
				const associatedTournament = tournaments.find(
					(tournament) => tournament.sponsor_id === sponsor.sponsor_id
				);
				return { ...sponsor };
			});
		} catch (err) {
			error = err.message;
		} finally {
			isLoading = false;
		}
	}

	onMount(fetchData);
</script>

<div class="p-6">
	<h1 class="text-5xl sm:text-7xl md:text-9xl font-bold mb-4 uppercase">Partners</h1>

	<div class="flex flex-wrap space-x-4 mb-4">
		<button
			class={`flex-1 px-2 py-1 sm:px-4 sm:py-2 transition duration-300 ease-in-out hover:bg-blue-700 font-bold ${
				selectedTab === 'venues' ? 'bg-blue-500 text-white' : 'bg-gray-800'
			}`}
			on:click={() => (selectedTab = 'venues')}
		>
			Venues
		</button>
		<button
			class={`flex-1 px-2 py-1 sm:px-4 sm:py-2 transition duration-300 ease-in-out hover:bg-blue-700 font-bold ${
				selectedTab === 'sponsors' ? 'bg-blue-500 text-white' : 'bg-gray-800'
			}`}
			on:click={() => (selectedTab = 'sponsors')}
		>
			Sponsors
		</button>
	</div>

	{#if isLoading}
		<p>Loading...</p>
	{:else if error}
		<p>{error}</p>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
			{#if selectedTab === 'venues'}
				{#each venues as venue}
					<VenueCard
						name={venue.name}
						location={venue.location}
						venueImageUrl={venue.venue_image_url}
					/>
				{/each}
			{:else}
				{#each sponsors as sponsor}
					<SponsorCard name={sponsor.name} sponsorImageUrl={sponsor.sponsor_image_url} />
				{/each}
			{/if}
		</div>
	{/if}
</div>

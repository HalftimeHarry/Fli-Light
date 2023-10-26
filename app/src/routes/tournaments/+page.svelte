<script lang="ts">
	import { onMount } from 'svelte';
	import TournamentCard from '$lib/components/TournamentCard.svelte';
	import { supabase } from '../../supabaseClient';

	let selectedTab: 'upcoming' | 'completed' = 'upcoming';
	let tournaments = [];
	let isLoading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			const { data: tournamentData, error } = await supabase.from('tournaments').select(`
				tournament_id,
				name,
				start_date,
				tournament_image_url,
				upcoming,
				venue_id,
				tournament_sponsors:sponsors(name)
			`);

			if (error) throw error;

			// Fetch all venues for the tournaments in parallel
			const venuePromises = tournamentData.map(async (tournament) => {
				if (tournament.venue_id) {
					const { data: venueData } = await supabase
						.from('venues')
						.select('name')
						.eq('venue_id', tournament.venue_id);
					return venueData ? venueData[0] : null;
				}
				return null;
			});

			const venues = await Promise.all(venuePromises);

			// Merge the venue data into the tournament data
			tournaments = tournamentData.map((tournament, index) => {
				return {
					...tournament,
					venue: venues[index],
					sponsors: tournament.tournament_sponsors.map((s) => s.name)
				};
			});

			isLoading = false;
		} catch (err) {
			error = err.message;
			isLoading = false;
		}
	});
</script>

<div class="p-6">
	<h1 class="text-5xl sm:text-7xl md:text-9xl font-bold mb-4 uppercase">Tournaments</h1>

	<div class="flex flex-wrap space-x-4 mb-4">
		<!-- Upcoming button -->
		<button
			class="flex-1 px-2 py-1 sm:px-4 sm:py-2 transition duration-300 ease-in-out hover:bg-green-700 font-extrabold"
			class:bg-green-500={selectedTab === 'upcoming'}
			class:text-black={selectedTab === 'upcoming'}
			class:bg-gray-800={selectedTab !== 'upcoming'}
			on:click={() => (selectedTab = 'upcoming')}
		>
			Upcoming
		</button>
		<!-- Completed button -->
		<button
			class="flex-1 px-2 py-1 sm:px-4 sm:py-2 transition duration-300 ease-in-out hover:bg-green-700 font-extrabold"
			class:bg-green-500={selectedTab === 'completed'}
			class:text-black={selectedTab === 'completed'}
			class:bg-gray-800={selectedTab !== 'completed'}
			on:click={() => (selectedTab = 'completed')}
		>
			Completed
		</button>
	</div>

	{#if isLoading}
		<p>Loading...</p>
	{:else if error}
		<p>{error}</p>
	{:else if selectedTab === 'upcoming'}
		<div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
			{#each tournaments.filter((t) => t.upcoming) as tournament}
				<TournamentCard
					tournamentId={tournament.tournament_id}
					name={tournament.name}
					date={tournament.start_date}
					tournamentImageUrl={tournament.tournament_image_url}
					venue={tournament.venue ? tournament.venue.name : 'No Venue'}
					sponsor={tournament.sponsors.length ? tournament.sponsors.join(', ') : 'No Sponsor'}
					venueId={tournament.venue_id}
					isUpcoming={tournament.upcoming}
				/>
			{/each}
		</div>
	{:else}
		<div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
			{#each tournaments.filter((t) => !t.upcoming) as tournament}
				<!-- Note the change here -->
				<TournamentCard
					tournamentId={tournament.tournament_id}
					name={tournament.name}
					date={tournament.start_date}
					tournamentImageUrl={tournament.tournament_image_url}
					venue={tournament.venue ? tournament.venue.name : 'No Venue'}
					sponsor={tournament.sponsors.length ? tournament.sponsors.join(', ') : 'No Sponsor'}
					venueId={tournament.venue_id}
					isUpcoming={tournament.upcoming}
				/>
			{/each}
		</div>
	{/if}
</div>

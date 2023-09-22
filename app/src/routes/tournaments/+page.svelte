<script lang="ts">
	import { onMount } from 'svelte';
	import TournamentCard from '$lib/components/TournamentCard.svelte';
	import { supabase } from '../../supabaseClient';

	let selectedTab: 'upcoming' | 'completed' = 'upcoming'; // Default to upcoming
	let tournaments = [];
	let isLoading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			const tournamentsResponse = await supabase.from('tournaments').select('*');

			if (tournamentsResponse.error) throw tournamentsResponse.error;

			tournaments = tournamentsResponse.data;
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
			class="flex-1 px-2 py-1 sm:px-4 sm:py-2 transition duration-300 ease-in-out hover:bg-blue-700"
			class:bg-blue-500={selectedTab === 'upcoming'}
			class:text-white={selectedTab === 'upcoming'}
			class:bg-gray-800={selectedTab !== 'upcoming'}
			on:click={() => (selectedTab = 'upcoming')}
		>
			Upcoming
		</button>
		<!-- Completed button -->
		<button
			class="flex-1 px-2 py-1 sm:px-4 sm:py-2 transition duration-300 ease-in-out hover:bg-blue-700"
			class:bg-blue-500={selectedTab === 'completed'}
			class:text-white={selectedTab === 'completed'}
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
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each tournaments.filter((t) => t.upcoming) as tournament}
				<TournamentCard
					name={tournament.name}
					date={tournament.date}
					tournamentImageUrl={tournament.tournament_image_url}
					venue={tournament.venue}
					sponsor={tournament.sponsor}
				/>
			{/each}
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each tournaments.filter((t) => !t.upcoming) as tournament}
				<TournamentCard
					name={tournament.name}
					date={tournament.date}
					tournamentImageUrl={tournament.tournament_image_url}
					venue={tournament.venue}
					sponsor={tournament.sponsor}
				/>
			{/each}
		</div>
	{/if}
</div>

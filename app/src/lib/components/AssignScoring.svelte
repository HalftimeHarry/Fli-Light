<!-- AssignScoring.svelte -->

<script lang="ts">
	import { supabase } from '../../supabaseClient';

	let selectedTournamentId = null;
	let tournaments = [];
	let venuesReferencedByTournament = [];
	let holeCount = null;
	let error = null;

	async function getTournaments() {
		try {
			const { data, error } = await supabase
				.from('tournaments')
				.select('tournament_id, name, upcoming')
				.eq('upcoming', true);

			if (error) {
				console.error(error);
			} else {
				tournaments = data;
			}
		} catch (error) {
			console.error(error);
		}
	}

	// Function to get venues referenced by the selected tournament
	async function getReferencedVenueFromTournament(tournamentId) {
		try {
			// Query venues where tournament_id matches the selected tournament's ID
			const { data, error } = await supabase
				.from('venues')
				.select('venue_id, name')
				.eq('tournament_id', tournamentId);

			if (error) {
				console.error(error);
			} else {
				venuesReferencedByTournament = data;
			}
		} catch (error) {
			console.error(error);
		}
	}

	async function getHoleCountWithRPC() {
		try {
			console.log(selectedTournamentId);
			await getReferencedVenueFromTournament(selectedTournamentId); // Call the function to get venues
			const venue = venuesReferencedByTournament[0]; // Assuming there's only one venue
			if (!venue) {
				console.error('No venue found for the selected tournament.');
				return;
			}
			const { data, error } = await supabase.rpc('get_holes_by_venue_id', {
				venue_id_arg: venue.venue_id // Use venue_id as the argument
			});

			if (error) {
				console.error(error);
			} else {
				holeCount = data.length; // Assuming `data` is an array of holes
			}
		} catch (error) {
			console.error(error);
		}
	}

	// Fetch tournaments on component load
	getTournaments();
</script>

<main>
	<h1>Assign Scoring</h1>
	<form on:submit|preventDefault={getHoleCountWithRPC}>
		<label for="tournament">Select a Tournament:</label>
		<select id="tournament" class="text-black" bind:value={selectedTournamentId}>
			{#each tournaments as tournament}
				<option value={tournament.tournament_id}>{tournament.name}</option>
			{/each}
		</select>

		<button type="submit" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
			Find Referenced Venues
		</button>
	</form>

	{#if venuesReferencedByTournament.length > 0}
		<p>Venue Name:</p>
		<ul>
			{#each venuesReferencedByTournament as venue}
				<li>{venue.name}</li>
			{/each}
		</ul>
	{/if}

	{#if holeCount !== null}
		<p>This venue has: {holeCount} holes</p>
	{/if}
</main>

<style>
	/* Add your CSS styles here if needed */
</style>

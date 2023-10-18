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

// Inside the getHoleCountWithRPC function
	async function getHoleCountWithRPC() {
	try {
		console.log(selectedTournamentId);
		await getReferencedVenueFromTournament(selectedTournamentId); // Call the function to get venues
		const venue = venuesReferencedByTournament[0]; // Assuming there's only one venue
		if (!venue) {
		console.error('No venue found for the selected tournament.');
		return;
		}
		const { data: holes, error } = await supabase.rpc('get_holes_by_venue_id', {
		venue_id_arg: venue.venue_id // Use venue_id as the argument
		});

		if (error) {
		console.error(error);
		} else {
		holeCount = holes.length; // Assuming `data` is an array of holes

		// Check if you have enough holes (e.g., at least 18 for a typical golf course)
		const enoughHoles = holeCount >= 18; // Adjust the number as needed

		if (enoughHoles) {
			console.log('You have enough holes.');
			assignHolesToGroups(holes); // Call the function to assign holes to groups
		} else {
			console.log('You need more holes to create a complete golf course.');
		}
		}
	} catch (error) {
		console.error(error);
	}
	}

	// Function to assign holes to groups
	async function assignHolesToGroups(holes) {
	try {
		if (!selectedTournamentId) {
		console.error('Please select a tournament.');
		return;
		}

		// Iterate through the holes and assign them to groups
		for (let i = 0; i < holes.length; i++) {
		const hole = holes[i];
		const groupId = i + 1; // Assuming group IDs start from 1

		// Insert the hole assignment into the 'group_hole_assignment' table
		await supabase
			.from('group_hole_assignment')
			.insert([
			{ group_id: groupId, hole_number: hole.hole_number }
			]);
		
		console.log(`Hole ${hole.hole_number} assigned to Group ${groupId}`);
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
		<button on:click={assignHolesToGroups} class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
			Assign Holes to Groups
		</button>
	{/if}
</main>

<style>
	/* Add your CSS styles here if needed */
</style>
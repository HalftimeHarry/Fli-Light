<!-- src/routes/fantasy/FantasyEntryForm.svelte -->
<script lang="ts">
	import type { League } from '$lib/types/League';
	import type { FantasyTournament } from '$lib/types/FantasyTournament';
	import { supabase } from '../../supabaseClient';

	let league: League = {
		league_name: '',
		created_by: null // Assign the user's UUID here
		// Other fields will use default values set in the database
	};
	let leagueName = '';

	// Example initialization within your Svelte component script
	let fantasyTournament: FantasyTournament = {
		fantasy_tournament_id: 0, // Assuming '0' as a placeholder value
		league_id: null, // This will be set when associated with a league
		fantasy_tournament_name: '', // Default empty string, to be updated by user input or API response
		start_date: null, // No default date, to be set later
		end_date: null, // No default date, to be set later
		fantasy_status: null, // Status to be set based on the tournament state
		fantasy_tournament_details_json: null, // Placeholder for detailed JSON data
		created_at: null, // Timestamps typically set by the backend
		updated_at: null // Timestamps typically set by the backend
	};

	const handleSubmit = async () => {
		// Retrieve the logged-in user's details
		const { data: userData } = await supabase.auth.getUser();
		const user = userData.user;
		if (!user) {
			console.error('User not logged in');
			return;
		}

		// Use the user's UUID
		const userUUID = user.id;

		// Create league and retrieve the generated ID
		const { data: leagueData, error: leagueError } = await supabase
			.from('league')
			.insert([{ league_name: leagueName, created_by: userUUID }])
			.single();

		if (leagueError) {
			console.error('Error creating league:', leagueError);
			return;
		}

		// After the league is created, query to get its ID
		const { data: createdLeague, error: fetchError } = await supabase
			.from('league')
			.select('league_id')
			.eq('created_by', userUUID)
			.order('created_at', { ascending: false })
			.limit(1)
			.single();

		if (fetchError) {
			console.error('Error fetching created league:', fetchError);
		} else if (createdLeague) {
			await createFantasyTournaments(createdLeague.league_id, leagueName);
		}
	};

	async function createFantasyTournaments(leagueId, leagueName) {
		for (let i = 1; i <= 12; i++) {
			const tournamentName = `${leagueName} Tournament ${i}`;
			const { error } = await supabase.from('fantasy_tournaments').insert([
				{
					league_id: leagueId,
					fantasy_tournament_name: tournamentName
					// Add other fields like start_date, end_date, etc., as necessary
				}
			]);

			if (error) {
				console.error(`Error creating ${tournamentName}:`, error);
			} else {
				console.log(`${tournamentName} created successfully`);
			}
		}
	}
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
	<div>
		<label for="leagueName" class="block text-sm font-medium text-white">League Name:</label>
		<input
			type="text"
			id="leagueName"
			bind:value={leagueName}
			placeholder="Example Name"
			class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
		/>
	</div>

	<button
		type="submit"
		class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
	>
		Create League
	</button>
</form>

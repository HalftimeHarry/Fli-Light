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
		// Example: use league.league_name in your API call or logic
    	console.log('League name:', league.league_name);
		// Retrieve the logged-in user's details
		const { data: userData } = await supabase.auth.getUser();
		const user = userData.user;
		if (!user) {
			console.error('User not logged in');
			return;
		}

		// Use the user's UUID
		const userUUID = user.id;
		console.log(userUUID);

		const { data, error } = await supabase
			.from('league')
			.insert([{ league_name: 'league.league_name', created_by: userUUID }])
			.select();

		if (error) {
			console.error('Error creating league:', error);
			return;
		}

		// Now call create_fantasy_tournaments function with the necessary arguments
		if (data) {
			let { error: tournamentError } = await supabase.rpc('create_fantasy_tournaments', {
				league_id_arg: data, // Assuming leagueResult is the new league ID
				league_name_arg: league.league_name,
				tournaments_count: 12 // Or however many tournaments you want to create
			});

			if (tournamentError) {
				console.error('Error creating fantasy tournaments:', tournamentError);
			} else {
				console.log('Fantasy tournaments created for league:', leagueResult);
			}
		}
	};
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
	<div>
		<label for="leagueName" class="block text-sm font-medium text-white">League Name:</label>
		<input
    type="text"
    id="leagueName"
    bind:value={league.league_name}
    placeholder="Example Name"
    class="..."
/>
	</div>

	<button
		type="submit"
		class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
	>
		Create League
	</button>
</form>

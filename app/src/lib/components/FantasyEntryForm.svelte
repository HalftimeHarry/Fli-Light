<!-- src/routes/fantasy/FantasyEntryForm.svelte -->
<script lang="ts">
	import type { League } from '$lib/types/League';
	import type { FantasyTournament } from '$lib/types/FantasyTournament';
	import { supabase } from '../../supabaseClient';

	let league: League = {
		league_id: 0,
		league_name: '',
		created_by: null, // You'll need to assign the user's UUID here
		status: null,
		entry_fee: 300,
		draft_status: null,
		fantasy_teams_json: null,
		current_round: 1,
		total_rounds: 12,
		fantasy_scores_json: null,
		results_json: null,
		prizes_json: null,
		created_at: null,
		updated_at: null,
		rules_json: null
	};

	// Example initialization within your Svelte component script
	let fantasyTournament: FantasyTournament = {
		fantasy_tournament_id: 0, // Assuming '0' as a placeholder value
		league_id: null, // This will be set when associated with a league
		fantasy_tournament_name: '', // Default empty string, to be updated by user input or API response
		start_date: null, // No default date, to be set later
		end_date: null, // No default date, to be set later
		status: null, // Status to be set based on the tournament state
		fantasy_tournament_details_json: null, // Placeholder for detailed JSON data
		created_at: null, // Timestamps typically set by the backend
		updated_at: null // Timestamps typically set by the backend
	};

	const handleSubmit = async () => {
		let { data: leagueResult, error } = await supabase.rpc('create_and_seed_league', {
			created_by_arg: league.created_by,
			default_fantasy_teams_json: league.fantasy_teams_json,
			entry_fee_arg: league.entry_fee,
			league_name_arg: league.league_name,
			status_arg: league.status,
			total_rounds_arg: league.total_rounds
		});

		if (error) {
			console.error('Error creating league:', error);
			return;
		}

		console.log('League created:', leagueResult);

		// Additional logic for creating fantasy tournaments
		// ...
		// Assuming you have a function to fetch or initialize data
		async function initFantasyTournament() {
			let { data, error } = await supabase.rpc('create_fantasy_tournaments', {
				league_id_arg,
				league_name_arg,
				tournaments_count
			});
			if (error) console.error(error);
			else console.log(data);
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
			class="mt-1 block w-full px-3 py-2 bg-white border text-black border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
		/>
	</div>

	<button
		type="submit"
		class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
	>
		Create League
	</button>
</form>

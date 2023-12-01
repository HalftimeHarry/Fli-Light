<!-- src/routes/fantasy/FantasyEntryForm.svelte -->
<script lang="ts">
	import type { League } from '$lib/types/League';
	import type { FantasyTournament } from '$lib/types/FantasyTournament';
	import { supabase } from '../../supabaseClient';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let league: League = {
		league_name: '',
		created_by: null // Assign the user's UUID here
	}; // Other fields will use default values set in the database
	let leagues = []; // Initialize leagues as an empty array
	let leagueName = '';
	let numTournaments = '6'; // Default to 1 tournament
	let paymentModel = 'full-all-6'; // Default to 'full', other option could be 'pay-per-tournament'
	// Reactive variables for status and loading
	let statusMessage = '';
	let isLoading = false;
	let leagueId;
	$: leagueId = $page.params.league_id;

	if (!leagueId) {
		console.error('League ID is not available.');
		// Optional: Redirect to another page or show an error message
	} else {
		// Continue with your logic when leagueId is available
	}

	$: entryFee = parseInt(numTournaments) * 50; // Replace 50 with your per-tournament fee

	$: crowdfunding = paymentModel !== 'full-all-6';

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
		isLoading = true;
		statusMessage = 'Creating League...';
		// Example calculation for entry_fee
		let calculatedEntryFee;
		switch (paymentModel) {
			case 'pay-1-of-6':
				calculatedEntryFee = 50; // Assuming each entry costs $50
				break;
			// ... other cases ...
			default:
				calculatedEntryFee = 300; // Full payment for all 6 entries
		}
		// Retrieve the logged-in user's details
		const { data: userData } = await supabase.auth.getUser();
		const user = userData.user;
		if (!user) {
			console.error('User not logged in');
			isLoading = false;
			statusMessage = 'Error: User not logged in.';
			return;
		}

		const userUUID = user.id;

		// Prepare league data for insertion
		const leagueDataToInsert = {
			league_name: leagueName,
			created_by: userUUID,
			entry_fee: entryFee,
			payment_model: paymentModel,
			is_crowdfunded: crowdfunding
		};

		console.log('Inserting league data:', leagueDataToInsert);

		// Insert league data
		const { data: leagueData, error: leagueError } = await supabase
			.from('league')
			.insert([leagueDataToInsert])
			.single();

		if (leagueError) {
			console.error('Error creating league:', leagueError);
			isLoading = false;
			statusMessage = `Error creating league: ${leagueError.message}`;
			return;
		}

		console.log('League created:', leagueData);

		// After the league is created, query to get its ID
		const { data: createdLeague, error: fetchError } = await supabase
			.from('league')
			.select('league_id')
			.eq('created_by', userUUID)
			.order('created_at', { ascending: false })
			.limit(1)
			.single();

		console.log('League Data:', leagueData);
		console.error('League Error:', leagueError);

		if (fetchError) {
			console.error('Error fetching created league:', fetchError);
		} else if (createdLeague) {
			await createFantasyTournaments(createdLeague.league_id, leagueName, numTournaments);
		}
		isLoading = false;
		statusMessage = 'League created successfully!';
	};

	async function createFantasyTournaments(leagueId, leagueName, numTournaments) {
		for (let i = 1; i <= numTournaments; i++) {
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

	onMount(async () => {
		const { data, error } = await supabase.from('league').select('*').single(); // Assuming you're fetching a single record

		if (error) {
			console.error('Error fetching league:', error);
		} else {
			league = data;
			console.log(league);
		}
	});
</script>

<h1>League ID: {league.league_id}</h1>
<form on:submit|preventDefault={handleSubmit} class="space-y-4">
	<!-- Entry Fee Input -->
	<!-- Display Calculated Entry Fee -->
	<div>
		<label for="calculatedEntryFee" class="block text-sm font-medium text-white"
			>Calculated Entry Fee:</label
		>
		<div
			id="calculatedEntryFee"
			class="mt-1 block w-full px-3 py-2 text-black bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm"
		>
			${entryFee}
		</div>
	</div>

	<!-- Payment Model Selection -->
	<div>
		<label for="paymentModel" class="block text-sm font-medium text-white">Payment Model:</label>
		<select
			id="paymentModel"
			bind:value={paymentModel}
			class="mt-1 block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
		>
			<option value="full-all-6">Full Payment for all 6 entries</option>
			<option value="pay-1-of-6">Pay for 1 entry of 6</option>
			<option value="pay-2-of-6">Pay for 2 entry of 6</option>
			<option value="pay-3-of-6">Pay for 3 entry of 6</option>
			<option value="pay-4-of-6">Pay for 4 entry of 6</option>
			<option value="pay-5-of-6">Pay for 5 entry of 6</option>
		</select>
	</div>

	<!-- Crowdfunding Toggle 
	<div>
		<label for="crowdfunding" class="block text-sm font-medium text-white">Crowdfunding:</label>
		<input type="checkbox" id="crowdfunding" bind:checked={crowdfunding} class="mt-1" />
	</div>
	-->

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

	<div>
		<label for="numTournaments" class="block text-sm font-medium text-white"
			>Number of Tournaments:</label
		>
		<select
			id="numTournaments"
			bind:value={numTournaments}
			class="mt-1 block w-full px-3 py-2 text-black bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
		>
			<option value="1">1 Tournament</option>
			<option value="2">2 Tournaments</option>
			<option value="3">3 Tournaments</option>
			<option value="4">4 Tournaments</option>
			<option value="5">5 Tournaments</option>
			<option value="6">6 Tournaments</option>
		</select>
	</div>

	<button
		type="submit"
		class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
	>
		Create League
	</button>
</form>
<a href={`/league/${league.league_id}`}>View {league.league_id}</a>

<!-- DraftOverlay.svelte -->
<script>
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { supabase } from '../../supabaseClient';
	import { leagueData } from '$lib/utilities/leagueDataForFantasyStore.ts';

	const drawerStore = getDrawerStore();

	let draftOrder = [];
	let currentParticipantIndex = 0;
	let selectedPro = '';
	let selectedProIndex = -1; // Initialize with an index outside the valid range
	let countdownTime = 60;
	let isDrafting = false;

	let pros = [];
	let teams = [];
	let loading = true;
	let loadingTeams = true;
	let error = null;
	let errorTeams = null;
	let leagueId;
	let fantasyTeamKey = ''; // Declare fantasyTeamKey outside the function
	let autoDraftInterval; // Add this variable to store the auto-draft interval
	let currentRound = 1; // Initialize it to 1 or the appropriate starting round
	$: subscribedLeagueData = $leagueData;

	function closeDrawer() {
		drawerStore.close();
	}

	// Function to set the default pro
	function setDefaultPro() {
		if (pros.length > 0) {
			selectedProIndex = 0;
			selectedPro = pros[0].name;
		}
	}

	function shuffle(array) {
		let currentIndex = array.length,
			randomIndex;

		while (currentIndex != 0) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}

		return array;
	}

	async function fetchFantasyTeams() {
		console.log('Fetching fantasy teams...');
		let { data: league, error } = await supabase.from('league').select('fantasy_teams_json');

		if (error) {
			console.error('Error fetching fantasy teams:', error);
			return;
		}

		if (league && league.length > 0) {
			let teamsArray;
			if (Array.isArray(league[0].fantasy_teams_json)) {
				teamsArray = league[0].fantasy_teams_json;
			} else {
				console.log('Transforming fantasy_teams_json into an array');
				teamsArray = transformToArrayOfTeams(league[0].fantasy_teams_json);
			}

			draftOrder = shuffle(teamsArray);
			console.log('Shuffled Fantasy Teams:', draftOrder);

			// Start the drafting process
			startDrafting();
		} else {
			console.error('No league data found or fantasy_teams_json is missing');
		}
	}

	function transformToArrayOfTeams(data) {
		return Object.values(data);
	}

	async function startDrafting() {
		console.log($leagueData.league_id);
		leagueId = $leagueData.league_id;
		if (draftOrder.length > 0) {
			const currentParticipant = draftOrder[currentParticipantIndex];
			console.log('Current Participant:', currentParticipant); // Log current participant
			console.log('Putting', currentParticipant.team_name, 'on the clock');
			console.log('Owner ID', currentParticipant.owner_id, 'match id when drafting');

			// Pass the current participant's owner_id to handleDraftOrder
			handleDraftOrder(currentParticipant.owner_id);

			// Update draft_status to "In Progress"
			const { data, error } = await supabase
				.from('league') // Replace with your table name
				.update({ draft_status: 'In Progress' })
				.eq('league_id', leagueId); // Replace with your league ID

			if (error) {
				console.error('Error updating draft_status:', error);
				return;
			}

			// Start the countdown timer
			countdownTime = 60; // Reset the countdown time
			autoDraftInterval = setInterval(() => {
				countdownTime--;
				if (countdownTime <= 0) {
					clearInterval(autoDraftInterval);
					// Handle timer completion here (e.g., end of draft)
					console.log('Current Round:', currentRound); // Log current round
					draftProWithConditions(currentParticipant, currentRound); // Pass currentParticipant and currentRound as arguments

					// Increment the currentRound
					currentRound++; // Update the round for the next draft
				}
			}, 1000);

			currentParticipantIndex++;
			if (currentParticipantIndex >= draftOrder.length) {
				currentParticipantIndex = 0;
			}
		}
	}

	function autoDraft() {
		// Add your logic to automatically select a pro and call draftProWithConditions
		if (selectedProIndex === -1) {
			// Automatically select a pro, for example, the first available pro
			selectedProIndex = pros.findIndex((p, index) => index !== selectedProIndex);

			if (selectedProIndex !== -1) {
				selectedPro = pros[selectedProIndex].name;
				draftProWithConditions();
			}
		}
	}

	function swapPro(pro) {
		selectedProIndex = pros.findIndex((p) => p.pro_id === pro.pro_id);
		console.log(selectedProIndex);
	}

	// Function to handle draft order
	function handleDraftOrder() {
		const currentTeam = draftOrder[currentParticipantIndex];

		if (currentTeam) {
			// Put the current team on the clock
			console.log('Putting', currentTeam.team_name, 'on the clock');

			// Start the countdown timer
			startCountdownTimer();

			// Move to the next participant
			currentParticipantIndex++;
			if (currentParticipantIndex >= draftOrder.length) {
				currentParticipantIndex = 0; // Reset to the first participant
			}
		} else {
			// All participants have drafted, perform auto-draft
			clearInterval(autoDraftInterval);
			autoDraft();
		}
	}

	// Function to start the countdown timer
	function startCountdownTimer() {
		console.log('Countdown Timer Started'); // Log when the countdown timer starts

		function updateTimer() {
			countdownTime--;
			console.log('Time remaining:', countdownTime);

			if (countdownTime <= 0) {
				// Handle timer completion here (e.g., end of round)
				clearInterval(autoDraftInterval);
				console.log('Countdown Timer Ended'); // Log when the countdown timer ends
				handleDraftOrder();
			} else {
				// Continue the countdown
				autoDraftInterval = setTimeout(updateTimer, 1000);
			}
		}
	}

	async function draftProWithConditions(currentTeam) {
		console.log('Current Team:', currentTeam);
		console.log(currentTeam);

		// Check if currentTeam has associated fantasy team data
		if (currentTeam.fantasy_scores_json) {
			console.error('Current participant has no associated fantasy team');
			return;
		}

		if (selectedProIndex === -1) {
			// No pro is selected, nothing to draft
			return;
		}

		// Get the selected pro's ID
		const selectedPro = pros[selectedProIndex];
		const selectedProId = selectedPro ? selectedPro.pro_id : null;
		console.log('Drafting this pro', selectedProId); // Log when a pro is being drafted

		// Check if selectedPro is defined
		if (!selectedPro || selectedProId === null) {
			console.log('Selected Pro ID:', selectedProId);
			console.error('Selected pro is undefined or has no ID.');
			return;
		}

		// Get the current participant's UUID
		const currentParticipantUUID = draftOrder[currentParticipantIndex].owner_id;

		// Find the fantasy team associated with the current participant
		let currentFantasyTeam = null;
		for (const teamKey in subscribedLeagueData.fantasy_scores_json) {
			const team = subscribedLeagueData.fantasy_scores_json[teamKey];

			console.log('Checking team:', teamKey);
			console.log('Team owner_id:', team.team_info.owner_id);
			console.log('Current participant UUID:', currentParticipantUUID);

			if (team.team_info.owner_id === currentParticipantUUID) {
				currentFantasyTeam = teamKey;
				break;
			}
		}
		console.log('Current Fantasy Team:', currentFantasyTeam); // Log current fantasy team
		console.log('Selected Pro ID:', selectedProId); // Log selected pro ID
		if (currentFantasyTeam) {
			console.error('Current participant has no associated fantasy team'); // Log the error message
			return;
		}

		// Construct proKey based on the selected pro's index
		const proKey = `pro_male_${selectedProIndex + 1}`; // Adjust the index as needed

		// Check if the pro has already been drafted
		if (
			subscribedLeagueData.fantasy_scores_json[currentFantasyTeam] &&
			subscribedLeagueData.fantasy_scores_json[currentFantasyTeam].fantasy_pros &&
			subscribedLeagueData.fantasy_scores_json[currentFantasyTeam].fantasy_pros[proKey] ===
				selectedProId
		) {
			console.log(
				`${pros[selectedProIndex].name} (ID: ${selectedProId}) has already been drafted.`
			);
			return;
		}

		// Update fantasy_scores_json with the drafted pro
		const updatedFantasyTeam = {
			...subscribedLeagueData.fantasy_scores_json[currentFantasyTeam],
			fantasy_pros: {
				...subscribedLeagueData.fantasy_scores_json[currentFantasyTeam].fantasy_pros,
				[proKey]: selectedProId // Use the pro_id as the value
			}
		};

		const updatePayload = {
			fantasy_scores_json: {
				...subscribedLeagueData.fantasy_scores_json,
				[currentFantasyTeam]: updatedFantasyTeam
			}
		};

		try {
			// Update the league data with the new fantasy_scores_json
			const { data: updateData, error: updateError } = await supabase
				.from('league')
				.update(updatePayload)
				.eq('league_id', leagueId);

			if (updateError) {
				console.error('Error updating fantasy_scores_json:', updateError);
				return;
			}

			// Clear the selected pro input field
			selectedProIndex = -1;

			// Move to the next participant
			currentParticipantIndex = (currentParticipantIndex + 1) % draftOrder.length;
			console.log('Current Participant Index:', currentParticipantIndex); // Log current participant index
			console.log('Draft Order:', draftOrder); // Log the draft order array

			if (selectedProIndex !== -1) {
				console.log('Pro drafted:', pros[selectedProIndex].name);
			} else {
				console.log('No pro drafted.');
			}
		} catch (error) {
			console.error('Error:', error);
		}
	}

	onMount(async () => {
		fetchFantasyTeams();
		try {
			// Fetching pros data and ordering by rank
			let { data: prosData, error: prosError } = await supabase
				.from('pros')
				.select('*')
				.order('rank', { ascending: true });

			if (prosError) throw prosError;

			// Fetching teams data
			let { data: teamsData, error: teamsError } = await supabase
				.from('teams')
				.select('team_id, name');

			if (teamsError) throw teamsError;

			// Storing the fetched data in variables
			pros = prosData;
			teams = teamsData;
			// Set the default pro
			setDefaultPro();
		} catch (err) {
			error = err;
		} finally {
			loading = false;
			loadingTeams = false;
		}
	});
</script>

<div
	class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-50"
>
	<!-- Close button -->
	<button
		on:click={closeDrawer}
		class="absolute top-2 right-2 bg-white text-black px-4 py-2 rounded shadow-lg">Close</button
	>

	<div class="flex flex-col items-center justify-center w-full">
		<!-- Participant List -->
		<div class="text-white mt-8">
			<h2 class="text-xl font-semibold mb-2">Draft Order:</h2>
			<div class="flex flex-row flex-wrap">
				{#each draftOrder as participant, index}
					<div class="mx-2">{index + 1}: {participant.team_name}</div>
				{/each}
			</div>
		</div>

		<!-- Form for selecting a pro -->
		<div class="w-full max-w-md p-4 rounded-lg shadow-lg mt-4 flex items-center justify-between">
			<form on:submit={draftProWithConditions} class="flex-grow flex flex-col">
				<div class="mb-4 flex items-center">
					<!-- Display the selected pro from the table as a suggestion -->
					{#if selectedProIndex !== -1}
						<div class="flex items-center ml-2">
							<img
								src={pros[selectedProIndex].pro_image_url}
								alt={pros[selectedProIndex].name}
								class="h-10 w-10 rounded-full mr-2"
							/>
							<span>World Ranking: # {pros[selectedProIndex].rank}</span>
						</div>

						<!-- Inline the "Draft" button and change its color to green -->
						<button
							type="submit"
							class="ml-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:bg-green-600"
							on:click={draftProWithConditions}
						>
							Draft {pros[selectedProIndex].name}
						</button>
					{:else}
						<p class="text-white">No pros available</p>
					{/if}
				</div>

				<!-- Display pro details in a table excluding the selected pro -->
				<div class="overflow-auto max-h-[40vh] w-full bg-white rounded-lg p-2 mt-2">
					{#if loading || loadingTeams}
						<p class="text-black">Loading...</p>
					{:else if error || errorTeams}
						<p class="text-black">Error: {error?.message || errorTeams?.message}</p>
					{:else}
						<table class="min-w-full text-black">
							<thead>
								<tr class="text-left">
									<th>Rank</th>
									<th>Image</th>
									<th>Name</th>
									<th>Team</th>
									<th>Select</th>
									<!-- Add a new column for selecting a pro -->
								</tr>
							</thead>
							<tbody>
								{#each pros as pro, index (pro.pro_id)}
									<!-- Use pro.pro_id as the unique key -->
									{#if index !== selectedProIndex}
										<!-- Exclude the selected pro -->
										<tr>
											<td>{pro.rank}</td>
											<td>
												<img
													src={pro.pro_image_url}
													alt={pro.name}
													class="h-10 w-10 rounded-full"
												/>
											</td>
											<td>{pro.name}</td>
											<td>{pro.team_id}</td>
											<td>
												<button
													type="button"
													class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
													on:click={() => swapPro(pro)}
												>
													Select
												</button>
											</td>
										</tr>
									{/if}
								{/each}
							</tbody>
						</table>
					{/if}
				</div>
			</form>
		</div>

		<p class="mt-2 text-white">Time remaining: {countdownTime} seconds</p>
	</div>
</div>

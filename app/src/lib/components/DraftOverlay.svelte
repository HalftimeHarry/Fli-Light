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
	let countdownTime = 10;
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

	async function initDraft() {
		try {
			// Fetch the shuffled fantasy teams and start the draft
			console.log('Fetching and initializing draft...');
			leagueId = $leagueData.league_id;
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

				// Define the actual primary key column name for your 'league' table
				const primaryKeyColumnName = 'your_primary_key_column_name';

				// Create the draft payload with the desired structure
				const draftPayload = {
					pros: [], // You can populate this array with pros data if needed
					draft_rounds: [],
					fantasy_teams: {}
				};

				// Define draftRound here
				const draftRound = {
					picks: [],
					draft_order: draftOrder.slice(), // Clone the draft order
					round_number: 1 // Set an initial round number
				};

				// Initialize fantasy teams
				league.forEach((row) => {
					const teamKey = row[primaryKeyColumnName];
					console.log(teamKey);

					if (teamKey) {
						// Extract the team number from the teamKey
						const teamNumber = teamKey.split('_').pop();

						// Define the fantasy team key (e.g., 'fantasy_team_1', 'fantasy_team_2', etc.)
						const fantasyTeamKey = 'fantasy_team_' + teamNumber;

						// Initialize the fantasy team
						draftPayload.fantasy_teams[fantasyTeamKey] = {
							score: 0,
							team_info: {
								owner_id: 'uuid_' + teamNumber, // Adjust based on your data
								team_name: 'Sample Name ' + teamNumber // Adjust based on your data
							},
							fantasy_pros: {
								pro_male_1: 0,
								pro_male_2: 0,
								pro_female_1: 0,
								pro_female_2: 0
							},
							reserve_pros: {
								reserve_pro_male: 0,
								reserve_pro_female: 0
							}
						};
					}
				});

				// Push draftRound into draftPayload.draft_rounds
				draftPayload.draft_rounds.push(draftRound);

				// Log the initialized draft payload
				console.log('Initialized Draft Payload:', draftPayload);

				// Update the fantasy_scores_json in the Supabase database with the draftPayload for a specific league_id
				const { error: updateError } = await supabase
					.from('league')
					.update({ fantasy_scores_json: draftPayload })
					.eq('league_id', leagueId);

				if (updateError) {
					console.error('Error updating fantasy_scores_json:', updateError);
					return;
				}

				// Start the drafting process
				startDrafting();
			} else {
				console.error('No league data found or fantasy_teams_json is missing');
			}
		} catch (err) {
			console.error('Error initializing draft:', err);
		}
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

			// Call initDraft to start the drafting process with the shuffled teams
			initDraft();
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
			countdownTime = 10; // Reset the countdown time
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

	// After a successful draft pick
	// Sample code for handling a draft pick
	function handleDraftPick(teamKey, playerKey) {
		// Update the team's pick in the current round
		data.draft_rounds[currentRound - 1].picks.push({
			team: teamKey,
			player: playerKey
		});

		// Update the team's information
		data.fantasy_teams[teamKey].fantasy_pros[playerKey] = 13; // Update as needed

		// Move to the next participant in the draft order
		currentParticipantIndex++;

		if (currentParticipantIndex >= draftOrder.length) {
			// If all participants have drafted in this round, start a new round
			currentRound++;
			currentParticipantIndex = 0;
		}

		// Check if the draft is complete or continue to the next team
		if (currentRound <= totalRounds) {
			// Start the drafting process for the next team
			startDrafting();
		} else {
			// The draft is complete
			console.log('Draft is complete.');
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
		console.log('Current Team:', currentTeam.owner_id);

		if (selectedProIndex === -1) {
			if (pros.length > 0) {
				console.log('Auto-drafting', pros[selectedProIndex].name);
				draftPro(pros[selectedProIndex]);
			} else {
				console.log('No pro selected for auto-draft.');
			}
			return;
		}

		const selectedPro = pros[selectedProIndex];
		const selectedProId = selectedPro ? selectedPro.pro_id : null;

		console.log('Drafting this pro', selectedProId);

		if (!selectedPro || selectedProId === null) {
			console.log('Selected Pro ID:', selectedProId);
			console.error('Selected pro is undefined or has no ID.');
			return;
		}

		const currentParticipantUUID = draftOrder[currentParticipantIndex]?.owner_id;
		const currentParticipantTeamName = draftOrder[currentParticipantIndex]?.team_name;

		if (!currentParticipantUUID) {
			console.error('Current participant has no associated fantasy team');
			return;
		}

		// Ensure that fantasy_pros is initialized for the current team within fantasy_scores_json
		if (!subscribedLeagueData.fantasy_scores_json[currentTeam]) {
			subscribedLeagueData.fantasy_scores_json[currentTeam] = {
				fantasy_pros: {}
			};
		} else if (!subscribedLeagueData.fantasy_scores_json[currentTeam].fantasy_pros) {
			subscribedLeagueData.fantasy_scores_json[currentTeam].fantasy_pros = {};
		}

		if (selectedProIndex < 0 || selectedProIndex >= pros.length) {
			console.error('Invalid selectedProIndex:', selectedProIndex);
			return;
		}

		const proKey = `pro_male_${selectedProIndex + 1}`;

		if (
			subscribedLeagueData.fantasy_scores_json[currentTeam]?.fantasy_pros &&
			subscribedLeagueData.fantasy_scores_json[currentTeam]?.fantasy_pros[proKey] !== undefined
		) {
			console.log(
				`${pros[selectedProIndex].name} (ID: ${selectedProId}) has already been drafted.`
			);
			return;
		}

		// Update fantasy_pros for the current team
		subscribedLeagueData.fantasy_scores_json[currentTeam].fantasy_pros[proKey] = selectedProId;

		const updatePayload = {
			fantasy_scores_json: {
				...subscribedLeagueData.fantasy_scores_json,
				[currentTeam.team_name]: {
					// Access the team name property
					...subscribedLeagueData.fantasy_scores_json[currentTeam.team_name], // Access the team name property
					fantasy_pros: {
						...subscribedLeagueData.fantasy_scores_json[currentTeam.team_name]?.fantasy_pros, // Access the team name property
						[`pro_male_${selectedProIndex + 1}`]: selectedProId
					}
				}
			}
		};

		try {
			// Update the league data with the new fantasy_pros
			const { data: updateData, error: updateError } = await supabase
				.from('league')
				.update(updatePayload)
				.eq('league_id', leagueId);

			if (updateError) {
				console.error('Error updating fantasy_pros:', updateError);
				return;
			}

			selectedProIndex = -1;
			currentParticipantIndex = (currentParticipantIndex + 1) % draftOrder.length;

			console.log('Current Participant Index:', currentParticipantIndex);
			console.log('Draft Order:', draftOrder);

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

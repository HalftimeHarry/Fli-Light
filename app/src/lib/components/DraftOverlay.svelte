<!-- DraftOverlay.svelte -->
<script>
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { supabase } from '../../supabaseClient';
	import { leagueData } from '$lib/utilities/leagueDataForFantasyStore.ts';
	import { writable } from 'svelte/store';

	const drawerStore = getDrawerStore();

	let draftOrder = [];
	let currentParticipantIndex = 0;
	let selectedPro = '';
	let selectedProIndex = -1; // Initialize with an index outside the valid range
	let isDrafting = false;
	// Update the draftPayload to include round information and snake direction
	let draftPayload = {
		pros: [],
		draft_rounds: [
			{
				picks: [],
				draft_order: [
					// ... Draft order data ...
				],
				round_number: 1
			}
		],
		fantasy_teams: {},
		metadata: {
			draft_format: 'snake', // or "linear" if applicable
			total_rounds: 6, // Total number of draft rounds
			timer_duration: 60, // Timer duration in seconds for each pick
			male_pro: true, // Set to true if male pros are available
			female_pro: true, // Set to true if female pros are available
			reserve_pro_male: true, // Set to true if reserve male pros are available
			reserve_pro_female: true // Set to true if reserve female pros are available
		}
	};

	let fantasy_scores_json = {}; // Define fantasy_scores_json as an empty object
	let countdownTime = writable(draftPayload.metadata.timer_duration);
	let pros = [];
	let teams = [];
	let loading = true;
	let loadingTeams = true;
	let error = null;
	let errorTeams = null;
	let leagueId;
	let draftRound;
	let fantasyTeamKey = ''; // Declare fantasyTeamKey outside the function
	let autoDraftInterval; // Add this variable to store the auto-draft interval
	let currentRound = 1; // Initialize it to 1 or the appropriate starting round
	let isSnakeDirectionUp = false; // Initialize isSnakeDirectionUp
	let countdownInterval;
	let currentTeam = null; // Initialize it as null
	let currentRoundIndex = 0; // Initialize it to 0 or the appropriate starting value
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
			let { data: league, error } = await supabase.from('league').select('fantasy_teams_json');

			if (error) {
				console.error('Error fetching fantasy teams:', error);
				return;
			}

			if (league && league.length > 0) {
				leagueId = $leagueData.league_id;

				let teamsArray;
				if (Array.isArray(league[0].fantasy_teams_json)) {
					teamsArray = league[0].fantasy_teams_json;
				} else {
					console.log('Transforming fantasy_teams_json into an array');
					teamsArray = transformToArrayOfTeams(league[0].fantasy_teams_json);
				}

				draftOrder = shuffle(teamsArray);
				console.log('Shuffled Fantasy Teams:', draftOrder);
				// Initialize fantasy_teams and draftPayload with the provided draft structure
				draftPayload = {
					pros: [],
					metadata: {
						male_pro: true,
						female_pro: true,
						draft_format: 'snake',
						total_rounds: 6,
						timer_duration: 11,
						reserve_pro_male: true,
						reserve_pro_female: true
					},
					draft_rounds: [], // Initialize draft_rounds as an empty array
					fantasy_teams: {}
				};
				// Define draftRound here
				const draftRound = {
					picks: [],
					draft_order: draftOrder.slice(), // Clone the draft order
					round_number: 1 // Set an initial round number
				};

				// Push draftRound into draftPayload.draft_rounds
				draftPayload.draft_rounds.push(draftRound);

				// Log the initialized draft payload
				console.log('Initialized Draft Payload:', draftPayload);

				// Update the draft_order_json in the Supabase database with the draftPayload for a specific league_id
				const { error: updateError } = await supabase
					.from('league')
					.update({ draft_order_json: draftPayload })
					.eq('league_id', leagueId);

				if (updateError) {
					console.error('Error updating draft_order_json:', updateError);
					return;
				}

				countdownTime = writable(draftPayload.metadata.timer_duration);

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

	// Define the updateDraftedProInFantasyTeam function with a proType parameter
	function updateDraftedProInFantasyTeam(currentParticipant, draftedPro, proType) {
		// Your logic to update the drafted pro's ID in the respective team's section within fantasy_teams
		// Example:
		const currentTeamKey = 'fantasy_team_' + currentParticipant.team_number; // Adjust based on your data
		const fantasyTeam = draftPayload.fantasy_teams[currentTeamKey];

		if (proType === 'pro_male_1') {
			fantasyTeam.fantasy_pros.pro_male_1 = draftedPro.pro_id;
		} else if (proType === 'pro_male_2') {
			fantasyTeam.fantasy_pros.pro_male_2 = draftedPro.pro_id;
		} else if (proType === 'pro_female_1') {
			fantasyTeam.fantasy_pros.pro_female_1 = draftedPro.pro_id;
		} else if (proType === 'pro_female_2') {
			fantasyTeam.fantasy_pros.pro_female_2 = draftedPro.pro_id;
		} else if (proType === 'reserve_male') {
			fantasyTeam.fantasy_pros.reserve_male = draftedPro.pro_id;
		} else if (proType === 'reserve_female') {
			fantasyTeam.fantasy_pros.reserve_female = draftedPro.pro_id;
		}
	}

	function draftProBasedOnCategory(currentParticipantTeamName, selectedProId) {
		console.log('Get pro here then do some checks');

		let proType = '';

		if (currentRound <= 2) {
			proType = 'pro_male';
		} else if (currentRound <= 4) {
			proType = 'pro_female';
		} else if (currentRound === 5) {
			proType = 'reserve_female';
		} else if (currentRound === 6) {
			proType = 'reserve_male';
		}

		// Simulate selecting a pro based on the selectedProId
		const selectedPro = {
			pro_id: selectedProId,
			name: 'Sample Pro',
			type: proType
			// Add other pro properties as needed
		};

		// Log the selectedPro object
		console.log('Selected Pro:', selectedPro);

		// Create an object to represent the drafted pro for the current participant
		const draftedPro = {
			pro_id: selectedPro.pro_id,
			name: selectedPro.name,
			type: selectedPro.type
			// Add other pro properties as needed
		};

		// Here, you can add the draftedPro to the relevant data structure
		// For example, if you want to add it to fantasy_scores_json, you can do something like this:
		fantasy_scores_json[currentParticipantTeamName] = draftedPro;

		// Return the drafted pro
		return draftedPro;
	}

	// Function to handle the end of the countdown timer
	function handleCountdownEnd(currentParticipant) {
		clearInterval(countdownInterval); // Stop the countdown
		console.log('Time is up for', currentParticipant.team_name);

		// Call the autoDraft function when the countdown expires
		autoDraft();
	}

	// Function to start the countdown timer for a participant
	function startParticipantCountdown(currentParticipant) {
		countdownTime.set(draftPayload.metadata.timer_duration); // Reset countdownTime
		clearInterval(countdownInterval);

		// Find the current team based on currentParticipant
		const currentTeam = findTeamByOwnerId(currentParticipant.owner_id);

		countdownInterval = setInterval(() => {
			countdownTime.update((time) => {
				return time - 1;
			});

			if ($countdownTime <= 0) {
				clearInterval(countdownInterval);
				console.log('We reached the end of the countdown');
				handleCountdownEnd(currentParticipant);

				// Pass the current team to draftProWithConditions
				draftProWithConditions(currentTeam);
			}
		}, 1000);
	}

	// Function to find a team by owner_id
	function findTeamByOwnerId(ownerId) {
		return draftPayload.draft_rounds[currentRoundIndex]?.draft_order.find(
			(team) => team.owner_id === ownerId
		);
	}

	async function startDrafting() {
		const currentRoundIndex = draftPayload.draft_rounds.length - 1;
		const currentRound = draftPayload.draft_rounds[currentRoundIndex];
		const totalRounds = draftPayload.metadata.total_rounds;

		if (currentRoundIndex < totalRounds) {
			const currentParticipant = currentRound.draft_order[currentParticipantIndex];
			console.log('Current Participant:', currentParticipant.team_name);

			// Start the countdown timer for the current participant
			startParticipantCountdown(currentParticipant);

			// Rest of your code for drafting process
		} else {
			// All rounds are complete, and the draft is finished
			console.log('Draft is complete.');
		}
	}

	function autoDraft() {
		console.log('Attempt autoDraft call 1st');
		if (selectedProIndex === -1) {
			// Automatically select a pro, for example, the first available pro
			selectedProIndex = pros.findIndex((p, index) => index !== selectedProIndex);

			if (selectedProIndex !== -1) {
				selectedPro = pros[selectedProIndex].name;
				console.log('Auto-drafting:', selectedPro);

				// Attempt auto-draft
				console.log('Attempt autoDraft call 2nd');

				// You should call the function to draft the selected pro here
				draftProWithConditions(); // Make sure this function is correctly called
			} else {
				console.log('No available pros to auto-draft.');
			}
		}
	}

	function swapPro(pro) {
		selectedProIndex = pros.findIndex((p) => p.pro_id === pro.pro_id);
		console.log(selectedProIndex);
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

	// Updated handleDraftOrder function
	function handleDraftOrder() {
		const currentRound = draftPayload.draft_rounds[currentRoundIndex];

		if (currentRound) {
			const currentOrder = currentRound.draft_order;
			const currentTeam = currentOrder[currentParticipantIndex];

			if (currentTeam) {
				// Put the current team on the clock
				console.log('Putting', currentTeam.team_name, 'on the clock');

				// Start the countdown timer
				startCountdownTimer(currentRound.metadata.timer_duration);

				// Move to the next participant
				currentParticipantIndex++;
				if (currentParticipantIndex >= currentOrder.length) {
					currentParticipantIndex = 0; // Reset to the first participant
					currentRoundIndex++; // Move to the next round
				}

				// Access the selected pro based on selectedProIndex
				const selectedPro = pros[selectedProIndex];

				if (!selectedPro) {
					console.error('Selected pro is undefined.');
					return;
				}

				// Log the selected pro for debugging purposes
				console.log('Selected Pro:', selectedPro);

				// Continue with drafting logic using the selected pro
				const proKey = `${selectedPro.type}_${selectedProIndex + 1}`;
				const selectedProId = selectedPro.pro_id;

				if (
					subscribedLeagueData.draft_order_json[currentParticipantTeamName]?.fantasy_pros &&
					subscribedLeagueData.draft_order_json[currentParticipantTeamName]?.fantasy_pros[
						proKey
					] !== undefined
				) {
					console.log(`${selectedPro.name} (ID: ${selectedProId}) has already been drafted.`);
					return;
				}

				// Log the drafted pro name
				console.log('Pro drafted:', draftedPro.name);

				if (
					subscribedLeagueData.draft_order_json[currentParticipantTeamName].fantasy_pros &&
					subscribedLeagueData.draft_order_json[currentParticipantTeamName].fantasy_pros[proKey] !==
						undefined
				) {
					console.log(`${selectedPro.name} (ID: ${selectedProId}) has already been drafted.`);
					return;
				}

				subscribedLeagueData.draft_order_json[currentParticipantTeamName].fantasy_pros[proKey] =
					selectedProId;

				// ... (rest of the code)

				// Log the drafted pro name
				console.log('Pro drafted:', selectedPro.name);
			} else {
				console.warn('currentTeam is undefined or null. Handling gracefully.');
			}
		} else {
			// All participants have drafted, perform auto-draft or end the draft
			clearInterval(autoDraftInterval);
			autoDraft(); // Implement auto-draft logic here if needed
		}
	}

	// Updated startCountdownTimer function
	function startCountdownTimer(duration) {
		countdownTime = duration; // Set the initial countdown time
		clearInterval(countdownInterval); // Clear any previous interval

		countdownInterval = setInterval(() => {
			countdownTime--;

			if (countdownTime <= 0) {
				clearInterval(countdownInterval); // Stop the countdown when it reaches 0
				// Handle the end of the countdown here
				console.log('Countdown Timer Ended');
				// You can call the function to handle the end of the timer here
				// For example: handleDraftOrder();
			}
		}, 1000);
	}

	async function draftProWithConditions() {
		console.log('Drafting pro with conditions.');

		const currentRound = draftPayload.draft_rounds[currentRoundIndex];
		console.log(currentRound);

		if (currentRound) {
			const currentOrder = currentRound.draft_order;

			// Debug statements
			console.log('Current Round:', currentRound);
			console.log('Current Order:', currentOrder);
			console.log('Current Participant Index:', currentParticipantIndex);

			const currentTeam = currentOrder[currentParticipantIndex];

			// Debug statement
			console.log('Current Team:', currentTeam);

			if (currentTeam) {
				// Access the selected pro based on selectedProIndex
				const selectedPro = pros[selectedProIndex];

				if (!selectedPro) {
					console.error('Selected pro is undefined.');
					return;
				}

				// Log the selected pro for debugging purposes
				console.log('Selected Pro:', selectedPro);

				// Continue with drafting logic for selected pro
				const genderType = selectedPro.gender === true ? 'male' : 'female';
				const proKey = `pro_${genderType}_${selectedProIndex + 1}`;
				const selectedProId = selectedPro.pro_id;

				// Check if the pro has already been drafted using payload
				console.log(draftPayload);
				if (
					draftPayload.fantasy_teams &&
					draftPayload.fantasy_teams[currentTeam.team_name] &&
					draftPayload.fantasy_teams[currentTeam.team_name][proKey] !== undefined
				) {
					console.log(`${selectedPro.name} (ID: ${selectedProId}) has already been drafted.`);
					return;
				}

				// Initialize the draft_order_json object if not exists
				if (!draftPayload.draft_order_json) {
					draftPayload.draft_order_json = {};
				}

				// Initialize the current team's draft_order_json if not exists
				if (!draftPayload.draft_order_json[currentTeam.team_name]) {
					draftPayload.draft_order_json[currentTeam.team_name] = {};
				}

				// Initialize fantasy_pros within the current team's draft_order_json if not exists
				if (!draftPayload.draft_order_json[currentTeam.team_name].fantasy_pros) {
					draftPayload.draft_order_json[currentTeam.team_name].fantasy_pros = {};
				}

				// Draft the pro by assigning their ID to the appropriate key in payload
				draftPayload.draft_order_json[currentTeam.team_name].fantasy_pros[proKey] = selectedProId;

				// Log the drafted pro name
				console.log('Pro drafted:', selectedPro.name);

				// After drafting the pro, update the fantasy_scores_json object
				if (!draftPayload.fantasy_scores_json) {
					draftPayload.fantasy_scores_json = {};
				}

				if (!draftPayload.fantasy_scores_json[currentTeam.team_name]) {
					draftPayload.fantasy_scores_json[currentTeam.team_name] = {};
				}

				// Create a drafted pro object with the required properties
				const draftedPro = {
					pro_id: selectedPro.pro_id,
					name: selectedPro.name.trim(), // Remove leading and trailing whitespace
					type: genderType // Set type based on gender
					// Add other pro properties as needed
				};

				// Update the fantasy_scores_json object with the drafted pro
				draftPayload.fantasy_scores_json[currentTeam.team_name][proKey] = draftedPro;

				console.log('Updated fantasy_scores_json in payload:', draftedPro);
				console.log(`Pro drafted: ${draftedPro.name}`);

				console.log('Updated fantasy_scores_json in payload:', draftPayload.fantasy_scores_json);

				// Increment the selectedProIndex for the next pick
				selectedProIndex++;
			} else {
				console.warn('Metadata is missing in the current round.');
			}

			// Move to the next participant
			currentParticipantIndex++;

			if (currentParticipantIndex >= currentOrder.length) {
				currentParticipantIndex = 0; // Reset to the first participant
				currentRoundIndex++; // Move to the next round
			}
		} else {
			// All participants have drafted, perform auto-draft or end the draft
			clearInterval(autoDraftInterval);
			autoDraft(); // Implement auto-draft logic here if needed
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

		<p class="mt-2 text-white">Time remaining: {$countdownTime} seconds</p>
	</div>
</div>

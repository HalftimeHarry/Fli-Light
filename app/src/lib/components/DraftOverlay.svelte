<!-- DraftOverlay.svelte -->
<script>
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { supabase } from '../../supabaseClient';
	import { leagueData } from '$lib/utilities/leagueDataForFantasyStore.ts';
	import { writable, get } from 'svelte/store';
	import { draftPicks } from '$lib/utilities/draftPicks.js'; // Adjust the import path as needed

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
	let fantasyScoresJson = writable({});
	let countdownInterval;
	export const currentDisplayTeam = writable(null);
	let currentRoundIndex = 0; // Initialize it to 0 or the appropriate starting value
	$: subscribedLeagueData = $leagueData;
	// Define a flag to track if autoDraft has been triggered
	let autoDraftTriggered = false;
	// Example draft pick data (replace with your actual data)
	let initialDisplayTriggered = false;
	let filteredPros = [];
	let recommendedPro = null;
	let currentTeamNameForRound3; // Top-level variable declaration

	$: {
		if (currentRoundIndex >= 2) {
			const currentTeam = draftOrder[currentParticipantIndex];
			console.log('Reactive for round 3');
			if (currentTeam) {
				updateProsForRound();
			}
		} else {
			// For rounds 1 and 2, show all pros
			filteredPros = pros;
		}
	}

	async function updateProsForRound() {
		const currentTeam = draftOrder[currentParticipantIndex];
		if (currentTeam) {
			const teamComposition = await getTeamCompositionFromJson(currentTeam.team_name);

			let genderToRecommend = null;
			if (teamComposition.femaleCount >= 2) {
				genderToRecommend = true; // Adjust this according to your actual data structure
			} else if (teamComposition.maleCount >= 2) {
				genderToRecommend = false;
			}

			filteredPros = pros.filter(
				(pro) => (!genderToRecommend || pro.gender === genderToRecommend) && !pro.drafted
			);

			// Check if there are any filtered pros available
			if (filteredPros.length > 0) {
				// Set the recommended pro to the first item in the filtered list
				recommendedPro = filteredPros[0];
				selectedPro = recommendedPro.name;
				selectedProIndex = pros.findIndex((pro) => pro.pro_id === recommendedPro.pro_id);
			} else {
				console.log('No suitable pros available for recommendation.');
				recommendedPro = null;
				selectedPro = '';
				selectedProIndex = -1;
			}

			console.log(`Recommended Pro for ${currentTeam.team_name}:`, recommendedPro);
		}
	}

	function updateTeamCompositions() {
		// Logic to update team compositions based on the latest fantasy scores
		draftOrder.forEach((team) => {
			const teamComposition = getTeamCompositionFromJson(team.team_name, $fantasyScoresJson);
			// Perform actions based on updated team composition, e.g., update UI elements
			console.log(teamComposition);
		});
	}

	async function handleProsFiltering() {
		await reviewRemainingPros(currentTeamNameForRound3);
		// Additional logic if needed after reviewing pros
		console.log(reviewRemainingPros);
	}

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
						timer_duration: 6,
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

	function transitionToNextRound() {
		const lastRound = draftPayload.draft_rounds[draftPayload.draft_rounds.length - 1];
		let newRoundNumber = lastRound.round_number + 1;

		let newDraftOrder = [];
		if (newRoundNumber % 2 === 0) {
			// For even rounds (like Round 2), reverse the order
			newDraftOrder = lastRound.draft_order.slice().reverse();
		} else {
			// For odd rounds (like Round 1 and Round 3), use the same order as Round 1
			newDraftOrder = draftPayload.draft_rounds[0].draft_order.slice();
		}

		draftPayload.draft_rounds.push({
			picks: [],
			draft_order: newDraftOrder,
			round_number: newRoundNumber
		});

		currentParticipantIndex = 0;
		currentRoundIndex = draftPayload.draft_rounds.length - 1;

		console.log(`Transitioning to Round ${newRoundNumber}`);
		// Depending on the round, call the appropriate round handling function
		if (newRoundNumber === 2) {
			handleRound2();
		} else if (newRoundNumber === 3) {
			handleRound3();
		} else if (newRoundNumber === 4) {
			handleRound4();
		}
		// Add more conditions for further rounds if needed
	}

	// Update the addDraftPick function to include round information
	function addDraftPick(teamName, selectedPro) {
		// Access the current round number
		const currentRoundNumber = currentRoundIndex + 1; // currentRoundIndex is 0-based

		// Create a draft pick object including the round number
		const draftPick = {
			teamName: teamName.team_name, // Assuming teamName is an object with a team_name property
			selectedPro: selectedPro.name, // Assuming selectedPro has a name property
			round: currentRoundNumber
		};

		// Add the pick to the current round's picks in draftPayload
		draftPayload.draft_rounds[currentRoundIndex].picks.push(draftPick);

		// Update the draftPicks store
		draftPicks.update((picks) => [...picks, draftPick]);

		// Trigger Svelte update
		draftPayload = { ...draftPayload };

		// Log the updated store for debugging
		draftPicks.subscribe((value) => console.log(value));
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

	// Function to handle the end of the countdown timer
	function handleCountdownEnd(currentParticipant) {
		clearInterval(countdownInterval);
		console.log('Time is up for', currentParticipant.team_name);

		switch (currentRoundIndex) {
			case 0:
				autoDraft(); // Round 1 auto-draft logic
				break;
			case 1:
				autoDraftRound2(); // Round 2 auto-draft logic
				break;
			case 2:
				autoDraftRound3(); // Round 3 auto-draft logic
				break;
			// Add cases for additional rounds as needed
			default:
				console.log('Unknown round. No auto-draft function available.');
		}
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
		autoDraftTriggered = false;
		const currentRoundIndex = draftPayload.draft_rounds.length - 1;
		const currentRound = draftPayload.draft_rounds[currentRoundIndex];
		const totalRounds = draftPayload.metadata.total_rounds;

		if (currentRoundIndex < totalRounds) {
			const currentParticipant = currentRound.draft_order[currentParticipantIndex];
			console.log('Current Participant:', currentParticipant.team_name);

			// Start the countdown timer for the current participant
			startParticipantCountdown(currentParticipant);

			if (currentRoundIndex === 1) {
				// Round 2 begins, call handleRound2 with the reversed order
				handleRound2(currentRound.draft_order.slice().reverse());
			} else {
				// Rest of your code for drafting process
			}
		} else {
			// All rounds are complete, and the draft is finished
			console.log('Draft is complete.');
		}
	}

	function autoDraft() {
		console.log('Attempt autoDraft call 1st');
		if (selectedProIndex === -1) {
			// Automatically select a pro, for example, the first available pro
			selectedProIndex = pros.findIndex((p, index) => !p.drafted);
			console.log('Pro-index:', selectedProIndex);
			if (selectedProIndex !== -1) {
				selectedPro = pros[selectedProIndex].name;
				console.log('Auto-drafting:', selectedPro);

				// Attempt auto-draft
				console.log('Attempt autoDraft call 2nd');

				// You should call the function to draft the selected pro here
				draftProWithConditions(currentParticipantTeamName); // Pass the current team name
				console.log('Calling handleDraftOrder because inside autoDraft');
				// After auto-draft, move on to the next team
				handleDraftOrder(); // Remove the parameter here
			} else {
				console.log('No available pros to auto-draft.');
			}
		}
	}

	function autoDraftRound2() {
		console.log('Starting autoDraft for Round 2');
		let selectedProIndexRound2;
		console.log('Pro-index:', selectedProIndexRound2);
		// Round 2 specific logic here
		if (selectedProIndexRound2 === -1) {
			selectedProIndexRound2 = pros.findIndex((p, index) => !p.drafted);

			if (selectedProIndexRound2 !== -1) {
				selectedProRound2 = pros[selectedProIndexRound2].name;
				console.log('Auto-drafting for Round 2:', selectedProRound2);

				// Call function to draft the selected pro for Round 2
				draftProWithConditionsRound2(currentParticipantTeamName);

				// Proceed to the next step or team after auto-draft in Round 2
				handleDraftOrderRound3();
			} else {
				console.log('No available pros to auto-draft in Round 2.');
			}
		}
	}

	async function fetchFantasyScores() {
		try {
			let { data, error } = await supabase.from('league').select('fantasy_scores_json');
			if (error) throw error;
			if (data.length > 0) {
				fantasyScoresJson.set(data[0].fantasy_scores_json);
			} else {
				fantasyScoresJson.set({});
			}
		} catch (err) {
			console.error('Error fetching fantasy scores:', err);
		}
	}

	async function getTeamCompositionFromJson(currentParticipantTeamName, fantasyScoresJson) {
		let fantasyScores;

		if (!fantasyScoresJson || !fantasyScoresJson[currentParticipantTeamName]) {
			// Fetch data directly if the store is empty or does not contain the team
			let { data, error } = await supabase.from('league').select('fantasy_scores_json');
			if (error) {
				console.error('Error fetching fantasy scores:', error);
				return { maleCount: 0, femaleCount: 0 };
			}
			fantasyScores = data.length > 0 ? data[0].fantasy_scores_json : {};
		} else {
			fantasyScores = fantasyScoresJson;
		}

		// Check and log the fantasyScores for debugging
		console.log(
			`Raw Fantasy Scores for ${currentParticipantTeamName}:`,
			fantasyScores[currentParticipantTeamName]
		);

		if (!fantasyScores[currentParticipantTeamName]) {
			console.log(`Team Composition for ${currentParticipantTeamName}:`, {
				maleCount,
				femaleCount
			});

			return { maleCount, femaleCount };
		}

		const teamData = fantasyScores[currentParticipantTeamName];
		let maleCount = 0;
		let femaleCount = 0;

		// Iterate over each player in the teamData
		for (const playerId in teamData) {
			if (teamData.hasOwnProperty(playerId) && playerId !== 'owner_id') {
				const playerType = teamData[playerId].type;
				if (playerType === 'male') {
					maleCount++;
				} else if (playerType === 'female') {
					femaleCount++;
				}
			}
		}

		// Log the calculated team composition
		console.log(`Calculated Team Composition for ${currentParticipantTeamName}:`, {
			maleCount,
			femaleCount
		});

		return { maleCount, femaleCount };
	}

	async function reviewRemainingPros(teamName) {
		const teamComposition = await getTeamCompositionFromJson(teamName, $fantasyScoresJson);
		let recommendedProIndex; // Define the variable at the start of the function

		if (teamComposition.femaleCount >= 2) {
			// Recommend male pro
			recommendedProIndex = pros.findIndex((p) => !p.drafted && p.gender === 'male');
		} else if (teamComposition.maleCount >= 2) {
			// Recommend female pro
			recommendedProIndex = pros.findIndex((p) => !p.drafted && p.gender === 'female');
		} else {
			// Recommend any pro
			recommendedProIndex = pros.findIndex((p) => !p.drafted);
		}

		if (recommendedProIndex !== -1) {
			recommendedPro = pros[recommendedProIndex];
			console.log(`Recommended Pro: ${recommendedPro.name}`);
		} else {
			console.log('No suitable pros available for recommendation.');
		}
	}

	async function updateFilteredPros(currentParticipantTeamName) {
		const teamComposition = await getTeamCompositionFromJson(currentParticipantTeamName);

		// Existing logic to filter pros based on team composition
		if (teamComposition.femaleCount >= 2) {
			filteredPros = pros.filter((pro) => pro.gender === 'male' && !pro.drafted);
		} else if (teamComposition.maleCount >= 2) {
			filteredPros = pros.filter((pro) => pro.gender === 'female' && !pro.drafted);
		} else {
			filteredPros = pros.filter((pro) => !pro.drafted);
		}

		// Check if filteredPros is empty and adjust accordingly
		if (filteredPros.length === 0) {
			console.log('No available pros of the required gender. Showing all available pros.');
			filteredPros = pros.filter((pro) => !pro.drafted);
		}

		// Log the filtered pros for debugging
		console.log('Filtered Pros:', filteredPros);
	}

	async function autoDraftRound3() {
		console.log('Starting autoDraft for Round 3');
		let selectedProIndexRound3;

		const currentTeam = draftOrder[currentParticipantIndex];
		const currentTeamName = currentTeam.team_name;

		console.log(`Fetching fantasy scores for ${currentTeamName}`);
		await fetchFantasyScores(); // Ensure the fantasy scores are up-to-date

		console.log(`Updating filtered pros for ${currentTeamName}`);
		await updateFilteredPros(currentTeamName); // This will update the filteredPros based on the team composition

		// Find the first available pro in the filtered list
		selectedProIndexRound3 = filteredPros.findIndex((pro) => !pro.drafted);

		// Log the selected pro for debugging
		if (selectedProIndexRound3 !== -1) {
			const selectedProRound3 = filteredPros[selectedProIndexRound3];
			console.log(`Auto-drafting for Round 3: ${selectedProRound3.name}`);
		} else {
			console.log('No available pros to auto-draft in Round 3.');
		}

		// Additional logic for auto-drafting the selected pro
		// ...
	}

	function autoDraftRound4() {
		console.log('Starting autoDraft for Round 4');
		let selectedProIndexRound4 = -1;

		console.log('Initial selectedProIndexRound4:', selectedProIndexRound4);

		if (selectedProIndexRound4 === -1 || selectedProIndexRound4 === undefined) {
			selectedProIndexRound4 = pros.findIndex((p, index) => !p.drafted);
			console.log('Updated selectedProIndexRound4:', selectedProIndexRound4);

			if (selectedProIndexRound4 !== -1) {
				let selectedProRound4 = pros[selectedProIndexRound4].name;
				console.log('Auto-drafting for Round 4:', selectedProRound4);

				// Determine the current participant's team name
				const currentTeam = draftOrder[currentParticipantIndex];
				const currentParticipantTeamName = currentTeam.team_name;

				// Call function to draft the selected pro for Round 4
				draftProWithConditionsRound4(currentParticipantTeamName);

				// Proceed to the next step or team after auto-draft in Round 4
				handleDraftOrderRound5();
			} else {
				console.log('No available pros to auto-draft in Round 4.');
			}
		} else {
			console.log('selectedProIndexRound4 is not -1:', selectedProIndexRound4);
		}
	}

	function draftProWithConditionsRound3(teamName) {
		// Specific drafting logic for Round 2
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
			console.log('Calling handleDraftOrder because', currentRound, 'is less', totalRounds);
			handleDraftOrder();
		} else {
			// The draft is complete
			console.log('Draft is complete.');
		}
	}

	async function handleRound2() {
		console.log('Starting Round 2');

		const currentRound = draftPayload.draft_rounds[currentRoundIndex];
		if (currentRound) {
			const currentTeam = currentRound.draft_order[currentParticipantIndex];

			console.log('currentParticipantIndex:', currentParticipantIndex);

			if (currentTeam) {
				// Put the current team on the clock
				console.log('Putting', currentTeam.team_name, 'on the clock');
				currentDisplayTeam.set(currentTeam.team_name);

				startParticipantCountdown(currentTeam); // Start the countdown timer for the current team
			} else {
				console.warn('currentTeam is undefined or null. Handling gracefully.');
				// Handle the case when the draft is completed (no more teams to draft)
				if (currentRoundIndex === 4) {
					handleReservePicks(); // Call Reserve Picks logic when regular rounds are completed
				} else {
					// Transition to the next round if needed
					transitionToNextRound();
				}
			}
		} else {
			// All participants have drafted, perform auto-draft or end the draft
			clearInterval(autoDraftInterval);
			autoDraftRound2(); // Implement auto-draft logic here if needed
		}
	}

	async function handleRound3() {
		console.log('Starting Round 3');
		const currentRound = draftPayload.draft_rounds[currentRoundIndex];

		if (currentRound) {
			const currentTeam = currentRound.draft_order[currentParticipantIndex];
			if (currentTeam) {
				currentTeamNameForRound3 = currentTeam.team_name;
				console.log('Putting', currentTeamNameForRound3, 'on the clock');

				// Update the pros list based on team composition
				await updateProsForRound();

				if (filteredPros.length > 0) {
					// Automatically select the first available pro
					recommendedPro = filteredPros[0];
					selectedProIndex = pros.findIndex((p) => p.pro_id === recommendedPro.pro_id);
					console.log(`Recommended Pro for ${currentTeamNameForRound3}:`, recommendedPro.name);
				} else {
					console.log(
						`No suitable pros available for recommendation for ${currentTeamNameForRound3}`
					);
				}

				// Start the countdown timer for the current team
				startParticipantCountdown(currentTeam);
			} else {
				console.warn('currentTeam is undefined or null.');
			}
		} else {
			console.log('Round 3 is complete or undefined.');
			clearInterval(autoDraftInterval);
			autoDraftRound3();
		}
	}

	async function handleRound4() {
		console.log('Starting Round 4');

		const currentRound = draftPayload.draft_rounds[currentRoundIndex];
		if (currentRound) {
			const currentOrder = currentRound.draft_order;
			const currentTeam = currentOrder[currentParticipantIndex];

			console.log('currentParticipantIndex:', currentParticipantIndex);

			if (currentParticipantIndex < currentOrder.length) {
				if (currentTeam) {
					console.log('Putting', currentTeam.team_name, 'on the clock');
					currentDisplayTeam.set(currentTeam.team_name);

					// Review and recommend a pro at the start of each turn in Round 4
					reviewRemainingPros();

					startParticipantCountdown(currentTeam);
				} else {
					console.warn('currentTeam is undefined or null.');
				}
			} else {
				transitionToNextRound();
			}
		} else {
			console.log('Round 4 is complete or undefined.');
			clearInterval(autoDraftInterval);
			// Call autoDraftRound4 or handle the end of the draft
		}
	}

	function handleDraftOrder() {
		const currentRound = draftPayload.draft_rounds[currentRoundIndex];
		console.log('Current Round:', currentRound);

		if (currentRound) {
			const currentOrder = currentRound.draft_order;
			const currentTeam = currentOrder[currentParticipantIndex];

			console.log('currentParticipantIndex:', currentParticipantIndex);

			if (currentParticipantIndex < currentOrder.length) {
				if (currentTeam) {
					// Put the current team on the clock
					console.log('Putting', currentTeam.team_name, 'on the clock');
					currentDisplayTeam.set(currentTeam.team_name);

					startParticipantCountdown(currentTeam); // Start the countdown timer for the current team
				} else {
					console.warn('currentTeam is undefined or null. Handling gracefully.');
				}
			} else {
				// End of the current round, transition to the next round
				transitionToNextRound();
			}
		} else {
			console.log('All rounds completed or current round is undefined.');
			// All participants have drafted, perform auto-draft or end the draft
			clearInterval(autoDraftInterval);
			autoDraft(); // Implement auto-draft logic here if needed
		}
	}

	async function startCountdownTimer(participant) {
		const timerDurationInSeconds = get(countdownTime);

		if (timerDurationInSeconds > 0) {
			countdownTimer = setTimeout(() => {
				console.log(`Time is up for ${participant.team_name}`);

				// Reset the autoDraftTriggered flag
				autoDraftTriggered = false;

				// Move to the next participant only if autoDraft is not triggered
				if (!autoDraftTriggered) {
					currentParticipantIndex++;

					if (currentParticipantIndex >= currentRound.draft_order.length) {
						// Move to the next round
						currentRoundIndex++;
						currentParticipantIndex = 0;
					}

					if (currentRoundIndex < draftPayload.draft_rounds.length) {
						startDrafting();
					} else {
						console.log('Draft is complete.');
					}
				}
			}, timerDurationInSeconds * 1000); // Convert seconds to milliseconds
		} else {
			// Handle the case where the timer duration is 0 or less (no timer needed)
			console.log('No timer needed for', participant.team_name);

			// Reset the autoDraftTriggered flag
			autoDraftTriggered = false;

			// Move to the next participant only if autoDraft is not triggered
			if (!autoDraftTriggered) {
				currentParticipantIndex++;

				if (currentParticipantIndex >= currentRound.draft_order.length) {
					// Move to the next round
					currentRoundIndex++;
					currentParticipantIndex = 0;
				}

				if (currentRoundIndex < draftPayload.draft_rounds.length) {
					startDrafting();
				} else {
					console.log('Draft is complete.');
				}
			}
		}
	}

	async function draftProWithConditions(currentTeamName) {
		console.log('Drafting pro with conditions.');

		const currentRound = draftPayload.draft_rounds[currentRoundIndex];

		if (currentRound) {
			const currentOrder = currentRound.draft_order;
			const currentTeam = currentOrder[currentParticipantIndex];

			if (currentTeam) {
				// Access the selected pro based on selectedProIndex
				const selectedPro = pros[selectedProIndex];

				if (!selectedPro) {
					console.error('Selected pro is undefined.');
					return;
				}

				// Log the selected pro for debugging purposes
				console.log('Selected Pro:', selectedPro);

				// Call addDraftPick to add the draft pick to the list
				addDraftPick(currentTeamName, selectedPro);

				// Continue with drafting logic for selected pro
				const genderType = selectedPro.gender === true ? 'male' : 'female';
				const proKey = `pro_${genderType}_${selectedProIndex + 1}`;
				const selectedProId = selectedPro.pro_id;

				// Fetch the existing fantasy_scores_json from the database
				const { data: leagueData, error: leagueError } = await supabase
					.from('league')
					.select('fantasy_scores_json')
					.eq('league_id', leagueId);

				if (leagueError) {
					console.error('Error fetching fantasy_scores_json:', leagueError);
					return;
				}

				// Initialize fantasy_scores_json if not exists
				const existingFantasyScoresJson = leagueData[0].fantasy_scores_json || {};

				// Initialize the current team's fantasy_scores_json if not exists
				existingFantasyScoresJson[currentTeam.team_name] =
					existingFantasyScoresJson[currentTeam.team_name] || {};

				// Add owner_id to the current team's fantasy_scores_json for Round 1
				existingFantasyScoresJson[currentTeam.team_name].owner_id = currentTeam.owner_id;

				// Create a drafted pro object with the required properties
				const draftedPro = {
					pro_id: selectedPro.pro_id,
					name: selectedPro.name.trim(), // Remove leading and trailing whitespace
					type: genderType // Set type based on gender
					// Add other pro properties as needed
				};

				// Update the fantasy_scores_json object with the drafted pro
				existingFantasyScoresJson[currentTeam.team_name][proKey] = draftedPro;

				// Now, update the database field (fantasy_scores_json) with the modified existingFantasyScoresJson
				const { error: updateError, data } = await supabase
					.from('league')
					.update({ fantasy_scores_json: existingFantasyScoresJson })
					.eq('league_id', leagueId);

				console.log(`Pro drafted: ${draftedPro.name}`);

				// Log the error response, if any
				if (updateError) {
					console.error('Error updating fantasy_scores_json:', updateError);
					console.error('Error details:', data); // Log the detailed error response
				}

				// Remove the drafted pro from the pros array
				pros.splice(selectedProIndex, 1);

				// Increment the selectedProIndex for the next pick
				selectedProIndex++;
			} else {
				console.warn('Metadata is missing in the current round.');
			}

			// Move to the next participant
			currentParticipantIndex++;

			// Importantly, after you have successfully drafted the pro within your currentTeam's fantasy_scores_json,
			// call the handleDraftOrder function to move to the next participant and continue the draft.
			handleDraftOrder(currentTeamName);

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

	async function fetchProsData() {
		try {
			let { data: prosData, error } = await supabase.from('pros').select('*');
			if (error) throw error;
			pros = prosData;
			console.log('Pros:', pros); // Log here after fetching
		} catch (err) {
			console.error('Error fetching pros data:', err);
		}
	}

	onMount(async () => {
		filteredPros = pros; // Initialize with all pros
		await fetchFantasyTeams(); // Existing function to fetch teams
		await fetchFantasyScores(); // Fetch fantasy scores
		await fetchProsData(); // Assuming you have a function to fetch pros data
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
					{#if selectedProIndex !== -1 && pros[selectedProIndex]}
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
								</tr>
							</thead>
							<tbody>
								{#each filteredPros as pro, index (pro.pro_id)}
									{#if index !== selectedProIndex}
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
	<div class="mt-2 text-white">
		{#if $currentDisplayTeam === null}
			<div class="mx-2">
				{#if draftOrder[0]}
					{draftOrder[0].team_name} is on the clock
				{/if}
			</div>
		{:else}
			<p>{$currentDisplayTeam ? `${$currentDisplayTeam} is on the clock` : 'No current team'}</p>
		{/if}
	</div>
	<!-- Display draft picks as a table with header cells for rounds -->
	<div class="container mx-auto overflow-auto max-h-[40vh] w-full bg-white rounded-lg p-2 mt-2">
		{#if draftPayload.draft_rounds.length > 0}
			<div class="container mx-auto">
				<table class="min-w-full text-black striped-table">
					<thead>
						<tr class="text-left">
							<th>Team</th>
							<th>Rd 1</th>
							<th>Rd 2</th>
							<th>Rd 3</th>
							<th>Rd 4</th>
							<th>Reserve Female</th>
							<th>Reserve Male</th>
						</tr>
					</thead>
					<tbody>
						{#each draftOrder as team}
							<tr>
								<td>{team.team_name}</td>
								{#each Array(6) as _, roundIndex}
									<!-- Assuming 6 rounds -->
									<td>
										{#if draftPayload.draft_rounds[roundIndex]?.picks && draftPayload.draft_rounds[roundIndex].picks.find((pick) => pick.teamName === team.team_name)}
											{draftPayload.draft_rounds[roundIndex].picks.find(
												(pick) => pick.teamName === team.team_name
											).selectedPro}
										{:else}
											{'-'}
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p class="text-black">No draft picks available.</p>
		{/if}
	</div>
</div>

<style>
	.striped-table tr:nth-child(even) {
		@apply bg-gray-200; /* Adjust the shade of grey as needed */
	}
</style>

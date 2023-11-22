<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '../../supabaseClient';
	import { femaleA, femaleB, maleA, maleB } from '$lib/utilities/stores.js';
	import Incrementer from '$lib/components/Incrementer.svelte';
	import Decrementer from '$lib/components/Decrementer.svelte';
	import Resetter from '$lib/components/Resetter.svelte';
	import { getCurrentUser } from '$lib/utilities/getUser.js';
	import { loadProsAndTeams } from '$lib/utilities/loadProsAndTeams';
	import { calculateFantasyScore } from '$lib/utilities/calculateFantasyScore.js';

	let scoresId = null;
	let user = null;
	let isScoresInitializationButtonVisible = true;
	let steps = [];
	let startHole = 1;
	let pros = [];
	let teams = [];
	let scoresValue = {
		femaleA: 0,
		femaleB: 0,
		maleA: 0,
		maleB: 0
	};

	$: scoresValue = {
		femaleA: $femaleA,
		femaleB: $femaleB,
		maleA: $maleA,
		maleB: $maleB
	};

	async function handleInitializeScores($scores) {
		await initializeScores(startHole, $scores);
		// After initializing, hide the button
		isScoresInitializationButtonVisible = false;
	}

	async function getUserId() {
		try {
			const user = await getCurrentUser();
			if (user) {
				console.log('User ID in getUserId:', user.id); // Log the user ID
				return user.id;
			} else {
				console.log('No user found in getUserId');
				return null;
			}
		} catch (error) {
			console.error('Error in getUserId:', error);
			return null;
		}
	}

	// Subscribe to the scores store
	femaleA.subscribe((value) => {
		scoresValue.femaleA = value;
	});
	femaleB.subscribe((value) => {
		scoresValue.femaleB = value;
	});
	maleA.subscribe((value) => {
		scoresValue.maleA = value;
	});
	maleB.subscribe((value) => {
		scoresValue.maleB = value;
	});

	async function fetchScoringData() {
		try {
			const scorerUuid = await getUserId();
			if (!scorerUuid) {
				console.error('No user ID available in fetchScoringData');
				return;
			}

			const { data: scores, error: scoresError } = await supabase
				.from('scores')
				.select('*')
				.eq('score_scorer_uuid_ref', scorerUuid);

			if (scoresError) {
				throw scoresError;
			}

			if (scores && scores[0]) {
				startHole = scores[0].score_hole_start;
				scoresId = scores[0].score_id; // Assign the score ID here

				let detailedScores = scores[0].detailed_scores;
				if (typeof detailedScores === 'string') {
					try {
						detailedScores = JSON.parse(detailedScores);
					} catch (error) {
						console.error('Error parsing detailed_scores:', error);
						return;
					}
				}

				console.log(startHole);
				steps = Object.entries(detailedScores).map(([key, holeData]: [string, any]) => {
					const groupName = holeData.det_sco_group_name;
					const par = holeData.det_sco_par;
					const distance = holeData.det_sco_distance;
					const female_a = holeData.det_sco_female_a;
					const male_a = holeData.det_sco_male_a;
					const female_b = holeData.det_sco_female_b;
					const male_b = holeData.det_sco_male_b;
					const team_a = holeData.det_sco_team_a_id;
					const team_b = holeData.det_sco_team_b_id;
					const holeNumber = holeData.det_sco_hole_number;
					const isActiveHole = holeData.det_sco_on_this_hole;
					console.log(`Hole ${holeNumber} active: ${isActiveHole}`);
					const isUpcomingHole = holeData.det_sco_this_is_the_upcoming_hole;
					const isFinalHole = holeData.det_sco_this_is_the_final_hole;
					const isCompleted = holeData.det_sco_completed_this_hole; // Added completed status

					return {
						...holeData,
						step_id: holeNumber,
						hole: holeNumber, // you could use `Hole ${holeNumber}`
						group: groupName, // Add the group name to the step
						par: par,
						distance: distance,
						female_a: female_a,
						male_a: male_a,
						female_b: female_b,
						male_b: male_b,
						team_a: team_a,
						team_b: team_b,
						active: isActiveHole,
						upcoming: isUpcomingHole,
						final: isFinalHole,
						completed: isCompleted // Added completed status to the returned object
					};
				});
			}
		} catch (error) {
			console.error('Error fetching scoring data:', error);
		}
	}

	// Function to get only the detailed_scores from the scoring data
	async function getDetailedScores() {
		try {
			const scorerUuid = await getUserId(); // Get the user ID
			if (!scorerUuid) {
				console.error('No user ID available in getDetailedScores');
				return null;
			}

			const { data: scores, error: scoresError } = await supabase
				.from('scores')
				.select('detailed_scores') // Select only the detailed_scores column
				.eq('score_scorer_uuid_ref', scorerUuid);

			if (scoresError) {
				throw scoresError;
			}

			if (scores && scores.length > 0) {
				const detailedScores = scores[0].detailed_scores;

				// Check if detailedScores is a string and needs parsing
				if (typeof detailedScores === 'string') {
					try {
						return JSON.parse(detailedScores); // Parse and return the JSON object
					} catch (parseError) {
						console.error('Error parsing detailed_scores:', parseError);
					}
				} else {
					return detailedScores; // Return it as it is if it's already an object
				}
			} else {
				console.error('No scoring data found for the given scorer UUID');
				return null; // Return null if no scores are found
			}
		} catch (error) {
			console.error('Error fetching detailed scores:', error);
			return null; // Return null in case of any error
		}
	}

	// Example usage of getDetailedScores
	(async () => {
		const detailedScores = await getDetailedScores();
		if (detailedScores) {
			// Here you can handle the detailed scores as needed
			console.log('Retrieved detailed scores:', detailedScores);
			// If you need to update the scores with new data, call your update function here
		}
	})();

	async function initializeScores(startHole: number, $scores: object) {
		// Check that startHole is a number
		if (typeof startHole !== 'number') {
			console.error('Expected startHole to be a number, but got:', startHole);
			return;
		}

		console.log('initialize startHole is a number with value:', startHole);

		const intitOriginalDetailedScores = await getDetailedScores();

		// Update for this hole as det_sco_on_this_hole
		let thisHole = startHole;
		let thisHoleDataToUpdate = intitOriginalDetailedScores[thisHole];
		if (thisHoleDataToUpdate) {
			thisHoleDataToUpdate.det_sco_on_this_hole = true;
		}

		// Update for the next hole
		let nextHole = startHole + 1;
		let nextHoleDataToUpdate = intitOriginalDetailedScores[nextHole];
		if (nextHoleDataToUpdate) {
			nextHoleDataToUpdate.det_sco_this_is_the_upcoming_hole = true;
		}

		// Update for the last hole
		let lastHoleDataToUpdate;
		if (startHole === 1) {
			// If starting at the first hole, use steps.length to find the last hole
			let is_lastHole = steps.length;
			lastHoleDataToUpdate = intitOriginalDetailedScores[is_lastHole];
		} else {
			// Otherwise, the last hole is the one before the startHole
			let lastHole = startHole - 1;
			lastHoleDataToUpdate = intitOriginalDetailedScores[lastHole];
		}

		if (lastHoleDataToUpdate) {
			lastHoleDataToUpdate.det_sco_this_is_the_final_hole = true;
		}

		console.log('Last Hole Data:', lastHoleDataToUpdate);

		// Prepare the update payload
		const updatePayload = {
			detailed_scores: intitOriginalDetailedScores
		};

		// Send the update to Supabase for detailed scores
		let { data, error } = await supabase
			.from('scores')
			.update(updatePayload)
			.eq('score_id', scoresId);

		if (error) {
			console.error('Error updating detailed scores:', error);
			return;
		}

		console.log('Detailed scores updated successfully:', data);

		// Now update the 'score_initialized' field to true
		const scoreInitUpdatePayload = {
			score_initialized: true
		};

		({ data, error } = await supabase
			.from('scores')
			.update(scoreInitUpdatePayload)
			.eq('score_id', scoresId));

		if (error) {
			console.error('Error updating score initialization:', error);
		} else {
			console.log('Score initialization updated successfully:', data);
		}
	}

	async function loadNextHole(newStartHole: number, $scores: object) {
		try {
			// Validate the newStartHole
			if (typeof newStartHole !== 'number') {
				console.error('Expected newStartHole to be a number, but got:', newStartHole);
				return;
			}

			console.log('initialize newStartHole is a number with value:', newStartHole);

			// Fetch the original detailed scores
			const originalDetailedScores = await getDetailedScores();

			// Update for the next hole
			let nextHole = newStartHole + 1;
			let nextHoleDataToUpdate = originalDetailedScores[nextHole - 1]; // Adjust index for 0-based array
			if (nextHoleDataToUpdate) {
				nextHoleDataToUpdate.det_sco_this_is_the_upcoming_hole = true;

				// Update the state or perform additional operations as needed
				// For example, update $scores or any other relevant state

				console.log('Updated next hole data:', nextHoleDataToUpdate);
			} else {
				console.log('No data found for the next hole:', nextHole);
			}
			if (nextHoleDataToUpdate) {
				// Update the steps array with the new hole data
				steps[nextHole - 1] = nextHoleDataToUpdate; // Update the steps array at the correct index
				return nextHoleDataToUpdate;
			} else {
				console.error('No data found for the next hole:', nextHole);
				return null;
			}
		} catch (error) {
			console.error('Error in loadNextHole:', error);
		}
	}

	async function submitStepUpdate(startHole: number) {
		// Reset score values when moving to the next hole
		$femaleA = 0;
		$maleA = 0;
		$femaleB = 0;
		$maleB = 0;

		try {
			let currentHoleIndex = startHole - 1; // Convert to 0-based index
			if (currentHoleIndex < 0 || currentHoleIndex >= steps.length) {
				throw new Error('Invalid currentHoleIndex: ' + currentHoleIndex);
			}

			let detailedScores = await getDetailedScores();

			// Update current and next hole states
			if (currentHoleIndex < steps.length - 1) {
				let nextHoleIndex = currentHoleIndex + 1;

				// Update current hole
				steps[currentHoleIndex].active = false;
				steps[currentHoleIndex].det_sco_this_is_the_upcoming_hole = false;
				detailedScores[startHole].det_sco_on_this_hole = false;
				detailedScores[startHole].det_sco_completed_this_hole = true;

				// Update next hole
				steps[nextHoleIndex].active = true;
				steps[nextHoleIndex].det_sco_this_is_the_upcoming_hole = true;
				detailedScores[nextHoleIndex + 1].det_sco_on_this_hole = true;

				console.log('steps 0 based index:', steps);
				console.log('detailedScores 1 based index:', detailedScores);

				// Update sessionStorage
				startHole = nextHoleIndex + 1; // Convert back to 1-based index
				sessionStorage.setItem('startHole', startHole.toString());

				if (nextHoleIndex === steps.length - 1) {
					detailedScores[nextHoleIndex + 1].det_sco_this_is_the_final_hole = true;
				}

				console.log('Moving to next hole.', startHole);
			} else {
				console.log('No next hole available. Current hole is the last one.');
				detailedScores[startHole].det_sco_this_is_the_final_hole = true;
			}

			// Persist the updated detailed scores
			await updateDetailedScores(detailedScores);
			console.log('Scores updated successfully:', startHole);
		} catch (error) {
			console.error('Error updating scores:', error);
		}
	}

	async function updateDetailedScores(detailedScores) {
		try {
			const { error } = await supabase
				.from('scores')
				.update({ detailed_scores: detailedScores })
				.eq('score_id', scoresId);

			if (error) {
				throw error;
			}
		} catch (error) {
			console.error('Error updating detailed scores:', error);
		}
	}

	// Placeholder for submitting scores
	async function submitScores(startHole: number, $scores: object) {
		// Validate input
		if (typeof startHole !== 'number') {
			console.error('Expected startHole to be a number, but got:', startHole);
			return;
		}

		// Get currentStartHole from sessionStorage
		const currentStartHole = parseInt(sessionStorage.getItem('startHole'), 10);

		// Fetch detailed scores
		const originalDetailedScores = await getDetailedScores();

		// Determine the hole index to update
		let holeIndex = startHole;
		if (
			originalDetailedScores[startHole] &&
			originalDetailedScores[startHole].det_sco_completed_this_hole
		) {
			// If the current hole (startHole) is completed, check the next hole
			let nextHoleIndex = startHole + 1;
			if (
				originalDetailedScores[nextHoleIndex] &&
				!originalDetailedScores[nextHoleIndex].det_sco_completed_this_hole
			) {
				holeIndex = nextHoleIndex;
			} else {
				// If next hole is also completed or doesn't exist, use currentStartHole
				holeIndex = currentStartHole;
			}
		}

		// Access the hole data to update
		let holeDataToUpdate = originalDetailedScores[holeIndex];

		if (!holeDataToUpdate) {
			console.error('No hole data found to update at index:', holeIndex);
			return;
		}

		// Check if the hole has already been scored
		if (holeDataToUpdate.det_sco_completed_this_hole) {
			console.log('Scoring for this hole already completed. Moving to hole:', currentStartHole);
			return currentStartHole; // Return currentStartHole for the next steps
		}

		console.log(scoresValue);
		if (typeof scoresValue !== 'object') {
			console.error('Expected scoresValue to be an object, but got:', scoresValue);
			return;
		}
		let proScoredFemaleA = scoresValue.femaleA;
		let proScoredFemaleB = scoresValue.femaleB;
		let proScoredMaleA = scoresValue.maleA;
		let proScoredMaleB = scoresValue.maleB;

		console.log('scoresValue is a object with value:', scoresValue);
		console.log('Female A Score:', proScoredFemaleA);
		console.log('Male A Score:', proScoredMaleA);
		console.log('Female B Score:', proScoredFemaleB);
		console.log('Male B Score:', proScoredMaleB);

		// Calculate fantasy scores for each player
		let fantasyScoreFemaleA = calculateFantasyScore(
			scoresValue.femaleA,
			holeDataToUpdate.det_sco_par
		);
		let fantasyScoreFemaleB = calculateFantasyScore(
			scoresValue.femaleB,
			holeDataToUpdate.det_sco_par
		);
		let fantasyScoreMaleA = calculateFantasyScore(scoresValue.maleA, holeDataToUpdate.det_sco_par);
		let fantasyScoreMaleB = calculateFantasyScore(scoresValue.maleB, holeDataToUpdate.det_sco_par);
		// ... calculations for other players ...

		// Update holeDataToUpdate with actual and fantasy scores
		holeDataToUpdate.det_sco_female_a_scored = scoresValue.femaleA;
		holeDataToUpdate.det_sco_female_a_fantasy_result_for_this_hole = fantasyScoreFemaleA;

		// Update the selected object with new scores from Svelte stores
		holeDataToUpdate.det_sco_female_a_scored = $femaleA;
		holeDataToUpdate.det_sco_female_b_scored = $femaleB;
		holeDataToUpdate.det_sco_male_a_scored = $maleA;
		holeDataToUpdate.det_sco_male_b_scored = $maleB;
		// Update the holeDataToUpdate object with fantasy scores
		holeDataToUpdate.det_sco_female_a_fantasy_result_for_this_hole = fantasyScoreFemaleA;
		holeDataToUpdate.det_sco_female_b_fantasy_result_for_this_hole = fantasyScoreFemaleB;
		holeDataToUpdate.det_sco_male_a_fantasy_result_for_this_hole = fantasyScoreMaleA;
		holeDataToUpdate.det_sco_male_b_fantasy_result_for_this_hole = fantasyScoreMaleB;

		// Calculate and update team fantasy scores
		holeDataToUpdate.det_sco_team_a_fantasy_result_for_this_hole =
			fantasyScoreFemaleA + fantasyScoreMaleA;
		holeDataToUpdate.det_sco_team_b_fantasy_result_for_this_hole =
			fantasyScoreFemaleB + fantasyScoreMaleB;

		// ... rest of your existing code for updating the scores in the database ...

		// Check if this is the final hole and handle overall aggregation if necessary
		if (holeDataToUpdate.det_sco_this_is_the_final_hole) {
			// Aggregate overall results here
			// ...
		}

		// ... rest of your function ...

		// Fetch current detailed scores
		const currentDetailedScores = await getDetailedScores();
		if (!currentDetailedScores) {
			console.error('Failed to retrieve current detailed scores.');
			return;
		}

		// Make sure scoresValue is defined and has the new score data
		if (!scoresValue) {
			console.error('Scores value is not set.');
			return;
		}
		// Select the hole data for the current startHole
		holeDataToUpdate = currentDetailedScores[startHole];
		if (!holeDataToUpdate) {
			console.error(`Hole data for number ${startHole} not found.`);
			return;
		}

		// Perform the score update logic here
		// ...
		// For example, updating the score for this hole
		holeDataToUpdate.score = scoresValue; // Replace scoresValue with the actual score you want to update

		// Assuming you have the correct scoresId which is the actual row id in the 'scores' table

		// Update the hole data with the new score
		holeDataToUpdate.score = scoresValue[startHole]; // Assuming scoresValue is structured with keys as pros example femaleA

		let newScoreFemaleA = $femaleA;
		let newScoreFemaleB = $femaleB;
		let newScoreMaleA = $maleA;
		let newScoreMaleB = $maleB;
		console.log('startHole value:', startHole);
		if (typeof startHole !== 'number' || isNaN(startHole)) {
			console.error('startHole is not a number:', startHole);
			return; // Exit the function if startHole is not a valid number
		}
		// Update the holeDataToUpdate object
		const updatedScores = {
			...holeDataToUpdate, // Assuming holeDataToUpdate is a regular object, not a Svelte store
			det_sco_female_a_scored: newScoreFemaleA,
			det_sco_female_b_scored: newScoreFemaleB,
			det_sco_male_a_scored: newScoreMaleA,
			det_sco_male_b_scored: newScoreMaleB
		};
		console.log(originalDetailedScores);
		// Send the entire updated array back to the database
		const updatePayload = {
			detailed_scores: originalDetailedScores
		};
		// Send the update to Supabase
		const { data, error } = await supabase
			.from('scores')
			.update(updatePayload)
			.eq('score_id', scoresId);
	}

	onMount(async () => {
		try {
			// Fetch user and other data
			const user = await getCurrentUser();
			if (user) {
				// Fetch scoring data for the current user, which should set the scoresId
				await fetchScoringData(user.id);

				// Now you can use scoresId to fetch the score initialization status
				const { data, error } = await supabase
					.from('scores')
					.select('score_initialized')
					.eq('score_id', scoresId) // scoresId is now set by fetchScoringData
					.single();

				if (error) {
					console.error('Error fetching score initialization status:', error);
					return;
				}

				// Hide the button if scores are already initialized
				if (data?.score_initialized) {
					isScoresInitializationButtonVisible = false;
				}

				// Further processing (e.g., loading pros and teams data)
				const proIds = new Set();
				const teamIds = new Set();

				steps.forEach((step) => {
					// Add IDs to sets for loading related data
					if (step.female_a) proIds.add(step.female_a);
					if (step.male_a) proIds.add(step.male_a);
					if (step.female_b) proIds.add(step.female_b);
					if (step.male_b) proIds.add(step.male_b);
					if (step.team_a) teamIds.add(step.team_a);
					if (step.team_b) teamIds.add(step.team_b);
				});

				const proIdsArray = Array.from(proIds);
				const teamIdsArray = Array.from(teamIds);
				const loadedData = await loadProsAndTeams(proIdsArray, teamIdsArray);

				pros = loadedData.pros;
				teams = loadedData.teams;

				// If additional detailed scores are needed, fetch them
				await getDetailedScores(user.id);
			} else {
				console.error('No user found');
			}
		} catch (error) {
			console.error('Error in onMount:', error);
		}
	});
</script>

<main class="container mx-auto p-4">
	<ol
		class="flex flex-wrap gap-4 justify-center text-sm font-medium text-gray-500 dark:text-gray-400"
	>
		{#each steps as { step_id, hole, group, par, distance, female_a, male_a, team_a, team_b, active, completed, on_hole }, index}
			{#if typeof hole !== 'undefined'}
				<li class="flex items-center">
					<span class="flex items-center">
						<svg
							class="w-4 h-4 mr-2"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="currentColor"
							viewBox="0 0 20 20"
							class:fill-blue-600={active && !completed}
							class:fill-green-600={completed}
							class:fill-gray-500={!active && !completed}
						>
							<path
								d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"
							/>
						</svg>
						<span class={startHole ? 'active-hole' : ''}>{hole}</span>
					</span>
				</li>
			{:else}
				<!-- Rendering for undefined holes -->
				<li class="flex items-center">
					...
					<span class="inactive-hole">Next: {index + 1}</span>
					<!-- Displaying next index -->
					...
				</li>
			{/if}
		{/each}
	</ol>
	{#if steps.length > 0}
		{#each steps as { step_id, hole, group, par, distance, female_a, male_a, female_b, male_b, team_a, team_b, active, on_hole }}
			{#if active}
				<form on:submit|preventDefault={() => submitScores(startHole)}>
					<fieldset>
						<div class="mt-6 flex justify-center">{group}</div>
						<div class="mt-2 flex justify-center">
							Scoring Hole {hole} - Par {par}
							{distance} feet
						</div>
						<div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
							<!-- Display Female A's name and score -->
							<div class="mb-4 border border-white p-4">
								<!-- Female A Team and Pro Information -->
								<div class="score-entry">
									{teams.find((t) => t.team_id === team_a)?.name || 'Unknown'}:
									<img
										src={teams.find((t) => t.team_id === team_a)?.team_image_url ||
											'team_image_url'}
										alt="Team"
										class="h-12 w-12 rounded-full"
									/>
								</div>
								<div class="score-entry">
									<img
										src={pros.find((p) => p.pro_id === female_a)?.pro_image_url || 'pro_image_url'}
										alt="Pro"
										class="h-10 w-10 rounded-full"
									/>
									<div>{pros.find((p) => p.pro_id === female_a)?.name || 'Unknown'}</div>
								</div>
								<div class="score-entry">Score: {$femaleA || 0}</div>
								<!-- Increment, Decrement, and Reset for Female A -->
								<div class="score-entry">
									<Incrementer pro="femaleA" />
									<Decrementer pro="femaleA" />
									<Resetter pro="femaleA" />
								</div>
							</div>
							<!-- Display Male A's name and score -->
							<div class="mb-4 border border-white p-4">
								<!-- Male A Team and Pro Information -->
								<div class="score-entry">
									{teams.find((t) => t.team_id === team_a)?.name || 'Unknown'}:
									<img
										src={teams.find((t) => t.team_id === team_a)?.team_image_url ||
											'team_image_url'}
										alt="Team"
										class="h-12 w-12 rounded-full"
									/>
								</div>
								<div class="score-entry">
									<img
										src={pros.find((p) => p.pro_id === male_a)?.pro_image_url || 'pro_image_url'}
										alt="Pro"
										class="h-10 w-10 rounded-full"
									/>
									<div>{pros.find((p) => p.pro_id === male_a)?.name || 'Unknown'}</div>
								</div>
								<div class="score-entry">Score: {$maleA || 0}</div>
								<!-- Increment, Decrement, and Reset for Male A -->
								<div class="score-entry">
									<Incrementer pro="maleA" />
									<Decrementer pro="maleA" />
									<Resetter pro="maleA" />
								</div>
							</div>
						</div>
						<div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
							<!-- Display Female B's name and score -->
							<div class="mb-4 border border-white p-4">
								<!-- Female B Team and Pro Information -->
								<div class="score-entry">
									{teams.find((t) => t.team_id === team_b)?.name || 'Unknown'}:
									<img
										src={teams.find((t) => t.team_id === team_b)?.team_image_url ||
											'team_image_url'}
										alt="Team"
										class="h-12 w-12 rounded-full"
									/>
								</div>
								<div class="score-entry">
									<img
										src={pros.find((p) => p.pro_id === female_b)?.pro_image_url || 'pro_image_url'}
										alt="Pro"
										class="h-10 w-10 rounded-full"
									/>
									<div>{pros.find((p) => p.pro_id === female_b)?.name || 'Unknown'}</div>
								</div>
								<div class="score-entry">Score: {$femaleB || 0}</div>
								<!-- Increment, Decrement, and Reset for Female B -->
								<div class="score-entry">
									<Incrementer pro="femaleB" />
									<Decrementer pro="femaleB" />
									<Resetter pro="femaleB" />
								</div>
							</div>
							<!-- Display Male B's name and score -->
							<div class="mb-4 border border-white p-4">
								<!-- Male B Team and Pro Information -->
								<div class="score-entry">
									{teams.find((t) => t.team_id === team_b)?.name || 'Unknown'}:
									<img
										src={teams.find((t) => t.team_id === team_b)?.team_image_url ||
											'team_image_url'}
										alt="Team"
										class="h-12 w-12 rounded-full"
									/>
								</div>
								<div class="score-entry">
									<img
										src={pros.find((p) => p.pro_id === male_b)?.pro_image_url || 'pro_image_url'}
										alt="Pro"
										class="h-10 w-10 rounded-full"
									/>
									<div>{pros.find((p) => p.pro_id === male_b)?.name || 'Unknown'}</div>
								</div>
								<div class="score-entry">Score: {$maleB || 0}</div>
								<!-- Increment, Decrement, and Reset for Male B -->
								<div class="score-entry">
									<Incrementer pro="maleB" />
									<Decrementer pro="maleB" />
									<Resetter pro="maleB" />
								</div>
							</div>
						</div>
					</fieldset>
				</form>
			{/if}
		{/each}
	{/if}
	<!-- Button to initialize scores -->
	{#if isScoresInitializationButtonVisible}
		<button
			on:click={handleInitializeScores}
			class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
		>
			Initialize Scores
		</button>
	{/if}
	<!-- Button to initialize scores -->
	{#if !isScoresInitializationButtonVisible}
		<button
			on:click|preventDefault={() => submitStepUpdate(startHole)}
			class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
		>
			Submit Scores
		</button>
	{/if}
</main>

<style>
	/* ... existing styles */

	.score-entry {
		margin: 1rem 0;
	}

	.score-entry label {
		margin-right: 0.5rem;
		text: bold;
	}

	.submit-scores {
		/* ... */
	}
</style>

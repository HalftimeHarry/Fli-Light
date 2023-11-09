<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '../../supabaseClient';
	import { femaleA, femaleB, maleA, maleB } from '$lib/utilities/stores.js';
	import Incrementer from '$lib/components/Incrementer.svelte';
	import Decrementer from '$lib/components/Decrementer.svelte';
	import Resetter from '$lib/components/Resetter.svelte';

	let activeStep = 1;
	let steps = [];
	let startHole;
	let currentScores = {}; // This will hold the current scores for the active hole
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

	// Some function that will be called when you want to initialize femaleA
	function initializeFemaleA(value) {
		femaleA.set(value);
	}

	async function loadProsAndTeams(proIds, teamIds) {
		// Load specific pros based on passed IDs
		if (proIds && proIds.length) {
			let prosQuery = `pro_id=in.(${proIds.join(',')})`;
			let prosResponse = await supabase.from('pros').select('*').in('pro_id', proIds);

			if (prosResponse.error) {
				console.error('Error loading pros:', prosResponse.error);
			} else {
				pros = prosResponse.data;
			}
		}

		// Load specific teams based on passed IDs
		if (teamIds && teamIds.length) {
			let teamsQuery = `id=in.(${teamIds.join(',')})`; // This creates a query string for multiple IDs
			let teamsResponse = await supabase.from('teams').select('*').in('team_id', teamIds);

			if (teamsResponse.error) {
				console.error('Error loading teams:', teamsResponse.error);
			} else {
				teams = teamsResponse.data;
			}
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
			const scorerUuid = 'aa6e4346-c20c-42cb-97b7-6770c563c4ff';
			const { data: scores, error: scoresError } = await supabase
				.from('scores')
				.select('*')
				.eq('score_scorer_uuid_ref', scorerUuid);

			startHole = scores[0].score_hole_start;

			console.log(scores[0].detailed_scores);
			console.log(scores[0].score_fantacy);

			if (scoresError) {
				throw scoresError;
			}

			if (scores && scores[0]) {
				let detailedScores = scores[0].detailed_scores;
				if (typeof detailedScores === 'string') {
					try {
						detailedScores = JSON.parse(detailedScores);
					} catch (error) {
						console.error('Error parsing detailed_scores:', error);
						return;
					}
				}

				steps = Object.entries(detailedScores).map(([key, holeData]: [string, any]) => {
					const groupName = holeData.det_sco_group_name;
					const par = holeData.det_sco_par;
					const female_a = holeData.det_sco_female_a;
					const male_a = holeData.det_sco_male_a;
					const female_b = holeData.det_sco_female_b;
					const male_b = holeData.det_sco_male_b;
					const team_a = holeData.det_sco_team_a_id;
					const team_b = holeData.det_sco_team_b_id;
					const holeNumber = holeData.det_sco_hole_number;
					const isActiveHole = holeNumber === startHole; // Compare holeNumber with startHole
					console.log(`Hole ${holeNumber} active: ${isActiveHole}`);
					const OnThisHole = isActiveHole; // Since you're starting on this hole, this flag should be true
					console.log(`Hole on ${holeNumber} active: ${OnThisHole}`);

					return {
						id: holeNumber,
						hole: `Hole ${holeNumber}`,
						group: groupName, // Add the group name to the step
						par: par,
						female_a: female_a,
						male_a: male_a,
						female_b: female_b,
						male_b: male_b,
						team_a: team_a,
						team_b: team_b,
						active: isActiveHole,
						on_hole: OnThisHole
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
			const scorerUuid = 'aa6e4346-c20c-42cb-97b7-6770c563c4ff';
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

	// Placeholder for submitting scores
	async function submitScores(startHole: number, $scores: object) {
		// Check that startHole is a number
		if (typeof startHole !== 'number') {
			console.error('Expected startHole to be a number, but got:', startHole);
			return;
		}

		console.log('startHole is a number with value:', startHole);

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

		const originalDetailedScores = await getDetailedScores();


		// Select the object to update using startHole as index
		let holeDataToUpdate = originalDetailedScores[startHole];

		if (!holeDataToUpdate) {
			console.error('No hole data found to update at index:', startHole);
			return;
		}

		// Update the selected object with new scores from Svelte stores
		holeDataToUpdate.det_sco_female_a_scored = $femaleA;
		holeDataToUpdate.det_sco_female_b_scored = $femaleB;
		holeDataToUpdate.det_sco_male_a_scored = $maleA;
		holeDataToUpdate.det_sco_male_b_scored = $maleB;

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

		// Here we use scoresValue to update the score for the specific hole
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
		const scoresId = 10; // Replace with actual ID

		// Update the hole data with the new score
		holeDataToUpdate.score = scoresValue[startHole]; // Assuming scoresValue is structured with keys as pros example femaleA

		let newScoreFemaleA = $femaleA;
		let newScoreFemaleB = $femaleB;
		let newScoreMaleA = $maleA;
		let newScoreMaleB = $maleB;
		// Update the holeDataToUpdate object
		const updatedScores = {
			...holeDataToUpdate, // Assuming holeDataToUpdate is a regular object, not a Svelte store
			det_sco_female_a_scored: newScoreFemaleA,
			det_sco_female_b_scored: newScoreFemaleB,
			det_sco_male_a_scored: newScoreMaleA,
			det_sco_male_b_scored: newScoreMaleB
		};
		console.log(updatedScores);

		// Send the entire updated array back to the database
		const updatePayload = {
			detailed_scores: originalDetailedScores
		};
		// Send the update to Supabase
		const { data, error } = await supabase
			.from('scores')
			.update(updatePayload)
			.eq('score_id', scoresId);

		if (error) {
			console.error('Error updating scores:', error);
		} else {
			console.log('Scores updated successfully:', data);
		}
	}

	onMount(async () => {
		await fetchScoringData(); // Assuming this populates the `steps` array.

		// Now that we have the `steps` data, we can extract the necessary IDs.
		const proIds = new Set();
		const teamIds = new Set();

		steps.forEach((step) => {
			if (step.female_a) proIds.add(step.female_a);
			if (step.male_a) proIds.add(step.male_a);
			if (step.female_b) proIds.add(step.female_b);
			if (step.male_b) proIds.add(step.male_b);
			if (step.team_a) teamIds.add(step.team_a);
			if (step.team_b) teamIds.add(step.team_b);
		});

		// Convert the Sets to arrays before passing them to loadProsAndTeams
		await loadProsAndTeams([...proIds], [...teamIds]);
	});
</script>

<main class="container mx-auto p-4">
	<ol
		class="flex flex-wrap gap-4 justify-center text-sm font-medium text-gray-500 dark:text-gray-400"
	>
		{#each steps as { id, hole, group, par, female_a, male_a, team_a, team_b, active, on_hole }}
			<li class="flex items-center">
				<span class="flex items-center">
					<svg
						class="w-4 h-4 mr-2"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 20 20"
						class:fill-blue-600={active}
						class:fill-gray-500={!active}
					>
						<path
							d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"
						/>
					</svg>
					<span class={active ? 'active-hole' : ''}>{hole}</span>
				</span>
			</li>
		{/each}
	</ol>
	{#if steps.length > 0}
		{#each steps as { id, hole, group, par, female_a, male_a, female_b, male_b, team_a, team_b, active, on_hole }}
			{#if active & on_hole}
				<form on:submit|preventDefault={() => submitScores(startHole)}>
					<fieldset>
						<div class="mt-6 flex justify-center">{group}</div>
						<div class="mt-2 flex justify-center">{hole} - Par {par}</div>

						<!-- Display Female A's name and score -->
						<div class="mt-4 mb-4 ml-4 mr-4 pl-4 border border-white flex items-center space-x-4">
							{teams.find((t) => t.team_id === team_a)?.name || 'Unknown'}:
							<img
								src={teams.find((t) => t.team_id === team_a)?.team_image_url ||
									'default_team_image_url'}
								alt="Team"
								class="h-12 w-12 rounded-full"
							/>
							<img
								src={pros.find((p) => p.pro_id === female_a)?.pro_image_url ||
									'default_pro_image_url'}
								alt="Pro"
								class="h-10 w-10 rounded-full ml-2"
							/>
							<div class="mr-4 ml-4">
								{pros.find((p) => p.pro_id === female_a)?.name || 'Unknown'}
							</div>
							<div class="mr-4 ml-4">Score: {$femaleA || 0}</div>

							<Incrementer pro="femaleA" />
							<Decrementer pro="femaleA" />
							<Resetter pro="femaleA" />
						</div>
						<!-- Display Male A's name and score -->
						<div class="mt-4 mb-4 ml-4 mr-4 pl-4 border border-white flex items-center space-x-4">
							{teams.find((t) => t.team_id === team_a)?.name || 'Unknown'}:
							<img
								src={teams.find((t) => t.team_id === team_a)?.team_image_url ||
									'default_team_image_url'}
								alt="Team"
								class="h-12 w-12 rounded-full"
							/>
							<img
								src={pros.find((p) => p.pro_id === male_a)?.pro_image_url ||
									'default_pro_image_url'}
								alt="Pro"
								class="h-10 w-10 rounded-full ml-2"
							/>
							<div class="mr-4 ml-4">
								{pros.find((p) => p.pro_id === male_a)?.name || 'Unknown'}
							</div>
							<div class="mr-4 ml-4">Score: {$maleA || 0}</div>

							<Incrementer pro="maleA" />
							<Decrementer pro="maleA" />
							<Resetter pro="maleA" />
						</div>

						<div class="border-t-4 border-yellow-400 my-4" />

						<!-- Display Female B's name and score -->
						<div class="mt-4 mb-4 ml-4 mr-4 pl-4 border border-white flex items-center space-x-4">
							{teams.find((t) => t.team_id === team_b)?.name || 'Unknown'}:
							<img
								src={teams.find((t) => t.team_id === team_b)?.team_image_url ||
									'default_team_image_url'}
								alt="Team"
								class="h-12 w-12 rounded-full"
							/>
							<img
								src={pros.find((p) => p.pro_id === female_b)?.pro_image_url ||
									'default_pro_image_url'}
								alt="Pro"
								class="h-10 w-10 rounded-full ml-2"
							/>
							<div class="mr-4 ml-4">
								{pros.find((p) => p.pro_id === female_b)?.name || 'Unknown'}
							</div>
							<div class="mr-4 ml-4">Score: {$femaleB || 0}</div>

							<Incrementer pro="femaleB" />
							<Decrementer pro="femaleB" />
							<Resetter pro="femaleB" />
						</div>

						<!-- Display Male B's name and score -->
						<div class="mt-4 mb-4 ml-4 mr-4 pl-4 border border-white flex items-center space-x-4">
							{teams.find((t) => t.team_id === team_b)?.name || 'Unknown'}:
							<img
								src={teams.find((t) => t.team_id === team_b)?.team_image_url ||
									'default_team_image_url'}
								alt="Team"
								class="h-12 w-12 rounded-full"
							/>
							<img
								src={pros.find((p) => p.pro_id === male_b)?.pro_image_url ||
									'default_pro_image_url'}
								alt="Pro"
								class="h-10 w-10 rounded-full ml-2"
							/>
							<div class="mr-4 ml-4">
								{pros.find((p) => p.pro_id === male_b)?.name || 'Unknown'}
							</div>
							<div class="mr-4 ml-4">Score: {$maleB || 0}</div>

							<Incrementer pro="maleB" />
							<Decrementer pro="maleB" />
							<Resetter pro="maleB" />
						</div>

						<button
							type="submit"
							class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
						>
							Submit Scores
						</button>
					</fieldset>
				</form>
			{/if}
		{/each}
	{/if}
</main>

<style>
	/* ... existing styles */

	.score-entry {
		margin: 1rem 0;
	}

	.score-entry label {
		margin-right: 0.5rem;
	}

	.submit-scores {
		/* ... */
	}
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '../../supabaseClient';
	import { scores } from '$lib/utilities/stores.js';
	import Incrementer from '$lib/components/Incrementer.svelte';
	import Decrementer from '$lib/components/Decrementer.svelte';
	import Resetter from '$lib/components/Resetter.svelte';

	let activeStep = 1;
	let steps = [];
	let startHole;
	let currentScores = {}; // This will hold the current scores for the active hole
	let pros = [];
	let teams = [];
	let scoresValue;

	$: if (scoresValue) {
		console.log('Current scores:', scoresValue);
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
	scores.subscribe((value) => {
		scoresValue = value;
	});

	// Placeholder for submitting scores
	async function submitScores() {
		// Implement the logic to submit scores
		// For instance, you can send currentScores to your backend
	}

	async function fetchScoringData() {
		try {
			const scorerUuid = 'ad74df33-97c6-4ce3-800c-8050eaf79d8f';
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
		{#each steps as { id, hole, group, par, female_a, male_a, team_a, team_b, active }}
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
		{#each steps as { id, hole, group, par, female_a, male_a, female_b, male_b, team_a, team_b, active }}
			{#if active}
				<form on:submit|preventDefault={submitScores}>
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
							<div class="mr-4 ml-4">Score: {scoresValue[female_a.toString()] || 0}</div>

							<Incrementer pro={female_a} />
							<Decrementer pro={female_a} />
							<Resetter pro={female_a} />
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
							<div class="mr-4 ml-4">Score: {scoresValue[male_a.toString()] || 0}</div>

							<Incrementer pro={male_a} />
							<Decrementer pro={male_a} />
							<Resetter pro={male_a} />
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
							<div class="mr-4 ml-4">Score: {scoresValue[female_b.toString()] || 0}</div>

							<Incrementer pro={female_b} />
							<Decrementer pro={female_b} />
							<Resetter pro={female_b} />
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
							<div class="mr-4 ml-4">Score: {scoresValue[male_b.toString()] || 0}</div>

							<Incrementer pro={male_b} />
							<Decrementer pro={male_b} />
							<Resetter pro={male_b} />
						</div>

						<button type="submit" class="...">Submit Scores</button>
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

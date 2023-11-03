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
	let scoresValue;

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
			const scorerUuid = 'aa6e4346-c20c-42cb-97b7-6770c563c4ff';
			const { data: scores, error: scoresError } = await supabase
				.from('scores')
				.select('*')
				.eq('score_scorer_uuid_ref', scorerUuid);

			startHole = scores[0].score_hole_start;

			console.log(scores[0].detailed_scores);

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
					const holeNumber = holeData.det_sco_hole_number;
					const isActiveHole = holeNumber === startHole; // Compare holeNumber with startHole
					console.log(`Hole ${holeNumber} active: ${isActiveHole}`);
					return {
						id: holeNumber,
						hole: `Hole ${holeNumber}`,
						active: isActiveHole
					};
				});
			}
		} catch (error) {
			console.error('Error fetching scoring data:', error);
		}
	}

	onMount(() => {
		fetchScoringData();
	});
</script>

<main class="container mx-auto p-4">
	<ol
		class="flex flex-wrap gap-4 justify-center text-sm font-medium text-gray-500 dark:text-gray-400"
	>
		{#each steps as { id, hole, active }}
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
		{#each steps as { id, hole, active }}
			{#if active}
				<form on:submit|preventDefault={submitScores}>
					<fieldset>
						<legend>{hole} - Enter Scores</legend>
						{#each Object.keys(scoresValue) as pro}
							<h1 class="mt-4 mb-4">Score for {pro}: {scoresValue[pro]}</h1>
							<Incrementer {pro} />
							<Decrementer {pro} />
							<Resetter {pro} />
						{/each}
						<button
							type="submit"
							class="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
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

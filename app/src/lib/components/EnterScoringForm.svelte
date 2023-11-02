<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '../../supabaseClient';

	let activeStep = 1;
	let steps = [];

	async function fetchScoringData() {
		try {
			// Step 1: Fetch the scores
			const scorerUuid = 'aa6e4346-c20c-42cb-97b7-6770c563c4ff'; // Update this with the desired UUID
			const { data: scores, error: scoresError } = await supabase
				.from('scores')
				.select('*')
				.eq('score_scorer_uuid_ref', scorerUuid);

			if (scoresError) {
				throw scoresError;
			}

			console.log(scores); // Log the fetched scores

			if (scores && scores[0] && scores[0].detailed_scores) {
				let detailedScores;
				try {
					detailedScores = JSON.parse(scores[0].detailed_scores);
				} catch (error) {
					console.error('Error parsing detailed_scores:', error);
					return;
				}

				const startHole = scores[0].det_sco_hole_start;

				steps = Object.entries(detailedScores).map(([key, holeData]: [string, any]) => {
					const holeNumber = holeData.det_sco_hole_number;
					const isActiveHole = holeNumber === startHole && holeData.det_sco_active_hole;
					return {
						id: holeNumber,
						name: `Hole ${holeNumber}`,
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

<main>
	<ol
		class="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base"
	>
		{#each steps as { id, name, active }}
			<li
				class="flex md:w-full items-center text-blue-600 dark:text-blue-500 sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700"
			>
				<span
					class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500"
				>
					<svg
						class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2.5"
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
					{name} <span class="hidden sm:inline-flex sm:ml-2">{id === 1 ? 'Info' : ''}</span>
				</span>
			</li>
		{/each}
	</ol>
</main>

<script lang="ts">
	import { onMount } from 'svelte';
	import { supabase } from '../../supabaseClient';

	let activeStep = 1;
	let steps = [];

	async function fetchScoringData() {
		try {
			const scorerUuid = 'aa6e4346-c20c-42cb-97b7-6770c563c4ff';
			const { data: scores, error: scoresError } = await supabase
				.from('scores')
				.select('*')
				.eq('score_scorer_uuid_ref', scorerUuid);

			if (scoresError) {
				throw scoresError;
			}

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

<main class="container mx-auto p-4">
	<ol
		class="flex flex-wrap gap-4 justify-center text-sm font-medium text-gray-500 dark:text-gray-400"
	>
		{#each steps as { id, name, active }}
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
					<span class={active ? 'active-hole' : ''}>{name}</span>
					<span class="hidden sm:inline-flex sm:ml-2">{id === 1 ? 'Info' : ''}</span>
				</span>
			</li>
		{/each}
	</ol>
</main>

<style>
	.active-hole {
		@apply text-red-500;
	}
</style>

<script>
	export let detailedScores;
	export let isSummaryVisible = false;

	// This function could be called from the parent component to display the summary
	export function displaySummary() {
		isSummaryVisible = true;
	}

	// Function to compute any additional summary details, if necessary
	function computeSummaryDetails() {
		// Logic to compute summary details
	}

	$: if (isSummaryVisible) {
		computeSummaryDetails();
	}
</script>

{#if isSummaryVisible}
	<div class="score-summary">
		<h2>Tournament Summary</h2>
		{#each Object.entries(detailedScores) as [holeId, score]}
			<div class="hole-summary">
				<h3>Hole {score.det_sco_hole_number}</h3>
				<p>
					Score: {score.det_sco_male_a_scored} (Male A), {score.det_sco_male_b_scored} (Male B), {score.det_sco_female_a_scored}
					(Female A), {score.det_sco_female_b_scored} (Female B)
				</p>
				<!-- Add more details as required -->
			</div>
		{/each}
	</div>
{/if}

<style>
	.score-summary {
		/* Styling for the summary component */
	}

	.hole-summary {
		/* Styling for each hole's summary */
	}
</style>

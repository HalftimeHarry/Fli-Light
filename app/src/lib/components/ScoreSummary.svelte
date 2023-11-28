<script>
	export let lastHoleData;
</script>

<div class="summary">
	<h1 class="text-5xl sm:text-7xl md:text-9xl font-bold mb-4 uppercase">Fantasy Summary</h1>
	<h2>Scores - {lastHoleData.det_sco_hole_number} holes of played</h2>
	<p>Group: {lastHoleData.det_sco_group_name}</p>
	<p>Team A Fantasy Score: {lastHoleData.det_sco_team_a_fantasy_result_overall}</p>
	<p>Team B Fantasy Score: {lastHoleData.det_sco_team_b_fantasy_result_overall}</p>
	<p>Male A Fantasy Score: {lastHoleData.det_sco_male_a_fantasy_result_overall}</p>
	<p>Male B Fantasy Score: {lastHoleData.det_sco_male_b_fantasy_result_overall}</p>
	<p>Female A Fantasy Score: {lastHoleData.det_sco_female_a_fantasy_result_overall}</p>
	<p>Female B Fantasy Score: {lastHoleData.det_sco_female_b_fantasy_result_overall}</p>
	<!-- Add more details as needed -->
</div>

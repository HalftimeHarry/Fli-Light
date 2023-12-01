<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let leagueId;

	$: leagueId = $page.params.league_id;


	let leagueData;

	onMount(async () => {
		// Fetch the league data based on leagueId
		// Example: `fetchLeagueData(leagueId)` is a function you would define to fetch league data
		leagueData = await fetchLeagueData(leagueId);
	});

	// Define the function to fetch league data
	async function fetchLeagueData(id) {
		// Implement the logic to fetch data from your API or database
		// Example: return fetch(`/api/leagues/${id}`).then(res => res.json());
	}
</script>

<h1>League: {leagueData?.name}</h1>
<p>Details about the league will be displayed here.</p>

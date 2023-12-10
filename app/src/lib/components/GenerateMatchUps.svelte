<script>
	console.log('GenerateMatchUps component loaded');
	import { onMount } from 'svelte';
	import { supabase } from '../../supabaseClient';
	import { getDrawerStore } from '@skeletonlabs/skeleton';

	export let onGenerateMatchUps;
	const drawerStore = getDrawerStore();
	let fantasyTeams = []; // Initialize as an empty array

	function closeDrawer() {
		console.log('Closing drawer...');
		drawerStore.close();
	}

	async function fetchFantasyTeams() {
		console.log('Fetching fantasy teams...');
		let { data: league, error } = await supabase.from('league').select('fantasy_teams_json');

		if (error) {
			console.error('Error fetching fantasy teams:', error);
			return;
		}

		if (league && league.length > 0) {
			// Check if fantasy_teams_json is an array
			if (Array.isArray(league[0].fantasy_teams_json)) {
				fantasyTeams = league[0].fantasy_teams_json;
			} else {
				// Handle the case where fantasy_teams_json is not an array
				// Example: Convert it to an array or take other actions based on your data structure
				console.log('Transforming fantasy_teams_json into an array');
				fantasyTeams = transformToArrayOfTeams(league[0].fantasy_teams_json);
			}
		} else {
			console.error('No league data found or fantasy_teams_json is missing');
		}
		console.log('Fantasy teams data:', fantasyTeams);
		onGenerateMatchUps(league);
	}

	function transformToArrayOfTeams(data) {
		// Transform your data into an array format
		// This depends on how your data is structured
		// Example transformation (adjust according to your data structure):
		return Object.values(data);
	}

	onMount(() => {
		fetchFantasyTeams();
	});
</script>

<div
	class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-95 flex justify-center items-center z-50"
>
	<!-- Close button -->
	<button
		on:click={closeDrawer}
		class="absolute top-2 right-2 bg-white text-black px-4 py-2 rounded shadow-lg"
	>
		Close
	</button>

	<!-- List of Team Names -->
	<div class="absolute top-2 left-2 text-white">
		{#each fantasyTeams as team}
			<div>{team.team_name}</div>
		{/each}
	</div>
</div>

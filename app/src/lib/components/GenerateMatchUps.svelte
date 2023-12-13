<script>
	console.log('GenerateMatchUps component loaded');
	import { onMount } from 'svelte';
	import { supabase } from '../../supabaseClient';
	import { getDrawerStore } from '@skeletonlabs/skeleton';

	export let getDraftOrder;
	const drawerStore = getDrawerStore();
	let draftOrder = []; // Initialize as an empty array

	function closeDrawer() {
		console.log('Closing drawer...');
		drawerStore.close();
	}

	function shuffle(array) {
		let currentIndex = array.length,
			randomIndex;

		// While there remain elements to shuffle...
		while (currentIndex != 0) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

			// And swap it with the current element.
			[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
		}

		return array;
	}

	async function fetchFantasyTeams() {
		console.log('Fetching fantasy teams...');
		let { data: league, error } = await supabase.from('league').select('fantasy_teams_json');

		if (error) {
			console.error('Error fetching fantasy teams:', error);
			return;
		}

		if (league && league.length > 0) {
			let teamsArray;
			// Check if fantasy_teams_json is an array
			if (Array.isArray(league[0].fantasy_teams_json)) {
				teamsArray = league[0].fantasy_teams_json;
			} else {
				// Handle the case where fantasy_teams_json is not an array
				console.log('Transforming fantasy_teams_json into an array');
				teamsArray = transformToArrayOfTeams(league[0].fantasy_teams_json);
			}

			// Shuffle the teams array
			draftOrder = shuffle(teamsArray);
			console.log('Shuffled Fantasy Teams:', draftOrder);

			// Call getDraftOrder with league data
			getDraftOrder(draftOrder);
		} else {
			console.error('No league data found or fantasy_teams_json is missing');
		}
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

<div class="fixed top-0 left-0 right-0 bottom-0 flex justify-center items-center z-50">
	<!-- Close button -->
	<button
		on:click={closeDrawer}
		class="absolute top-2 right-2 bg-white text-black px-4 py-2 rounded shadow-lg"
	>
		Close
	</button>

	<!-- List of Team Names -->
	<div class="absolute flex flex-row top-2 left-2 text-white">
		{#each draftOrder as team}
			<div class="mx-2">{team.team_name}</div>
		{/each}
	</div>
</div>

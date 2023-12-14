<!-- MainComponent.svelte -->
<script>
	console.log('MainComponent loaded');
	import { onMount } from 'svelte';
	import { supabase } from '../../supabaseClient';
	import { getDrawerStore } from '@skeletonlabs/skeleton';

	export let getDraftOrder;
	const drawerStore = getDrawerStore();
	let draftOrder = []; // Initialize as an empty array
	let currentParticipantIndex = 0; // Index of the current participant
	let selectedPro = ''; // Store the selected pro here
	let countdownTime = '';
	let isDrafting = false;

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

			// Call getDraftOrder with draftOrder
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

	function startDrafting() {
		// Check if there are participants to put on the clock
		if (draftOrder.length > 0) {
			// Put the current participant on the clock
			const currentParticipant = draftOrder[currentParticipantIndex];
			console.log('Putting', currentParticipant.team_name, 'on the clock');

			// Add your logic to start the countdown for this participant here

			// Move to the next participant
			currentParticipantIndex++;
			if (currentParticipantIndex >= draftOrder.length) {
				currentParticipantIndex = 0; // Start from the beginning if all participants have taken their turns
			}
		}
	}

	function selectPro() {
		console.log('Select a pro');
	}

	onMount(() => {
		fetchFantasyTeams();
		// Start drafting once the data is fetched
		startDrafting();
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

	<!-- List of Team Names (Pro Table) -->
	<div class="absolute flex flex-row top-2 left-2 text-white">
		{#each draftOrder as team}
			<div class="mx-2">{team.team_name}</div>
		{/each}
	</div>

	<!-- Form for selecting a pro (Displayed above the table) -->
	<div class="bg-white w-full max-w-md p-4 rounded-lg shadow-lg mt-4">
		<h2 class="text-xl font-semibold mb-4">Select a Pro</h2>
		<form on:submit={selectPro}>
			<div class="mb-4">
				<label for="proName" class="block text-sm font-medium text-gray-700">Pro Name:</label>
				<input
					type="text"
					id="proName"
					class="mt-1 p-2 w-full rounded border border-gray-300"
					bind:value={selectedPro}
					required
				/>
			</div>
			<button
				type="submit"
				class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
				disabled={!isDrafting || countdownTime <= 0}>Draft</button
			>
		</form>
		<p class="mt-2 text-gray-500">Time remaining: {countdownTime} seconds</p>
	</div>
</div>

<!-- DraftOverlay.svelte -->
<script>
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { supabase } from '../../supabaseClient';

	const drawerStore = getDrawerStore();

	let draftOrder = [];
	let currentParticipantIndex = 0;
	let selectedPro = '';
	let countdownTime = '';
	let isDrafting = false;

	let pros = [];
	let teams = [];
	let loading = true;
	let loadingTeams = true;
	let error = null;
	let errorTeams = null;

	function closeDrawer() {
		drawerStore.close();
	}

	function shuffle(array) {
		let currentIndex = array.length,
			randomIndex;

		while (currentIndex != 0) {
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex--;

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
			if (Array.isArray(league[0].fantasy_teams_json)) {
				teamsArray = league[0].fantasy_teams_json;
			} else {
				console.log('Transforming fantasy_teams_json into an array');
				teamsArray = transformToArrayOfTeams(league[0].fantasy_teams_json);
			}

			draftOrder = shuffle(teamsArray);
			console.log('Shuffled Fantasy Teams:', draftOrder);

			draftOrder;
			console.log(draftOrder);
		} else {
			console.error('No league data found or fantasy_teams_json is missing');
		}
	}

	function transformToArrayOfTeams(data) {
		return Object.values(data);
	}

	function startDrafting() {
		if (draftOrder.length > 0) {
			const currentParticipant = draftOrder[currentParticipantIndex];
			console.log('Putting', currentParticipant.team_name, 'on the clock');

			currentParticipantIndex++;
			if (currentParticipantIndex >= draftOrder.length) {
				currentParticipantIndex = 0;
			}
		}
	}

	function selectPro() {
		console.log('Select a pro');
	}

	onMount(async () => {
		fetchFantasyTeams();
		try {
			// Fetching pros data and ordering by rank
			let { data: prosData, error: prosError } = await supabase
				.from('pros')
				.select('*')
				.order('rank', { ascending: true });

			if (prosError) throw prosError;

			// Fetching teams data
			let { data: teamsData, error: teamsError } = await supabase
				.from('teams')
				.select('team_id, name');

			if (teamsError) throw teamsError;

			// Storing the fetched data in variables
			pros = prosData;
			teams = teamsData;
		} catch (err) {
			error = err;
		} finally {
			loading = false;
			loadingTeams = false;
		}
	});
</script>

<div
	class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-50"
>
	<!-- Close button -->
	<button
		on:click={closeDrawer}
		class="absolute top-2 right-2 bg-white text-black px-4 py-2 rounded shadow-lg"
	>
		Close
	</button>

	<div class="flex flex-col items-center justify-center w-full">
		<!-- Participant List -->
		<div class="text-white mt-8">
			<h2 class="text-xl font-semibold mb-2">Draft Order:</h2>
			<div class="flex flex-row flex-wrap">
				{#each draftOrder as participant, index}
					<div class="mx-2">{index + 1}: {participant.team_name}</div>
				{/each}
			</div>
		</div>

		<!-- Form for selecting a pro -->
		<div class="w-full max-w-md p-4 rounded-lg shadow-lg mt-4 flex items-center">
			<form on:submit={selectPro} class="flex-grow">
				<div class="mb-4">
					<label for="proName" class="block text-sm font-medium text-white-700">Pro Name:</label>
					<input
						type="text"
						id="proName"
						class="mt-1 p-2 w-full rounded border border-gray-300"
						bind:value={selectedPro}
						required
					/>
				</div>
			</form>
			<button
				type="submit"
				class="bg-blue-500 text-white mt-2 px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
				disabled={!isDrafting || countdownTime <= 0}
			>
				Draft
			</button>
		</div>
		<p class="mt-2 text-white">Time remaining: {countdownTime} seconds</p>
	</div>

	<!-- Display pro details in a table -->
	<div class="overflow-auto max-h-[80vh] w-[90vw] bg-white rounded-lg p-4 mt-4">
		{#if loading || loadingTeams}
			<p class="text-black">Loading...</p>
		{:else if error || errorTeams}
			<p class="text-black">Error: {error?.message || errorTeams?.message}</p>
		{:else}
			<table class="min-w-full text-black">
				<thead>
					<tr class="text-left">
						<th>Rank</th>
						<th>Image</th>
						<th>Name</th>
						<th>Team</th>
					</tr>
				</thead>
				<tbody>
					{#each pros as pro}
						<tr>
							<td>{pro.rank}</td>
							<td>
								<img src={pro.pro_image_url} alt={pro.name} class="h-10 w-10 rounded-full" />
							</td>
							<td>{pro.name}</td>
							<td>{pro.team_id}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>
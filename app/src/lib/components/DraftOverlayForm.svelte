<script lang="ts">
	import GenerateMatchUps from '$lib/components/GenerateMatchUps.svelte';
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { supabase } from '../../supabaseClient'; // Adjust the path as necessary

	export let onGenerateMatchUps;
	const drawerStore = getDrawerStore();

	let pros = [];
	let teams = [];
	let loading = true;
	let loadingTeams = true;
	let error = null;
	let errorTeams = null;

	onMount(async () => {
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

	function closeDrawer() {
		drawerStore.close();
	}

	function getTeamName(teamId) {
		const team = teams.find((t) => t.team_id === teamId);
		return team ? team.name : 'Unknown';
	}
</script>

<div
	class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-95 flex justify-center items-center z-50"
>
	<!-- Close button -->
	<button on:click={closeDrawer}>Close</button>

	<!-- Table to display pros -->
	{#if loading || loadingTeams}
		<p>Loading...</p>
	{:else if error || errorTeams}
		<p>Error: {error?.message || errorTeams?.message}</p>
	{:else}
		<table>
			<!-- Table headers and rows as before -->
		</table>
	{/if}
</div>

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

	<!-- Display pro details in a table -->
	<div class="overflow-auto max-h-[80vh] w-[90vw] bg-white rounded-lg p-4">
		{#if loading || loadingTeams}
			<p class="text-black">Loading...</p>
		{:else if error || errorTeams}
			<p class="text-black">Error: {error?.message || errorTeams?.message}</p>
		{:else}
			<table class="min-w-full text-black">
				<thead>
					<tr class="text-left">
						<th>Rank</th>
						<!-- Moved Rank to the first position -->
						<th>Image</th>
						<!-- Moved Image next -->
						<th>Name</th>
						<!-- Moved Name to the third position -->
						<th>Team</th>
						<!-- Team remains the last -->
					</tr>
				</thead>
				<tbody>
					{#each pros as pro}
						<tr>
							<td>{pro.rank}</td>
							<!-- Rank first -->
							<td>
								<img src={pro.pro_image_url} alt={pro.name} class="h-10 w-10 rounded-full" />
							</td>
							<!-- Image next -->
							<td>{pro.name}</td>
							<!-- Name third -->
							<td>{getTeamName(pro.team_id)}</td>
							<!-- Team last -->
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

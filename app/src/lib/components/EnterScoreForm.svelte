<script lang="ts">
	import { supabase } from '../../supabaseClient'; // Make sure to import supabase

	let pros = [];
	let teams = [];
	let groups = [];

	// Fetch data for pros, teams, and groups
	async function fetchData() {
		try {
			let { data: prosData, error: prosError } = await supabase.from('pros').select('pro_id');

			let { data: teamsData, error: teamsError } = await supabase.from('teams').select('team_id');

			let { data: groupsData, error: groupsError } = await supabase
				.from('groups')
				.select('group_id');

			if (prosError) {
				console.error(prosError);
			} else {
				pros = prosData;
			}

			if (teamsError) {
				console.error(teamsError);
			} else {
				teams = teamsData;
			}

			if (groupsError) {
				console.error(groupsError);
			} else {
				groups = groupsData;
			}
		} catch (error) {
			console.error(error);
		}
	}

	fetchData();

	let startingHole = 1; // Modify this as needed
	let totalHoles = 18; // Modify this as needed
	let proId = null;
	let teamId = null;
	let groupId = null;
	let score = null;

	// Function to calculate holeNumber based on startingHole and totalHoles
	function calculateHoleNumber() {
		return startingHole + (parseInt(holeNumber) - 1);
	}

	async function handleSubmit() {
		if (!proId || !groupId || !score || isNaN(parseInt(score))) {
			alert('Please fill in all fields, and ensure the score is a valid number.');
			return;
		}

		const holeNum = calculateHoleNumber();

		// You can now use proId, teamId, groupId, holeNum, and score to insert into the database

		// Example:
		// const result = await insertScore(proId, teamId, groupId, holeNum, score);

		// Handle the result (success or error) as needed
		// alert(result);
	}
</script>

<main>
	<h2>Enter Score</h2>
	<form on:submit|preventDefault={handleSubmit}>
		<label for="proId">Pro ID:</label>
		<select id="proId" class="text-black" bind:value={proId}>
			{#each pros as pro}
				<option value={pro.pro_id}>{pro.pro_id}</option>
			{/each}
		</select>

		<label for="teamId">Team ID:</label>
		<select id="teamId" class="text-black" bind:value={teamId}>
			{#each teams as team}
				<option value={team.team_id}>{team.team_id}</option>
			{/each}
		</select>

		<label for="groupId">Group ID:</label>
		<select id="groupId" class="text-black" bind:value={groupId}>
			{#each groups as group}
				<option value={group.group_id}>{group.group_id}</option>
			{/each}
		</select>

		<label for="score">Score:</label>
		<input type="text" id="score" class="text-black" bind:value={score} />

		<button type="submit">Submit</button>
	</form>
</main>

<style>
	/* Add your CSS styles here if needed */
</style>

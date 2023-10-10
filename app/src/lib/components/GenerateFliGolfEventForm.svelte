<script lang="ts">
	import { supabase } from '../../supabaseClient.ts';
	import { onMount } from 'svelte';

	let startDate = '';
	let duration = 'singleday';
	let format = 'standard';
	let teamsList = [];

	async function generateEvent() {
		if (duration === 'singleday') {
			console.log(duration);
		}
		try {
			const { data, error } = await supabase.rpc('generate_golf_event', {
				p_startdate: startDate,
				p_duration: duration,
				p_format: format
			});

			if (error) throw error;

			// Handle success: Notify user, navigate, etc.
			alert(`Generated event with ID: ${data}`);
		} catch (error) {
			// Handle error
			console.error('Error generating event:', error.message);
		}
	}

	function handleSubmit() {
		generateEvent();
	}

	async function getTeams() {
		try {
			let { data: teams, error } = await supabase.from('teams').select('*');

			if (error) throw error;

			return teams; // Return the fetched teams
		} catch (error) {
			console.error('Error fetching teams: ', error.message);
			return null; // Return null or handle the error as per your requirements
		}
	}

	onMount(() => {
		getTeams().then((teams) => {
			teamsList = teams;
		});
	});
</script>

<div class="max-w-md mx-auto p-6 space-y-6">
	<h2 class="text-xl font-semibold">Generate Golf Event</h2>
	<form class="space-y-4" on:submit|preventDefault={handleSubmit}>
		<div>
			<label for="startDate" class="block text-sm font-medium">Start Date:</label>
			<input
				type="date"
				id="startDate"
				bind:value={startDate}
				class="mt-1 block w-full p-2 border rounded-md text-black"
				required
			/>
		</div>

		<div>
			<label for="duration" class="block text-sm font-medium">Duration:</label>
			<select
				id="duration"
				bind:value={duration}
				class="mt-1 block w-full p-2 border rounded-md text-black"
			>
				<option value="singleday">Single Day</option>
				<option value="multiday">Multi Day</option>
			</select>
		</div>

		<div>
			<label for="format" class="block text-sm font-medium">Format:</label>
			<select
				id="format"
				bind:value={format}
				class="mt-1 block w-full p-2 border rounded-md text-black"
			>
				<option value="standard">Standard</option>
				<option value="match">Match</option>
				<option value="playoff">Playoff</option>
				<option value="alternateshot">Alternate Shot</option>
			</select>
		</div>

		<button
			type="submit"
			class="w-full py-2 px-4 border rounded-md bg-blue-500 text-white hover:bg-blue-600"
			>Generate Event</button
		>
	</form>
</div>

<!-- src/routes/fantasy/FantasyEntryForm.svelte -->
<script lang="ts">
	let leagueName = '';

	// Function to handle form submission
	const handleSubmit = () => {
		// Implement your form submission logic here
		console.log(`Creating league: ${leagueName}`);
	};
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
	<div>
		<label for="leagueName" class="block text-sm font-medium text-white">League Name:</label>
		<input
			type="text"
			id="leagueName"
			bind:value={leagueName}
			placeholder="Example Name"
			class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
		/>
	</div>

	<button
		type="submit"
		class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
	>
		Create League
	</button>
</form>

<script>
	export let isButtonEnabled; // Accepts the isButtonEnabled prop

	function startDraft() {
		if (isButtonEnabled) {
			console.log('Draft started');
			// Logic to start the draft
		} else {
			console.log('Draft not ready to start yet');
		}
	}
</script>

<button
	class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
	on:click={startDraft}
	disabled={!isButtonEnabled}
>
	Start Draft
</button>

<style>
	/* Additional custom styles if needed */
</style>

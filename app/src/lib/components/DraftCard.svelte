<script>
	export let round;
	export let pick;
	export let teamName;
	export let proName;
</script>

<div class="draft-card bg-white shadow-lg rounded-lg p-4">
	<div class="text-xl font-semibold mb-2">Round {round}, Pick {pick}</div>
	<div class="text-gray-600">Team: {teamName}</div>
	<div class="text-gray-600">Pro: {proName}</div>
</div>

<style>
	/* Add any additional custom styles here */
</style>

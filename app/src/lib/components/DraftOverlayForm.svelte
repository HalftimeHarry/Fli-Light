<script lang="ts">
	import GenerateMatchUps from '$lib/components/generateMatchUps.svelte'; // Adjust path as necessary
	export let onGenerateMatchUps;

	// Additional script content if necessary
</script>

<div class="overlay">
	<!-- Include other UI elements related to the draft process -->
	<GenerateMatchUps {onGenerateMatchUps} />
</div>

<style>
	.overlay {
		/* Define your overlay styles here */
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5); /* Example semi-transparent background */
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>

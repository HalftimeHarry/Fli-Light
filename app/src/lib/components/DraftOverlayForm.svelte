<script>
	// ...other imports...
	import DraftOverlayForm from '$lib/components/DraftOverlayForm.svelte';

	let isDraftStarted = false;
	let showDraftOverlay = false;

</script>

<!-- Other HTML and components -->

{#if showDraftOverlay}
	<DraftOverlayForm />
{/if}

<button on:click={startDraft} disabled={isDraftStarted}> Start Draft </button>

<!-- Include other UI elements related to the draft process -->

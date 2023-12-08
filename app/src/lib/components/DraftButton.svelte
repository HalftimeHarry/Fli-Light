<script lang="ts">
    export let isButtonEnabled;
    export let onDraftStart;

    function startDraft() {
        console.log('Draft started');
        if (typeof onDraftStart === 'function') {
            onDraftStart(); // Call the passed function
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

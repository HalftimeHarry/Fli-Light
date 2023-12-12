<script lang="ts">
	export let isButtonEnabled: boolean;
	export let onDraftStart: () => void;
</script>

<button
	class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
	on:click={onDraftStart}
	disabled={!isButtonEnabled}
>
	Start Draft
</button>

<script lang="ts">
	import { scores } from '$lib/utilities/stores.js';
	import Icon from '@iconify/svelte';
	export let pro: string;

	function increment() {
		scores.update((currentScores) => {
			currentScores[pro] = (currentScores[pro] || 0) + 1;
			return currentScores;
		});
	}
</script>

<button on:click={increment} class="flex items-center justify-center p-2 bg-transparent hover:bg-gray-800 text-green-500">
	<Icon icon="zondicons:add-solid" class="h-6 w-6" />
	<span class="ml-2">Add</span>
</button>

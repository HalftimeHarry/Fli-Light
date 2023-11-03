<script lang="ts">
	import { scores } from '$lib/utilities/stores.js';
	import Icon from '@iconify/svelte';
	export let pro: string;

	function decrement() {
		scores.update((currentScores) => {
			if (currentScores[pro] != null && currentScores[pro] > 0) {
				currentScores[pro] -= 1;
			}
			return currentScores;
		});
	}
</script>

<button
	on:click={decrement}
	class="flex items-center justify-center p-2 bg-transparent hover:bg-gray-800 text-red-500"
>
	<Icon icon="carbon:subtract-alt" class="h-6 w-6" />
	<span class="ml-2">Subtract</span>
</button>

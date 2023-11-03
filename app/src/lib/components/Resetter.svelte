<script lang="ts">
	import { scores } from '$lib/utilities/stores.js';
	import Icon from '@iconify/svelte';
	export let pro: string;

	function reset() {
		scores.update((currentScores) => {
			if (currentScores.hasOwnProperty(pro)) {
				currentScores[pro] = 0;
			}
			return currentScores;
		});
	}
</script>

<button
	on:click={reset}
	class="flex items-center justify-center p-2 bg-transparent hover:bg-gray-800 text-blue-500"
>
	<Icon icon="fluent-mdl2:reset" class="h-6 w-6" />
	<span class="ml-2">Reset</span>
</button>

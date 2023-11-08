<script lang="ts">
	import { femaleA, femaleB, maleA, maleB } from '$lib/utilities/stores.js';
	import Icon from '@iconify/svelte';
	export let pro: string;

	function reset() {
		switch (pro) {
			case 'femaleA':
				femaleA.set(0);
				break;
			case 'femaleB':
				femaleB.set(0);
				break;
			case 'maleA':
				maleA.set(0);
				break;
			case 'maleB':
				maleB.set(0);
				break;
		}
	}
</script>

<button
	on:click={reset}
	class="flex items-center justify-center p-2 bg-transparent hover:bg-gray-800 text-blue-500"
>
	<Icon icon="fluent-mdl2:reset" class="h-6 w-6" />
	<span class="ml-2">Reset</span>
</button>

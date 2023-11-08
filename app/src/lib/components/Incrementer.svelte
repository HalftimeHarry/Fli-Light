<script lang="ts">
	import { femaleA, femaleB, maleA, maleB } from '$lib/utilities/stores.js';
	import Icon from '@iconify/svelte';
	export let pro: string;

	function increment(pro: string) {
		console.log('Increment function called', pro);
		switch (pro) {
			case 'femaleA':
				femaleA.update((n) => {
					console.log(`Current femaleA score: ${n}`);
					return n + 1;
				});
				break;
			case 'femaleB':
				femaleB.update((n) => {
					console.log(`Current femaleB score: ${n}`);
					return n + 1;
				});
				break;
			case 'maleA':
				maleA.update((n) => {
					console.log(`Current maleA score: ${n}`);
					return n + 1;
				});
				break;
			case 'maleB':
				maleB.update((n) => {
					console.log(`Current maleB score: ${n}`);
					return n + 1;
				});
				break;
		}
	}
</script>

<button
	on:click={() => increment('femaleA')}
	class="flex items-center justify-center p-2 bg-transparent hover:bg-gray-800 text-green-500"
>
	<Icon icon="zondicons:add-solid" class="h-6 w-6" />
	<span class="ml-2">Add</span>
</button>

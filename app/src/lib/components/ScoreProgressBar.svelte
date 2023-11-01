<script lang="ts">
	export let holes;
</script>

<ol class="items-center w-full space-y-4 sm:flex sm:space-x-8 sm:space-y-0">
	{#each holes as { hole_number, par }}
		<li class="flex items-center text-blue-600 dark:text-blue-500 space-x-2.5">
			<span
				class="flex items-center justify-center w-8 h-8 border border-blue-600 rounded-full shrink-0 dark:border-blue-500"
			>
				{hole_number}
			</span>
			<span>
				<h3 class="font-medium leading-tight">{hole_number}</h3>
				<p class="text-sm">Par: {par}</p>
			</span>
		</li>
	{/each}
</ol>

<style>
	/* Add your styling here */
</style>

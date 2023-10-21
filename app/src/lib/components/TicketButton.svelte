<script lang="ts">
	export let isUpcoming: boolean;
	export let isCompleted: boolean;
</script>

<button
	class="text-xs sm:text-sm md:text-base lg:text-lg px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-2 md:py-3 lg:py-4 rounded mr-2 {isUpcoming
		? 'bg-purple-500 hover:bg-purple-400'
		: isCompleted
		? 'bg-red-500 hover:bg-red-400'
		: 'bg-gray-500 hover:bg-gray-400'} text-white"
>
	{isUpcoming ? 'Buy Tickets' : isCompleted ? 'Results' : 'Default'}
</button>

<style>
	/* You can add additional styles for your button here */
</style>

<script lang="ts">
	export let name: string;
	export let gender: boolean = true;
	export let proImageUrl: string | null = null;
	export let team: string = 'No Team'; // New prop for the team name
	export let earnings: number = 0;
	export let points: number = 0;
</script>

<div class="border border-gray-300 rounded p-4 transition-shadow hover:shadow-md flex items-center">
	{#if proImageUrl}
		<img class="w-10 h-10 rounded-full object-cover mr-4" src={proImageUrl} alt="{name}'s image" />
	{/if}
	<div class="flex flex-col">
		<!-- Emphasize the team name in blue and uppercase. When ready, wrap in <a> tag -->
		<div class="text-green-500 mb-2 uppercase cursor-pointer hover:underline">
			<!-- Assuming a link will be provided later -->
			<a href={`#/${team}`}>{team}</a>
		</div>
		<div class="text-xl font-bold mb-2">{name}</div>
		<div class="text-gray-400">
			<div>{gender ? 'Male' : 'Female'}</div>
			<div>Earnings: ${earnings.toFixed(2)}</div>
			<div>{points} points</div>
		</div>
	</div>
</div>

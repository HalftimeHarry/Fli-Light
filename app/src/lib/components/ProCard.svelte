<script lang="ts">
	export let name: string;
	export let gender: boolean = true;
	export let proImageUrl: string | null = null;
	export let team: string = 'No Team';
	export let teamImageUrl: string | null = null;
	export let earnings: number = 0;
	export let points: number = 0;
</script>

<div class="border border-gray-300 rounded p-4 transition-shadow hover:shadow-md flex items-start">
	<div class="flex flex-col items-start justify-between mr-4">
		{#if teamImageUrl}
			<img class="w-12 h-12 rounded-sm object-cover mb-4" src={teamImageUrl} alt="{team} logo" />
		{/if}
		{#if proImageUrl}
			<img class="w-10 h-10 rounded-sm object-cover" src={proImageUrl} alt="{name}'s image" />
		{/if}
	</div>

	<div class="flex flex-col flex-grow">
		<div class="text-xl font-bold text-green-500 mb-2 uppercase cursor-pointer hover:underline">
			<a href={`#/${team}`}>{team}</a>
		</div>
		<div class="text-xl font-bold mb-2">{name}</div>
		<div class="text-gray-400">
			<div>Earnings: ${earnings.toFixed(2)}</div>
			<div>{points} points</div>
		</div>
	</div>
</div>

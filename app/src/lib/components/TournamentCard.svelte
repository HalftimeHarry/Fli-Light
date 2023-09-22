<script lang="ts">
	export let name: string;
	export let date: Date | null = null;
	export let tournamentImageUrl: string | null = null;
	export let venue: string = 'No Venue';
	export let sponsor: string = 'No Sponsor';
</script>

<div class="border border-gray-300 rounded p-4 transition-shadow hover:shadow-md flex items-center">
	{#if tournamentImageUrl}
		<img
			class="w-10 h-10 rounded-full object-cover mr-4"
			src={tournamentImageUrl}
			alt="{name}'s image"
		/>
	{/if}
	<div>
		<div class="text-xl font-bold mb-2">{name}</div>
		{#if date}<div class="text-gray-500">Date: {date}</div>{/if}
		<div class="text-gray-400">Venue: {venue}</div>
		<div class="text-gray-400">Sponsor: {sponsor}</div>
	</div>
</div>

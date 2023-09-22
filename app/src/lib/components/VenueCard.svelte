<script lang="ts">
	import SponsorCard from './SponsorCard.svelte'; // Make sure the path is correct

	export let name: string;
	export let location: string;
	export let venueImageUrl: string | null = null;
	export let sponsors: Array<any> = [];
</script>

<div class="border border-gray-300 rounded p-4 transition-shadow hover:shadow-md">
	{#if venueImageUrl}
		<img class="w-20 h-20 rounded object-cover mb-4" src={venueImageUrl} alt="{name}'s image" />
	{/if}
	<div class="text-2xl font-bold mb-2">{name}</div>
	<div class="text-xl mb-4">{location}</div>

	<!-- List of Sponsors -->
	<div>
		<div class="font-semibold mb-2">Sponsors:</div>
		{#each sponsors as sponsor}
			<SponsorCard
				name={sponsor.name}
				sponsorImageUrl={sponsor.sponsor_image_url}
				venueName={name}
			/>
		{/each}
	</div>
</div>

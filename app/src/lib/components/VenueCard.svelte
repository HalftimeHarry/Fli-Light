<script lang="ts">
	export let name: string;
	export let location: string;
	export let venueImageUrl: string | null = null;
</script>

<div class="border border-gray-300 rounded p-4 transition-shadow hover:shadow-md">
	{#if venueImageUrl}
		<img class="w-36 h-20 rounded object-cover mb-4" src={venueImageUrl} alt="{name}'s image" />
	{/if}
	<div class="flex flex-col">
		<!-- Emphasize the team name in blue and uppercase. When ready, wrap in <a> tag -->
		<div class="text-xl font-bold mb-2">{name}</div>
		<div class="text-gray-400">
			<div>Location: ${location}</div>
		</div>
	</div>
</div>

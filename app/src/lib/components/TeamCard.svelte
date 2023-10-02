<script lang="ts">
	export let name: string;
	export let teamImageUrl: string | null = null;
	export let points: number = 0;
</script>

<div class="border border-gray-300 rounded p-4 transition-shadow hover:shadow-md flex flex-col sm:flex-row items-center">
	{#if teamImageUrl}
		<!-- Image container to maintain a square aspect ratio -->
		<div class="relative w-18 h-18 mb-4 sm:mb-0 sm:mr-4">
			<img class="w-full h-full object-cover" src={teamImageUrl} alt="{name} team image" />
		</div>
	{/if}
	<div>
		<div class="text-xl font-bold">{name}</div>
		<div class="text-gray-400">{points} points</div>
	</div>
</div>


<!-- Removed the <style> tag since we're now using Tailwind CSS -->

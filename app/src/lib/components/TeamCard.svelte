<script lang="ts">
	export let name: string;
	export let teamImageUrl: string | null = null;
	export let points: number = 0;
</script>

<div class="border border-gray-300 rounded p-4 transition-shadow hover:shadow-md flex items-center">
	{#if teamImageUrl}
		<!-- Image container to maintain a square aspect ratio -->
		<div class="relative w-25 h-20">
			<!-- Increase size from w-16 h-16 to w-20 h-20 -->
			<img class="w-full h-full object-cover" src={teamImageUrl} alt="{name} team image" />
		</div>
	{/if}
	<div class="ml-4">
		<div class="text-xl font-bold">{name}</div>
		<div class="text-gray-400">{points} points</div>
	</div>
</div>

<!-- Removed the <style> tag since we're now using Tailwind CSS -->

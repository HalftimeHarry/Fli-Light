<script lang="ts">
	import { getTeamColors } from '$lib/utilities/teamColors.ts';

	export let name: string;
	export let teamImageUrl: string | null = null;
	export let points: number = 0;

	const { primary: primaryColor, outline: outlineColor } = getTeamColors(name);
</script>

<div
	style="border-color: {outlineColor};"
	class="rounded p-4 transition-shadow hover:shadow-md flex flex-col sm:flex-row items-center border"
>
	{#if teamImageUrl}
		<div class="relative w-20 h-20 mb-4 sm:mb-0 sm:mr-4">
			<img class="w-full h-full object-cover" src={teamImageUrl} alt="{name} team image" />
		</div>
	{/if}
	<div>
		<div style="color: {primaryColor};" class="text-xl font-bold">{name}</div>
		<div class="text-gray-400">{points} points</div>
	</div>
</div>

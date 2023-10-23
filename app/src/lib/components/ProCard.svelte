<script lang="ts">
	import { getTeamColors } from '$lib/utilities/teamColors';

	export let name: string;
	export let gender: boolean = true;
	export let proImageUrl: string | null = null;
	export let team: string = 'No Team';
	export let teamImageUrl: string | null = null;
	export let earnings: number = 0;
	export let points: number = 0;

	const { primary: primaryColor, outline: outlineColor } = getTeamColors(team);
</script>

<div
	class="border rounded p-4 transition-shadow hover:shadow-md flex items-start justify-start"
	style="border-color: {outlineColor};"
>
	{#if proImageUrl}
		<div class="flex flex-col items-center mr-4">
			<div class="text-lg font-bold mb-2" style="color: {primaryColor};">{name}</div>
			<img class="w-24 h-24 rounded-sm object-cover mb-2" src={proImageUrl} alt="{name}'s image" />
			<div class="text-gray-400">
				<div>Earnings: ${earnings.toFixed(2)}</div>
				<div>{points} points</div>
			</div>
		</div>
	{/if}

	<div class="flex flex-col flex-grow justify-between">
		{#if teamImageUrl}
			<div class="flex flex-col items-center mb-2">
				<img class="w-36 h-18 rounded-sm mb-2" src={teamImageUrl} alt="{team} logo" />
				<div
					class="text-sm font-semibold uppercase cursor-pointer hover:underline"
					style="color: {primaryColor};"
				>
					<a href={`#/${team}`}>{team}</a>
				</div>
			</div>
		{:else}
			<div
				class="text-sm font-semibold uppercase cursor-pointer hover:underline mt-6"
				style="color: {primaryColor};"
			>
				<a href={`#/${team}`}>{team}</a>
			</div>
		{/if}
	</div>
</div>

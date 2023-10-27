<script lang="ts">
	import { getTeamColors } from '$lib/utilities/teamColors';

	export let name: string;
	export let gender: boolean = true;
	export let rank: number = null;
	export let u_disc_link: string;
	export let proImageUrl: string | null = null;
	export let team: string = 'No Team';
	export let teamImageUrl: string | null = null;
	export let earnings: number = 0;
	export let points: number = 0;

	const worldRankingsIcon = '/White_World_Rankings_Icon.svg';
	const { primary: primaryColor, outline: outlineColor } = getTeamColors(team);
</script>

<div
	class="border rounded p-4 transition-shadow hover:shadow-md flex items-start justify-between"
	style="border-color: {outlineColor};"
>
	{#if proImageUrl}
		<div class="flex flex-col items-center">
			<div class="text-lg font-bold mb-2" style="color: {primaryColor};">{name}</div>
			<img class="w-24 h-24 rounded-sm object-cover mb-2" src={proImageUrl} alt="{name}'s image" />
			<div class="text-gray-400">
				<div>Earnings: ${earnings.toFixed(2)}</div>
				<div>{points} points</div>
			</div>
		</div>
	{/if}

	<div class="flex flex-col items-end">
		{#if teamImageUrl}
			<div class="flex flex-col items-center mb-2">
				<img class="w-12 h-18 rounded-sm mb-2" src={teamImageUrl} alt="{team} logo" />
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

		<div class="text-gray-400 ml-6">
			<div>
				<img class="inline-block h-4 mr-15" src={worldRankingsIcon} alt="World Rankings Icon" />
				World Ranking # {rank}
			</div>
		</div>
		<div class="text-gray-400">
			<div class="flex flex-col items-center mt-4">
				<!-- Other content... -->
				{#if u_disc_link}
					<a
						href={u_disc_link}
						target="_blank"
						rel="noopener noreferrer"
						class="flex flex-col items-center"
					>
						<img src="/u_disc_2.png" alt="UDisc Profile" width="60" height="60" class="mb-2" />
						<span class="text-sm">Player Profile</span>
					</a>
				{:else}
					<span>No UDisc Profile</span>
				{/if}
			</div>
		</div>
	</div>
</div>

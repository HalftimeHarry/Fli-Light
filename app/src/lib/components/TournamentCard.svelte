<script lang="ts">
	import { supabase } from '../../supabaseClient';
	import HoleDetails from '$lib/components/HoleDetails.svelte';
	import Pairing from '$lib/components/Pairings.svelte';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	export let name: string;
	export let date: Date | null = null;
	export let tournamentImageUrl: string | null = null;
	export let venue: string = 'No Venue';
	export let sponsor: string = 'No Sponsor';
	export let isCompleted: boolean = false;
	export let venueId: number | null = null;
	let holesDataArray: any[] = [];
	let holesData: any[] = [];
	let totalDistance: number | null = null;
	let totalPar: number | null = null;
	let groupData: any[] = [];

	interface TotalDistanceAndPar {
		total_distance: bigint; // Update to bigint if needed
		total_par: bigint; // Update to bigint if needed
	}

	let isCourseVisible = false; // To control the visibility of the holes list

	function toggleCourse(): void {
		isCourseVisible = !isCourseVisible;
		if (isCourseVisible) {
			showCourse();
			fetchAggregateValues();
		}
	}

	async function showCourse(): Promise<void> {
		try {
			if (!venueId) {
				throw new Error('Venue ID is not defined');
			}

			const { data, error } = await supabase.rpc('get_holes_by_venue_id', {
				venue_id_arg: venueId
			});

			if (error) {
				throw error;
			}

			holesData = data || []; // Save the fetched data to a local variable
		} catch (err) {
			console.error('Error fetching holes:', err.message || err);
		}
	}

	async function fetchAggregateValues(): Promise<void> {
		try {
			//... Previous code
			const { data, error } = await supabase.rpc('get_total_distance_and_par', {
				venue_id_arg: venueId
			});

			if (error) {
				console.error('Supabase Error:', error);
				throw error;
			}

			if (data && data.length > 0) {
				totalDistance = data[0].total_distance;
				totalPar = data[0].total_par;
			}
		} catch (err) {
			console.error('Error:', err.message || err);
		}
	}

	async function showGroups(): Promise<void> {
		console.log('Groups for:', name);

		try {
			const { data: groups, error: groupsError } = await supabase.from('groups').select('*');

			if (groupsError) {
				console.error('Error fetching groups:', groupsError.message);
				throw groupsError;
			}

			const enrichedGroups = [];

			for (const group of groups) {
				const teamIDs = await fetchTeamsByRef(group.group_pairing_ref);
				const teams = [];

				for (const teamID of teamIDs) {
					const team = await fetchTeamByID(teamID);
					teams.push(team);
				}

				enrichedGroups.push({
					...group,
					teams
				});
			}
			console.log('Enriched Groups:', enrichedGroups);
			groupData = enrichedGroups; // <-- Here, update the groupData array
		} catch (err) {
			console.error('Unexpected error in showGroups:', err.message);
		}
	}

	async function fetchTeamsByRef(ref) {
		try {
			const { data, error } = await supabase.rpc('in_group_fetch_teams_from_pairing', {
				group_pairing_ref: ref
			});

			if (error) {
				console.error('Error fetching teams using RPC:', error.message);
				throw error;
			}

			return data;
		} catch (err) {
			console.error('Unexpected error in fetchTeamsByRef:', err.message);
			throw err;
		}
	}

	async function fetchTeamByID(teamID) {
		try {
			const { data, error } = await supabase
				.from('teams')
				.select('*')
				.eq('team_id', teamID)
				.single();

			if (error) {
				console.error('Error fetching team by ID:', error.message);
				throw error;
			}

			return data;
		} catch (err) {
			console.error('Unexpected error in fetchTeamByID:', err.message);
			throw err;
		}
	}

	onMount(() => {
		fetchAggregateValues();
	});
</script>

<div
	class="border border-gray-300 rounded p-4 transition-shadow hover:shadow-md flex flex-col items-center text-center"
>
	{#if tournamentImageUrl}
		<img
			class="w-16 h-16 rounded-full object-cover mb-4"
			src={tournamentImageUrl}
			alt="{name}'s image"
		/>
	{/if}
	<div class="text-xl font-bold mb-2">{name}</div>
	{#if date}<div class="text-gray-500">Date: {date}</div>{/if}
	<div class="text-gray-400">Venue: {venue}</div>
	<div class="text-gray-400">Sponsor: {sponsor}</div>

	{#if !isCompleted}
		<div class="flex mt-4 space-x-2">
			<button class="text-xs px-2 py-1 bg-blue-500 text-white rounded" on:click={showGroups}>
				Groups
			</button>
			<button class="text-xs px-2 py-1 bg-green-500 text-white rounded" on:click={toggleCourse}>
				{isCourseVisible ? 'Back' : 'Course'}
			</button>
		</div>
	{:else}
		<div class="flex mt-4 space-x-2">
			<button class="text-xs px-2 py-1 bg-red-500 text-white rounded" on:click={showResults}>
				Results
			</button>
		</div>
	{/if}
	{#if holesData.length > 0 && isCourseVisible}
		{#if totalDistance != null && totalPar != null}
			<div class="mt-4 mb-4">
				<p>Total Distance: {totalDistance}</p>
				<p>Total Par: {totalPar}</p>
			</div>
		{:else}
			<p>Loading totals...</p>
		{/if}
		<Accordion>
			{#each holesData as hole}
				<AccordionItem>
					<svelte:fragment slot="lead" />
					<svelte:fragment slot="summary">
						Hole -{hole.hole_number}
					</svelte:fragment>
					<svelte:fragment slot="content">
						<HoleDetails holeData={hole} />
					</svelte:fragment>
				</AccordionItem>
			{/each}
		</Accordion>
	{/if}

	{#if groupData && groupData.length > 0}
		<Accordion>
			{#each groupData as group (group.group_id)}
				<!-- Assuming each group has an id property for key -->
				<AccordionItem>
					<svelte:fragment slot="summary">
						{group.group_name}
					</svelte:fragment>
					<svelte:fragment slot="content">
						{#if group.teams && group.teams.length > 0}
							{#each group.teams as team}
								<div class="flex items-center space-x-4">
									{#if team.team_image_url}
										<img src={team.team_image_url} alt={team.name} class="team-img" />
									{/if}
									<p>{team.name}</p>
								</div>
							{/each}
						{:else}
							<p>No teams for this group.</p>
						{/if}
					</svelte:fragment>
				</AccordionItem>
			{/each}
		</Accordion>
	{/if}
</div>

<style>
	.team-img {
		border-radius: 50%; /* round image */
		width: 50px;
		height: 50px;
	}
</style>

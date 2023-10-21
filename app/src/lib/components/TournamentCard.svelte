<script lang="ts">
	import { supabase } from '../../supabaseClient';
	import HoleDetails from '$lib/components/HoleDetails.svelte';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { ConicGradient } from '@skeletonlabs/skeleton';
	import type { ConicStop } from '@skeletonlabs/skeleton';
	import TicketButton from '$lib/components/TicketButton.svelte'; // Import the TicketButton component

	export let name: string;
	export let date: Date | null = null;
	export let tournamentImageUrl: string | null = null;
	export let venue: string = 'No Venue';
	export let sponsor: string = 'No Sponsor';
	export let isCompleted: boolean = false;
	export let venueId: number | null = null;
	export let isUpcoming: boolean; // Add this line to accept isUpcoming as a prop
	let holesDataArray: any[] = [];
	let holesData: any[] = [];
	let totalDistance: number | null = null;
	let totalPar: number | null = null;
	let groupData: any[] = [];
	let isLoading = false;

	interface TotalDistanceAndPar {
		total_distance: bigint; // Update to bigint if needed
		total_par: bigint; // Update to bigint if needed
	}

	let isCourseVisible = false; // To control the visibility of the holes list
	let isGroupVisible = false; // To control the visibility of the groups list

	function toggleGroup(): void {
		isGroupVisible = !isGroupVisible;
		if (isGroupVisible) {
			showGroups();
		} else {
			location.reload();
		}
	}

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
		isLoading = true;
		console.log('Fetching groups for:', name);

		try {
			const { data: groups, error: groupsError } = await supabase.from('groups').select('*');

			if (groupsError) {
				console.error('Error fetching groups:', groupsError.message);
				throw groupsError;
			}

			console.log('Fetched groups:', groups);

			const enrichedGroups = [];

			for (const group of groups) {
				const teamIDs = await fetchTeamsByRef(group.group_pairing_ref);
				console.log(`Fetched team IDs for group ${group.group_name}:`, teamIDs);

				const teams = [];

				for (const teamID of teamIDs) {
					const team = await fetchTeamByID(teamID);
					console.log(`Fetched team data for team ID ${teamID}:`, team);

					// Fetch pros for this team
					const pros = await fetchProsByTeamID(teamID);
					console.log(`Fetched pros for team ID ${teamID}:`, pros);

					team.pros = pros; // Add pros data to the team object

					teams.push(team);
				}

				enrichedGroups.push({
					...group,
					teams
				});
			}

			console.log('Final enriched groups:', enrichedGroups);

			groupData = enrichedGroups; // <-- Update the groupData array
			isLoading = false; // Fetching completed
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

	async function fetchProsByTeamID(teamID: number): Promise<any[]> {
		try {
			const { data, error } = await supabase.from('pros').select('*').eq('team_id', teamID);

			if (error) {
				console.error('Error fetching pros by team ID:', error.message);
				throw error;
			}

			return data || [];
		} catch (err) {
			console.error('Unexpected error in fetchProsByTeamID:', err.message);
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
	<TicketButton {isUpcoming} isCompleted={!isUpcoming} />
	{#if tournamentImageUrl}
		<img
			class="w-16 h-16 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 object-contain mb-4 mt-4"
			src={tournamentImageUrl}
			alt="{name}'s image"
		/>
	{/if}
	<div class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{name}</div>
	{#if date}<div class="text-gray-500 text-sm sm:text-base md:text-lg lg:text-xl">
			Date: {date}
		</div>{/if}
	<div class="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl">Venue: {venue}</div>
	<div class="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl">Sponsor: {sponsor}</div>

	{#if !isCompleted}
		<div class="flex mt-4 space-x-2">
			<button
				class="text-xs sm:text-sm md:text-base lg:text-lg px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-2 md:py-3 lg:py-4 bg-blue-500 text-white rounded"
				on:click={toggleGroup}
				disabled={isCourseVisible}
			>
				{isGroupVisible ? 'Back' : 'Group'}
			</button>
			<button
				class="text-xs sm:text-sm md:text-base lg:text-lg px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-2 md:py-3 lg:py-4 bg-green-500 text-white rounded"
				on:click={toggleCourse}
			>
				{isCourseVisible ? 'Back' : 'Course'}
			</button>
		</div>
	{:else}
		<div class="flex mt-4 space-x-2">
			<button
				class="text-xs sm:text-sm md:text-base lg:text-lg px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-2 md:py-3 lg:py-4 bg-red-500 text-white rounded"
				on:click={showResults}
			>
				Results
			</button>
		</div>
	{/if}

	<!-- Other code above... -->

	{#if isCourseVisible}
		{#if holesData.length > 0}
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
	{:else if isLoading}
		<div class="spinner" />
	{:else if groupData && groupData.length > 0}
		<Accordion>
			{#each groupData as group (group.group_id)}
				<AccordionItem>
					<svelte:fragment slot="summary">
						{group.group_name}
					</svelte:fragment>
					<svelte:fragment slot="content">
						<Accordion>
							{#each group.teams as team}
								<AccordionItem>
									<svelte:fragment slot="summary">
										<div class="flex items-center space-x-4">
											<img src={team.team_image_url} alt={team.team_name} class="team-img" />
											<p>{team.name}</p>
										</div>
									</svelte:fragment>
									<svelte:fragment slot="content">
										{#each team.pros as pro}
											<div class="flex items-center space-x-4">
												<img src={pro.pro_image_url} alt={pro.name} class="pro-img" />
												<p>{pro.name}</p>
											</div>
										{/each}
									</svelte:fragment>
								</AccordionItem>
							{/each}
						</Accordion>
					</svelte:fragment>
				</AccordionItem>
			{/each}
		</Accordion>
	{/if}

	<!-- Other code below... -->
</div>

<style>
	.team-img {
		border-radius: 50%; /* round image */
		width: 50px;
		height: 50px;
	}
	.pro-img {
		border-radius: 50%; /* round image */
		width: 40px;
		height: 40px;
	}
	.spinner {
		border: 4px solid rgba(255, 255, 255, 0.1);
		border-radius: 50%;
		border-top: 4px solid #ffffff;
		width: 40px;
		height: 40px;
		animation: spin 1s linear infinite;
		margin-top: 1.5rem; /* This equals to mt-6 in Tailwind CSS */
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>

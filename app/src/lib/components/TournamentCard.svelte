<script lang="ts">
	import { supabase } from '../../supabaseClient';
	import HoleDetails from '$lib/components/HoleDetails.svelte';
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
		console.log('Venue:', venue);
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

			console.log('Holes for venue ID', venueId, ':', data);
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

			console.log('Returned Data:', data);

			if (error) {
				console.error('Supabase Error:', error);
				throw error;
			}
			
			if(data && data.length > 0) {
				totalDistance = data[0].total_distance;
				totalPar = data[0].total_par;
			}

		} catch (err) {
			console.error('Error:', err.message || err);
		}
	}

	function showPairings(): void {
		console.log('Pairings for:', name);
		// Your logic for showing pairings here...
	}

	function showResults(): void {
		console.log('Results for:', name);
		// Your logic for showing results here...
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
			<button class="text-xs px-2 py-1 bg-blue-500 text-white rounded" on:click={showPairings}>
				Pairings
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
</div>

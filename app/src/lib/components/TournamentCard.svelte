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
	export let venueId: string | null = null;
	let holesData: any[] = [];

	let isCourseVisible = false; // To control the visibility of the holes list

	function toggleCourse(): void {
		isCourseVisible = !isCourseVisible; // Toggle visibility
		if (isCourseVisible) {
			showCourse(); // Fetch and show holes data if it's being made visible
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

	function showPairings(): void {
		console.log('Pairings for:', name);
		// Your logic for showing pairings here...
	}

	function showResults(): void {
		console.log('Results for:', name);
		// Your logic for showing results here...
	}

	onMount(async () => {
		// Fetch your data here...
		// Example:
		holesData = [
			{ name: 'Hole 1', par: 3 },
			{ name: 'Hole 2', par: 4 }
			// More holes...
		];
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

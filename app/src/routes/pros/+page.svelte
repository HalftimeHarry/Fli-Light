<script lang="ts">
	import { onMount } from 'svelte';
	import ProCard from '$lib/components/ProCard.svelte';
	import TeamCard from '$lib/components/TeamCard.svelte';
	import { supabase } from '/workspace/Fli-Light/app/src/supabaseClient'; // Assuming you have a Supabase client setup

	let selectedTab: 'teams' | 'pros' = 'pros'; // changed to 'pros'
	let teams = [];
	let pros = [];
	let isLoading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			let response = await supabase.from('teams').select('*');
			if (response.error) throw response.error;
			teams = response.data;

			response = await supabase.from('pros').select('*');
			if (response.error) throw response.error;
			pros = response.data;

			isLoading = false;
		} catch (err) {
			error = err.message;
			isLoading = false;
		}
	});
</script>

<div class="p-6">
	<h1 class="text-5xl sm:text-7xl md:text-9xl font-bold mb-4 uppercase">Standings</h1>

	<div class="flex flex-wrap space-x-4 mb-4">
		<!-- Pros button moved to the left -->
		<button
			class="flex-1 px-2 py-1 sm:px-4 sm:py-2"
			class:bg-blue-500={selectedTab === 'pros'}
			class:text-white={selectedTab === 'pros'}
			class:bg-gray-800={selectedTab !== 'pros'}
			on:click={() => (selectedTab = 'pros')}
		>
			Pros
		</button>
		<!-- Teams button -->
		<button
			class="flex-1 px-2 py-1 sm:px-4 sm:py-2"
			class:bg-blue-500={selectedTab === 'teams'}
			class:text-white={selectedTab === 'teams'}
			class:bg-gray-800={selectedTab !== 'teams'}
			on:click={() => (selectedTab = 'teams')}
		>
			Teams
		</button>
	</div>

	{#if isLoading}
		<p>Loading...</p>
	{:else if error}
		<p>{error}</p>
	{:else if selectedTab === 'teams'}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each teams as team}
				<TeamCard name={team.name} teamImageUrl={team.team_image_url} points={team.points} />
			{/each}
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each pros as pro}
				<ProCard
					name={pro.name}
					gender={pro.gender}
					proImageUrl={pro.pro_image_url}
					earnings={pro.earnings}
					points={pro.points}
				/>
			{/each}
		</div>
	{/if}
</div>

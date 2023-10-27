<script lang="ts">
    import { onMount } from 'svelte';
    import ProCard from '$lib/components/ProCard.svelte';
    import TeamCard from '$lib/components/TeamCard.svelte';
    import { supabase } from '../../supabaseClient';

    let selectedTab: 'teams' | 'pros' = 'pros';
    let teams: any[] = [];
    let pros = [];
    let isLoading = true;
    let error: string | null = null;

    onMount(async () => {
        try {
            const teamsResponse = await supabase.from('teams').select('*');
            const prosResponse = await supabase.from('pros').select('*');
            console.log(prosResponse);

            if (teamsResponse.error) throw teamsResponse.error;
            if (prosResponse.error) throw prosResponse.error;

            teams = teamsResponse.data;
            pros = prosResponse.data
                .map((pro) => {
                    const associatedTeam = teams.find((team) => team.team_id === pro.team_id);
                    return {
                        ...pro,
                        team: associatedTeam ? associatedTeam.name : 'No Team',
                        team_image_url: associatedTeam ? associatedTeam.team_image_url : null
                    };
                })
                .sort((a, b) => a.team.localeCompare(b.team));

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
        <button
            class="flex-1 px-2 py-1 sm:px-4 sm:py-2 transition duration-300 ease-in-out hover:bg-green-700 font-extrabold"
            class:bg-green-500={selectedTab === 'pros'}
            class:text-black={selectedTab === 'pros'}
            class:bg-gray-800={selectedTab !== 'pros'}
            on:click={() => (selectedTab = 'pros')}
        >
            Pros
        </button>
        <button
            class="flex-1 px-2 py-1 sm:px-4 sm:py-2 transition duration-300 ease-in-out hover:bg-green-700 font-extrabold"
            class:bg-green-500={selectedTab === 'teams'}
            class:text-black={selectedTab === 'teams'}
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            {#each pros as pro}
                <ProCard
                    name={pro.name}
                    gender={pro.gender}
                    proImageUrl={pro.pro_image_url}
                    rank={pro.rank}
                    u_disc_link={pro.u_disc_link}
                    team={pro.team}
                    teamImageUrl={pro.team_image_url}
                    earnings={pro.earnings}
                    points={pro.points}
                />
            {/each}
        </div>
    {/if}
</div>

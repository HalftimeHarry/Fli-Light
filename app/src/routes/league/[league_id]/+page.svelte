<script context="module">
    import { supabase } from '/workspace/Fli-Light/app/src/supabaseClient.ts';

    let { data: league, error } = await supabase.from('league').select('*');
    console.log(league);
    let leagueData = league[0];
    let registrationDeadline = new Date(leagueData.registration_deadline).toLocaleDateString();
</script>

{#if error}
    <p>Error loading league: {error}</p>
{:else if leagueData}
    <h1>League: {leagueData.league_name}</h1>
    <p>Created by: {leagueData.created_by}</p>
    <p>Draft Status: {leagueData.draft_status}</p>
    <p>Current Participants: {leagueData.current_participant_count}</p>
    <p>Entry Fee: ${leagueData.entry_fee}</p>
    <p>Total Rounds: {leagueData.total_rounds}</p>
    <p>Max Participants: {leagueData.max_participants}</p>
    <p>Registration Deadline: {registrationDeadline}</p>
    <p>Payment Model: {leagueData.payment_model}</p>

    {#if leagueData.is_crowdfunded}
        <p>Crowdfunding Progress: ${leagueData.crowdfunding_progress}</p>
        <!-- Display additional crowdfunding details and options -->
    {/if}

    {#if leagueData.fantasy_tournament_active}
        <!-- Display active fantasy tournament details -->
    {/if}

    {#if !leagueData.fantasy_team_count_met}
        <!-- Display options for joining or forming teams -->
    {/if}
{/if}

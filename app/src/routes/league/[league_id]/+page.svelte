<script context="module">
	import { supabase } from '/workspace/Fli-Light/app/src/supabaseClient.ts';

	let { data: league, error } = await supabase.from('league').select('*');
	console.log(league);
	let leagueData = league[0];
	// Function to count non-null league_participant fields
	function countNonNullParticipants(leagueData) {
		let participantFields = [
			'league_participant_1',
			'league_participant_2',
			'league_participant_3',
			'league_participant_4',
			'league_participant_5',
			'league_participant_6'
		];

		let count = 0;
		for (let field of participantFields) {
			if (leagueData[field] != null) {
				count++;
			}
		}
		return count;
	}

	// Calculate the number of non-null participants
	let nonNullParticipantCount = countNonNullParticipants(leagueData);
	let needed = nonNullParticipantCount - 6;
	let positiveValue = Math.abs(needed);
	console.log(needed);
</script>

{#if error}
	<p>Error loading league: {error}</p>
{:else if leagueData}
	<h1>League: {leagueData.league_name}</h1>
	<p>Created by: {leagueData.created_by}</p>
	<p>Draft Status: {leagueData.draft_status}</p>
	<p>
		Current Participants: {nonNullParticipantCount} of / {leagueData.current_participant_count}
	</p>

	{#if nonNullParticipantCount === leagueData.max_participants}
		<script>
			leagueData.fantasy_tournament_active = true;
			// Update league status in the database as needed
		</script>
		<!-- UI for active fantasy tournament -->
	{/if}

	{#if leagueData.fantasy_tournament_active}
		<p>A fantasy tournament is currently active.</p>
		<!-- Add more details or actions related to the active tournament -->
	{/if}

	{#if leagueData.invitations_sent}
		<p>Invitations have been sent out.</p>
		<!-- Additional UI for managing invitations -->
	{/if}

	{#if leagueData.fantasy_tournament_completed}
		<p>The fantasy tournament has been completed.</p>
		<!-- Display results or next steps after tournament completion -->
	{/if}

	{#if leagueData.is_crowdfunded}
		<p>Crowdfunding Progress: {leagueData.crowdfunding_progress}</p>
		<!-- Additional UI for crowdfunding details and contributions -->
	{/if}

	{#if !leagueData.league_started}
		<p>The league has not started yet. We need {positiveValue} Additional Participants</p>
		<!-- UI elements for pre-league start like joining, team formation, etc. -->
	{/if}

	{#if leagueData.league_started && !leagueData.fantasy_tournament_active}
		<p>The league is ongoing, but no fantasy tournament is active currently.</p>
		<!-- UI elements for ongoing league with no active tournament -->
	{/if}
{/if}

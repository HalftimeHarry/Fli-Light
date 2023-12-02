<script context="module">
	import { supabase } from '/workspace/Fli-Light/app/src/supabaseClient.ts';

	let { data: league, error } = await supabase.from('league').select('*');
	console.log(league);
	let leagueData = league[0];
	let userUUID; // UUID of the logged-in user

	// Define participantFields at the module level
	const participantFields = [
		'league_participant_1',
		'league_participant_2',
		'league_participant_3',
		'league_participant_4',
		'league_participant_5',
		'league_participant_6'
	];

	function countNonNullParticipants(leagueData) {
		return participantFields.reduce(
			(count, field) => (leagueData[field] != null ? count + 1 : count),
			0
		);
	}

	// Function to handle participant joining
	async function joinLeague(participantUUID) {
		let leagueId = leagueData.league_id;
		let updateField = participantFields.find((field) => leagueData[field] == null);

		if (updateField) {
			try {
				const updateData = { [updateField]: participantUUID };
				const { error: updateError } = await supabase
					.from('league')
					.update(updateData)
					.eq('league_id', leagueId);

				if (updateError) throw updateError;
				console.log(`Participant added to league in slot: ${updateField}`);
				leagueData[updateField] = participantUUID; // Update local data
			} catch (error) {
				console.error('Error joining league:', error);
			}
		} else {
			console.log('No available slots in the league');
		}
	}

	// Calculate the number of non-null participants
	let nonNullParticipantCount = countNonNullParticipants(leagueData);
	let needed = nonNullParticipantCount - 6;
	let positiveValue = Math.abs(needed);
	// Get the logged-in user's UUID
	const { data: userData } = await supabase.auth.getUser();
	userUUID = userData.user?.id;
</script>

<script>
	// Calculate the number of non-null participants
	$: nonNullParticipantCount = leagueData ? countNonNullParticipants(leagueData) : 0;
	$: additionalParticipantsNeeded = leagueData.max_participants - nonNullParticipantCount;
</script>

{#if error}
	<p>Error loading league: {error}</p>
{:else if leagueData}
	<!-- League Dashboard UI -->
	<h1>League: {leagueData.league_name}</h1>
	<p>Created by: {leagueData.created_by}</p>
	<p>Draft Status: {leagueData.draft_status}</p>
	<p>Current Participants: {nonNullParticipantCount} / {leagueData.max_participants}</p>

	{#if additionalParticipantsNeeded > 0}
		<p>We need {additionalParticipantsNeeded} additional participants.</p>
		{#if userUUID && !Object.values(leagueData).includes(userUUID)}
			<button on:click={() => joinLeague(userUUID)}>Join This League</button>
		{/if}
	{/if}

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
		{#if nonNullParticipantCount < leagueData.max_participants}
			<button on:click={() => joinLeague(userUUID)}>Join This League</button>
		{/if}
	{/if}

	{#if leagueData.league_started && !leagueData.fantasy_tournament_active}
		<p>The league is ongoing, but no fantasy tournament is active currently.</p>
		<!-- UI elements for ongoing league with no active tournament -->
	{/if}
	<!-- League dashboard UI -->
{/if}

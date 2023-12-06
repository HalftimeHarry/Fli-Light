<script context="module">
	import { supabase } from '../../../supabaseClient.ts';
	import { isFantasyParticipantJoinLeaguePopupVisible } from '$lib/utilities/fantasyParticipantJoinLeague.ts';
	import JoinLeaguePopup from '$lib/components/JoinLeaguePopup.svelte';
	import DraftCountdown from '$lib/components/DraftCountdown.svelte';
	import { leagueData } from '$lib/utilities/leagueDataForFantasyStore.ts';

	function openPopup() {
		isFantasyParticipantJoinLeaguePopupVisible.set(true);
	}

	// Define participantFields at the module level
	const participantFields = [
		'league_participant_1',
		'league_participant_2',
		'league_participant_3',
		'league_participant_4',
		'league_participant_5',
		'league_participant_6'
	];

	async function fetchNextFantasyTournament(leagueId) {
		let { data: fantasyTournaments, error } = await supabase
			.from('fantasy_tournaments')
			.select('start_date')
			.eq('league_id', leagueId)
			.order('start_date', { ascending: true })
			.limit(1);

		if (error) {
			console.error('Error fetching fantasy tournament start date:', error);
			return null;
		} else if (fantasyTournaments && fantasyTournaments.length > 0) {
			let firstTournamentStartDate = new Date(fantasyTournaments[0].start_date);
			let draftStartTime = new Date(firstTournamentStartDate.getTime());
			draftStartTime.setHours(draftStartTime.getHours() - 48); // 48 hours before the tournament start time
			return draftStartTime;
		} else {
			console.log('No upcoming fantasy tournaments found');
			return null;
		}
	}

	// Calculate the number of non-null participants
	let nonNullParticipantCount = countNonNullParticipants(leagueData);
	let needed = nonNullParticipantCount - 6;
	let positiveValue = Math.abs(needed);
	// Get the logged-in user's UUID
</script>

<script>
	import { onMount } from 'svelte';

	let userUUID, error;
	let draftStartTime = null; // Defined at the top level
	let leagueIdForCountdown;
	let isDraftTimeLoaded = false; // Local variable to control the display

	async function initializeData() {
		// Fetch league data
		let { data: league, fetchError } = await supabase.from('league').select('*');
		error = fetchError;
		if (!fetchError && league && league.length > 0) {
			leagueData = league[0];
			leagueIdForCountdown = leagueData.league_id;
			userUUID = (await supabase.auth.getUser()).data.user?.id;
			draftStartTime = await fetchNextFantasyTournament(leagueIdForCountdown);
			isDraftTimeLoaded = true; // Set to true after loading
		} else if (league && league.length > 0) {
			leagueData.set(league[0]); // Update the store
			// Additional logic...
		}
	}

	onMount(async () => {
		initializeData(); // Call the function inside onMount
		let { data: league, fetchError } = await supabase.from('league').select('*');
		error = fetchError;
		if (!fetchError && league && league.length > 0) {
			leagueData = league[0];
			leagueIdForCountdown = leagueData.league_id;
			userUUID = (await supabase.auth.getUser()).data.user?.id;
			draftStartTime = await fetchNextFantasyTournament(leagueIdForCountdown);
			isDraftTimeLoaded = true; // Set to true after loading
		}
	});

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

	// Reactive subscription
	$: subscribedLeagueData = $leagueData;
	// Reactive statement for debugging
	$: if (draftStartTime) console.log('Draft starts at:', draftStartTime);
	// Calculate the number of non-null participants
	$: nonNullParticipantCount = leagueData ? countNonNullParticipants(leagueData) : 0;
	$: additionalParticipantsNeeded = 6 - nonNullParticipantCount;
</script>

{#if error}
	<p>Error loading league: {error}</p>
{:else if leagueData}
	<!-- League Dashboard UI -->
	<h1>League: {leagueData.league_name}</h1>
	<p>Created by: {leagueData.created_by}</p>
	<p>Draft Status: {leagueData.draft_status}</p>
	<p>Current Participants: {nonNullParticipantCount} / {leagueData.max_participants}</p>

	{#if isDraftTimeLoaded}
		{#if draftStartTime}
			<DraftCountdown {draftStartTime} />
		{:else}
			<p>Loading draft countdown...</p>
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
		<p>This Fantasy Tournament is currently active.</p>
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

	{#if !leagueData.league_started && !leagueData.fantasy_tournament_active}
		<p>The league has not started yet. We need {positiveValue} Additional Participants</p>
		<!-- UI elements for pre-league start like joining, team formation, etc. -->
	{/if}

	{#if leagueData.league_started && !leagueData.fantasy_tournament_active}
		<p>The league is ongoing, but no fantasy tournament is active currently.</p>
		<!-- UI elements for ongoing league with no active tournament -->
	{/if}

	{#if $isFantasyParticipantJoinLeaguePopupVisible}
		<JoinLeaguePopup {userUUID} {leagueData} {participantFields} />
	{/if}

	{#if additionalParticipantsNeeded > 0}
		<p>We need {additionalParticipantsNeeded} more participants.</p>
		{#if userUUID && !Object.values(leagueData).includes(userUUID)}
			<button on:click={openPopup}>Join This League</button>
		{/if}
	{/if}
{/if}

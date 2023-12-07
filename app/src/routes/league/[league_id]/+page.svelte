<script context="module">
	import { supabase } from '../../../supabaseClient.ts';
	import { isFantasyParticipantJoinLeaguePopupVisible } from '$lib/utilities/fantasyParticipantJoinLeague.ts';
	import JoinLeaguePopup from '$lib/components/JoinLeaguePopup.svelte';
	import DraftCountdown from '$lib/components/DraftCountdown.svelte';

	function openPopup() {
		isFantasyParticipantJoinLeaguePopupVisible.set(true);
	}

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
			// Directly return the original tournament start date
			let firstTournamentStartDate = new Date(fantasyTournaments[0].start_date);
			return firstTournamentStartDate;
		} else {
			console.log('No upcoming fantasy tournaments found');
			return null;
		}
	}

	// Calculate the number of non-null participants
</script>

<script>
	import { onMount } from 'svelte';
	import { leagueData } from '$lib/utilities/leagueDataForFantasyStore.ts';

	// Define participantFields at the module level
	const participantFields = [
		'league_participant_1',
		'league_participant_2',
		'league_participant_3',
		'league_participant_4',
		'league_participant_5',
		'league_participant_6'
	];

	let userUUID, error;
	let draftStartTime = null; // Defined at the top level
	let leagueIdForCountdown;
	let isDraftTimeLoaded = false; // Local variable to control the display
	let nonNullParticipantCount = countNonNullParticipants(leagueData);
	let needed = nonNullParticipantCount - 6;
	let positiveValue = Math.abs(needed);
	$: subscribedLeagueData = $leagueData;

	async function initializeData() {
		// Fetch league data
		let { data: league, fetchError } = await supabase.from('league').select('*');
		error = fetchError;
		if (!fetchError && league && league.length > 0) {
			leagueData.set(league[0]);
			leagueIdForCountdown = $leagueData.league_id;
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
			leagueData.set(league[0]);
			leagueIdForCountdown = $leagueData.league_id;
			userUUID = (await supabase.auth.getUser()).data.user?.id;
			draftStartTime = await fetchNextFantasyTournament(leagueIdForCountdown);
			isDraftTimeLoaded = true; // Set to true after loading
		}
	});

	// Define countNonNullParticipants function here
	function countNonNullParticipants() {
		return participantFields.reduce(
			(count, field) => ($leagueData[field] != null ? count + 1 : count),
			0
		);
	}

	// Reactive statements and other component logic
	$: nonNullParticipantCount = $leagueData ? countNonNullParticipants() : 0;

	// Log for debugging
	$: console.log('Non-null participant count:', nonNullParticipantCount);

	// Calculate the number of non-null participants
	$: subscribedLeagueData = $leagueData;
	// Reactive statement for debugging
	$: if (draftStartTime) console.log('Draft starts at:', draftStartTime);
	$: additionalParticipantsNeeded = 6 - nonNullParticipantCount;
</script>

{#if error}
	<p>Error loading league: {error}</p>
{:else if subscribedLeagueData && Object.keys(subscribedLeagueData).length > 0}
	<!-- League Dashboard UI -->
	<h1>League: {subscribedLeagueData.league_name}</h1>
	<p>Created by: {subscribedLeagueData.created_by}</p>
	<p>Draft Status: {subscribedLeagueData.draft_status}</p>
	<p>Current Participants: {nonNullParticipantCount} / {subscribedLeagueData.max_participants}</p>

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
		<JoinLeaguePopup {userUUID} {participantFields} />
	{/if}

	{#if additionalParticipantsNeeded > 0}
		<p>We need {additionalParticipantsNeeded} more participants.</p>
		{#if userUUID && !Object.values(leagueData).includes(userUUID)}
			<button on:click={openPopup}>Join This League</button>
		{/if}
	{/if}
{/if}

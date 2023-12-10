<script context="module">
	import { supabase } from '../../../supabaseClient.ts';
	import { isFantasyParticipantJoinLeaguePopupVisible } from '$lib/utilities/fantasyParticipantJoinLeague.ts';
	import JoinLeaguePopup from '$lib/components/JoinLeaguePopup.svelte';
	import DraftCountdown from '$lib/components/DraftCountdown.svelte';
	import DraftButton from '$lib/components/DraftButton.svelte';
	import DraftOverlayForm from '$lib/components/DraftOverlayForm.svelte'; // Assuming this is the correct path
	import GenerateMatchUps from '$lib/components/generateMatchUps.svelte';
	import Icon from '@iconify/svelte';

	let draftStartTime; // Declare draftStartTime at the module level

	// Define participantFields at the module level
	const participantFields = [
		'league_participant_1',
		'league_participant_2',
		'league_participant_3',
		'league_participant_4',
		'league_participant_5',
		'league_participant_6'
	];

	function openPopup() {
		isFantasyParticipantJoinLeaguePopupVisible.set(true);
	}
</script>

<script>
	import { onMount } from 'svelte';
	import { leagueData } from '$lib/utilities/leagueDataForFantasyStore.ts';

	let showDraftOverlay = false;
	let isDiceRolling = false; // State to control the dice roll animation
	let showFirstDice = true;
	let isButtonEnabled = false;
	let userUUID, error;
	let onCountdownComplet;
	let leagueIdForCountdown;
	let isDraftTimeLoaded = false; // Local variable to control the display
	let hasLeagueBeenUpdated = false; // Flag to track if the update has been done
	let nonNullParticipantCount = countNonNullParticipants(leagueData);
	let needed = nonNullParticipantCount - 6;
	let positiveValue = Math.abs(needed);
	$: subscribedLeagueData = $leagueData;

	function startDraft() {
		console.log('Draft started');
		isDiceRolling = true;

		setTimeout(() => {
			isDiceRolling = false;
			// Trigger function in generateMatchUps component here
		}, 3000);
	}

	function handleDraftStart() {
		console.log('Draft process started');
		showDraftOverlay = true;
		// Include additional logic for starting the draft
		setTimeout(() => {
			showDraftOverlay = false; // Hide the overlay after some time or an event
		}, 3000); // Adjust time as per your needs
	}

	function startDiceRolling() {
		isDiceRolling = true;
		showFirstDice = true;

		const interval = setInterval(() => {
			showFirstDice = !showFirstDice; // Toggle between the two dice
		}, 500); // Adjust timing as needed

		setTimeout(() => {
			clearInterval(interval);
			isDiceRolling = false;
			// Any additional logic after dice roll
		}, 3000); // Total duration of dice roll
	}

	function onDraftStart() {
		console.log('Draft is starting');
		isDiceRolling = true; // Start the dice roll animation

		setTimeout(() => {
			isDiceRolling = false; // End the dice roll animation
			showDraftOverlay = true; // Show the DraftOverlayForm
		}, 1000); // Duration of your dice roll animation
	}

	function onGenerateMatchUps() {
		// Logic for generating matchups
		console.log('Generating matchups');
		// ... more logic ...
	}

	function onCountdownComplete() {
		isButtonEnabled = true; // Enable the button when countdown completes
		console.log('Countdown complete');
	}

	async function initializeData() {
		// Fetch league data
		let { data: league, fetchError } = await supabase.from('league').select('*');
		error = fetchError;
		if (!fetchError && league && league.length > 0) {
			leagueData.set(league[0]);
			leagueIdForCountdown = $leagueData.league_id;
			userUUID = (await supabase.auth.getUser()).data.user?.id;
			isDraftTimeLoaded = true; // Set to true after loading
		} else if (league && league.length > 0) {
			leagueData.set(league[0]); // Update the store
			// Additional logic...
		}
	}

	onMount(async () => {
		console.log('Received draft start time:', draftStartTime);
		initializeData(); // Call the function inside onMount
		let { data: league, fetchError } = await supabase.from('league').select('*');
		error = fetchError;
		if (!fetchError && league && league.length > 0) {
			leagueData.set(league[0]);
			leagueIdForCountdown = $leagueData.league_id;
			userUUID = (await supabase.auth.getUser()).data.user?.id;
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
	$: if (
		nonNullParticipantCount === 6 &&
		$leagueData.payment_model === 'full-all-6' &&
		!$leagueData.fantasy_tournament_active
	) {
		updateLeagueStatus();
	}

	async function updateLeagueStatus() {
		const updatePayload = {
			fantasy_tournament_active: true,
			league_started: true
		};

		const { error } = await supabase
			.from('league')
			.update(updatePayload)
			.eq('league_id', $leagueData.league_id);

		if (error) {
			console.error('Error updating league status:', error);
		} else {
			leagueData.update((data) => {
				return { ...data, ...updatePayload };
			});
			console.log('League status updated to Active, Fantasy Tournament set to active');
		}
	}

	// Log for debugging
	$: console.log('Non-null participant count:', nonNullParticipantCount);

	// Calculate the number of non-null participants
	$: subscribedLeagueData = $leagueData;
	// Reactive statement for debugging
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

	<DraftCountdown
		leagueId={$leagueData.league_id}
		{draftStartTime}
		on:countdownComplete={onCountdownComplete}
	/>
	<!-- Ensure onDraftStart is passed to DraftButton -->
	<DraftButton {isButtonEnabled} {onDraftStart} />

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

	{#if !$leagueData.league_started || !$leagueData.fantasy_tournament_active}
		<p>The league has not started yet. We need {positiveValue} Additional Participants</p>
	{/if}

	{#if $isFantasyParticipantJoinLeaguePopupVisible}
		<JoinLeaguePopup {userUUID} {participantFields} />
	{/if}

	{#if isDiceRolling}
		<div class="dice-icon">
			{#if showFirstDice}
				<Icon icon="ri:dice-fill" />
			{:else}
				<Icon icon="ri:dice-line" />
			{/if}
		</div>
	{/if}

	{#if showDraftOverlay}
		<DraftOverlayForm {onGenerateMatchUps} />
	{/if}

	{#if additionalParticipantsNeeded > 0}
		<p>We need {additionalParticipantsNeeded} more participants.</p>
		{#if userUUID && !Object.values(leagueData).includes(userUUID)}
			<button on:click={openPopup}>Join This League</button>
		{/if}
	{/if}
{/if}

<style>
	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-5px);
		}
		50% {
			transform: translateX(5px);
		}
		75% {
			transform: translateX(-5px);
		}
	}

    .dice-icon {
        animation: shake 0.5s ease-in-out;
        font-size: 48px; /* Example size, adjust as needed */
    }
</style>

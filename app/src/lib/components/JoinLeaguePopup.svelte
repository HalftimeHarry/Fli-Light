<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { leagueData } from '$lib/utilities/leagueDataForFantasyStore.ts'; // Import the store
	import { fetchNextFantasyTournament } from '$lib/utilities/fantasyTournamentUtils.js';

	// Exported props
	export let userUUID;
	export let leagueId;

	const dispatch = createEventDispatcher();
	let countdownTime = '';
	let interval;

	// Subscribe to the leagueData store
	$: subscribedLeagueData = $leagueData;

	onMount(async () => {
		if (!leagueId) {
			console.error('League ID is undefined or invalid.');
			countdownTime = 'Invalid league ID';
			return;
		}

		// Using leagueId from the store if it's not passed as a prop
		const effectiveLeagueId = leagueId || subscribedLeagueData.league_id;

		try {
			const startTime = await fetchNextFantasyTournament(effectiveLeagueId);
			if (startTime) {
				startCountdown(startTime);
			} else {
				countdownTime = 'No upcoming tournaments';
			}
		} catch (error) {
			console.error('Error fetching tournament:', error);
			countdownTime = 'Error loading tournament data';
		}
	});

	function startCountdown(startTime) {
		interval = setInterval(() => {
			const now = new Date();
			const timeLeft = startTime.getTime() - now.getTime();

			if (timeLeft <= 0) {
				clearInterval(interval);
				countdownTime = 'Draft is ready to start';
				dispatch('countdownComplete');
				return;
			}

			countdownTime = formatTimeLeft(timeLeft);
		}, 1000);
	}

	function formatTimeLeft(timeLeft) {
		// ... same as before ...
	}

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<main>
	{#if countdownTime}
		<p>Draft starts in: {countdownTime}</p>
	{:else}
		<p>Loading draft countdown...</p>
	{/if}
</main>

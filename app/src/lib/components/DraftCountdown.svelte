<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    import { fetchNextFantasyTournament } from '$lib/utilities/fantasyTournamentUtils.js';

    export let leagueId;
    export let draftStartTime;

    const dispatch = createEventDispatcher();
    let countdownTime = '';
    let interval;

    // Define formatTimeLeft here
    function formatTimeLeft(timeLeft) {
        const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
        const seconds = Math.floor((timeLeft / 1000) % 60);

        return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    }

    // startCountdown function using formatTimeLeft
    function startCountdown() {
        interval = setInterval(() => {
            const now = new Date();
            const timeLeft = new Date(draftStartTime).getTime() - now.getTime();

            if (timeLeft <= 0) {
                clearInterval(interval);
                countdownTime = 'Draft is ready to start';
                handleCountdownComplete();
                return;
            }

            countdownTime = formatTimeLeft(timeLeft);
        }, 7000);
    }

    onMount(async () => {
        if (!leagueId) {
            console.error('League ID is undefined or invalid.');
            countdownTime = 'Invalid league ID';
            return;
        }

        if (!draftStartTime || isNaN(new Date(draftStartTime).getTime())) {
            try {
                let fetchedStartTime = await fetchNextFantasyTournament(leagueId);
                if (fetchedStartTime) {
                    draftStartTime = new Date(fetchedStartTime);
                    startCountdown();
                } else {
                    countdownTime = 'No upcoming tournaments';
                }
            } catch (error) {
                console.error('Error fetching tournament:', error);
                countdownTime = 'Error loading tournament data';
            }
        } else {
            startCountdown();
        }
    });

    function handleCountdownComplete() {
        dispatch('countdownComplete');
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

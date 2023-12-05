<script lang="ts">
	import { onMount } from 'svelte';

	export let draftStartTime; // Expects a Date object
	let countdownTime = '';

	onMount(() => {
		startCountdown();
	});

	function startCountdown() {
		const interval = setInterval(() => {
			const now = new Date();
			const timeLeft = draftStartTime - now;

			if (timeLeft < 0) {
				clearInterval(interval);
				countdownTime = 'Draft has started';
				return;
			}

			countdownTime = formatTimeLeft(timeLeft);
		}, 1000);
	}

	function formatTimeLeft(timeLeft) {
		let hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
		let minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
		let seconds = Math.floor((timeLeft / 1000) % 60);

		return `${hours}h ${minutes}m ${seconds}s`;
	}
</script>

<main>
	{#if countdownTime}
		<p>Draft starts in: {countdownTime}</p>
	{:else}
		<p>Loading draft countdown...</p>
	{/if}
</main>

<script lang="ts">
	import { overlayStore } from '$lib/overlayStore';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	import { writable } from 'svelte/store';

	function closeOverlay() {
		overlayStore.set(false);
	}

	function handleOutsideClick(e) {
		if (e.target === e.currentTarget) {
			closeOverlay();
		}
	}
</script>

{#if $overlayStore}
	<div
		class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
		on:click={handleOutsideClick}
	>
		<div
			class="relative bg-white p-4 rounded-lg max-w-xl w-full overflow-y-auto"
			style="max-height: 80vh;"
		>
			<!-- Close button -->
			<button
				class="absolute top-0 right-0 m-2 text-gray-700 hover:text-gray-900"
				type="button"
				on:click={closeOverlay}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					class="h-6 w-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>

			<!-- Content of your popup -->
			<div class="text-black">
				<div class="mb-4">
					<img src="/blk_wt_fli_logo.png" alt="FLI GOLF League Logo" />
				</div>
				<p class="mb-4">
					FLI GOLF League is the first Disc Golf league in HISTORY to be built as a fantasy style
					exhibition tournament. Each league consists of 6 teams and 36 total players. FLI Fantasy
					is a head-to-head style format where each league can be constructed as a TEAMS VS. TEAMS
					or PLAYERS VS. PLAYERS.
				</p>
				<p class="mb-4">
					Regardless of which style your league chooses, the lowest total team score wins the
					matchup!
				</p>
				<h3 class="text-xl font-semibold mb-4">Here Is how it works:</h3>
				<p class="mb-4">
					6 players will register their league on FLIGOLF.COM. Two days before the tournament
					begins, there will be a randomly generated draft order and matchups. Each league member
					will choose players or teams in a snake style format through 6 rounds. The first 4 rounds
					are choosing your top men and women players or choosing teams with the final 2 rounds
					reserved for the backup (bench) players on the tour.
				</p>
				<p class="mb-4">
					Now that each team has 2 men and 2 women or 2 FLI GOLF teams chosen as well as a backup
					man and woman, the league is ready for live action! Follow along on the FLI GOLF Fantasy
					app in real time as the tournament takes place and watch your team score live. As it is in
					the actual game of Disc Golf, the team that has the lowest total score in the matchup
					wins. There is no money exchanged or gambled through FLI Golf Fantasy. Any money won or
					lost is the responsibility of the league members to coordinate and exchange off the app.
				</p>
				<p class="mb-4">
					Is this a very basic Fantasy league? Yes, it is. However, it is also the only platform in
					the world that the over 10-million disc golfers worldwide can interact and enjoy their
					favorite sport and favorite players in a fantasy style competition format. I believe this
					is what the major sports books need to see operational before they decide to create lines
					and get in on the Disc Golf Fantasy action. Also, at $300 per league for the year, it is
					an additional revenue stream for the league with very little overhead to maintain.
				</p>
			</div>
			<div class="absolute bottom-0 right-0 mr-4 mb-4">
				<button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
					Sign Up
				</button>
			</div>
		</div>
	</div>
{/if}

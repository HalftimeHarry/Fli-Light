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
			class="relative bg-white p-4 rounded-lg max-w-xl w-full overflow-y-auto flex flex-col"
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
			<div class="text-black flex-grow">
				<div class="mb-4">
					<img src="/blk_wt_fli_logo.png" alt="FLI GOLF League Logo" />
				</div>
				<p class="mb-4">
					Get ready for a Disc Golf revolution unlike anything you&#39;ve ever seen before! FLI GOLF
					League proudly stands as the pioneer of fantasy-style exhibition tournaments in the
					history of Disc Golf. Picture this: six electrifying teams, 36 powerhouse players, and a
					fantasy format that will blow your mind! FLI Fantasy pits teams against each other,
					whether it&#39;s the epic clash of TEAMS VS. TEAMS or the thrilling showdown of PLAYERS
					VS. PLAYERS. Brace yourselves because in this exhilarating battle, the team with the
					lowest total score snatches not only victory but also THE PRIZE!
				</p>
				<p class="text-black mb-4 flex-grow" style="min-height: 0;">
					Regardless of which style your league chooses, the lowest total team score wins the
					matchup!
				</p>
				<h3 class="text-xl font-semibold mb-4">Here Is how it works:</h3>
				<p class="text-black mb-4 flex-grow" style="min-height: 0;">
					Six eager players dive into the heart-pounding action by registering their league on
					FLIGOLF.COM. Two days before the tournament unleashes its excitement, a buzz of
					anticipation fills the air as the draft order and matchups are randomly generated. The
					snake-style draft frenzy begins, spanning six intense rounds. The first four rounds see
					teams selecting their top men, women, or FLI GOLF teams, with the final two rounds
					dedicated to securing backup players for the ultimate strategy.
				</p>
				<p class="text-black mb-4 flex-grow" style="min-height: 0;">
					Now, with two men, two women, and backup players in tow, the league catapults into live
					action! Tune in to the pulse-pounding excitement on the FLI GOLF Fantasy app, where the
					tournament unfolds in real-time. Watch in awe as your team&#39;s score evolves, mirroring
					the fierce competition of actual Disc Golf. Just like in the real game, the team with the
					lowest total score emerges victorious, claiming ultimate glory.
				</p>
				<p class="text-black mb-4 flex-grow" style="min-height: 0;">
					But wait, there&#39;s more! FLI GOLF Fantasy isn&#39;t just about winning cash; it&#39;s
					about winning prestige and exclusive FLI GOLF gear worth up to $1,200! Each tournament
					brings a chance to score fantasy prizes, including the highly coveted college logo/FLI
					Golf logo collaboration shirts, unattainable anywhere else. Can you collect the entire
					college logo collection? Gather your league, rally your skills, and let the fantasy frenzy
					begin!
				</p>
				<p class="text-black mb-4 flex-grow" style="min-height: 0;">
					In the heart-pounding world of scoring, every legal throw earns a precious point. But
					beware, shots over par pack a punch with a 2x outcome. A bogie? That&#39;s an extra 2
					points; a double bogie? Prepare for a whopping 4 points added to your team&#39;s score! On
					the flip side, shots under par shave off 0.5 points per under par position.
				</p>
				<p class="text-black mb-4 flex-grow" style="min-height: 0;">
					Picture the thrill of recording a &quot;0&quot; on your scorecard after a hole-in-one on a
					par 3—that&#39;s the pinnacle of victory!
				</p>
				<p class="text-black mb-4 flex-grow" style="min-height: 0;">
					Some might call FLI GOLF Fantasy basic, but we call it a revolution! It&#39;s not just a
					game; it&#39;s a global phenomenon uniting over 10 million Disc Golfers worldwide in the
					ultimate fantasy sports adventure. This is what the world has been waiting for—the
					interactive Disc Golf experience sports books dream about! At just $300 per league for the
					entire year, it&#39;s your ticket to an adrenaline-packed adventure without breaking the
					bank. Disc Golf enthusiasts, this is your moment! Join us, embrace the thrill, and let FLI
					GOLF Fantasy redefine the way you experience your favorite sport!
				</p>
				<h1>Scoring Explanation:</h1>
				<p class="text-black mb-4 flex-grow" style="min-height: 0;">
					Each tournament will have 3 matchups that are randomly generated after the draft order is
					set. Just like the game of Disc Golf, the lowest total teams or players scores wins the 1
					on 1 matchup. Each league will have 3 winners per tournament. - Each legal throw counts as
					1(one) pt. - Shots OVER par record a 2x outcome. Example: A bogie in Disc Golf would
					typically record 1 additional point under par. In FLI Golf, a bogie will add 2(two) pts.
					to the team score. A double bogie would add 4(four) pts to the team score. - Shots UNDER
					par drop .5 pts off the total team score, per under par position. Example: If a player
					scores a birdie on a par 3, the player will only record 1.5 strokes for the hole instead
					of 2. If a player shoots a hole in 1 on a par 3, which is two shots under par (.5 pts x 2
					strokes under par = 1pt), the player will record THE COVETED “0” ON THEIR SCORE CARD! *All
					regular scoring rules apply to teams that have replacement players moved to an active
					position for a tournament.
				</p>
			</div>
			<div class="p-4">
				<button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded w-full">
					Sign Up
				</button>
			</div>
		</div>
	</div>
{/if}

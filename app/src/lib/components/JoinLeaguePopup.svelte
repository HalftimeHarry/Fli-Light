<!-- JoinLeaguePopup.svelte -->
<script lang="ts">
	import { isFantasyParticipantJoinLeaguePopupVisible } from '$lib/utilities/fantasyParticipantJoinLeague.ts';
	import { supabase } from '../../supabaseClient.ts';
	import Icon from '@iconify/svelte';
	import { leagueData } from '$lib/utilities/leagueDataForFantasyStore.ts'; // Import the store

	export let userUUID;
	export let participantFields; // Only as an exported prop

	let teamName = '';

	// Subscribe to the leagueData store
	$: subscribedLeagueData = $leagueData;

	function closePopup() {
		isFantasyParticipantJoinLeaguePopupVisible.set(false);
	}

	async function joinLeague() {
		let leagueId = $leagueData.league_id;
		console.log(leagueId);

		// Reverse the array to start checking from the end
		let reversedParticipantFields = [...participantFields].reverse();

		// Find the next available league participant slot in the reversed array
		let updateField = reversedParticipantFields.find((field) => $leagueData[field] == null);
		if (!updateField) {
			console.log('No available slots in the league');
			return;
		}

		try {
			// Update the league participant slot with the user UUID
			const participantUpdateData = { [updateField]: userUUID };

			// Prepare the fantasy_teams_json update
			let fantasyTeamsJson = leagueData.fantasy_teams_json || {};
			fantasyTeamsJson[updateField] = {
				owner_id: userUUID,
				team_name: teamName
				// Add other necessary properties for the team
			};

			// Combine both updates
			const updateData = {
				...participantUpdateData,
				fantasy_teams_json: fantasyTeamsJson
			};

			const { error: updateError } = await supabase
				.from('league')
				.update(updateData)
				.eq('league_id', leagueId);

			if (updateError) throw updateError;
			console.log(`Participant added to league in slot: ${updateField}`);
			leagueData[updateField] = userUUID; // Update local data for league participant
			leagueData.fantasy_teams_json = fantasyTeamsJson; // Update local data for fantasy teams
			closePopup();
		} catch (error) {
			console.error('Error joining league:', error);
		}
		// Check if the league is full and the payment model is 'full-all-6'
		const isLeagueFull = countNonNullParticipants(leagueData) === 6;
		const isFullPaymentModel = leagueData.payment_model === 'full-all-6';

		if (isLeagueFull && isFullPaymentModel) {
			// Update league_status to 'Active' and fantasy_tournament_active to true
			const updatePayload = {
				league_status: 'Active',
				fantasy_tournament_active: true
			};

			const { error: updateError } = await supabase
				.from('league')
				.update(updatePayload)
				.eq('league_id', leagueId);

			if (updateError) {
				console.error('Error updating league status and fantasy tournament:', updateError);
				return;
			}

			console.log('League status updated to Active, Fantasy Tournament set to active');
			leagueData.league_status = 'Active'; // Update local league data
			leagueData.fantasy_tournament_active = true; // Update local fantasy tournament data
		}

		closePopup();
	}

	function countNonNullParticipants(leagueData) {
		return participantFields.reduce(
			(count, field) => (leagueData[field] != null ? count + 1 : count),
			0
		);
	}

	function submitForm() {
		joinLeague();
	}
</script>

<div class="popup">
	<form on:submit|preventDefault={submitForm}>
		<input
			class="text-black"
			type="text"
			bind:value={teamName}
			placeholder="Enter Fantasy Team Name"
		/>
		<button type="submit">Join</button>
		<button class="ml-2" type="button" on:click={closePopup}
			><Icon icon="zondicons:close-solid" /></button
		>
	</form>
</div>

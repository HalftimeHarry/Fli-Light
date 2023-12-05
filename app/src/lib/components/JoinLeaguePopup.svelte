<!-- JoinLeaguePopup.svelte -->
<script lang="ts">
	import { isFantasyParticipantJoinLeaguePopupVisible } from '$lib/utilities/fantasyParticipantJoinLeague.ts';
	import { supabase } from '../../supabaseClient.ts';
	import Icon from '@iconify/svelte';

	export let userUUID;
	export let leagueData;
	export let participantFields; // Only as an exported prop, remove local definition

	let teamName = '';

	function closePopup() {
		isFantasyParticipantJoinLeaguePopupVisible.set(false);
	}

	async function joinLeague() {
		let leagueId = leagueData.league_id;

		// Find the next available league participant slot
		let updateField = participantFields.find((field) => leagueData[field] == null);
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

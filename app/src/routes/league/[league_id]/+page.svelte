<script context="module">
	import { supabase } from '/workspace/Fli-Light/app/src/supabaseClient.ts';

	let { data: league, error } = await supabase.from('league').select('*');
	console.log(league);
	let leagueId = league[0].league_id;
	let leagueName = league[0].league_name;
	let createdBy = league[0].created_by;
	let draftStatus = league[0].draft_status;
	let currentParticipantCount = league[0].current_participant_count.toString();
	let crowdfundingProgress = league[0].crowdfunding_progress;
	let entryFee = league[0].entry_fee;
	let totalRounds = league[0].total_rounds;
	let maxParticipants = league[0].max_participants;
	let registrationDeadline = new Date(league[0].registration_deadline).toLocaleDateString();
	let paymentModel = league[0].payment_model;
	// Other properties can be added similarly
</script>

{#if error}
	<p>Error loading league: {error}</p>
{:else if leagueId}
	<h1>League: {leagueName}</h1>
	<p>Created by: {createdBy}</p>
	<p>Draft Status: {draftStatus}</p>
	<p>Current Participants: {currentParticipantCount}</p>
	<p>Crowdfunding Progress: {crowdfundingProgress}</p>
	<p>Entry Fee: ${entryFee}</p>
	<p>Total Rounds: {totalRounds}</p>
	<p>Max Participants: {maxParticipants}</p>
	<p>Registration Deadline: {registrationDeadline}</p>
	<p>Payment Model: {paymentModel}</p>
	<!-- Add other properties here as needed -->
{/if}

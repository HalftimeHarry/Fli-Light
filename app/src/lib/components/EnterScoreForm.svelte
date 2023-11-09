<script lang="ts">
	import { supabase } from '../../supabaseClient';
	import { onMount } from 'svelte';

	let loading = true;
	let holes; // Define holes in a broader scope
	let score = { score_id: 0 /* ... other default values ... */ };
	let group; // Define group in a broader scope
	let female_pro_a_id;
	let male_pro_a_id;
	let female_pro_b_id;
	let male_pro_b_id;
	let team_b_id;
	let team_a_id;

	async function fetchData() {
		// Step 1: Fetch the scores
		const scorerUuid = 'ad74df33-97c6-4ce3-800c-8050eaf79d8f'; // Update this with the desired UUID
		const { data: scores, error: scoresError } = await supabase
			.from('scores')
			.select('*')
			.eq('score_scorer_uuid_ref', scorerUuid);

		// Check for any errors
		if (scoresError) {
			console.error('Error fetching scores:', scoresError);
			return;
		}

		// Log the score_group_id
		scores?.forEach((score) => {
			console.log(score.score_hole_start);
		});

		// If there's only one score, display its info in a form
		if (scores && scores.length === 1) {
			score = scores[0]; // Update the top-level score variable
			displayScoreForm(score);

			// Step 2: Fetch the referenced group
			const { data: group, error: groupError } = await supabase
				.from('groups')
				.select('*')
				.eq('group_id', score.score_group_id_ref)
				.single(); // Use single() to get a single record

			// Check for any errors
			if (groupError) {
				console.error('Error fetching group:', groupError);
				return;
			}

			// Log the referenced group
			console.log(group);

			// Step 3: Fetch the referenced pairing
			const { data: pairing, error: pairingError } = await supabase
				.from('pairings')
				.select('*')
				.eq('pairings_id', group.group_pairing_ref)
				.single(); // Use single() to get a single record

			// Check for any errors
			if (pairingError) {
				console.error('Error fetching pairing:', pairingError);
				return;
			}

			// Log the referenced pairing
			console.log(pairing);

			// Step 3.1: Fetch team_a
			const { data: team_a, error: team_aError } = await supabase
				.from('teams')
				.select('*')
				.eq('team_id', pairing.team_a)
				.single(); // Use single() to get a single record

			// ...
			team_a_id = team_a.team_id;
			console.log(team_a_id);

			// Step 3.2: Fetch team_b
			const { data: team_b, error: team_bError } = await supabase
				.from('teams')
				.select('*')
				.eq('team_id', pairing.team_b)
				.single(); // Use single() to get a single record

			// ...
			team_b_id = team_b.team_id;
			console.log(team_b_id);

			// Step 3.3: Fetch team_a_pros
			const { data: team_a_pros, error: team_a_prosError } = await supabase
				.from('pros')
				.select('*')
				.eq('team_id', team_a.team_id);

			// Check for any errors
			if (team_a_prosError) {
				console.error('Error fetching team_a pros:', team_a_prosError);
				return;
			}

			// Log the referenced team_a_pros
			console.log(team_a_pros);
			female_pro_a_id = team_a_pros[0].pro_id;
			console.log(female_pro_a_id);
			male_pro_a_id = team_a_pros[1].pro_id;
			console.log(male_pro_a_id);

			// Step 3.4: Fetch team_b_pros
			const { data: team_b_pros, error: team_b_prosError } = await supabase
				.from('pros')
				.select('*')
				.eq('team_id', team_b.team_id);

			// Check for any errors
			if (team_b_prosError) {
				console.error('Error fetching team_b pros:', team_b_prosError);
				return;
			}

			console.log(team_b_pros);
			female_pro_b_id = team_b_pros[0].pro_id;
			console.log(female_pro_b_id);
			male_pro_b_id = team_b_pros[1].pro_id;
			console.log(male_pro_b_id);

			// Log the referenced team_b_pros
			console.log(team_b_pros);

			// Step 4: Fetch the referenced tournament
			const { data: tournament, error: tournamentError } = await supabase
				.from('tournaments')
				.select('*')
				.eq('tournament_id', pairing.tour_ref)
				.single(); // Use single() to get a single record

			// Check for any errors
			if (tournamentError) {
				console.error('Error fetching tournament:', tournamentError);
				return;
			}

			// Log the referenced tournament
			console.log(tournament);

			// Step 5: Fetch the referenced venue
			const { data: venue, error: venueError } = await supabase
				.from('venues')
				.select('*')
				.eq('venue_id', tournament.venue_id)
				.single(); // Use single() to get a single record

			// Check for any errors
			if (venueError) {
				console.error('Error fetching venue:', venueError);
				return;
			}

			// Log the referenced venue
			console.log(venue);

			// Step 6: Fetch the referenced holes
			const { data, error: holesError } = await supabase
				.from('holes')
				.select('*')
				.eq('venue_id', venue.venue_id) // Use the venue_id to filter holes
				.eq('not_using', false); // Filter out holes where not_using is true

			// Check for any errors
			if (holesError) {
				console.error('Error fetching holes:', holesError);
				return;
			}

			// Assign the fetched holes data to the holes variable
			holes = data;

			// Log the referenced holes
			console.log(holes);

			const detailedScores = buildDetailedScores(
				holes,
				score,
				group,
				female_pro_a_id,
				male_pro_a_id,
				female_pro_b_id,
				male_pro_b_id,
				team_b_id,
				team_a_id
			);
			console.log(detailedScores);
		}
	}

	function displayScoreForm(score) {
		// TODO: Implement this function to display the score info in a form
	}

	async function updateDetailedScores(score_id, detailedScores) {
		console.log(
			'updateDetailedScores started with score_id:',
			score_id,
			'and detailedScores:',
			detailedScores
		);

		// Convert detailedScores to a JSON string if it's an object
		const updatedScores =
			typeof detailedScores === 'object' ? JSON.stringify(detailedScores) : detailedScores;
		console.log('Updated scores (after JSON.stringify if needed):', updatedScores);

		// Update the scores in the database
		const { data, error } = await supabase
			.from('scores')
			.update({ detailed_scores: updatedScores }) // Updated from buildDetailedScores to updatedScores
			.eq('score_id', score_id);

		// Handle any errors that occurred during the update
		if (error) {
			throw new Error('Error updating detailed scores: ' + error.message); // Throw error to be caught in the calling function
		}

		// Log the updated scores this returns null fix later
		console.log('Updated detailed scores:', data);

		// Return the updated scores data
		return data;
	}

	function buildDetailedScores(
		holes,
		score,
		group,
		female_pro_a_id,
		male_pro_a_id,
		female_pro_b_id,
		male_pro_b_id,
		team_b_id,
		team_a_id
	) {
		console.log('buildDetailedScores started with holes:', holes);
		console.log('buildDetailedScores started with score:', score);
		console.log('buildDetailedScores started with group:', group);
		console.log('buildDetailedScores started with group:', female_pro_a_id);
		console.log('buildDetailedScores started with group:', male_pro_a_id);
		console.log('buildDetailedScores started with group:', female_pro_b_id);
		console.log('buildDetailedScores started with group:', male_pro_b_id);
		console.log('buildDetailedScores started with group:', team_b_id);
		console.log('buildDetailedScores started with group:', team_a_id);

		const detailedScores = {};
		holes.forEach((hole) => {
			detailedScores[hole.hole_id] = {
				det_sco_par: hole.par,
				det_sco_hole_number: hole.hole_number,
				det_sco_group_name: group.group_name,
				det_sco_group_tee_time: group.tee_time,
				det_sco_female_a: female_pro_a_id,
				det_sco_male_a: male_pro_a_id,
				det_sco_female_b: female_pro_b_id,
				det_sco_male_b: male_pro_b_id,
				det_sco_team_b_id: team_b_id,
				det_sco_team_a_id: team_a_id,
				det_sco_verified_this_hole: false,
				det_sco_female_a_scored: 0,
				det_sco_male_a_scored: 0,
				det_sco_female_b_scored: 0,
				det_sco_male_b_scored: 0,
				det_sco_hole_start: score.score_hole_start,
				det_sco_completed_this_hole: false,
				det_sco_on_this_hole: false,
				det_sco_was_last_hole_updated: false,
				det_sco_this_is_the_upcoming_hole: false,
				det_sco_updating_hole: false,
				det_sco_this_is_the_final_hole: false
				// ... add any other group properties you want to include
			};
		});

		console.log('Detailed scores (after processing holes and group):', detailedScores);
		updateDetailedScores(score.score_id, detailedScores);
		return detailedScores;
	}

	async function handleClick(group) {
		console.log('clicked');
		console.log('group:', group); // Add this line
		if (!score || !score.score_hole_start) {
			console.error('Score is not defined or does not have score_hole_start property');
			return;
		}
		if (!group) {
			console.error('Group is not defined');
			return;
		}
		const detailedScores = buildDetailedScores(holes, score, group);
		console.log(detailedScores);
		try {
			const updatedScores = await updateDetailedScores(score.score_id, detailedScores);
			console.log('Scores updated successfully:', updatedScores);
		} catch (error) {
			console.error('Failed to update scores:', error);
		}
	}

	fetchData();

	onMount(async () => {
		console.log('onMount started');
		await fetchData();
		loading = false;
		console.log('onMount finished');
	});
</script>

<button
	class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
	on:click={handleClick}
>
	Start
</button>

<script lang="ts">
	import { supabase } from '../../supabaseClient';

	let holes; // Define holes in a broader scope

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

		// Log the score_group_id_ref for each score
		scores?.forEach((score) => {
			console.log(score.score_group_id_ref);
		});

		// If there's only one score, display its info in a form
		if (scores && scores.length === 1) {
			const score = scores[0];
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

			// Step 3.2: Fetch team_b
			const { data: team_b, error: team_bError } = await supabase
				.from('teams')
				.select('*')
				.eq('team_id', pairing.team_b)
				.single(); // Use single() to get a single record

			// ...

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
		}
	}

	function displayScoreForm(score) {
		// TODO: Implement this function to display the score info in a form
	}

function handleClick() {
    const detailedScores = buildDetailedScores(holes);
    console.log(detailedScores);
}

	function buildDetailedScores(holes) {
		// Process the array of holes and convert it into a JSON object
		const detailedScores = {};
		holes.forEach(hole => {
			detailedScores[hole.hole_id] = {
				par: hole.par,
				distance: hole.distance,
				// Add any other hole properties you want to include in the detailed scores
			};
		});
		return detailedScores;
	}

	fetchData();
</script>

<button
	class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
	on:click={handleClick}
>
	Start
</button>

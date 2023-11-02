<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '../../supabaseClient';

  async function fetchScoringData() {
    try {
      // Step 1: Fetch the scores
      const scorerUuid = 'aa6e4346-c20c-42cb-97b7-6770c563c4ff'; // Update this with the desired UUID
      const { data: scores, error: scoresError } = await supabase
        .from('scores')
        .select('*')
        .eq('score_scorer_uuid_ref', scorerUuid);

      if (scoresError) {
        throw scoresError;
      }

      console.log(scores); // Log the fetched scores

      // Log the detailed_scores property from the fetched data
      if (scores && scores[0] && scores[0].detailed_scores) {
        console.log(scores[0].detailed_scores);
      }
    } catch (error) {
      console.error('Error fetching scoring data:', error);
    }
  }

  onMount(() => {
    fetchScoringData();
  });
</script>

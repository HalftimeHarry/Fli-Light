<script>
	import { supabase } from '../../supabaseClient';
	import DraftOverlayForm from '$lib/components/DraftOverlayForm.svelte'; // Assuming this is the correct path

	export let onGenerateMatchUps;

    // Function to fetch fantasy teams data from the database
    async function fetchFantasyTeams() {
        let { data: league, error } = await supabase
            .from('league')
            .select('fantasy_teams_json');

        if (error) {
            console.error('Error fetching fantasy teams:', error);
            return; // Exit the function if there's an error
        }

        console.log('Fantasy teams data:', league);
        // Process the data as needed
        // You can call onGenerateMatchUps here or pass the data to it, depending on your logic
        onGenerateMatchUps(league); // Assuming you want to pass the fetched data to this function
    }

    // Call this function when the button is clicked
    function generateMatchUps() {
        fetchFantasyTeams();
        // You can include additional logic here if needed
    }
</script>

<button on:click={generateMatchUps}>Generate Matchups</button>
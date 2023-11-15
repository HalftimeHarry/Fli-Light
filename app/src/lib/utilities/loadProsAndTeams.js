import { supabase } from '../../supabaseClient'; // Adjust the import path as necessary

export async function loadProsAndTeams(proIds, teamIds) {
    let pros = [];
    let teams = [];

    // Validate the input arrays
    if (!Array.isArray(proIds) || !Array.isArray(teamIds)) {
        console.error('Invalid input: proIds and teamIds should be arrays');
        return { pros: [], teams: [] };
    }

    try {
        // Load specific pros based on passed IDs
        if (proIds.length > 0) {
            let prosResponse = await supabase.from('pros').select('*').in('pro_id', proIds);
            if (prosResponse.error) throw prosResponse.error;
            pros = prosResponse.data;
        }

        // Load specific teams based on passed IDs
        if (teamIds.length > 0) {
            let teamsResponse = await supabase.from('teams').select('*').in('team_id', teamIds);
            if (teamsResponse.error) throw teamsResponse.error;
            teams = teamsResponse.data;
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }

    return { pros, teams };
}

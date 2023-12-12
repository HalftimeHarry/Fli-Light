// fantasyTournamentUtils.js
import { supabase } from '../../supabaseClient'; // Adjust the path as per your project structure


export async function fetchNextFantasyTournament(leagueId) {
    console.log('Fetching tournament for league ID:', leagueId);
    let { data: fantasyTournaments, error } = await supabase
        .from('fantasy_tournaments')
        .select('start_date')
        .eq('league_id', leagueId)
        .order('start_date', { ascending: true })
        .limit(1);

    if (error) {
        console.error('Error fetching fantasy tournament start date:', error);
        return null;
    } else if (fantasyTournaments && fantasyTournaments.length > 0) {
        return new Date(fantasyTournaments[0].start_date);
    } else {
        console.log('No upcoming fantasy tournaments found');
        return null;
    }
}

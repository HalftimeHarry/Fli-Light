// src/types/FantasyTournament.ts

export interface FantasyTournament {
    fantasy_tournament_id: number;
    league_id: number | null;
    fantasy_tournament_name: string;
    start_date: Date | null;
    end_date: Date | null;
    status: string | null;  // Consider using an enum if you have a predefined set of statuses
    fantasy_tournament_details_json: JSON | null;  // Replace 'any' with a more specific type if you know the structure of this JSON
    created_at: Date | null;
    updated_at: Date | null;
}

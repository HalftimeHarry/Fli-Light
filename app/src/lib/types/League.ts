// src/types/League.ts
import type { StatusEnum, DraftStatusEnum } from '$lib/types/Enums.ts';

export interface League {
    league_id: number;
    league_name: string;
    created_by: string | null; // UUID
    status: StatusEnum | null;
    entry_fee: number | null;
    draft_status: DraftStatusEnum | null;
    fantasy_teams_json: JSON | null;
    current_round: number | null;
    total_rounds: number | null;
    fantasy_scores_json: JSON | null;
    results_json: JSON | null;
    prizes_json: JSON | null;
    created_at: Date | null;
    updated_at: Date | null;
    rules_json: JSON | null;
}

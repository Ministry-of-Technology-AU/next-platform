export interface MatchScore {
    id: number;
    match_name: string;
    league_name: string;
    sport?: string;
    match_status: 'upcoming' | 'live' | 'paused' | 'cancelled' | 'completed';
    date?: string;
    team_a_name: string;
    team_b_name: string;
    team_a_color?: string;
    team_b_color?: string;
    team_a_score: number;
    team_b_score: number;
    team_a_logo?: string;
    team_b_logo?: string;
    sets?: any; // JSON type in Strapi
    status?: string;
}

export interface MatchScoreResponse {
    data: MatchScore[];
    meta?: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

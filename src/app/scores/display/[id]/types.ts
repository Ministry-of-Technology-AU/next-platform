export interface AbstractScoreCard {
    label: string;
    valueA: string | number; // Top score (Team A)
    valueB: string | number; // Bottom score (Team B)
    highlight?: boolean;
    subtext?: string;
}

export interface Team {
    id: string;
    name: string;
    logoUrl: string;
    primaryColor?: string;
}

export interface MatchData {
    id: string;
    leagueName: string;
    matchTitle: string;
    sport: string;
    teamA: Team;
    teamB: Team;
    scoreA: number | string;
    scoreB: number | string;
    infoCards: AbstractScoreCard[];
    isLive: boolean;
}

'use server';

import { strapiGet, strapiPut, strapiPost } from './strapi';
import { MatchData } from '@/app/scores/display/[id]/types';
import { MATCH_SCORE_MODEL } from '@/lib/constants';

// Helper to transform Strapi response to MatchData
// Note: Adapting Strapi structure (attributes) to MatchData interface
const transformMatchData = (id: string, attributes: any): MatchData => {
    return {
        id: String(id),
        leagueName: attributes.league_name,
        matchTitle: attributes.match_name,
        sport: attributes.sport,
        isLive: attributes.match_status === 'live',
        teamA: {
            id: 'team_a',
            name: attributes.team_a_name,
            logoUrl: attributes.team_a_logo || '',
        },
        teamB: {
            id: 'team_b',
            name: attributes.team_b_name,
            logoUrl: attributes.team_b_logo || '',
        },
        scoreA: attributes.team_a_score || 0,
        scoreB: attributes.team_b_score || 0,
        infoCards: attributes.sets || [],
    };
};

export async function getMatch(id: string | number): Promise<MatchData | null> {
    const res = await strapiGet(`${MATCH_SCORE_MODEL}/${id}`);
    if (!res || !res.data) return null;
    return transformMatchData(res.data.id, res.data.attributes);
}

export async function updateMatch(id: string | number, data: Partial<MatchData>) {
    const payload: any = {};
    if (data.leagueName) payload.league_name = data.leagueName;
    if (data.matchTitle) payload.match_name = data.matchTitle;
    if (data.sport) payload.sport = data.sport;
    if (data.teamA?.name) payload.team_a_name = data.teamA.name;
    if (data.teamB?.name) payload.team_b_name = data.teamB.name;
    if (data.teamA?.logoUrl) payload.team_a_logo = data.teamA.logoUrl;
    if (data.teamB?.logoUrl) payload.team_b_logo = data.teamB.logoUrl;
    if (data.isLive !== undefined) payload.match_status = data.isLive ? 'live' : 'completed';
    if (data.infoCards) payload.sets = data.infoCards;

    return await strapiPut(`${MATCH_SCORE_MODEL}/${id}`, { data: payload });
}

export async function updateScore(id: string | number, scoreA: number, scoreB: number) {
    return await strapiPut(`${MATCH_SCORE_MODEL}/${id}`, {
        data: {
            team_a_score: scoreA,
            team_b_score: scoreB,
        },
    });
}

export async function endSet(id: string | number, currentSets: any[]) {
    return await strapiPut(`${MATCH_SCORE_MODEL}/${id}`, {
        data: {
            team_a_score: 0,
            team_b_score: 0,
            sets: currentSets
        },
    });
}

import { NextResponse } from 'next/server';
import { strapiGet } from '@/lib/apis/strapi';
import { unstable_cache } from 'next/cache';

interface LeaderboardEntry {
    rank: number;
    username: string;
    guesses: number;
    time: number;
    score: number;
}

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

// Calculate score: lower is better (guesses * 100 + time in seconds)
function calculateScore(guesses: number, time: number): number {
    return guesses * 100 + time;
}

// Cached leaderboard computation (60 seconds)
const getCachedLeaderboard = unstable_cache(
    async (date: string) => {
        // Fetch all users with wordle_data
        const usersResponse = await strapiGet('/users', {
            fields: ['username', 'wordle_data'],
            pagination: { pageSize: 10000 }
        });

        const users = usersResponse || [];
        const leaderboard: LeaderboardEntry[] = [];

        for (const user of users) {
            const wordleData = user.wordle_data;
            if (wordleData && wordleData[date] && wordleData[date].won) {
                const { guesses, time } = wordleData[date];
                leaderboard.push({
                    rank: 0,
                    username: user.username || 'Anonymous',
                    guesses: guesses.length,
                    time,
                    score: calculateScore(guesses.length, time)
                });
            }
        }

        // Sort by score (lower is better)
        leaderboard.sort((a, b) => a.score - b.score);

        // Assign ranks and take top 10
        return leaderboard.slice(0, 10).map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));
    },
    ['wordle-leaderboard'],
    { revalidate: 60 } // Cache for 60 seconds
);

/**
 * GET /api/platform/games/wordle/leaderboard
 * Returns top 10 players for today's puzzle (cached)
 */
export async function GET() {
    try {
        const today = getTodayDate();
        const leaderboard = await getCachedLeaderboard(today);

        return NextResponse.json({
            success: true,
            date: today,
            leaderboard
        });

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}

import { NextResponse } from 'next/server';
import { strapiGet } from '@/lib/apis/strapi';
import { unstable_cache } from 'next/cache';

interface LeaderboardEntry {
    rank: number;
    username: string;
    guesses: number;
    time: number;
    streak: number;
}

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
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
                // Get streak from top-level wordle_data.streak
                const streak = typeof wordleData.streak === 'number' ? wordleData.streak : 0;
                leaderboard.push({
                    rank: 0,
                    username: user.username || 'Anonymous',
                    guesses: guesses.length,
                    time,
                    streak
                });
            }
        }

        // Sort by guesses first (ascending), then by time (ascending) for ties
        leaderboard.sort((a, b) => {
            if (a.guesses !== b.guesses) {
                return a.guesses - b.guesses;
            }
            return a.time - b.time;
        });

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

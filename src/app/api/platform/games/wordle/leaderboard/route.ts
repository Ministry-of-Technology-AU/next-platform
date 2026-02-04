import { NextRequest, NextResponse } from 'next/server';
import { strapiGet } from '@/lib/apis/strapi';
import { unstable_cache } from 'next/cache';

interface ScoreLeaderboardEntry {
    rank: number;
    username: string;
    guesses: number;
    time: number;
}

interface StreakLeaderboardEntry {
    rank: number;
    username: string;
    currentStreak: number;
    maxStreak: number;
}

// Get today's date in YYYY-MM-DD format (India Standard Time)
function getTodayDate(): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

// Cached score leaderboard computation (60 seconds)
const getCachedScoreLeaderboard = unstable_cache(
    async (date: string) => {
        const usersResponse = await strapiGet('/users', {
            fields: ['username', 'wordle_data'],
            pagination: { pageSize: 10000 }
        });

        const users = usersResponse || [];
        const leaderboard: ScoreLeaderboardEntry[] = [];

        for (const user of users) {
            const wordleData = user.wordle_data;
            if (wordleData && wordleData[date] && wordleData[date].won) {
                const { guesses, time } = wordleData[date];
                leaderboard.push({
                    rank: 0,
                    username: user.username || 'Anonymous',
                    guesses: guesses.length,
                    time
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

        return leaderboard.slice(0, 10).map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));
    },
    ['wordle-leaderboard-score'],
    { revalidate: 60 }
);

// Cached streak leaderboard computation (60 seconds)
const getCachedStreakLeaderboard = unstable_cache(
    async () => {
        const usersResponse = await strapiGet('/users', {
            fields: ['username', 'wordle_data'],
            pagination: { pageSize: 10000 }
        });

        const users = usersResponse || [];
        const leaderboard: StreakLeaderboardEntry[] = [];

        for (const user of users) {
            const wordleData = user.wordle_data;
            const currentStreak = typeof wordleData?.streak === 'number' ? wordleData.streak : 0;
            const maxStreak = typeof wordleData?.maxStreak === 'number' ? wordleData.maxStreak : 0;

            // Only include users with at least some streak history
            if (currentStreak > 0 || maxStreak > 0) {
                leaderboard.push({
                    rank: 0,
                    username: user.username || 'Anonymous',
                    currentStreak,
                    maxStreak
                });
            }
        }

        // Sort by current streak (descending), then max streak (descending)
        leaderboard.sort((a, b) => {
            if (b.currentStreak !== a.currentStreak) {
                return b.currentStreak - a.currentStreak;
            }
            return b.maxStreak - a.maxStreak;
        });

        return leaderboard.slice(0, 10).map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));
    },
    ['wordle-leaderboard-streak'],
    { revalidate: 60 }
);

/**
 * GET /api/platform/games/wordle/leaderboard
 * Query params:
 *   - type: 'score' (default) | 'streak'
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'score';
        const today = getTodayDate();

        if (type === 'streak') {
            const leaderboard = await getCachedStreakLeaderboard();
            return NextResponse.json({
                success: true,
                type: 'streak',
                leaderboard
            });
        }

        // Default to score leaderboard
        const leaderboard = await getCachedScoreLeaderboard(today);
        return NextResponse.json({
            success: true,
            type: 'score',
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

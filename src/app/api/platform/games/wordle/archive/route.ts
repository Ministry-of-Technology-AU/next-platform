import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { strapiGet } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';

interface ArchivePuzzle {
    id: number;
    word: string;
    date: string;
    hint?: string;
    userCompleted?: boolean;
    userWon?: boolean;
    userGuesses?: number;
    userTime?: number;
}

/**
 * GET /api/platform/games/wordle/archive
 * Returns past puzzles (user can play these but progress isn't saved to leaderboard)
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const today = new Date().toISOString().split('T')[0];

        // Fetch all published puzzles before today
        const puzzlesResponse = await strapiGet('/games', {
            filters: {
                date: { $lt: today }
            },
            sort: ['date:desc'],
            pagination: { pageSize: 30 },
            publicationState: 'live'
        });

        const puzzles = puzzlesResponse?.data || [];

        // Get user's wordle data to show completion status
        const userId = await getUserIdByEmail(session.user.email);
        let wordleData: Record<string, { guesses: string[]; time: number; won: boolean }> = {};

        if (userId) {
            const userResponse = await strapiGet(`/users/${userId}`, {
                fields: ['wordle_data']
            });
            wordleData = userResponse?.wordle_data || {};
        }

        // Map puzzles with user completion data
        const archives: ArchivePuzzle[] = puzzles.map((puzzle: { id: number; word: string; date: string; hint?: string }) => {
            const userData = wordleData[puzzle.date];
            return {
                id: puzzle.id,
                word: puzzle.word?.toUpperCase() || '',
                date: puzzle.date,
                hint: puzzle.hint,
                userCompleted: !!userData?.guesses?.length,
                userWon: userData?.won || false,
                userGuesses: userData?.guesses?.length || 0,
                userTime: userData?.time || 0
            };
        });

        return NextResponse.json({
            success: true,
            archives
        });

    } catch (error) {
        console.error('Error fetching archives:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch archives' },
            { status: 500 }
        );
    }
}

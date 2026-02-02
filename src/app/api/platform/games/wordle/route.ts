import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { strapiGet, strapiPut } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';

// Types for wordle data
interface WordleGameData {
    guesses: string[];
    time: number;
    won: boolean;
    completed: boolean;
}

interface WordleUserData {
    [date: string]: WordleGameData;
}

interface DailyPuzzle {
    id: number;
    word: string;
    date: string;
    hint?: string;
}

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

/**
 * GET /api/platform/games/wordle
 * Returns today's word and user's existing progress
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

        const today = getTodayDate();

        // Fetch today's puzzle from Strapi
        const puzzleResponse = await strapiGet('/games', {
            filters: {
                date: { $eq: today }
            },
            publicationState: 'live'
        });

        const puzzles = puzzleResponse?.data || [];
        if (puzzles.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No puzzle available for today' },
                { status: 404 }
            );
        }

        const todaysPuzzle: DailyPuzzle = {
            id: puzzles[0].id,
            word: puzzles[0].word?.toUpperCase() || '',
            date: puzzles[0].date,
            hint: puzzles[0].hint
        };

        // Fetch user's wordle data
        const userId = await getUserIdByEmail(session.user.email);
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        const userResponse = await strapiGet(`/users/${userId}`, {
            fields: ['wordle_data', 'username']
        });

        const wordleData: WordleUserData = userResponse?.wordle_data || {};
        const todaysProgress = wordleData[today] || null;

        return NextResponse.json({
            success: true,
            puzzle: {
                word: todaysPuzzle.word,
                date: todaysPuzzle.date,
                hint: todaysPuzzle.hint,
                wordLength: todaysPuzzle.word.length,
                maxGuesses: todaysPuzzle.word.length + 1
            },
            userProgress: todaysProgress
        });

    } catch (error) {
        console.error('Error fetching wordle data:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch wordle data' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/platform/games/wordle
 * Submit game completion (guesses and time)
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { guesses, time, won } = body;

        // Validate input
        if (!Array.isArray(guesses) || typeof time !== 'number' || typeof won !== 'boolean') {
            return NextResponse.json(
                { success: false, error: 'Invalid request body' },
                { status: 400 }
            );
        }

        const today = getTodayDate();

        // Get user ID
        const userId = await getUserIdByEmail(session.user.email);
        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Fetch existing wordle data
        const userResponse = await strapiGet(`/users/${userId}`, {
            fields: ['wordle_data']
        });

        const wordleData: WordleUserData = userResponse?.wordle_data || {};

        // Check if already completed today
        if (wordleData[today]?.completed) {
            return NextResponse.json(
                { success: false, error: 'Already completed today\'s puzzle' },
                { status: 400 }
            );
        }

        // Update with new game data
        wordleData[today] = {
            guesses,
            time,
            won,
            completed: true
        };

        // Save to Strapi
        await strapiPut(`/users/${userId}`, {
            wordle_data: wordleData
        });

        return NextResponse.json({
            success: true,
            message: 'Game progress saved',
            data: wordleData[today]
        });

    } catch (error) {
        console.error('Error saving wordle data:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to save game progress' },
            { status: 500 }
        );
    }
}

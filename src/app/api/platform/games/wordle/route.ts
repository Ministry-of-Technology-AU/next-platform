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

// Wordle user data structure with top-level streak tracking
interface WordleUserData {
    streak: number;     // Current winning streak
    maxStreak: number;  // Best ever streak
    [date: string]: WordleGameData | number; // Daily progress data (date keys) + streak values
}

interface DailyPuzzle {
    id: number;
    word: string;
    date: string;
    hint?: string;
}

// Get today's date in YYYY-MM-DD format (India Standard Time)
function getTodayDate(): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
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

        const wordleData: WordleUserData = userResponse?.wordle_data || { streak: 0, maxStreak: 0 };
        const todaysProgress = wordleData[today] as WordleGameData | undefined || null;
        const currentStreak = typeof wordleData.streak === 'number' ? wordleData.streak : 0;
        const maxStreak = typeof wordleData.maxStreak === 'number' ? wordleData.maxStreak : 0;

        return NextResponse.json({
            success: true,
            puzzle: {
                word: todaysPuzzle.word,
                date: todaysPuzzle.date,
                hint: todaysPuzzle.hint,
                wordLength: todaysPuzzle.word.length,
                maxGuesses: todaysPuzzle.word.length + 1
            },
            userProgress: todaysProgress,
            currentStreak,
            maxStreak
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

        const wordleData: WordleUserData = userResponse?.wordle_data || { streak: 0, maxStreak: 0 };
        const existingProgress = wordleData[today] as WordleGameData | undefined;

        // Check if already completed today
        if (existingProgress?.completed) {
            return NextResponse.json(
                { success: false, error: 'Already completed today\'s puzzle' },
                { status: 400 }
            );
        }

        // Get current streak and max streak values
        const currentStreak = typeof wordleData.streak === 'number' ? wordleData.streak : 0;
        const currentMaxStreak = typeof wordleData.maxStreak === 'number' ? wordleData.maxStreak : 0;

        // Update streak: increment on win, reset to 0 on loss
        const newStreak = won ? currentStreak + 1 : 0;
        const newMaxStreak = Math.max(currentMaxStreak, newStreak);

        // Update with new game data
        wordleData[today] = {
            guesses,
            time,
            won,
            completed: true
        };
        wordleData.streak = newStreak;
        wordleData.maxStreak = newMaxStreak;

        // Save to Strapi
        await strapiPut(`/users/${userId}`, {
            wordle_data: wordleData
        });

        return NextResponse.json({
            success: true,
            message: 'Game progress saved',
            data: {
                ...wordleData[today] as WordleGameData,
                streak: newStreak,
                maxStreak: newMaxStreak
            }
        });

    } catch (error) {
        console.error('Error saving wordle data:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to save game progress' },
            { status: 500 }
        );
    }
}


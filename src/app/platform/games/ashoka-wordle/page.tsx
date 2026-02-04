import { auth } from '@/auth';
import { strapiGet } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';
import WordleGameClient from './_components/WordleGameClient';
import PageTitle from '@/components/page-title';
import { Puzzle } from 'lucide-react';

// Force dynamic rendering since we use auth()
export const dynamic = 'force-dynamic';

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

interface DailyPuzzle {
    word: string;
    date: string;
    hint?: string;
}

interface UserProgress {
    guesses: string[];
    time: number;
    won: boolean;
    completed: boolean;
}

async function getWordleData(): Promise<{
    puzzle: DailyPuzzle | null;
    userProgress: UserProgress | null;
    currentStreak: number;
    error?: string;
}> {
    try {
        const session = await auth();
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
            return { puzzle: null, userProgress: null, currentStreak: 0, error: 'No puzzle available for today' };
        }

        // Strapi v4 returns data in { id, attributes: { word, date, hint } } format
        const puzzleData = puzzles[0]?.attributes || puzzles[0];
        const puzzle: DailyPuzzle = {
            word: (puzzleData.word || puzzleData?.word || '')?.toUpperCase(),
            date: puzzleData.date,
            hint: puzzleData.hint
        };

        // If user is not logged in, return just the puzzle
        if (!session?.user?.email) {
            return { puzzle, userProgress: null, currentStreak: 0 };
        }

        // Fetch user's wordle data
        const userId = await getUserIdByEmail(session.user.email);
        if (!userId) {
            return { puzzle, userProgress: null, currentStreak: 0 };
        }

        const userResponse = await strapiGet(`/users/${userId}`, {
            fields: ['wordle_data']
        });

        const wordleData = userResponse?.wordle_data || { streak: 0 };
        const userProgress = wordleData[today] || null;
        // Streak is stored at top-level of wordle_data
        const currentStreak = typeof wordleData.streak === 'number' ? wordleData.streak : 0;

        return { puzzle, userProgress, currentStreak };
    } catch (error) {
        console.error('Error fetching wordle data:', error);
        return { puzzle: null, userProgress: null, currentStreak: 0, error: 'Failed to load puzzle' };
    }
}

export default async function AshokaWordlePage() {
    const { puzzle, userProgress, currentStreak, error } = await getWordleData();

    return (
        <div>
            <PageTitle
                text="Ashoka Wordle"
                icon={Puzzle}
                subheading="The classic NYT Wordle Game - with an Ashokan theme! We do not condone playing this in class :)"
            />

            {error || !puzzle ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <p className="text-lg text-muted-foreground">
                        {error || 'No puzzle available today. Check back later!'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Puzzles are uploaded daily by the team.
                    </p>
                </div>
            ) : (
                <WordleGameClient
                    targetWord={puzzle.word}
                    initialProgress={userProgress}
                    currentStreak={currentStreak}
                />
            )}
        </div>
    );
}
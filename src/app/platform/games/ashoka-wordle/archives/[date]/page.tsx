import { auth } from '@/auth';
import { strapiGet } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';
import WordleGameClient from '../../_components/WordleGameClient';
import PageTitle from '@/components/page-title';
import { Archive, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ArchivePageProps {
    params: Promise<{ date: string }>;
}

async function getArchivePuzzle(date: string): Promise<{
    word: string | null;
    error?: string;
    userProgress: { guesses: string[]; time: number; won: boolean; completed: boolean } | null;
}> {
    try {
        // Fetch puzzle for this date
        const puzzleResponse = await strapiGet('/games', {
            filters: {
                date: { $eq: date }
            },
            publicationState: 'live'
        });

        const puzzles = puzzleResponse?.data || [];
        if (puzzles.length === 0) {
            return { word: null, userProgress: null, error: 'Puzzle not found for this date' };
        }

        // Handle Strapi v4 format
        const puzzleData = puzzles[0]?.attributes || puzzles[0];
        const word = (puzzleData.word || '')?.toUpperCase();

        // Get user progress for this date (optional - archives don't save to leaderboard)
        const session = await auth();
        if (!session?.user?.email) {
            return { word, userProgress: null };
        }

        const userId = await getUserIdByEmail(session.user.email);
        if (!userId) {
            return { word, userProgress: null };
        }

        const userResponse = await strapiGet(`/users/${userId}`, {
            fields: ['wordle_data']
        });
        const wordleData = userResponse?.wordle_data || {};
        const userProgress = wordleData[date] || null;

        return { word, userProgress };
    } catch (error) {
        console.error('Error fetching archive puzzle:', error);
        return { word: null, userProgress: null, error: 'Failed to load puzzle' };
    }
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default async function ArchivePlayPage({ params }: ArchivePageProps) {
    const { date } = await params;
    const { word, userProgress, error } = await getArchivePuzzle(date);

    return (
        <div>
            <div className="flex items-center gap-4 mb-4">
                <Link href="/platform/games/ashoka-wordle/archives">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <PageTitle
                    text="Archive Puzzle"
                    icon={Archive}
                    subheading={formatDate(date)}
                />
            </div>

            {error || !word ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <p className="text-lg text-muted-foreground">
                        {error || 'Puzzle not found for this date.'}
                    </p>
                    <Link href="/platform/games/ashoka-wordle/archives">
                        <Button variant="animated">
                            Back to Archives
                        </Button>
                    </Link>
                </div>
            ) : (
                <WordleGameClient
                    targetWord={word}
                    initialProgress={userProgress}
                    isArchive={true}
                />
            )}
        </div>
    );
}

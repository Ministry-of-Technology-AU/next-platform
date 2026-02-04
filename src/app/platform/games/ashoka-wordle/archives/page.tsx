import { auth } from '@/auth';
import { Archive, Calendar, Lock, ArrowLeft, Check, X, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { strapiGet } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';

// Force dynamic rendering since we use auth()
export const dynamic = 'force-dynamic';

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

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
    if (!dateStr) return 'Unknown Date';
    // Handle ISO date strings from Strapi
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return 'Unknown Date';
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

async function getArchiveData(): Promise<{
    hasCompletedToday: boolean;
    archives: ArchivePuzzle[];
}> {
    try {
        const session = await auth();
        const today = new Date().toISOString().split('T')[0];

        // Fetch past puzzles
        const puzzlesResponse = await strapiGet('/games', {
            filters: {
                date: { $lt: today }
            },
            sort: ['date:desc'],
            pagination: { pageSize: 30 },
            publicationState: 'live'
        });

        const puzzles = puzzlesResponse?.data || [];

        // If no session, user hasn't completed today
        if (!session?.user?.email) {
            return {
                hasCompletedToday: false,
                // Handle Strapi v4 format: data is in { id, attributes: { field } }
                archives: puzzles.map((p: { id: number; attributes?: { word?: string; date?: string; hint?: string }; word?: string; date?: string; hint?: string }) => {
                    const attrs = p.attributes || p;
                    return {
                        id: p.id,
                        word: (attrs.word || '')?.toUpperCase(),
                        date: attrs.date || '',
                        hint: attrs.hint
                    };
                })
            };
        }

        // Get user's wordle data
        const userId = await getUserIdByEmail(session.user.email);
        let wordleData: Record<string, { guesses: string[]; time: number; won: boolean; completed: boolean }> = {};
        let hasCompletedToday = false;

        if (userId) {
            const userResponse = await strapiGet(`/users/${userId}`, {
                fields: ['wordle_data']
            });
            wordleData = userResponse?.wordle_data || {};
            hasCompletedToday = !!wordleData[today]?.completed;
        }

        // Map puzzles with user completion data (handle Strapi v4 format)
        const archives: ArchivePuzzle[] = puzzles.map((puzzle: { id: number; attributes?: { word?: string; date?: string; hint?: string }; word?: string; date?: string; hint?: string }) => {
            const attrs = puzzle.attributes || puzzle;
            const puzzleDate = attrs.date || '';
            const userData = wordleData[puzzleDate];
            return {
                id: puzzle.id,
                word: (attrs.word || '')?.toUpperCase(),
                date: puzzleDate,
                hint: attrs.hint,
                userCompleted: !!userData?.completed,
                userWon: userData?.won || false,
                userGuesses: userData?.guesses?.length || 0,
                userTime: userData?.time || 0
            };
        });

        return { hasCompletedToday, archives };
    } catch (error) {
        console.error('Error fetching archives:', error);
        return { hasCompletedToday: false, archives: [] };
    }
}

export default async function ArchivesPage() {
    const { hasCompletedToday, archives } = await getArchiveData();

    // If user hasn't completed today's puzzle, show locked state
    if (!hasCompletedToday) {
        return (
            <div className="py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/platform/games/ashoka-wordle">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Archive className="h-6 w-6 text-primary" />
                        Archives
                    </h2>
                </div>

                <Card className="max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 p-4 rounded-full bg-gray-extralight dark:bg-neutral-light">
                            <Lock className="h-12 w-12 text-primary" />
                        </div>
                        <CardTitle>Archives Locked</CardTitle>
                        <CardDescription>
                            Complete today&apos;s puzzle to unlock access to past Wordles!
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/platform/games/ashoka-wordle" className="w-full">
                            <Button variant="animated" className="w-full">
                                Play Today&apos;s Puzzle
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="py-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/platform/games/ashoka-wordle">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Archive className="h-6 w-6 text-primary" />
                    Archives
                </h2>
            </div>

            <p className="text-muted-foreground mb-6">
                View past Wordle puzzles. Archive playback coming soon!
            </p>

            {archives.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">No past puzzles yet!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {archives.map((archive) => (
                        <Card
                            key={archive.id}
                            className={`transition-all hover:shadow-lg cursor-pointer ${archive.userCompleted ? 'border-green/50' : ''}`}
                        >
                            <Link href={`/platform/games/ashoka-wordle/archives/${archive.date}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{formatDate(archive.date)}</span>
                                        </div>
                                        {archive.userCompleted && (
                                            <div className="flex items-center gap-1">
                                                {archive.userWon ? (
                                                    <Check className="h-5 w-5 text-green" />
                                                ) : (
                                                    <X className="h-5 w-5 text-destructive" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {archive.userCompleted ? (
                                        <div className="space-y-2">
                                            <p className="text-2xl font-bold tracking-widest text-primary">
                                                {archive.word}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>{archive.userGuesses} guesses</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTime(archive.userTime || 0)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Click to replay</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-2xl font-bold tracking-widest text-muted-foreground">
                                                {'?'.repeat(archive.word.length || 5)}
                                            </p>
                                            <Button variant="outline" size="sm" className="w-full">
                                                Play Now
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Link>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}


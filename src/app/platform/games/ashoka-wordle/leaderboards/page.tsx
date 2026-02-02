import { Trophy, Medal, Clock, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { strapiGet } from '@/lib/apis/strapi';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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

async function getLeaderboard(): Promise<{ leaderboard: LeaderboardEntry[]; date: string }> {
    try {
        const today = getTodayDate();

        // Fetch all users with wordle_data directly from Strapi
        const usersResponse = await strapiGet('/users', {
            fields: ['username', 'wordle_data'],
            pagination: { pageSize: 10000 }
        });

        const users = usersResponse || [];
        const leaderboard: LeaderboardEntry[] = [];

        for (const user of users) {
            const wordleData = user.wordle_data;
            if (wordleData && wordleData[today] && wordleData[today].won) {
                const { guesses, time } = wordleData[today];
                const guessCount = Array.isArray(guesses) ? guesses.length : guesses;
                leaderboard.push({
                    rank: 0,
                    username: user.username || 'Anonymous',
                    guesses: guessCount,
                    time,
                    score: calculateScore(guessCount, time)
                });
            }
        }

        // Sort by score (lower is better)
        leaderboard.sort((a, b) => a.score - b.score);

        // Assign ranks and take top 10
        const top10 = leaderboard.slice(0, 10).map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));

        return { leaderboard: top10, date: today };
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return { leaderboard: [], date: getTodayDate() };
    }
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) {
        return `${secs}s`;
    }
    return `${mins}m ${secs}s`;
}

function getRankBadge(rank: number) {
    if (rank === 1) return <Trophy className="h-5 w-5 text-secondary" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-light" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-secondary-dark" />;
    return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>;
}

export default async function LeaderboardPage() {
    const { leaderboard, date } = await getLeaderboard();

    return (
        <div className="py-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/platform/games/ashoka-wordle">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-secondary" />
                    Leaderboard
                </h2>
            </div>

            <div className="mb-6 p-4 rounded-lg bg-gray-extralight dark:bg-neutral-light">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Today&apos;s puzzle: {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-lg text-muted-foreground">No completions yet today!</p>
                    <p className="text-sm text-muted-foreground mt-2">Be the first to complete today&apos;s puzzle.</p>
                </div>
            ) : (
                <div className="rounded-lg border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">Rank</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead className="text-center">Time</TableHead>
                                <TableHead className="text-center">Guesses</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leaderboard.map((entry) => (
                                <TableRow key={entry.rank}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center justify-center">
                                            {getRankBadge(entry.rank)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{entry.username}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            {formatTime(entry.time)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{entry.guesses} guesses</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}

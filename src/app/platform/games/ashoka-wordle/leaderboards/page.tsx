import { Metadata } from 'next';
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
import PageTitle from '@/components/page-title';

export const metadata: Metadata = {
    title: 'Leaderboard | Ashoka Wordle',
    description: 'View the fastest Wordle solvers at Ashoka University',
};

// Placeholder data - will be replaced with backend data
const PLACEHOLDER_LEADERBOARD = [
    { rank: 1, name: 'Alex Kumar', time: 45, guesses: 3, streak: 15, date: '2026-02-02' },
    { rank: 2, name: 'Priya Singh', time: 52, guesses: 4, streak: 12, date: '2026-02-02' },
    { rank: 3, name: 'Rahul Verma', time: 67, guesses: 4, streak: 10, date: '2026-02-02' },
    { rank: 4, name: 'Ananya Sharma', time: 78, guesses: 3, streak: 8, date: '2026-02-02' },
    { rank: 5, name: 'Vikram Patel', time: 89, guesses: 5, streak: 7, date: '2026-02-02' },
    { rank: 6, name: 'Neha Gupta', time: 95, guesses: 4, streak: 6, date: '2026-02-02' },
    { rank: 7, name: 'Arjun Nair', time: 102, guesses: 5, streak: 5, date: '2026-02-02' },
    { rank: 8, name: 'Kavya Reddy', time: 115, guesses: 6, streak: 4, date: '2026-02-02' },
    { rank: 9, name: 'Siddharth Joshi', time: 128, guesses: 5, streak: 3, date: '2026-02-02' },
    { rank: 10, name: 'Meera Iyer', time: 145, guesses: 6, streak: 2, date: '2026-02-02' },
];

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

export default function LeaderboardPage() {
    return (
        <div className="container py-8">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/platform/games/ashoka-wordle">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <PageTitle text="Leaderboard" icon={Trophy} />
            </div>

            <div className="mb-6 p-4 rounded-lg bg-gray-extralight dark:bg-neutral-light">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Today&apos;s puzzle: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
            </div>

            <div className="rounded-lg border overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">Rank</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-center">Time</TableHead>
                            <TableHead className="text-center">Guesses</TableHead>
                            <TableHead className="text-center">Streak</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {PLACEHOLDER_LEADERBOARD.map((entry) => (
                            <TableRow key={entry.rank}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center justify-center">
                                        {getRankBadge(entry.rank)}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{entry.name}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        {formatTime(entry.time)}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">{entry.guesses}/6</TableCell>
                                <TableCell className="text-center">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green/10 text-green">
                                        🔥 {entry.streak} days
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Leaderboard data is placeholder. Backend integration coming soon!</p>
            </div>
        </div>
    );
}

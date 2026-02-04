'use client';

import { useEffect, useState } from 'react';
import { Trophy, Medal, Clock, Calendar, ArrowLeft, Flame } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    const [activeTab, setActiveTab] = useState<'score' | 'streak'>('score');
    const [scoreLeaderboard, setScoreLeaderboard] = useState<ScoreLeaderboardEntry[]>([]);
    const [streakLeaderboard, setStreakLeaderboard] = useState<StreakLeaderboardEntry[]>([]);
    const [date, setDate] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboards() {
            setLoading(true);
            try {
                // Fetch score leaderboard
                const scoreRes = await fetch('/api/platform/games/wordle/leaderboard?type=score');
                const scoreData = await scoreRes.json();
                if (scoreData.success) {
                    setScoreLeaderboard(scoreData.leaderboard);
                    setDate(scoreData.date);
                }

                // Fetch streak leaderboard
                const streakRes = await fetch('/api/platform/games/wordle/leaderboard?type=streak');
                const streakData = await streakRes.json();
                if (streakData.success) {
                    setStreakLeaderboard(streakData.leaderboard);
                }
            } catch (error) {
                console.error('Failed to fetch leaderboards:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchLeaderboards();
    }, []);

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

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'score' | 'streak')} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="score" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Today&apos;s Scores
                    </TabsTrigger>
                    <TabsTrigger value="streak" className="flex items-center gap-2">
                        <Flame className="h-4 w-4" />
                        Streaks
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="score">
                    {date && (
                        <div className="mb-6 p-4 rounded-lg bg-gray-extralight dark:bg-neutral-light">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Today&apos;s puzzle: {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Loading...</p>
                        </div>
                    ) : scoreLeaderboard.length === 0 ? (
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
                                    {scoreLeaderboard.map((entry) => (
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
                </TabsContent>

                <TabsContent value="streak">
                    <div className="mb-6 p-4 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                        <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                            <Flame className="h-4 w-4" />
                            <span>Players with the longest winning streaks</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Loading...</p>
                        </div>
                    ) : streakLeaderboard.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-lg text-muted-foreground">No streaks yet!</p>
                            <p className="text-sm text-muted-foreground mt-2">Win consecutive days to build your streak.</p>
                        </div>
                    ) : (
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16">Rank</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-center">Current Streak</TableHead>
                                        <TableHead className="text-center">Best Streak</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {streakLeaderboard.map((entry) => (
                                        <TableRow key={entry.rank}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center justify-center">
                                                    {getRankBadge(entry.rank)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{entry.username}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Flame className="h-4 w-4 text-orange-500" />
                                                    {entry.currentStreak} days
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">{entry.maxStreak} days</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

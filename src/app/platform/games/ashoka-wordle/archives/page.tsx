'use client';

import { useEffect, useState } from 'react';
import { Archive, Calendar, Lock, ArrowLeft, Check, X, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { STORAGE_KEYS } from '../types';

interface CompletedPuzzle {
    guesses: number;
    time: number;
    won: boolean;
}

// Placeholder archive data - will be replaced with backend
const PLACEHOLDER_ARCHIVES = [
    { date: '2026-02-01', word: 'ASHOKA', available: true },
    { date: '2026-01-31', word: 'CAMPUS', available: true },
    { date: '2026-01-30', word: 'LEARN', available: true },
    { date: '2026-01-29', word: 'STUDY', available: true },
    { date: '2026-01-28', word: 'THINK', available: true },
    { date: '2026-01-27', word: 'BRAIN', available: true },
];

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

export default function ArchivesPage() {
    const [hasCompletedToday, setHasCompletedToday] = useState(false);
    const [completedPuzzles, setCompletedPuzzles] = useState<Record<string, CompletedPuzzle>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const completed = localStorage.getItem(STORAGE_KEYS.COMPLETED_PUZZLES);
            if (completed) {
                try {
                    const parsed = JSON.parse(completed);
                    setCompletedPuzzles(parsed);
                    const today = new Date().toISOString().split('T')[0];
                    setHasCompletedToday(!!parsed[today]);
                } catch (e) {
                    console.error('Failed to parse completed puzzles:', e);
                }
            }
            setIsLoading(false);
        }
    }, []);

    if (isLoading) {
        return (
            <div className="py-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-pulse text-lg">Loading...</div>
                </div>
            </div>
        );
    }

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
                Play past Wordle puzzles. Your scores won&apos;t count towards the leaderboard.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PLACEHOLDER_ARCHIVES.map((archive) => {
                    const completed = completedPuzzles[archive.date];

                    return (
                        <Card
                            key={archive.date}
                            className={`transition-all hover:shadow-lg ${completed ? 'border-green/50' : ''}`}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{formatDate(archive.date)}</span>
                                    </div>
                                    {completed && (
                                        <div className="flex items-center gap-1">
                                            {completed.won ? (
                                                <Check className="h-5 w-5 text-green" />
                                            ) : (
                                                <X className="h-5 w-5 text-destructive" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {completed ? (
                                    <div className="space-y-2">
                                        <p className="text-2xl font-bold tracking-widest text-primary">
                                            {archive.word}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>{completed.guesses} guesses</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatTime(completed.time)}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-2xl font-bold tracking-widest text-muted-foreground">
                                            ?????
                                        </p>
                                        <Button variant="outline" size="sm" className="w-full" disabled>
                                            Play (Coming Soon)
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Archive playback coming soon with backend integration!</p>
            </div>
        </div>
    );
}

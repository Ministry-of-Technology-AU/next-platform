'use client';

import { useEffect, useState } from 'react';
import { useWordle } from '../_context/wordle-context';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { XCircle, Eye, Archive, Flame } from 'lucide-react';
import Link from 'next/link';

export default function LoseDialog() {
    const { gameData, resetGame, currentStreak } = useWordle();
    const [open, setOpen] = useState(false);
    // Store the streak that was broken (the streak before today's loss)
    const [brokenStreak, setBrokenStreak] = useState(0);

    const { gameState, targetWord, elapsedTime, guesses } = gameData;

    useEffect(() => {
        if (gameState === 'lost') {
            // Capture the streak that was broken before updating
            setBrokenStreak(currentStreak);
            // Delay opening the modal to allow tiles to animate
            const timer = setTimeout(() => {
                setOpen(true);
            }, 1500);
            return () => clearTimeout(timer);
        } else {
            setOpen(false);
        }
    }, [gameState, currentStreak]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
                        <XCircle className="h-8 w-8 text-destructive" />
                        Better luck next time!
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        You&apos;ve used all your guesses.
                    </DialogDescription>
                </DialogHeader>

                {brokenStreak > 0 && (
                    <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                            Streak Broken! You lost your {brokenStreak} day streak 😢
                        </span>
                    </div>
                )}

                <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-2">The word was</p>
                    <p className="text-4xl font-bold tracking-widest text-primary">{targetWord}</p>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                    <Link href="/platform/games/ashoka-wordle/leaderboards" className="flex-1">
                        <Button variant="outline" className="w-full">
                            <Eye className="h-4 w-4 mr-2" />
                            View Leaderboard
                        </Button>
                    </Link>
                    <Link href="/platform/games/ashoka-wordle/archives" className="flex-1">
                        <Button variant="animated" className="w-full">
                            <Archive className="h-4 w-4 mr-2" />
                            View Archives
                        </Button>
                    </Link>
                </DialogFooter>

                <p className="text-center text-sm text-muted-foreground mt-2">
                    Come back tomorrow for a new puzzle!
                </p>
            </DialogContent>
        </Dialog>
    );
}


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
import { XCircle, Eye, Archive } from 'lucide-react';
import Link from 'next/link';

export default function LoseDialog() {
    const { gameData, resetGame } = useWordle();
    const [open, setOpen] = useState(false);

    const { gameState, targetWord, elapsedTime, guesses } = gameData;

    useEffect(() => {
        if (gameState === 'lost') {
            // Delay opening the modal to allow tiles to animate
            const timer = setTimeout(() => {
                setOpen(true);
            }, 1500);
            return () => clearTimeout(timer);
        } else {
            setOpen(false);
        }
    }, [gameState]);

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

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
import { Trophy, Clock, Target, Share2, Archive } from 'lucide-react';
import Link from 'next/link';
import ConfettiEffect from './ConfettiEffect';

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function WinDialog() {
    const { gameData, wordLength, resetGame } = useWordle();
    const [open, setOpen] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const { gameState, guesses, elapsedTime, targetWord } = gameData;

    useEffect(() => {
        if (gameState === 'won') {
            // Delay opening the modal to allow tiles to animate
            const timer = setTimeout(() => {
                setOpen(true);
                setShowConfetti(true);
            }, 1500);
            return () => clearTimeout(timer);
        } else {
            setOpen(false);
            setShowConfetti(false);
        }
    }, [gameState]);

    const handleShare = async () => {
        const emojiGrid = guesses.map(guess =>
            guess.evaluation.map(e => {
                if (e.state === 'correct') return '🟩';
                if (e.state === 'present') return '🟨';
                return '⬛';
            }).join('')
        ).join('\n');

        const shareText = `Ashoka Wordle ${new Date().toLocaleDateString()}\n${guesses.length}/${6} • ${formatTime(elapsedTime)}\n\n${emojiGrid}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Ashoka Wordle',
                    text: shareText,
                });
            } else {
                await navigator.clipboard.writeText(shareText);
                // Could add a toast here
            }
        } catch (e) {
            console.error('Share failed:', e);
        }
    };

    return (
        <>
            <ConfettiEffect trigger={showConfetti} />
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
                            <Trophy className="h-8 w-8 text-secondary" />
                            Congratulations!
                        </DialogTitle>
                        <DialogDescription className="text-center">
                            You solved today&apos;s Ashoka Wordle!
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="flex flex-col items-center p-4 rounded-lg bg-gray-extralight dark:bg-neutral-light">
                            <Target className="h-6 w-6 text-green mb-2" />
                            <span className="text-2xl font-bold">{guesses.length}/{6}</span>
                            <span className="text-sm text-muted-foreground">Guesses</span>
                        </div>
                        <div className="flex flex-col items-center p-4 rounded-lg bg-gray-extralight dark:bg-neutral-light">
                            <Clock className="h-6 w-6 text-blue mb-2" />
                            <span className="text-2xl font-bold">{formatTime(elapsedTime)}</span>
                            <span className="text-sm text-muted-foreground">Time</span>
                        </div>
                    </div>

                    <div className="text-center py-2">
                        <p className="text-sm text-muted-foreground mb-1">The word was</p>
                        <p className="text-3xl font-bold tracking-widest text-primary">{targetWord}</p>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={handleShare}
                            className="flex-1"
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Results
                        </Button>
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
        </>
    );
}

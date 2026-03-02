'use client';

import { useWordle } from '../_context/wordle-context';
import { Timer, Check, X } from 'lucide-react';

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function GameTimer() {
    const { elapsedTime, gameData, isTimerRunning } = useWordle();
    const { gameState } = gameData;

    return (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-extralight dark:bg-neutral-light">
            {gameState === 'won' && (
                <Check className="h-5 w-5 text-green" />
            )}
            {gameState === 'lost' && (
                <X className="h-5 w-5 text-destructive" />
            )}
            {gameState === 'playing' && (
                <Timer className={`h-5 w-5 ${isTimerRunning ? 'text-primary animate-pulse' : 'text-gray'}`} />
            )}
            <span className="font-mono text-lg font-semibold">
                {formatTime(elapsedTime)}
            </span>
        </div>
    );
}

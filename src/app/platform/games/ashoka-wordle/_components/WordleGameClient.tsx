'use client';

import { WordleProvider } from '../_context/wordle-context';
import GameBoard from './GameBoard';
import Keyboard from './Keyboard';
import GameTimer from './GameTimer';
import WinDialog from './WinDialog';
import LoseDialog from './LoseDialog';
import AlreadyPlayedBanner from './AlreadyPlayedBanner';

interface WordleGameClientProps {
    targetWord: string;
    initialProgress?: {
        guesses: string[];
        time: number;
        won: boolean;
        completed: boolean;
    } | null;
}

export default function WordleGameClient({ targetWord, initialProgress }: WordleGameClientProps) {
    // Validate word length (3-8 letters)
    if (targetWord.length < 3 || targetWord.length > 8) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-destructive">
                    Error: Word must be between 3 and 8 letters.
                </p>
            </div>
        );
    }

    return (
        <WordleProvider
            targetWord={targetWord}
            initialProgress={initialProgress}
        >
            <div className="flex flex-col items-center justify-center py-8 gap-6">
                <div className="flex items-center justify-center w-full">
                    <GameTimer />
                </div>
                <AlreadyPlayedBanner />
                <GameBoard />
                <Keyboard />
                <WinDialog />
                <LoseDialog />
            </div>
        </WordleProvider>
    );
}

'use client';

import { WordleProvider } from './_context/wordle-context';
import GameBoard from './_components/GameBoard';
import Keyboard from './_components/Keyboard';
import GameTimer from './_components/GameTimer';
import WinDialog from './_components/WinDialog';
import LoseDialog from './_components/LoseDialog';
import AlreadyPlayedBanner from './_components/AlreadyPlayedBanner';
import PageTitle from '@/components/page-title';
import { Puzzle } from 'lucide-react';

// ============================================
// CUSTOM WORD CONFIGURATION
// Change this word to set the daily puzzle
// Word length: 3-8 letters
// Players get n+1 guesses for an n-letter word
// ============================================
const TODAYS_WORD = 'ASHOKA'; // Placeholder - replace with your custom word

function WordleGame() {
    return (
        <div>
            <PageTitle
                text="Ashoka Wordle"
                icon={Puzzle}
                subheading="Guess the word! You have n+1 attempts for an n-letter word."
            />
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
        </div>
    );
}

export default function AshokaWordlePage() {
    // Validate word length (3-8 letters)
    const word = TODAYS_WORD.toUpperCase();
    if (word.length < 3 || word.length > 8) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-destructive">
                    Error: Word must be between 3 and 8 letters. Current word: &quot;{word}&quot; ({word.length} letters)
                </p>
            </div>
        );
    }

    return (
        <WordleProvider targetWord={word}>
            <WordleGame />
        </WordleProvider>
    );
}
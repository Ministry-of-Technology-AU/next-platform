'use client';

import { WordleProvider } from './_context/wordle-context';
import GameBoard from './_components/GameBoard';
import Keyboard from './_components/Keyboard';
import WordleHeader from './_components/WordleHeader';
import WinDialog from './_components/WinDialog';
import LoseDialog from './_components/LoseDialog';
import AlreadyPlayedBanner from './_components/AlreadyPlayedBanner';
import { getRandomWord } from './_utils/dictionary';
import { useState, useEffect } from 'react';

// For demo purposes, we use a random word
// In production, this would come from your backend API based on the date
function getTodaysWord(): string {
    // Use date as seed for consistent daily word
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // Simple hash function for deterministic word selection
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
        const char = dateString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }

    // Use different word lengths to show flexibility
    const wordLengths = [4, 5, 5, 5, 6]; // More 5-letter words
    const lengthIndex = Math.abs(hash) % wordLengths.length;
    const wordLength = wordLengths[lengthIndex];

    // Get a word of that length
    // In production, this would be a specific word from your backend
    return getRandomWord(wordLength);
}

function WordleGame() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] gap-8">
            <WordleHeader />
            <AlreadyPlayedBanner />
            <GameBoard />
            <Keyboard />
            <WinDialog />
            <LoseDialog />
        </div>
    );
}

export default function AshokaWordlePage() {
    const [todaysWord, setTodaysWord] = useState<string | null>(null);

    useEffect(() => {
        // Get today's word on client side to avoid hydration issues
        setTodaysWord(getTodaysWord());
    }, []);

    if (!todaysWord) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <div className="animate-pulse text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container py-4 px-2 sm:px-4">
            <WordleProvider targetWord={todaysWord}>
                <WordleGame />
            </WordleProvider>
        </div>
    );
}
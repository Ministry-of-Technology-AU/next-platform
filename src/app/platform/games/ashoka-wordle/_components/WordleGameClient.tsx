'use client';

import { WordleProvider } from '../_context/wordle-context';
import GameBoard from './GameBoard';
import Keyboard from './Keyboard';
import GameTimer from './GameTimer';
import WinDialog from './WinDialog';
import LoseDialog from './LoseDialog';
import AlreadyPlayedBanner from './AlreadyPlayedBanner';
import FriendsPanel from './FriendsPanel';
import AcceptInviteHandler from './AcceptInviteHandler';

interface WordleGameClientProps {
    targetWord: string;
    initialProgress?: {
        guesses: string[];
        time: number;
        won: boolean;
        completed: boolean;
    } | null;
    isArchive?: boolean;
    currentStreak?: number;
    maxStreak?: number;
    aboutWord?: string;
}

export default function WordleGameClient({ targetWord, initialProgress, isArchive = false, currentStreak = 0, maxStreak = 0, aboutWord }: WordleGameClientProps) {
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
            isArchive={isArchive}
            currentStreak={currentStreak}
            maxStreak={maxStreak}
            aboutWord={aboutWord}
        >
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-center py-8 px-4 w-full max-w-[1600px] mx-auto">
                {/* Main Game Column (70%) */}
                <div className="flex flex-col items-center flex-1 w-full lg:w-[75%] lg:pr-8">
                    {/* Centering container for the game board within the 70% */}
                    <div className="w-full max-w-2xl flex flex-col items-center">
                        {/* Mobile only: Pending Invites shown above the game */}
                        {!isArchive && (
                            <div className="lg:hidden w-full mb-6">
                                <FriendsPanel mode="invites" />
                            </div>
                        )}

                        <div className="flex items-center justify-center w-full mb-6">
                            <GameTimer />
                        </div>

                        {!isArchive && <AlreadyPlayedBanner />}

                        <div className="flex flex-col items-center gap-6">
                            <GameBoard />
                            <Keyboard />
                        </div>

                        <WinDialog />
                        <LoseDialog />
                        {!isArchive && <AcceptInviteHandler />}

                        {/* Mobile only: Friends Scores shown below the game */}
                        {!isArchive && (
                            <div className="lg:hidden w-full mt-8">
                                <FriendsPanel mode="scores" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Vertical Divider (Desktop only) */}
                {!isArchive && (
                    <div className="hidden lg:block w-px self-stretch bg-border/50 mx-4" />
                )}

                {/* Desktop only: Sidebar (30%) */}
                {!isArchive && (
                    <div className="hidden lg:block w-full lg:w-[30%] lg:pl-8 shrink-0 sticky top-24">
                        <FriendsPanel mode="all" />
                    </div>
                )}
            </div>
        </WordleProvider>
    );
}


'use client';

import { motion } from 'motion/react';
import { useWordle } from '../_context/wordle-context';
import { LetterState } from '../types';
import { cn } from '@/lib/utils';

// Get background color based on letter state
function getTileColor(state: LetterState): string {
    switch (state) {
        case 'correct':
            return 'bg-green dark:bg-green'; // --color-green
        case 'present':
            return 'bg-secondary dark:bg-secondary-dark'; // --color-secondary
        case 'absent':
            return 'bg-gray dark:bg-gray-dark'; // --color-gray
        case 'tbd':
            return 'bg-gray-extralight dark:bg-neutral-light border-2 border-gray-light';
        case 'empty':
        default:
            return 'bg-gray-extralight dark:bg-neutral-light border-2 border-gray-light dark:border-gray-dark';
    }
}

// Get text color based on letter state
function getTextColor(state: LetterState): string {
    switch (state) {
        case 'correct':
        case 'present':
        case 'absent':
            return 'text-white';
        case 'tbd':
        case 'empty':
        default:
            return 'text-foreground';
    }
}

interface TileProps {
    letter: string;
    state: LetterState;
    position: number;
    isRevealing?: boolean;
    delay?: number;
}

function Tile({ letter, state, position, isRevealing = false, delay = 0 }: TileProps) {
    return (
        <motion.div
            className={cn(
                'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center rounded-md font-bold text-2xl sm:text-3xl uppercase transition-colors',
                getTileColor(state),
                getTextColor(state)
            )}
            initial={isRevealing ? { rotateX: 0 } : false}
            animate={isRevealing ? { rotateX: 360 } : false}
            transition={{
                duration: 0.5,
                delay: delay * 0.15,
                ease: 'easeInOut',
            }}
            style={{ perspective: 1000 }}
        >
            <motion.span
                initial={letter && state === 'tbd' ? { scale: 0.8 } : false}
                animate={letter && state === 'tbd' ? { scale: 1 } : false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
                {letter}
            </motion.span>
        </motion.div>
    );
}

interface RowProps {
    guess?: { word: string; evaluation: { letter: string; state: LetterState }[] };
    currentGuess?: string;
    wordLength: number;
    isSubmitting?: boolean;
}

function Row({ guess, currentGuess, wordLength, isSubmitting = false }: RowProps) {
    const tiles = [];

    for (let i = 0; i < wordLength; i++) {
        if (guess) {
            // Completed guess row
            tiles.push(
                <Tile
                    key={i}
                    letter={guess.evaluation[i].letter}
                    state={guess.evaluation[i].state}
                    position={i}
                    isRevealing={isSubmitting}
                    delay={i}
                />
            );
        } else if (currentGuess !== undefined) {
            // Current guess row
            const letter = currentGuess[i] || '';
            tiles.push(
                <Tile
                    key={i}
                    letter={letter}
                    state={letter ? 'tbd' : 'empty'}
                    position={i}
                />
            );
        } else {
            // Empty row
            tiles.push(
                <Tile
                    key={i}
                    letter=""
                    state="empty"
                    position={i}
                />
            );
        }
    }

    return (
        <div className="flex gap-1.5 sm:gap-2">
            {tiles}
        </div>
    );
}

export default function GameBoard() {
    const { gameData, wordLength, maxGuesses } = useWordle();
    const { guesses, currentGuess, gameState } = gameData;

    const rows = [];

    for (let i = 0; i < maxGuesses; i++) {
        if (i < guesses.length) {
            // Completed guess
            rows.push(
                <Row
                    key={i}
                    guess={guesses[i]}
                    wordLength={wordLength}
                    isSubmitting={i === guesses.length - 1 && gameState !== 'playing'}
                />
            );
        } else if (i === guesses.length && gameState === 'playing') {
            // Current guess
            rows.push(
                <Row
                    key={i}
                    currentGuess={currentGuess}
                    wordLength={wordLength}
                />
            );
        } else {
            // Empty row
            rows.push(
                <Row
                    key={i}
                    wordLength={wordLength}
                />
            );
        }
    }

    return (
        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
            {rows}
        </div>
    );
}

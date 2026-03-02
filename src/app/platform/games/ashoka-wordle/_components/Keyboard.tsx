'use client';

import { useWordle } from '../_context/wordle-context';
import { LetterState } from '../types';
import { cn } from '@/lib/utils';
import { Delete } from 'lucide-react';

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

function getKeyColor(state: LetterState | undefined): string {
    switch (state) {
        case 'correct':
            return 'bg-green hover:bg-green-dark text-white';
        case 'present':
            return 'bg-secondary hover:bg-secondary-dark text-black';
        case 'absent':
            return 'bg-gray hover:bg-gray-dark text-white';
        default:
            return 'bg-gray-light hover:bg-gray dark:bg-neutral-light dark:hover:bg-gray-dark text-foreground';
    }
}

interface KeyProps {
    keyValue: string;
    state?: LetterState;
    onClick: () => void;
    isWide?: boolean;
}

function Key({ keyValue, state, onClick, isWide = false }: KeyProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'h-12 sm:h-14 rounded-md font-bold uppercase transition-colors flex items-center justify-center',
                isWide ? 'px-2 sm:px-4 text-xs sm:text-sm min-w-[52px] sm:min-w-[65px]' : 'w-8 sm:w-10 text-sm sm:text-base',
                getKeyColor(state)
            )}
        >
            {keyValue === 'BACKSPACE' ? <Delete className="h-5 w-5" /> : keyValue}
        </button>
    );
}

export default function Keyboard() {
    const { keyboardState, addLetter, deleteLetter, submitGuess, gameData } = useWordle();
    const isPlaying = gameData.gameState === 'playing';

    const handleKeyClick = (key: string) => {
        if (!isPlaying) return;

        if (key === 'ENTER') {
            submitGuess();
        } else if (key === 'BACKSPACE') {
            deleteLetter();
        } else {
            addLetter(key);
        }
    };

    return (
        <div className="flex flex-col items-center gap-1.5 sm:gap-2 w-full max-w-lg mx-auto px-1">
            {KEYBOARD_ROWS.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-1 sm:gap-1.5 justify-center">
                    {row.map((key) => (
                        <Key
                            key={key}
                            keyValue={key}
                            state={keyboardState[key]}
                            onClick={() => handleKeyClick(key)}
                            isWide={key === 'ENTER' || key === 'BACKSPACE'}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

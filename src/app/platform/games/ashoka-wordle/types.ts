// Wordle game type definitions

export type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';

export type GameState = 'playing' | 'won' | 'lost';

export interface LetterEvaluation {
    letter: string;
    state: LetterState;
}

export interface Guess {
    word: string;
    evaluation: LetterEvaluation[];
}

export interface GameData {
    targetWord: string;
    guesses: Guess[];
    currentGuess: string;
    gameState: GameState;
    startTime: number | null;
    endTime: number | null;
    elapsedTime: number;
    date: string; // YYYY-MM-DD format for daily puzzle tracking
}

export interface KeyboardState {
    [key: string]: LetterState;
}

export interface LeaderboardEntry {
    rank: number;
    name: string;
    time: number; // in seconds
    guesses: number;
    streak: number;
    date: string;
}

export interface ArchiveEntry {
    date: string;
    word: string;
    completed: boolean;
    guesses: number;
    time: number;
}

// Local storage keys
export const STORAGE_KEYS = {
    GAME_STATE: 'ashoka-wordle-game-state',
    COMPLETED_PUZZLES: 'ashoka-wordle-completed',
    STATS: 'ashoka-wordle-stats',
} as const;

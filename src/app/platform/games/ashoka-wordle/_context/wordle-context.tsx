'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { GameData, GameState, Guess, KeyboardState, LetterEvaluation, LetterState, STORAGE_KEYS } from '../types';
import { isValidWord } from '../_utils/dictionary';
import { toast } from 'sonner';

interface WordleContextType {
    // Game state
    gameData: GameData;
    keyboardState: KeyboardState;
    wordLength: number;
    maxGuesses: number;

    // Actions
    addLetter: (letter: string) => void;
    deleteLetter: () => void;
    submitGuess: () => void;
    resetGame: (newWord?: string) => void;

    // Timer
    elapsedTime: number;
    isTimerRunning: boolean;

    // Game status
    hasPlayedToday: boolean;
    todayStats: { guesses: number; time: number } | null;
}

const WordleContext = createContext<WordleContextType | undefined>(undefined);

interface WordleProviderProps {
    children: React.ReactNode;
    targetWord: string; // The word to guess
    isArchive?: boolean; // If true, don't save to today's completion
    initialProgress?: {
        guesses: string[];
        time: number;
        won: boolean;
        completed: boolean;
    } | null;
}

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

// Evaluate a guess against the target word
function evaluateGuess(guess: string, target: string): LetterEvaluation[] {
    const result: LetterEvaluation[] = [];
    const targetLetters = target.split('');
    const guessLetters = guess.split('');
    const usedIndices: Set<number> = new Set();

    // First pass: mark correct positions
    guessLetters.forEach((letter, i) => {
        if (letter === targetLetters[i]) {
            result[i] = { letter, state: 'correct' };
            usedIndices.add(i);
        }
    });

    // Second pass: mark present or absent
    guessLetters.forEach((letter, i) => {
        if (result[i]) return; // Already marked as correct

        // Find this letter in target (not already used)
        const targetIndex = targetLetters.findIndex((t, ti) =>
            t === letter && !usedIndices.has(ti)
        );

        if (targetIndex !== -1) {
            result[i] = { letter, state: 'present' };
            usedIndices.add(targetIndex);
        } else {
            result[i] = { letter, state: 'absent' };
        }
    });

    return result;
}

// Update keyboard state with guess results
function updateKeyboardState(
    current: KeyboardState,
    evaluation: LetterEvaluation[]
): KeyboardState {
    const updated = { ...current };

    evaluation.forEach(({ letter, state }) => {
        const key = letter.toUpperCase();
        const currentState = updated[key];

        // Priority: correct > present > absent
        if (state === 'correct') {
            updated[key] = 'correct';
        } else if (state === 'present' && currentState !== 'correct') {
            updated[key] = 'present';
        } else if (state === 'absent' && !currentState) {
            updated[key] = 'absent';
        }
    });

    return updated;
}

export function WordleProvider({ children, targetWord, isArchive = false, initialProgress }: WordleProviderProps) {
    const wordLength = targetWord.length;
    const MAX_GUESSES = wordLength + 1; // n+1 guesses for an n-letter word
    const normalizedTarget = targetWord.toUpperCase();

    // Helper to evaluate guesses for rebuilding state
    const evaluateAllGuesses = useCallback((guesses: string[]) => {
        return guesses.map(guess => ({
            word: guess,
            evaluation: evaluateGuess(guess, normalizedTarget)
        }));
    }, [normalizedTarget]);

    // Initialize game data from server or localStorage
    const [gameData, setGameData] = useState<GameData>(() => {
        // If we have server-side initial progress, use it
        if (initialProgress?.completed) {
            const evaluatedGuesses = evaluateAllGuesses(initialProgress.guesses);
            return {
                targetWord: normalizedTarget,
                guesses: evaluatedGuesses,
                currentGuess: '',
                gameState: initialProgress.won ? 'won' : 'lost',
                startTime: null,
                endTime: null,
                elapsedTime: initialProgress.time,
                date: getTodayDate(),
            };
        }

        // Try to load from localStorage for in-progress games
        if (typeof window !== 'undefined' && !isArchive) {
            const saved = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Only restore if same word (same day's puzzle)
                    if (parsed.targetWord === normalizedTarget && parsed.date === getTodayDate()) {
                        return parsed;
                    }
                } catch (e) {
                    console.error('Failed to parse saved game:', e);
                }
            }
        }

        return {
            targetWord: normalizedTarget,
            guesses: [],
            currentGuess: '',
            gameState: 'playing' as GameState,
            startTime: null,
            endTime: null,
            elapsedTime: 0,
            date: getTodayDate(),
        };
    });

    const [keyboardState, setKeyboardState] = useState<KeyboardState>(() => {
        // Rebuild keyboard state from saved guesses
        let state: KeyboardState = {};
        if (gameData.guesses.length > 0) {
            gameData.guesses.forEach(guess => {
                state = updateKeyboardState(state, guess.evaluation);
            });
        }
        return state;
    });

    const [elapsedTime, setElapsedTime] = useState(gameData.elapsedTime);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isTimerRunning = gameData.gameState === 'playing' && gameData.startTime !== null;

    // Check if already played today
    const [hasPlayedToday, setHasPlayedToday] = useState(false);
    const [todayStats, setTodayStats] = useState<{ guesses: number; time: number } | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && !isArchive) {
            const completed = localStorage.getItem(STORAGE_KEYS.COMPLETED_PUZZLES);
            if (completed) {
                try {
                    const parsed = JSON.parse(completed);
                    const today = getTodayDate();
                    if (parsed[today]) {
                        setHasPlayedToday(true);
                        setTodayStats(parsed[today]);
                    }
                } catch (e) {
                    console.error('Failed to parse completed puzzles:', e);
                }
            }
        }
    }, [isArchive]);

    // Timer effect
    useEffect(() => {
        if (isTimerRunning && gameData.startTime) {
            timerRef.current = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - gameData.startTime!) / 1000));
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isTimerRunning, gameData.startTime]);

    // Save game state to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined' && !isArchive) {
            const toSave = { ...gameData, elapsedTime };
            localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(toSave));
        }
    }, [gameData, elapsedTime, isArchive]);

    // Add a letter to current guess
    const addLetter = useCallback((letter: string) => {
        if (gameData.gameState !== 'playing') return;
        if (gameData.currentGuess.length >= wordLength) return;

        const upperLetter = letter.toUpperCase();
        if (!/^[A-Z]$/.test(upperLetter)) return;

        setGameData(prev => {
            // Start timer on first letter
            const startTime = prev.startTime ?? Date.now();
            return {
                ...prev,
                currentGuess: prev.currentGuess + upperLetter,
                startTime,
            };
        });
    }, [gameData.gameState, gameData.currentGuess.length, wordLength]);

    // Delete last letter
    const deleteLetter = useCallback(() => {
        if (gameData.gameState !== 'playing') return;
        if (gameData.currentGuess.length === 0) return;

        setGameData(prev => ({
            ...prev,
            currentGuess: prev.currentGuess.slice(0, -1),
        }));
    }, [gameData.gameState, gameData.currentGuess.length]);

    // Submit current guess
    const submitGuess = useCallback(() => {
        if (gameData.gameState !== 'playing') return;
        if (gameData.currentGuess.length !== wordLength) {
            toast.error('Not enough letters');
            return;
        }

        // Check if valid word (allow if it matches the target, even if not in dictionary)
        const isCorrectAnswer = gameData.currentGuess === normalizedTarget;
        if (!isCorrectAnswer && !isValidWord(gameData.currentGuess)) {
            toast.error('Not in word list');
            return;
        }

        const evaluation = evaluateGuess(gameData.currentGuess, normalizedTarget);
        const newGuess: Guess = {
            word: gameData.currentGuess,
            evaluation,
        };

        const isWin = gameData.currentGuess === normalizedTarget;
        const isLoss = !isWin && gameData.guesses.length + 1 >= MAX_GUESSES;
        const newGameState: GameState = isWin ? 'won' : isLoss ? 'lost' : 'playing';
        const endTime = (isWin || isLoss) ? Date.now() : null;
        const finalElapsedTime = endTime && gameData.startTime
            ? Math.floor((endTime - gameData.startTime) / 1000)
            : elapsedTime;

        setGameData(prev => ({
            ...prev,
            guesses: [...prev.guesses, newGuess],
            currentGuess: '',
            gameState: newGameState,
            endTime,
            elapsedTime: finalElapsedTime,
        }));

        setKeyboardState(prev => updateKeyboardState(prev, evaluation));

        // Save completion if won or lost
        if ((isWin || isLoss) && typeof window !== 'undefined' && !isArchive) {
            // Save to localStorage for quick access
            const completed = localStorage.getItem(STORAGE_KEYS.COMPLETED_PUZZLES);
            let puzzles: Record<string, { guesses: number; time: number; won: boolean }> = {};

            try {
                puzzles = completed ? JSON.parse(completed) : {};
            } catch (e) {
                console.error('Failed to parse completed puzzles:', e);
            }

            puzzles[getTodayDate()] = {
                guesses: gameData.guesses.length + 1,
                time: finalElapsedTime,
                won: isWin,
            };

            localStorage.setItem(STORAGE_KEYS.COMPLETED_PUZZLES, JSON.stringify(puzzles));
            setHasPlayedToday(true);
            setTodayStats({ guesses: gameData.guesses.length + 1, time: finalElapsedTime });

            // Save to API (async, don't block UI)
            const allGuesses = [...gameData.guesses.map(g => g.word), gameData.currentGuess];
            fetch('/api/platform/games/wordle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    guesses: allGuesses,
                    time: finalElapsedTime,
                    won: isWin
                })
            }).catch(err => console.error('Failed to save to API:', err));
        }
    }, [gameData, wordLength, normalizedTarget, elapsedTime, isArchive]);

    // Reset game
    const resetGame = useCallback((newWord?: string) => {
        const word = (newWord || normalizedTarget).toUpperCase();
        setGameData({
            targetWord: word,
            guesses: [],
            currentGuess: '',
            gameState: 'playing',
            startTime: null,
            endTime: null,
            elapsedTime: 0,
            date: getTodayDate(),
        });
        setKeyboardState({});
        setElapsedTime(0);
    }, [normalizedTarget]);

    // Handle keyboard input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            if (e.key === 'Enter') {
                e.preventDefault();
                submitGuess();
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                deleteLetter();
            } else if (/^[a-zA-Z]$/.test(e.key)) {
                addLetter(e.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [addLetter, deleteLetter, submitGuess]);

    const value: WordleContextType = {
        gameData,
        keyboardState,
        wordLength,
        maxGuesses: MAX_GUESSES,
        addLetter,
        deleteLetter,
        submitGuess,
        resetGame,
        elapsedTime,
        isTimerRunning,
        hasPlayedToday,
        todayStats,
    };

    return (
        <WordleContext.Provider value={value}>
            {children}
        </WordleContext.Provider>
    );
}

export function useWordle() {
    const context = useContext(WordleContext);
    if (!context) {
        throw new Error('useWordle must be used within a WordleProvider');
    }
    return context;
}

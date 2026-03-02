// Dictionary utilities for word validation using an-array-of-english-words
// This package provides ~275,000 English words

import words from 'an-array-of-english-words';

// Create a Set for O(1) lookup
const DICTIONARY = new Set(words.map(w => w.toLowerCase()));

// Group words by length for random word selection
const WORDS_BY_LENGTH: { [key: number]: string[] } = {};
words.forEach(word => {
    const len = word.length;
    if (len >= 3 && len <= 10) { // Support words from 3-10 letters
        if (!WORDS_BY_LENGTH[len]) {
            WORDS_BY_LENGTH[len] = [];
        }
        WORDS_BY_LENGTH[len].push(word.toLowerCase());
    }
});

/**
 * Check if a word is valid (exists in dictionary)
 */
export function isValidWord(word: string): boolean {
    return DICTIONARY.has(word.toLowerCase());
}

/**
 * Get a random word of specified length (for demo/testing)
 */
export function getRandomWord(length: number = 5): string {
    const wordsOfLength = WORDS_BY_LENGTH[length];
    if (!wordsOfLength || wordsOfLength.length === 0) {
        // Fallback to 5-letter words if length not available
        const fallback = WORDS_BY_LENGTH[5] || ['hello'];
        return fallback[Math.floor(Math.random() * fallback.length)].toUpperCase();
    }
    return wordsOfLength[Math.floor(Math.random() * wordsOfLength.length)].toUpperCase();
}

/**
 * Get available word lengths
 */
export function getAvailableWordLengths(): number[] {
    return Object.keys(WORDS_BY_LENGTH).map(Number).sort((a, b) => a - b);
}

/**
 * Check if a word length is supported
 */
export function isWordLengthSupported(length: number): boolean {
    return length in WORDS_BY_LENGTH && WORDS_BY_LENGTH[length].length > 0;
}

/**
 * Get word count for a specific length
 */
export function getWordCount(length?: number): number {
    if (length !== undefined) {
        return WORDS_BY_LENGTH[length]?.length || 0;
    }
    return DICTIONARY.size;
}

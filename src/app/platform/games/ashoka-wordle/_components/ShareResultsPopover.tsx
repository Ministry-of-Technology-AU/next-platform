'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Share2, Twitter, Copy, Check, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ShareResultsPopoverProps {
    guesses: { word: string; evaluation: { letter: string; state: string }[] }[];
    elapsedTime: number;
    wordLength: number;
    maxGuesses: number;
    won: boolean;
    puzzleDate?: string;
    streak?: number;
    leaderboardPosition?: number;
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateStr?: string): string {
    if (!dateStr) {
        return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ShareResultsPopover({
    guesses,
    elapsedTime,
    wordLength,
    maxGuesses,
    won,
    puzzleDate,
    streak = 0,
    leaderboardPosition
}: ShareResultsPopoverProps) {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);

    // Generate emoji grid like actual Wordle
    const emojiGrid = guesses.map(guess =>
        guess.evaluation.map(e => {
            if (e.state === 'correct') return '🟩';
            if (e.state === 'present') return '🟨';
            return '⬛';
        }).join('')
    ).join('\n');

    const dateStr = formatDate(puzzleDate);
    const resultCount = won ? guesses.length : 'X';

    // Build share text with catchy message
    const shareLines = [
        `🎯 Ashoka Wordle - ${dateStr}`,
        '',
        won
            ? `I cracked it in ${resultCount}/${maxGuesses} guesses! ⏱️ ${formatTime(elapsedTime)}`
            : `${resultCount}/${maxGuesses} - I'll get it next time! 💪`,
        '',
        emojiGrid,
    ];

    // Add streak info if present
    if (streak > 0) {
        shareLines.push('');
        shareLines.push(`🔥 ${streak} day streak!`);
    }

    // Add leaderboard position if on leaderboard
    if (leaderboardPosition && leaderboardPosition <= 10) {
        shareLines.push(`🏆 #${leaderboardPosition} on today's leaderboard`);
    }

    shareLines.push('');
    shareLines.push('Play now: sg.ashoka.edu.in/platform/games/ashoka-wordle');

    const shareText = shareLines.join('\n');

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            toast.success('Copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            toast.error('Failed to copy');
        }
    };

    const handleTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, '_blank');
        setOpen(false);
    };

    const handleWhatsApp = () => {
        // Use whatsapp api with text parameter for better emoji support
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Results
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="center">
                <div className="flex flex-col gap-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={handleTwitter}
                    >
                        <Twitter className="h-4 w-4 mr-2" />
                        Share on Twitter
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={handleWhatsApp}
                    >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Share on WhatsApp
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={handleCopy}
                    >
                        {copied ? (
                            <Check className="h-4 w-4 mr-2 text-green" />
                        ) : (
                            <Copy className="h-4 w-4 mr-2" />
                        )}
                        {copied ? 'Copied!' : 'Copy to Clipboard'}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}


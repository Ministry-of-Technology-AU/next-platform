'use client';

import { ArrowLeft, HelpCircle, BarChart2, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import GameTimer from './GameTimer';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface WordleHeaderProps {
    title?: string;
    showBackButton?: boolean;
    backHref?: string;
}

export default function WordleHeader({
    title = 'Ashoka Wordle',
    showBackButton = true,
    backHref = '/platform/games'
}: WordleHeaderProps) {
    return (
        <div className="flex items-center justify-between w-full mb-6 px-2">
            <div className="flex items-center gap-4">
                {showBackButton && (
                    <Link href={backHref}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                )}
                <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
            </div>

            <div className="flex items-center gap-2">
                <GameTimer />

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link href="/platform/games/ashoka-wordle/leaderboards">
                                <Button variant="ghost" size="icon">
                                    <BarChart2 className="h-5 w-5" />
                                </Button>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Leaderboard</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <HelpCircle className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                            <div className="text-sm">
                                <p className="font-bold mb-2">How to Play</p>
                                <p>Guess the word in 6 tries.</p>
                                <ul className="mt-2 space-y-1">
                                    <li><span className="inline-block w-4 h-4 bg-green rounded mr-2"></span>Correct letter and position</li>
                                    <li><span className="inline-block w-4 h-4 bg-secondary rounded mr-2"></span>Correct letter, wrong position</li>
                                    <li><span className="inline-block w-4 h-4 bg-gray rounded mr-2"></span>Letter not in word</li>
                                </ul>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}

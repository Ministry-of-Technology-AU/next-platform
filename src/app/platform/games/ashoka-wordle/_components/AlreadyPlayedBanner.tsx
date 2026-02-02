'use client';

import { useWordle } from '../_context/wordle-context';
import {
    Banner,
    BannerIcon,
    BannerTitle,
    BannerAction,
    BannerClose,
} from '@/components/ui/shadcn-io/banner';
import { Trophy, Archive, Medal } from 'lucide-react';
import Link from 'next/link';

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

interface AlreadyPlayedBannerProps {
    visible?: boolean;
}

export default function AlreadyPlayedBanner({ visible = true }: AlreadyPlayedBannerProps) {
    const { hasPlayedToday, todayStats } = useWordle();

    if (!hasPlayedToday || !visible) {
        return null;
    }

    return (
        <Banner
            visible={visible}
            className="bg-green text-white rounded-lg mb-4"
            inset
        >
            <BannerIcon icon={Trophy} />
            <BannerTitle className="flex-1">
                <span className="font-semibold">You&apos;ve completed today&apos;s puzzle!</span>
                {todayStats && (
                    <span className="ml-2 text-sm opacity-90">
                        ({todayStats.guesses}/6 guesses • {formatTime(todayStats.time)})
                    </span>
                )}
            </BannerTitle>
            <div className="flex gap-2">
                <Link href="/platform/games/ashoka-wordle/leaderboards">
                    <BannerAction className="border-white/30">
                        <Medal className="h-4 w-4 mr-1" />
                        Leaderboard
                    </BannerAction>
                </Link>
                <Link href="/platform/games/ashoka-wordle/archives">
                    <BannerAction className="border-white/30">
                        <Archive className="h-4 w-4 mr-1" />
                        Archives
                    </BannerAction>
                </Link>
            </div>
        </Banner>
    );
}

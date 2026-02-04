'use client';
import { format } from 'date-fns';

interface ScoreboardHeaderProps {
    leagueName: string;
    matchTitle: string;
}

export function ScoreboardHeader({ leagueName, matchTitle }: ScoreboardHeaderProps) {
    const currentDate = format(new Date(), 'EEEE, MMMM do');

    return (
        <div className="w-full bg-white rounded-full px-6 py-2 flex justify-between items-center shadow-sm border border-gray-200/50">
            <h1 className="md:text-base font-bold text-primary truncate flex items-center gap-2">
                <span className="uppercase text-primary-dark text-[18px]">{leagueName}</span>
                <span className="text-gray-400 text-[18px]">|</span>
                <span className="text-gray-600 font-medium text-[18px]">{matchTitle}</span>
            </h1>
            <div className="text-xs font-semibold text-gray-500 hidden sm:block">
                {currentDate}
            </div>
        </div>
    );
}

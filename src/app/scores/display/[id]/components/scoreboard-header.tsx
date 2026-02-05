'use client';
import { format } from 'date-fns';

import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ScoreboardHeaderProps {
    leagueName: string;
    matchTitle: string;
    sport?: string;
    isEditable?: boolean;
    onLeagueNameChange?: (val: string) => void;
    onMatchTitleChange?: (val: string) => void;
    onSportChange?: (val: string) => void;
}

export function ScoreboardHeader({
    leagueName,
    matchTitle,
    sport,
    isEditable = false,
    onLeagueNameChange,
    onMatchTitleChange,
    onSportChange,
}: ScoreboardHeaderProps) {
    const currentDate = format(new Date(), 'EEEE, MMMM do');

    if (isEditable) {
        return (
            <div className="w-full dark:bg-gray-dark/20 backdrop-blur rounded-xl px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-md border border-gray-200 gap-4">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center overflow-hidden">
                    <Select value={sport} onValueChange={onSportChange}>
                        <SelectTrigger className="w-[180px] shrink-0">
                            <SelectValue placeholder="Select Sport" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="badminton">Badminton</SelectItem>
                            <SelectItem value="squash">Squash</SelectItem>
                            <SelectItem value="table-tennis">Table Tennis</SelectItem>
                            <SelectItem value="tennis">Tennis</SelectItem>
                            <SelectItem value="volleyball">Volleyball</SelectItem>
                            <SelectItem value="basketball">Basketball</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2 overflow-hidden w-full">
                        <Input
                            value={leagueName}
                            onChange={(e) => onLeagueNameChange?.(e.target.value)}
                            className="min-w-[150px] w-full md:w-[200px] font-bold uppercase text-primary dark:text-primary-bright truncate"
                            placeholder="League Name"
                            title={leagueName}
                        />
                        <span className="text-gray-400 shrink-0">|</span>
                        <Input
                            value={matchTitle}
                            onChange={(e) => onMatchTitleChange?.(e.target.value)}
                            className="min-w-[150px] w-full md:w-[250px] font-medium truncate"
                            placeholder="Match Title"
                            title={matchTitle}
                        />
                    </div>
                </div>
                <div className="text-xs font-semibold text-gray-500 shrink-0">
                    {currentDate}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-full px-6 py-2 flex justify-between items-center shadow-sm border border-border/50">
            <h1 className="md:text-base font-bold text-primary truncate flex items-center gap-2 overflow-hidden">
                <span className="uppercase text-primary-dark text-[18px] truncate" title={leagueName}>{leagueName}</span>
                <span className="text-gray-light text-[18px]">|</span>
                <span className="text-gray-dark font-medium text-[18px] truncate" title={matchTitle}>{matchTitle}</span>
            </h1>
            <div className="text-xs font-semibold text-gray hidden sm:block shrink-0">
                {currentDate}
            </div>
        </div>
    );
}

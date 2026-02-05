'use client';

import { MatchScore } from './types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MatchCardProps {
    match: MatchScore;
}

export function MatchCard({ match }: MatchCardProps) {
    const handleClick = () => {
        console.log(`Match ID: ${match.id}`);
        console.log(
            `Score: ${match.team_a_name} ${match.team_a_score} - ${match.team_b_score} ${match.team_b_name}`
        );
    };

    return (
        <Card
            onClick={handleClick}
            // rounded-[32px] gives it that distinct "widget" shape from the screenshot
            // border-none and a background color help mimic the card style
            className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-none dark:bg-black/70 bg-gray-light rounded-xl"
        >
            <CardContent className="p-6 flex flex-col gap-6 rounded-xl">
                {/* Header Row: Sport Name + Time/Status */}
                <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-normal text-primary-bright dark:text-secondary-dark">
                        {match.match_name || 'Match'}
                    </span>

                    {/* Top Right Badge - Layout placeholder for the "10:05" in screenshot. 
              Styled neutrally as requested. */}
                    <Badge
                        variant="default"
                        className="rounded-full px-4 py-1 text-xs font-medium uppercase"
                    >
                        {match.sport || 'Match'}
                    </Badge>
                </div>

                {/* Teams and Scores Grid */}
                <div className="flex flex-col gap-4">

                    {/* Team A Row */}
                    <div className="flex items-center justify-between">
                        <span
                            className="text-md font-medium truncate w-3/4"
                            title={match.team_a_name}
                        >
                            {match.team_a_name}
                        </span>
                        <span className="text-md font-bold text-primary tabular-nums">
                            {match.team_a_score}
                        </span>
                    </div>

                    {/* Team B Row */}
                    <div className="flex items-center justify-between">
                        <span
                            className="text-md font-medium truncate w-3/4"
                            title={match.team_b_name}
                        >
                            {match.team_b_name}
                        </span>
                        <span className="text-md font-bold text-primary tabular-nums">
                            {match.team_b_score}
                        </span>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}
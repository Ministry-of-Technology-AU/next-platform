import Image from 'next/image';
import { Team } from '../types';

interface ScoreboardMainProps {
    teamA: Team;
    teamB: Team;
    scoreA: number | string;
    scoreB: number | string;
}

export function ScoreboardMain({ teamA, teamB, scoreA, scoreB }: ScoreboardMainProps) {
    return (
        <div className="w-full max-w-5xl bg-primary text-white rounded-[2rem] h-[220px] shadow-xl relative overflow-hidden flex items-center mt-4 mb-4">
            {/* Decorative center line */}
            <div className="absolute top-6 bottom-6 left-1/2 w-px bg-white/20 transform -translate-x-1/2 rounded-full"></div>

            {/* Container - Grid 2 cols */}
            <div className="w-full h-full grid grid-cols-2">

                {/* Team A (Left Side) - Layout: [Logo][Name] ... [Score] */}
                <div className="flex flex-row items-center justify-between pr-8 pl-10 h-full">
                    {/* Logo and Name Group */}
                    <div className="flex flex-row items-center gap-4">
                        <div className="relative w-20 h-20 bg-white/5 rounded-full p-2 flex-shrink-0 border border-white/10">
                            {/* Fallback aware image */}
                            <Image
                                src={teamA.logoUrl || '/placeholder-logo.png'}
                                alt={teamA.name}
                                fill
                                className="object-contain p-2"
                            />
                            {!teamA.logoUrl && (
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-xl opacity-50">
                                    {teamA.name.substring(0, 1)}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col text-left max-w-[140px]">
                            {/* Providing a specific class for the dark blue text if needed, or white for contrast on default red */}
                            <span className="text-lg md:text-xl font-black uppercase tracking-wide leading-tight text-white/90 drop-shadow-sm">
                                {teamA.name}
                            </span>
                        </div>
                    </div>

                    {/* Score A - Right Aligned against center line */}
                    <div className="flex items-center justify-end min-w-[100px]">
                        <div className="text-[9rem] font-bold leading-none tabular-nums tracking-tighter text-white drop-shadow-lg pr-4">
                            {scoreA}
                        </div>
                    </div>
                </div>

                {/* Team B (Right Side) - Layout: [Score] ... [Name][Logo] */}
                <div className="flex flex-row-reverse items-center justify-between pl-8 pr-10 h-full">
                    {/* Logo and Name Group */}
                    <div className="flex flex-row-reverse items-center gap-4">
                        <div className="relative w-20 h-20 bg-white/5 rounded-full p-2 flex-shrink-0 border border-white/10">
                            <Image
                                src={teamB.logoUrl || '/placeholder-logo.png'}
                                alt={teamB.name}
                                fill
                                className="object-contain p-2"
                            />
                            {!teamB.logoUrl && (
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-xl opacity-50">
                                    {teamB.name.substring(0, 1)}
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col text-right max-w-[140px]">
                            <span className="text-lg md:text-xl font-black uppercase tracking-wide leading-tight text-white/90 drop-shadow-sm">
                                {teamB.name}
                            </span>
                        </div>
                    </div>

                    {/* Score B - Left Aligned against center line */}
                    <div className="flex items-center justify-start min-w-[100px]">
                        <div className="text-[9rem] font-bold leading-none tabular-nums tracking-tighter text-white drop-shadow-lg pl-4">
                            {scoreB}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

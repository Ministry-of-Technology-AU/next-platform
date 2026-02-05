import Image from 'next/image';
import { useState } from 'react';
import { Team } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FileUpload } from '@/components/form';
import { Plus, Minus, Pencil } from 'lucide-react';

interface ScoreboardMainProps {
    teamA: Team;
    teamB: Team;
    scoreA: number | string;
    scoreB: number | string;
    isEditable?: boolean;
    onScoreChange?: (team: 'A' | 'B', delta: number) => void;
    onTeamNameChange?: (team: 'A' | 'B', name: string) => void;
    onTeamLogoChange?: (team: 'A' | 'B', file: File) => void;
}

export function ScoreboardMain({
    teamA,
    teamB,
    scoreA,
    scoreB,
    isEditable = false,
    onScoreChange,
    onTeamNameChange,
    onTeamLogoChange
}: ScoreboardMainProps) {
    const [popoverOpen, setPopoverOpen] = useState<{ team: 'A' | 'B', type: 'plus' | 'minus' } | null>(null);

    const handleScoreClick = (team: 'A' | 'B', delta: number) => {
        onScoreChange?.(team, delta);
    };

    const handleContextMenu = (e: React.MouseEvent, team: 'A' | 'B', type: 'plus' | 'minus') => {
        e.preventDefault();
        setPopoverOpen({ team, type });
    };

    const TeamLogo = ({ team, side }: { team: Team, side: 'A' | 'B' }) => {
        const content = (
            <div className={`relative w-20 h-20 bg-white/5 rounded-full p-2 flex-shrink-0 border border-white/10 ${isEditable ? 'cursor-pointer group hover:bg-white/10' : ''}`}>
                <Image
                    src={team.logoUrl || '/placeholder-logo.png'}
                    alt={team.name}
                    fill
                    className={`object-contain p-2 ${isEditable ? 'group-hover:opacity-50' : ''}`}
                />
                {!team.logoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xl opacity-50">
                        {team.name.substring(0, 1)}
                    </div>
                )}
                {isEditable && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil className="w-6 h-6 text-white" />
                    </div>
                )}
            </div>
        );

        if (isEditable) {
            return (
                <Dialog>
                    <DialogTrigger asChild>
                        {content}
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogTitle className="hidden">Upload Team Logo</DialogTitle>
                        <FileUpload
                            title="Upload Team Logo"
                            accept="image/*"
                            maxSize={5}
                            onChange={(files) => {
                                if (files.length > 0) {
                                    onTeamLogoChange?.(side, files[0]);
                                }
                            }}
                        />
                    </DialogContent>
                </Dialog>
            );
        }
        return content;
    };

    const ScoreControls = ({ team, currentScore }: { team: 'A' | 'B', currentScore: number | string }) => {
        if (!isEditable) {
            return (
                <div className={`text-[9rem] font-bold leading-none tabular-nums tracking-tighter text-white drop-shadow-lg ${team === 'A' ? 'pr-4' : 'pl-4'}`}>
                    {currentScore}
                </div>
            );
        }

        const increments = [2, 3, 5, 15];

        return (
            <div className={`flex items-center gap-4 ${team === 'B' ? 'flex-row-reverse' : ''}`}>
                <div className="text-[6rem] font-bold leading-none tabular-nums tracking-tighter text-white drop-shadow-lg">
                    {currentScore}
                </div>
                <div className="flex flex-col gap-2">
                    {/* Plus Button Popover */}
                    <Popover open={popoverOpen?.team === team && popoverOpen?.type === 'plus'} onOpenChange={(open) => !open && setPopoverOpen(null)}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-green hover:bg-green-dark text-white border-none"
                                onClick={() => handleScoreClick(team, 1)}
                                onContextMenu={(e) => handleContextMenu(e, team, 'plus')}
                            >
                                <Plus className="h-6 w-6" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-16 p-1 flex flex-col gap-1">
                            {increments.map(inc => (
                                <Button
                                    key={inc}
                                    variant="ghost"
                                    className="h-8 text-xs font-bold"
                                    onClick={() => {
                                        handleScoreClick(team, inc);
                                        setPopoverOpen(null);
                                    }}
                                >
                                    +{inc}
                                </Button>
                            ))}
                        </PopoverContent>
                    </Popover>

                    {/* Minus Button Popover */}
                    <Popover open={popoverOpen?.team === team && popoverOpen?.type === 'minus'} onOpenChange={(open) => !open && setPopoverOpen(null)}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-destructive hover:bg-primary-dark text-white border-none"
                                onClick={() => handleScoreClick(team, -1)}
                                onContextMenu={(e) => handleContextMenu(e, team, 'minus')}
                            >
                                <Minus className="h-6 w-6" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-16 p-1 flex flex-col gap-1">
                            {increments.map(inc => (
                                <Button
                                    key={inc}
                                    variant="ghost"
                                    className="h-8 text-xs font-bold"
                                    onClick={() => {
                                        handleScoreClick(team, -inc);
                                        setPopoverOpen(null);
                                    }}
                                >
                                    -{inc}
                                </Button>
                            ))}
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full max-w-5xl bg-primary text-white rounded-[2rem] h-[220px] shadow-xl relative overflow-visible flex items-center mt-4 mb-4">
            {/* Decorative center line */}
            <div className="absolute top-6 bottom-6 left-1/2 w-px bg-white/20 transform -translate-x-1/2 rounded-full"></div>

            {/* Container - Grid 2 cols */}
            <div className="w-full h-full grid grid-cols-2">

                {/* Team A (Left Side) - Layout: [Logo][Name] ... [Score] */}
                <div className="flex flex-row items-center justify-between pr-8 pl-10 h-full">
                    {/* Logo and Name Group */}
                    <div className="flex flex-row items-center gap-4">
                        <TeamLogo team={teamA} side="A" />
                        <div className="flex flex-col text-left max-w-[140px] overflow-hidden">
                            {isEditable ? (
                                <Input
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-bold uppercase truncate"
                                    value={teamA.name}
                                    onChange={(e) => onTeamNameChange?.('A', e.target.value)}
                                    title={teamA.name}
                                />
                            ) : (
                                <span className="text-lg md:text-xl font-black uppercase tracking-wide leading-tight text-white/90 drop-shadow-sm truncate block" title={teamA.name}>
                                    {teamA.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Score A - Right Aligned against center line */}
                    <div className="flex items-center justify-end min-w-[100px]">
                        <ScoreControls team="A" currentScore={scoreA} />
                    </div>
                </div>

                {/* Team B (Right Side) - Layout: [Score] ... [Name][Logo] */}
                <div className="flex flex-row-reverse items-center justify-between pl-8 pr-10 h-full">
                    {/* Logo and Name Group */}
                    <div className="flex flex-row-reverse items-center gap-4">
                        <TeamLogo team={teamB} side="B" />
                        <div className="flex flex-col text-right max-w-[140px] overflow-hidden">
                            {isEditable ? (
                                <Input
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-bold uppercase text-right truncate"
                                    value={teamB.name}
                                    onChange={(e) => onTeamNameChange?.('B', e.target.value)}
                                    title={teamB.name}
                                />
                            ) : (
                                <span className="text-lg md:text-xl font-black uppercase tracking-wide leading-tight text-white/90 drop-shadow-sm truncate block" title={teamB.name}>
                                    {teamB.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Score B - Left Aligned against center line */}
                    <div className="flex items-center justify-start min-w-[100px]">
                        <ScoreControls team="B" currentScore={scoreB} />
                    </div>
                </div>

            </div>
        </div>
    );
}

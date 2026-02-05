import { AbstractScoreCard, Team } from '../types';

interface InfoCardsProps {
    cards: AbstractScoreCard[];
    teamA: Team;
    teamB: Team;
}

export function InfoCards({ cards, teamA, teamB }: InfoCardsProps) {
    if (!cards || cards.length === 0) return null;

    // Filter out live sets
    const archivedCards = cards.filter(c => c.subtext !== 'Live');

    if (archivedCards.length === 0) return null;

    return (
        <div className="flex flex-col gap-3 w-full mx-auto">
            {archivedCards.map((card, idx) => {
                const valA = Number(card.valueA);
                const valB = Number(card.valueB);
                let winnerText = '';

                if (!isNaN(valA) && !isNaN(valB)) {
                    if (valA > valB) winnerText = `Won by ${teamA.name}`;
                    else if (valB > valA) winnerText = `Won by ${teamB.name}`;
                }

                return (
                    <div
                        key={idx}
                        className="flex flex-row items-center justify-between px-6 py-3 rounded-full shadow-sm w-full bg-white/60 backdrop-blur-md border border-black"
                    >
                        {/* Set Name */}
                        <span className="text-gray font-bold text-sm uppercase tracking-widest min-w-[60px]">
                            {card.label}
                        </span>

                        {/* Score */}
                        <div className="flex items-center gap-6">
                            <span className="text-2xl font-black text-black tabular-nums">
                                {card.valueA || '0'}
                            </span>
                            <div className="h-6 w-px bg-gray-light/50"></div>
                            <span className="text-2xl font-black text-black tabular-nums">
                                {card.valueB || '0'}
                            </span>
                        </div>

                        {/* Winner Sentence */}
                        <div className="min-w-[150px] flex justify-end text-right">
                            {winnerText && (
                                <span className="text-sm font-semibold text-gray-dark italic">
                                    {winnerText}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
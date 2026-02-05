"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ScoreboardLayout } from "../../display/[id]/components/scoreboard-layout";
import { ScoreboardHeader } from "../../display/[id]/components/scoreboard-header";
import { ScoreboardMain } from "../../display/[id]/components/scoreboard-main";
import { InfoCards } from "../../display/[id]/components/info-cards";
import { MatchData, AbstractScoreCard } from "../../display/[id]/types";
import { Button } from "@/components/ui/button";

// Initial Mock Data
const INITIAL_MATCH_DATA: MatchData = {
    id: "match-123",
    leagueName: "Inter-University League",
    matchTitle: "Badminton Men's Singles Final",
    sport: "badminton",
    isLive: true,
    teamA: {
        id: "t1",
        name: "Ashoka University",
        logoUrl: "",
    },
    teamB: {
        id: "t2",
        name: "Shiv Nadar",
        logoUrl: "",
    },
    scoreA: 0,
    scoreB: 0,
    infoCards: [],
};

export default function AdminScoreboardPage() {
    const params = useParams();
    const [match, setMatch] = useState<MatchData>(INITIAL_MATCH_DATA);

    const handleScoreChange = (team: "A" | "B", delta: number) => {
        if (!match.isLive) return;
        setMatch((prev) => ({
            ...prev,
            [team === "A" ? "scoreA" : "scoreB"]: Math.max(0, Number(prev[team === "A" ? "scoreA" : "scoreB"]) + delta),
        }));
    };

    const handleTeamNameChange = (team: "A" | "B", name: string) => {
        if (!match.isLive) return;
        setMatch((prev) => ({
            ...prev,
            [team === "A" ? "teamA" : "teamB"]: {
                ...prev[team === "A" ? "teamA" : "teamB"],
                name,
            },
        }));
    };

    const handleTeamLogoChange = (team: "A" | "B", file: File) => {
        if (!match.isLive) return;
        const url = URL.createObjectURL(file);
        setMatch((prev) => ({
            ...prev,
            [team === "A" ? "teamA" : "teamB"]: {
                ...prev[team === "A" ? "teamA" : "teamB"],
                logoUrl: url,
            },
        }));
    };

    const handleEndSet = () => {
        if (!match.isLive) return;
        const newCard: AbstractScoreCard = {
            label: `Set ${match.infoCards.length + 1}`,
            valueA: match.scoreA,
            valueB: match.scoreB,
            highlight: false,
        };

        setMatch((prev) => ({
            ...prev,
            scoreA: 0,
            scoreB: 0,
            infoCards: [...prev.infoCards, newCard],
        }));
    };

    const handleEndMatch = () => {
        if (!match.isLive) return;
        if (window.confirm("Are you sure you want to end the match? This will freeze all details.")) {
            setMatch((prev) => ({ ...prev, isLive: false }));
        }
    };

    return (
        <ScoreboardLayout variant="admin">
            <ScoreboardHeader
                leagueName={match.leagueName}
                matchTitle={match.matchTitle}
                sport={match.sport}
                isEditable={match.isLive}
                onLeagueNameChange={(val) => setMatch((prev) => ({ ...prev, leagueName: val }))}
                onMatchTitleChange={(val) => setMatch((prev) => ({ ...prev, matchTitle: val }))}
                onSportChange={(val) => setMatch((prev) => ({ ...prev, sport: val }))}
            />

            <ScoreboardMain
                teamA={match.teamA}
                teamB={match.teamB}
                scoreA={match.scoreA}
                scoreB={match.scoreB}
                isEditable={match.isLive}
                onScoreChange={handleScoreChange}
                onTeamNameChange={handleTeamNameChange}
                onTeamLogoChange={handleTeamLogoChange}
            />

            {match.isLive && (
                <div className="flex gap-4 justify-center w-full">
                    <Button
                        className="bg-secondary-dark hover:bg-secondary-extradark text-white font-bold px-8 py-6 text-lg rounded-xl shadow-lg"
                        onClick={handleEndSet}
                    >
                        End Set
                    </Button>
                    <Button
                        className="bg-destructive hover:bg-primary-dark text-white font-bold px-8 py-6 text-lg rounded-xl shadow-lg"
                        onClick={handleEndMatch}
                    >
                        End Match
                    </Button>
                </div>
            )}

            <InfoCards
                cards={match.infoCards}
                teamA={match.teamA}
                teamB={match.teamB}
            />
        </ScoreboardLayout>
    );
}

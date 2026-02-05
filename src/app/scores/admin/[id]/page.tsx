"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ScoreboardLayout } from "../../display/[id]/components/scoreboard-layout";
import { ScoreboardHeader } from "../../display/[id]/components/scoreboard-header";
import { ScoreboardMain } from "../../display/[id]/components/scoreboard-main";
import { InfoCards } from "../../display/[id]/components/info-cards";
import { MatchData, AbstractScoreCard } from "../../display/[id]/types";
import { Button } from "@/components/ui/button";
import { getMatch, updateMatch, updateScore, endSet } from "@/lib/apis/match-scores";

// Initial Mock Data (Fallback)
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
    const [match, setMatch] = useState<MatchData | null>(null);
    const [loading, setLoading] = useState(true);

    const matchId = params.id as string;

    // Fetch initial data
    useEffect(() => {
        if (!matchId || matchId === 'test-id') {
            // Keep mock data for test-id for verifying UI if needed, or just fail? 
            // Let's assume real ID is needed, but for 'test-id' we might default to mock or error.
            if (matchId === 'test-id') {
                setMatch(INITIAL_MATCH_DATA);
                setLoading(false);
                return;
            }
        }

        async function load() {
            try {
                const data = await getMatch(matchId);
                if (data) setMatch(data);
                else console.error("Match not found");
            } catch (err) {
                console.error("Failed to load match", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [matchId]);

    const handleScoreChange = async (team: "A" | "B", delta: number) => {
        if (!match || !match.isLive) return;

        const currentScoreA = Number(match.scoreA);
        const currentScoreB = Number(match.scoreB);
        const newScoreA = team === "A" ? Math.max(0, currentScoreA + delta) : currentScoreA;
        const newScoreB = team === "B" ? Math.max(0, currentScoreB + delta) : currentScoreB;

        // Optimistic Update
        setMatch((prev) => prev ? ({
            ...prev,
            scoreA: newScoreA,
            scoreB: newScoreB,
        }) : null);

        // API Call
        try {
            await updateScore(match.id, newScoreA, newScoreB);
        } catch (error) {
            console.error("Failed to update score", error);
            // Revert state if needed?
        }
    };

    const handleTeamNameChange = async (team: "A" | "B", name: string) => {
        if (!match || !match.isLive) return;

        const newTeamA = team === "A" ? { ...match.teamA, name } : match.teamA;
        const newTeamB = team === "B" ? { ...match.teamB, name } : match.teamB;

        setMatch(prev => prev ? ({ ...prev, teamA: newTeamA, teamB: newTeamB }) : null);

        try {
            await updateMatch(match.id, {
                teamA: newTeamA,
                teamB: newTeamB
            });
        } catch (error) {
            console.error("Failed to update team name", error);
        }
    };

    const handleTeamLogoChange = (team: "A" | "B", file: File) => {
        // Disabled per requirements
        console.warn("Logo editing is disabled");
    };

    // Additional handlers for Header inputs
    const handleLeagueChange = async (val: string) => {
        if (!match) return;
        setMatch(prev => prev ? ({ ...prev, leagueName: val }) : null);
        try { await updateMatch(match.id, { leagueName: val }); } catch (e) { console.error(e); }
    };

    const handleMatchTitleChange = async (val: string) => {
        if (!match) return;
        setMatch(prev => prev ? ({ ...prev, matchTitle: val }) : null);
        try { await updateMatch(match.id, { matchTitle: val }); } catch (e) { console.error(e); }
    };

    const handleSportChange = async (val: string) => {
        if (!match) return;
        setMatch(prev => prev ? ({ ...prev, sport: val }) : null);
        try { await updateMatch(match.id, { sport: val }); } catch (e) { console.error(e); }
    };

    const handleEndSet = async () => {
        if (!match || !match.isLive) return;

        const newCard: AbstractScoreCard = {
            label: `Set ${match.infoCards.length + 1}`,
            valueA: match.scoreA,
            valueB: match.scoreB,
            highlight: false,
        };

        const newSets = [...match.infoCards, newCard];

        setMatch((prev) => prev ? ({
            ...prev,
            scoreA: 0,
            scoreB: 0,
            infoCards: newSets,
        }) : null);

        try {
            await endSet(match.id, newSets);
        } catch (error) {
            console.error("Failed to end set", error);
        }
    };

    const handleEndMatch = async () => {
        if (!match || !match.isLive) return;
        if (window.confirm("Are you sure you want to end the match? This will freeze all details.")) {
            setMatch((prev) => prev ? ({ ...prev, isLive: false }) : null);
            try {
                await updateMatch(match.id, { isLive: false });
            } catch (error) {
                console.error("Failed to end match", error);
            }
        }
    };

    if (loading) return <div className="w-full h-screen flex items-center justify-center text-white">Loading...</div>;
    if (!match) return <div className="w-full h-screen flex items-center justify-center text-white">Match not found</div>;

    return (
        <ScoreboardLayout variant="admin">
            <ScoreboardHeader
                leagueName={match.leagueName}
                matchTitle={match.matchTitle}
                sport={match.sport}
                isEditable={match.isLive}
                onLeagueNameChange={handleLeagueChange}
                onMatchTitleChange={handleMatchTitleChange}
                onSportChange={handleSportChange}
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

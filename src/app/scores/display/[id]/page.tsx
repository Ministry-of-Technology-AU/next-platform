'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ScoreboardLayout } from './components/scoreboard-layout';
import { ScoreboardHeader } from './components/scoreboard-header';
import { ScoreboardMain } from './components/scoreboard-main';
import { InfoCards } from './components/info-cards';
import { MatchData } from './types';
import { getMatch } from '@/lib/apis/match-scores';
import { MATCH_SCORE_MODEL } from '@/lib/constants';
import { connectToStrapiStream } from '@/lib/apis/strapi-realtime';

export default function ScoreboardPage() {
  const params = useParams();
  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);

  const matchId = params.id as string;

  // Initial Fetch
  useEffect(() => {
    async function load() {
      try {
        const data = await getMatch(matchId);
        if (data) setMatch(data);
      } catch (err) {
        console.error("Failed to load match", err);
      } finally {
        setLoading(false);
      }
    }
    if (matchId) load();
  }, [matchId]);

  // Real-time Updates
  useEffect(() => {
    if (!matchId) return;

    const cleanup = connectToStrapiStream((data) => {
      // Check if update is for this match
      if (data.model === 'match-score' && data.entry && String(data.entry.id) === matchId) {
        setMatch(prev => {
          if (!prev) return null;
          const entry = data.entry;

          // Merge updates
          return {
            ...prev,
            // Check fields that might be updated
            leagueName: entry.league_name || prev.leagueName,
            matchTitle: entry.match_name || prev.matchTitle,
            sport: entry.sport || prev.sport,
            isLive: entry.match_status ? entry.match_status === 'live' : prev.isLive,
            scoreA: entry.team_a_score !== undefined ? entry.team_a_score : prev.scoreA,
            scoreB: entry.team_b_score !== undefined ? entry.team_b_score : prev.scoreB,
            teamA: {
              ...prev.teamA,
              name: entry.team_a_name || prev.teamA.name,
              logoUrl: entry.team_a_logo || prev.teamA.logoUrl,
            },
            teamB: {
              ...prev.teamB,
              name: entry.team_b_name || prev.teamB.name,
              logoUrl: entry.team_b_logo || prev.teamB.logoUrl,
            },
            infoCards: entry.sets || prev.infoCards
          };
        });
      }
    });

    return cleanup;
  }, [matchId]);

  if (loading) return <div className="text-white flex items-center justify-center h-screen">Loading...</div>;
  if (!match) return <div className="text-white flex items-center justify-center h-screen">Match not found</div>;

  return (
    <ScoreboardLayout>
      <ScoreboardHeader
        leagueName={match.leagueName}
        matchTitle={match.matchTitle}
        sport={match.sport}
      />

      <ScoreboardMain
        teamA={match.teamA}
        teamB={match.teamB}
        scoreA={match.scoreA}
        scoreB={match.scoreB}
      />

      <InfoCards cards={match.infoCards} teamA={match.teamA} teamB={match.teamB} />
    </ScoreboardLayout>
  );
}
'use client';

import { useParams } from 'next/navigation';
import { ScoreboardLayout } from './components/scoreboard-layout';
import { ScoreboardHeader } from './components/scoreboard-header';
import { ScoreboardMain } from './components/scoreboard-main';
import { InfoCards } from './components/info-cards';
import { MatchData } from './types';

// Mock Data - later to be replaced by backend fetch
const MOCK_MATCH_DATA: MatchData = {
  id: 'match-123',
  leagueName: 'Inter-University League',
  matchTitle: 'Badminton Men\'s Singles Final',
  isLive: true,
  teamA: {
    id: 't1',
    name: 'Ashoka University',
    logoUrl: '', // Will fallback to initials
  },
  teamB: {
    id: 't2',
    name: 'Shiv Nadar',
    logoUrl: '', // Will fallback to initials
  },
  scoreA: 21,
  scoreB: 19,
  infoCards: [
    { label: 'Set 1', valueA: 21, valueB: 15, highlight: true, subtext: 'Ashoka' },
    { label: 'Set 2', valueA: 18, valueB: 21, highlight: false, subtext: 'SNU' },
    { label: 'Set 3', valueA: 5, valueB: 2, highlight: true, subtext: 'Live' },
  ]
};

export default function ScoreboardPage() {
  const params = useParams();
  // In a real app, use params.id to fetch data
  const match = MOCK_MATCH_DATA;

  return (
    <ScoreboardLayout>
      <ScoreboardHeader
        leagueName={match.leagueName}
        matchTitle={match.matchTitle}
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
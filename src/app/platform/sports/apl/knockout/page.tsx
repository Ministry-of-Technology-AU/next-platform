"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

const roundLabels: Record<string, string> = {
  round_of_16: 'Round of 16',
  quarter_final: 'Quarter Finals',
  semi_final: 'Semi Finals',
  final: 'Final',
};

const roundOrder = ['round_of_16', 'quarter_final', 'semi_final', 'final'];

const formatRoundLabel = (round?: string) =>
  (round && roundLabels[round]) || round?.replace(/_/g, ' ') || 'Knockout';

export default function APLKnockoutPage() {
  const [rawMatches, setRawMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const matchesRes = await fetch('/api/platform/sports/apl/matches');

        if (matchesRes.ok) {
          const d = await matchesRes.json();
          setRawMatches(d.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const eventSource = new EventSource('/api/platform/sports/apl/sse');
    eventSource.onmessage = () => fetchData();
    eventSource.onerror = () => console.warn('[SSE] Connection lost');

    return () => eventSource.close();
  }, []);

  const buildParticipant = useCallback(
    (
      id: string,
      name: string,
      score: number | null,
      winner: boolean
    ) => ({
      id,
      name,
      resultText: score !== null && score !== undefined ? String(score) : '',
      isWinner: winner,
      status: score === null ? null : 'PLAYED',
    }),
    []
  );

  const buildMatch = useCallback(
    (match: any) => {
      const scoreA = match.attributes?.team_a_score;
      const scoreB = match.attributes?.team_b_score;
      const teamA = match.attributes?.team_a?.data?.attributes?.name || 'TBA';
      const teamB = match.attributes?.team_b?.data?.attributes?.name || 'TBA';
      const round = match.attributes?.round;

      return {
        id: match.id,
        name: `${formatRoundLabel(round)} ${match.attributes?.match_number ?? match.id}`,
        tournamentRoundText: formatRoundLabel(round),
        startTime: match.attributes?.start_time || '',
        state:
          match.attributes?.status === 'completed'
            ? 'DONE'
            : match.attributes?.status === 'live'
            ? 'PLAYED'
            : 'NO_PARTY',
        participants: [
          buildParticipant(
            `${match.id}-A`,
            teamA,
            typeof scoreA === 'number' ? scoreA : null,
            typeof scoreA === 'number' && typeof scoreB === 'number' ? scoreA > scoreB : false
          ),
          buildParticipant(
            `${match.id}-B`,
            teamB,
            typeof scoreB === 'number' ? scoreB : null,
            typeof scoreA === 'number' && typeof scoreB === 'number' ? scoreB > scoreA : false
          ),
        ],
        href: `/platform/sports/apl/${match.id}`,
      };
    },
    [buildParticipant]
  );

  const createPlaceholderMatch = useCallback((label: string) => ({
    id: `placeholder-${label}`,
    name: label,
    tournamentRoundText: label,
    startTime: '',
    state: 'NO_PARTY',
    participants: [
      { id: `${label}-A`, name: 'TBA', resultText: '', isWinner: false, status: null },
      { id: `${label}-B`, name: 'TBA', resultText: '', isWinner: false, status: null },
    ],
    href: '#',
  }), []);

  const bracketGroups = useMemo(() => {
    const sortedKnockouts = rawMatches
      .filter((m: any) =>
        m.attributes?.round &&
        roundOrder.includes(m.attributes.round) &&
        m.attributes.round !== 'group_stage'
      )
      .sort((a: any, b: any) =>
        (a.attributes?.match_number ?? 0) - (b.attributes?.match_number ?? 0)
      );

    const roundOf16Matches = sortedKnockouts
      .filter((m: any) => m.attributes?.round === 'round_of_16')
      .slice(0, 8)
      .map(buildMatch);

    const quarterFinalMatches = sortedKnockouts
      .filter((m: any) => m.attributes?.round === 'quarter_final')
      .slice(0, 4)
      .map(buildMatch);

    const semiFinalMatches = sortedKnockouts
      .filter((m: any) => m.attributes?.round === 'semi_final')
      .slice(0, 2)
      .map(buildMatch);

    const finalMatch = sortedKnockouts
      .filter((m: any) => m.attributes?.round === 'final')
      .slice(0, 1)
      .map(buildMatch)[0] ?? createPlaceholderMatch('Final');

    return {
      roundOf16Left: roundOf16Matches.slice(0, 4).map((match, index) =>
        match || createPlaceholderMatch(`R16-L${index + 1}`)
      ),
      quarterFinalLeft: quarterFinalMatches.slice(0, 2).map((match, index) =>
        match || createPlaceholderMatch(`QF-L${index + 1}`)
      ),
      semiFinals: semiFinalMatches.map((match, index) =>
        match || createPlaceholderMatch(`SF-${index + 1}`)
      ),
      finalMatch,
      quarterFinalRight: quarterFinalMatches.slice(2, 4).map((match, index) =>
        match || createPlaceholderMatch(`QF-R${index + 1}`)
      ),
      roundOf16Right: roundOf16Matches.slice(4, 8).map((match, index) =>
        match || createPlaceholderMatch(`R16-R${index + 1}`)
      ),
    };
  }, [rawMatches, buildMatch, createPlaceholderMatch]);

  const renderMatchCard = (match: any) => {
    const card = (
      <div className="rounded-3xl border border-slate-700 bg-slate-950/95 p-4 shadow-lg shadow-slate-950/20 transition hover:-translate-y-1 hover:shadow-xl">
        <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">{match.tournamentRoundText}</div>
        <div className="mt-3 space-y-2">
          {match.participants.map((participant: any) => (
            <div key={participant.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-sm">
              <span className={`truncate ${participant.isWinner ? 'font-semibold text-amber-300' : 'text-slate-100'}`}>
                {participant.name}
              </span>
              <span className={`min-w-[2rem] text-right font-semibold ${participant.isWinner ? 'text-amber-300' : 'text-slate-400'}`}>
                {participant.resultText || '-'}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>{match.startTime ? new Date(match.startTime).toLocaleDateString() : 'TBA'}</span>
          <span>{match.state === 'DONE' ? 'Finished' : match.state === 'PLAYED' ? 'Live' : 'Upcoming'}</span>
        </div>
      </div>
    );

    return match.href && match.href !== '#' ? (
      <a href={match.href} className="block">
        {card}
      </a>
    ) : (
      <div className="block cursor-default">{card}</div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading Knockout Bracket...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto inline-flex items-center justify-center rounded-full bg-primary/10 p-3 text-primary">
          <Trophy className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">APL Knockout Bracket</h1>
        <p className="text-muted-foreground">Round of 16 through Final, rendered as a self-contained APL bracket.</p>
      </div>

      {rawMatches.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No knockout bracket data available yet.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid min-w-[960px] grid-cols-[minmax(200px,1fr)_minmax(180px,1fr)_minmax(220px,1fr)_minmax(180px,1fr)_minmax(200px,1fr)] gap-4">
            <div className="space-y-4">
              <div className="rounded-full bg-slate-900 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-500">Round of 16</div>
              {bracketGroups.roundOf16Left.map(renderMatchCard)}
            </div>

            <div className="space-y-4">
              <div className="rounded-full bg-slate-900 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-500">Quarter Finals</div>
              {bracketGroups.quarterFinalLeft.map(renderMatchCard)}
            </div>

            <div className="space-y-4">
              <div className="rounded-full bg-slate-900 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-500">Semis / Final</div>
              {bracketGroups.semiFinals.map(renderMatchCard)}
              {renderMatchCard(bracketGroups.finalMatch)}
            </div>

            <div className="space-y-4">
              <div className="rounded-full bg-slate-900 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-500">Quarter Finals</div>
              {bracketGroups.quarterFinalRight.map(renderMatchCard)}
            </div>

            <div className="space-y-4">
              <div className="rounded-full bg-slate-900 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-500">Round of 16</div>
              {bracketGroups.roundOf16Right.map(renderMatchCard)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// 
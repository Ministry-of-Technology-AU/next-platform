"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Trophy } from 'lucide-react';
import { formatISTDateTimeDisplay } from '@/lib/date-utils';
import DeveloperCredits from '@/components/developer-credits';

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

  const groupedMatches = useMemo(() => {
    const lookup: Record<string, any[]> = {
      round_of_16: [],
      quarter_final: [],
      semi_final: [],
      final: [],
    };

    return rawMatches
      .filter((match: any) => match.attributes?.round && roundOrder.includes(match.attributes.round))
      .sort((a: any, b: any) => (a.attributes?.match_number ?? 0) - (b.attributes?.match_number ?? 0))
      .reduce((acc: Record<string, any[]>, match: any) => {
        const round = match.attributes?.round;
        if (round && acc[round]) {
          acc[round].push(match);
        }
        return acc;
      }, lookup);
  }, [rawMatches]);

  const renderMatchCard = (match: any) => {
    const teamA = match.attributes?.team_a?.data?.attributes?.name || 'TBA';
    const teamB = match.attributes?.team_b?.data?.attributes?.name || 'TBA';
    const scoreA = match.attributes?.team_a_score;
    const scoreB = match.attributes?.team_b_score;
    const status = match.attributes?.status;
    const stateLabel =
      status === 'completed' ? 'Finished' : status === 'live' ? 'Live' : 'Upcoming';

    return (
      <div key={match.id} className="rounded-3xl border border-slate-700 bg-slate-950/95 p-4 shadow-lg shadow-slate-950/20 transition hover:-translate-y-1 hover:shadow-xl">
        <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
          {formatRoundLabel(match.attributes?.round)}
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-sm">
            <span className="truncate text-slate-100">{teamA}</span>
            <span className="min-w-[2rem] text-right font-semibold text-slate-400">{typeof scoreA === 'number' ? scoreA : '-'}</span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-sm">
            <span className="truncate text-slate-100">{teamB}</span>
            <span className="min-w-[2rem] text-right font-semibold text-slate-400">{typeof scoreB === 'number' ? scoreB : '-'}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>{match.attributes?.start_time ? formatISTDateTimeDisplay(match.attributes.start_time).date : 'TBA'}</span>
          <span>{stateLabel}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading Knockout Bracket...</div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="text-center space-y-2">
        <div className="mx-auto inline-flex items-center justify-center rounded-full bg-primary/10 p-3 text-primary">
          <Trophy className="h-5 w-5" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">APL Knockout Bracket</h1>
        <p className="text-muted-foreground">Round of 16 through Final, rendered as a self-contained APL bracket.</p>
        <div className="flex justify-center">
          <Link href="/platform/sports/apl">
            <Button variant="outline" className="mt-2 w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              APL Home
            </Button>
          </Link>
        </div>
      </div>

      {rawMatches.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No knockout bracket data available yet.
          </CardContent>
        </Card>
      ) : (
        <div className="md:overflow-x-auto">
          <div className="grid grid-cols-1 gap-4 md:min-w-[760px] md:grid-cols-4">
            {roundOrder.map((roundKey) => (
              <div key={roundKey} className="space-y-4">
                <div className="rounded-full bg-slate-900 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  {formatRoundLabel(roundKey)}
                </div>
                {groupedMatches[roundKey].length > 0 ? (
                  groupedMatches[roundKey].map((match) => renderMatchCard(match))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 p-6 text-center text-sm text-slate-500">
                    No matches available
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <DeveloperCredits
        developers={[
          {
            name: 'Nitin S',
            role: 'Lead Developer',
            profileUrl: 'https://github.com/28nitin07',
          },
          {
            name: 'Atharvajeet Singh',
            role: 'Developer',
            profileUrl: 'https://github.com/atharvajeetsingh',
          },
        ]}
      />
    </div>
  );
}
// 
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function getStrapiMediaUrl(media: any): string | null {
  if (!media?.data?.attributes?.url) return null;
  const url = media.data.attributes.url;
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

export default function MatchPage() {
  const params = useParams();
  const id = params?.id as string;

  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMatchData = async () => {
    try {
      const response = await fetch(`/api/platform/sports/apl/matches/${id}`);
      if (response.ok) {
        const d = await response.json();
        setRawData(d.data || null);
      }
    } catch (e) {
      console.error("Polling error on match detail:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchMatchData();

    // SSE: listen for real-time push events from Strapi webhook
    const eventSource = new EventSource('/api/platform/sports/apl/sse');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        // Re-fetch when any APL entity changes (match scores, participant stats)
        fetchMatchData();
      } catch (e) {
        console.error('[SSE] Parse error:', e);
      }
    };

    eventSource.onerror = () => {
      console.warn('[SSE] Connection lost, will auto-reconnect...');
    };

    // Commented out polling (kept for fallback reference):
    // const interval = setInterval(fetchMatchData, 2000);

    return () => {
      eventSource.close();
      // clearInterval(interval);
    };
  }, [id]);

  const matchData = useMemo(() => {
    if (!rawData) return {
      id,
      teamA: 'Loading...',
      teamB: 'Loading...',
      scoreA: 0,
      scoreB: 0,
      status: 'Upcoming',
      type: 'Group stage',
      period: '1H • 00:00',
      details: { sets: [], events: [] },
      teamAPlayers: [],
      teamBPlayers: []
    };

    const attrs = rawData.attributes || {};
    const details = attrs.details || {};

    const parsePlayers = (teamKey: 'team_a' | 'team_b'): any[] => {
      const members = attrs[teamKey]?.data?.attributes?.members?.data || [];
      const stats = details.individual_stats || [];
      return members.map((p: any) => {
        const playerMatchStats = stats.find((s: any) => s.id === p.id);
        return {
          id: p.id.toString(),
          name: p.attributes?.name || 'Unknown',
          goals: playerMatchStats ? playerMatchStats.matchGoals : 0,
        };
      }).sort((a: any, b: any) => b.goals - a.goals);
    };

    return {
      id,
      teamA: attrs.team_a?.data?.attributes?.name || 'Team A',
      teamB: attrs.team_b?.data?.attributes?.name || 'Team B',
      teamALogo: getStrapiMediaUrl(attrs.team_a?.data?.attributes?.logo),
      teamBLogo: getStrapiMediaUrl(attrs.team_b?.data?.attributes?.logo),
      scoreA: details.scoreA || 0,
      scoreB: details.scoreB || 0,
      status: attrs.status || 'Upcoming',
      type: attrs.type || 'Group stage',
      period: details.period || '1H • 00:00',
      start_time: attrs.start_time,
      details: {
        sets: details.sets || [],
        events: details.events || []
      },
      teamAPlayers: parsePlayers('team_a'),
      teamBPlayers: parsePlayers('team_b')
    };
  }, [rawData, id]);

  if (loading && !rawData) return <div className="p-8 text-center text-muted-foreground">Loading Match Details...</div>;

  return (
    <div className="p-4 md:p-6 w-full max-w-4xl mx-auto space-y-6">
      <div>
        <Button variant="ghost" className="mb-4 -ml-4" asChild>
          <Link href="/platform/sports/apl">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to APL Event
          </Link>
        </Button>
      </div>

      <Card className="border-2 border-primary/20 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 m-4">
          <Badge variant={matchData.status === 'Live' ? 'destructive' : 'default'} className={matchData.status === 'Live' ? 'animate-pulse' : ''}>
            {matchData.status}
          </Badge>
        </div>
        <CardHeader className="text-center pt-8">
          <CardDescription className="uppercase tracking-widest font-semibold text-muted-foreground">
            {matchData.type}
            {matchData.start_time && ` • ${new Date(matchData.start_time).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}`}
          </CardDescription>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 mt-6">
            <div className="flex flex-col items-center flex-1">
              {matchData.teamALogo && (
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl overflow-hidden border border-border mb-2">
                  <Image src={matchData.teamALogo} alt={matchData.teamA} width={96} height={96} className="w-full h-full object-cover" unoptimized />
                </div>
              )}
              <h2 className="text-3xl md:text-5xl font-bold">{matchData.teamA}</h2>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-5xl md:text-7xl font-black tabular-nums tracking-tighter flex items-center gap-4">
                <span>{matchData.scoreA}</span>
                <span className="text-muted-foreground/30 text-3xl">-</span>
                <span>{matchData.scoreB}</span>
              </div>

              {/* Compact Period Breakdown */}
              {matchData.details.sets.length > 0 && (
                <div className="flex gap-4 mt-4">
                  {matchData.details.sets.map((set: any, idx: number) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="bg-muted px-2 py-1 rounded border border-border flex gap-2 text-[10px] font-mono font-bold">
                        <span className={set.scoreA > set.scoreB ? 'text-foreground font-black' : 'text-muted-foreground'}>{set.scoreA}</span>
                        <span className="text-muted-foreground/30">:</span>
                        <span className={set.scoreB > set.scoreA ? 'text-foreground font-black' : 'text-muted-foreground'}>{set.scoreB}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            <div className="flex flex-col items-center flex-1">
              {matchData.teamBLogo && (
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl overflow-hidden border border-border mb-2">
                  <Image src={matchData.teamBLogo} alt={matchData.teamB} width={96} height={96} className="w-full h-full object-cover" unoptimized />
                </div>
              )}
              <h2 className="text-3xl md:text-5xl font-bold">{matchData.teamB}</h2>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold tracking-tight text-muted-foreground uppercase">{matchData.teamA} Roster</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {matchData.teamAPlayers.length === 0 ? <p className="text-sm text-muted-foreground">No players.</p> : null}
                {matchData.teamAPlayers.map((p: any) => (
                  <li key={p.id} className="flex justify-between items-center text-xs p-1.5 hover:bg-muted/50 transition-colors">
                    <span className="font-medium">{p.name}</span>
                    <span className="font-bold text-muted-foreground">{p.goals} GOALS</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold tracking-tight text-muted-foreground uppercase">{matchData.teamB} Roster</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {matchData.teamBPlayers.length === 0 ? <p className="text-sm text-muted-foreground">No players.</p> : null}
                {matchData.teamBPlayers.map((p: any) => (
                  <li key={p.id} className="flex justify-between items-center text-xs p-1.5 hover:bg-muted/50 transition-colors">
                    <span className="font-medium">{p.name}</span>
                    <span className="font-bold text-muted-foreground">{p.goals} GOALS</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Match Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matchData.details.events.length === 0 ? (
                <p className="text-muted-foreground text-sm">No timeline events recorded.</p>
              ) : matchData.details.events.map((ev: any, idx: number) => (
                <div key={idx} className="flex gap-4 items-start text-sm">
                  <span className="text-muted-foreground whitespace-nowrap">{ev.time}</span>
                  <div className="flex-1">
                    <p className="font-medium">{ev.action} <span className="text-muted-foreground font-normal">by {ev.player} ({ev.team})</span></p>
                  </div>
                  <span className="font-semibold tabular-nums tracking-tight bg-primary/10 text-primary px-2 py-0.5 rounded">{ev.newScore}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
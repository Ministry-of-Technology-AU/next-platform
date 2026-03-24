"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function MatchPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMatchData = async () => {
    try {
      const response = await fetch(`/api/platform/sports/aba/matches/${id}`);
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
    const interval = setInterval(fetchMatchData, 2000);
    return () => clearInterval(interval);
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
      period: 'Q1 • 10:00',
      details: { sets: [], events: [] },
      teamAPlayers: [],
      teamBPlayers: []
    };

    const attrs = rawData.attributes || {};
    const details = attrs.details || {};

    const parsePlayers = (teamKey: 'team_a' | 'team_b'): any[] => {
      const members = attrs[teamKey]?.data?.attributes?.members?.data || [];
      return members.map((p: any) => ({
        id: p.id.toString(),
        name: p.attributes?.name || 'Unknown',
        points: p.attributes?.points_scored || 0,
      })).sort((a: any, b: any) => b.points - a.points);
    };

    return {
      id,
      teamA: attrs.team_a?.data?.attributes?.name || 'Team A',
      teamB: attrs.team_b?.data?.attributes?.name || 'Team B',
      scoreA: details.scoreA || 0,
      scoreB: details.scoreB || 0,
      status: attrs.status || 'Upcoming',
      type: attrs.type || 'Group stage',
      period: details.period || 'Q1 • 10:00',
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
          <Link href="/platform/sports/aba">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to ABA Event
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
          <CardDescription className="uppercase tracking-widest font-semibold">{matchData.type}</CardDescription>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 mt-6">
            <div className="flex flex-col items-center flex-1">
              <h2 className="text-3xl md:text-5xl font-bold">{matchData.teamA}</h2>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-5xl md:text-7xl font-black tabular-nums tracking-tighter flex items-center gap-4">
                <span>{matchData.scoreA}</span>
                <span className="text-muted-foreground/30 text-3xl">-</span>
                <span>{matchData.scoreB}</span>
              </div>
              {matchData.status === 'Live' && (
                <div className="text-sm font-medium text-red-500 mt-2">{matchData.period}</div>
              )}
            </div>
            <div className="flex flex-col items-center flex-1">
              <h2 className="text-3xl md:text-5xl font-bold">{matchData.teamB}</h2>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Period Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matchData.details.sets.length === 0 && <p className="text-sm text-muted-foreground">No period data yet.</p>}
              {matchData.details.sets.map((set: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-muted-foreground w-8">{set.name}</span>
                  <span className={`tabular-nums ${set.live ? 'text-primary font-bold' : ''}`}>{set.scoreA}</span>
                  <span className="text-muted-foreground/50">-</span>
                  <span className={`tabular-nums ${set.live ? 'text-primary font-bold' : ''}`}>{set.scoreB}</span>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between text-xl font-bold">
                <span className="w-8">T</span>
                <span>{matchData.scoreA}</span>
                <span>-</span>
                <span>{matchData.scoreB}</span>
              </div>
            </div>
          </CardContent>
        </Card>

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
                   <span className="font-semibold tabular-nums tracking-tight bg-muted px-2 py-0.5 rounded">{ev.newScore}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground italic">
              Dashboard polls every 2 seconds for live changes.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{matchData.teamA} Roster</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {matchData.teamAPlayers.length === 0 ? <p className="text-sm text-muted-foreground">No players.</p> : null}
              {matchData.teamAPlayers.map((p: any) => (
                <li key={p.id} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded">
                  <span className="font-semibold">{p.name}</span>
                  <span className="font-mono text-muted-foreground">{p.points} pts</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{matchData.teamB} Roster</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {matchData.teamBPlayers.length === 0 ? <p className="text-sm text-muted-foreground">No players.</p> : null}
              {matchData.teamBPlayers.map((p: any) => (
                <li key={p.id} className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded">
                  <span className="font-semibold">{p.name}</span>
                  <span className="font-mono text-muted-foreground">{p.points} pts</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

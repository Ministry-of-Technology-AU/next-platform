"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        JSON.parse(event.data);
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
  }, [id, fetchMatchData]);

  const matchData = useMemo(() => {
    if (!rawData) return {
      id,
      teamA: 'Loading...',
      teamB: 'Loading...',
      scoreA: 0,
      scoreB: 0,
      status: 'upcoming',
      type: 'Group stage',
      period: 'Not started',
      details: { events: [] },
      teamAPlayers: [],
      teamBPlayers: []
    };

    const attrs = rawData.attributes || {};
    const teamAName = attrs.team_a?.data?.attributes?.name || 'Team A';
    const teamBName = attrs.team_b?.data?.attributes?.name || 'Team B';

    const parsePlayers = (teamKey: 'team_a' | 'team_b'): any[] => {
      const members = attrs[teamKey]?.data?.attributes?.members?.data || [];
      return members.map((p: any) => ({
        id: p.id.toString(),
        name: p.attributes?.name || 'Unknown',
        goals: p.attributes?.goals || 0,
      })).sort((a: any, b: any) => b.goals - a.goals);
    };

    const goalEvents = (attrs.goal_events?.data || []).map((event: any) => {
      const eventAttrs = event.attributes || {};
      const scorer = eventAttrs.scorer?.data?.attributes?.name || 'Unknown';
      const assister = eventAttrs.assister?.data?.attributes?.name;
      const teamLabel = eventAttrs.team === 'team_a' ? teamAName : teamBName;
      const action = eventAttrs.is_own_goal ? 'Own Goal' : eventAttrs.is_penalty ? 'Penalty Goal' : 'Goal';
      const minute = eventAttrs.minute || 0;
      return {
        minute,
        time: `${minute}'`,
        action,
        player: scorer,
        team: teamLabel,
        description: assister ? `Assist: ${assister}` : '',
      };
    });

    const cardEvents = (attrs.card_events?.data || []).map((event: any) => {
      const eventAttrs = event.attributes || {};
      const player = eventAttrs.player?.data?.attributes?.name || 'Unknown';
      const teamLabel = eventAttrs.team === 'team_a' ? teamAName : teamBName;
      const cardLabel = eventAttrs.card_type === 'red' ? 'Red Card' : eventAttrs.card_type === 'yellow_red' ? 'Yellow + Red Card' : 'Yellow Card';
      const minute = eventAttrs.minute || 0;
      return {
        minute,
        time: `${minute}'`,
        action: cardLabel,
        player,
        team: teamLabel,
        description: '',
      };
    });

    const saveEvents = (attrs.save_events?.data || []).map((event: any) => {
      const eventAttrs = event.attributes || {};
      const keeper = eventAttrs.goalkeeper?.data?.attributes?.name || 'Unknown';
      const teamLabel = eventAttrs.team === 'team_a' ? teamAName : teamBName;
      const minute = eventAttrs.minute || 0;
      return {
        minute,
        time: `${minute}'`,
        action: 'Goalkeeper Saves',
        player: keeper,
        team: teamLabel,
        description: `${eventAttrs.saves || 0} saves`,
      };
    });

    const substituteEvents = (attrs.substitution_events?.data || []).map((event: any) => {
      const eventAttrs = event.attributes || {};
      const offPlayer = eventAttrs.player_off?.data?.attributes?.name || 'Unknown';
      const onPlayer = eventAttrs.player_on?.data?.attributes?.name || 'Unknown';
      const teamLabel = eventAttrs.team === 'team_a' ? teamAName : teamBName;
      const minute = eventAttrs.minute || 0;
      return {
        minute,
        time: `${minute}'`,
        action: 'Substitution',
        player: `${offPlayer} off, ${onPlayer} on`,
        team: teamLabel,
        description: '',
      };
    });

    return {
      id,
      teamA: teamAName,
      teamB: teamBName,
      teamALogo: getStrapiMediaUrl(attrs.team_a?.data?.attributes?.logo),
      teamBLogo: getStrapiMediaUrl(attrs.team_b?.data?.attributes?.logo),
      scoreA: attrs.team_a_score || 0,
      scoreB: attrs.team_b_score || 0,
      status: attrs.status || 'upcoming',
      type: attrs.round?.replace('_', ' ') || 'Group stage',
      period: attrs.period?.replace('_', ' ') || 'Not started',
      start_time: attrs.start_time,
      details: {
        events: [...goalEvents, ...cardEvents, ...saveEvents, ...substituteEvents].sort((a: any, b: any) => (a.minute || 0) - (b.minute || 0))
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
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">
                      {ev.action}
                      <span className="text-muted-foreground font-normal"> by {ev.player} ({ev.team})</span>
                    </p>
                    {ev.description ? <p className="text-xs text-muted-foreground">{ev.description}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
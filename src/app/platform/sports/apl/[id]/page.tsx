"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { normalizePlayerName } from '@/lib/utils';
import { formatISTDateTimeDisplay } from '@/lib/date-utils';
import DeveloperCredits from '@/components/developer-credits';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function getStrapiMediaUrl(media: any): string | null {
  const url = media?.data?.attributes?.url || media?.data?.url || media?.attributes?.url || media?.url;
  if (!url) return null;
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

function toArray(value: any): any[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value.data)) return value.data;
  return [];
}

function relationName(relation: any): string {
  return relation?.data?.attributes?.name || relation?.data?.name || relation?.attributes?.name || relation?.name || 'Unknown';
}

function toTimelineSeconds(minute: number, second = 0): number {
  const safeMinute = Math.max(1, Number.isFinite(minute) ? Math.floor(minute) : 1);
  const safeSecond = Math.min(59, Math.max(0, Number.isFinite(second) ? Math.floor(second) : 0));
  return (safeMinute - 1) * 60 + safeSecond;
}

export default function MatchPage() {
  const params = useParams();
  const id = params?.id as string;

  const [rawData, setRawData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMatchData = async () => {
    try {
      const response = await fetch(`/api/platform/sports/apl/matches/${id}`, { cache: 'no-store' });
      if (response.ok) {
        const d = await response.json();
        setRawData(d.data || null);
      }
    } catch (e) {
      console.error('Polling error on match detail:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchData();

    const eventSource = new EventSource('/api/platform/sports/apl/sse');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.model && payload.model !== 'apl-matches') {
          return;
        }
        const payloadId = payload?.entryId ?? payload?.id;
        if (payloadId !== undefined && String(payloadId) !== String(id)) {
          return;
        }
        fetchMatchData();
      } catch (e) {
        console.error('[SSE] Parse error:', e);
      }
    };

    eventSource.onerror = () => {
      console.warn('[SSE] Connection lost, will auto-reconnect...');
    };

    return () => {
      eventSource.close();
    };
  }, [id]);

  const matchData = useMemo(() => {
    if (!rawData) {
      return {
        id,
        teamA: 'Loading...',
        teamB: 'Loading...',
        scoreA: 0,
        scoreB: 0,
        status: 'upcoming',
        type: 'Group stage',
        period: 'Not started',
        details: { events: [] as any[] },
        teamAPlayers: [] as any[],
        teamBPlayers: [] as any[],
        teamALogo: null as string | null,
        teamBLogo: null as string | null,
        start_time: null as string | null,
      };
    }

    const attrs = rawData.attributes || rawData;
    const teamAData = attrs.team_a?.data?.attributes || attrs.team_a?.data || attrs.team_a || {};
    const teamBData = attrs.team_b?.data?.attributes || attrs.team_b?.data || attrs.team_b || {};
    const teamAName = teamAData.name || 'Team A';
    const teamBName = teamBData.name || 'Team B';
    const hasGoalEvents = attrs.goal_events !== undefined && attrs.goal_events !== null;

    const goalEventsRaw = toArray(attrs.goal_events);
    const goalScorerCounts = new Map<string, number>();

    const goalEvents = goalEventsRaw.map((event: any, index: number) => {
      const eventAttrs = event?.attributes || event || {};
      const scorer = relationName(eventAttrs.scorer);
      const teamLabel = eventAttrs.team === 'team_a' ? teamAName : teamBName;
      const action = eventAttrs.is_own_goal ? 'Own Goal' : eventAttrs.is_penalty ? 'Penalty Goal' : 'Goal';
      const minute = Number(eventAttrs.minute || 0);
      const eventSeconds = toTimelineSeconds(minute, 0);
      const scorerKey = normalizePlayerName(scorer);

      if (scorerKey && scorerKey !== 'Unknown') {
        goalScorerCounts.set(scorerKey, (goalScorerCounts.get(scorerKey) || 0) + 1);
      }

      return {
        minute,
        time: `${minute}'`,
        action,
        player: scorer,
        team: teamLabel,
        description: '',
        eventSeconds,
        sortIndex: index,
      };
    });

    const parsePlayers = (teamKey: 'team_a' | 'team_b'): any[] => {
      const team = attrs[teamKey]?.data?.attributes || attrs[teamKey]?.data || attrs[teamKey] || {};
      const players = toArray(team.participants || team.members);

      return players
        .map((p: any) => {
          const participant = p?.attributes || p;
          const normalizedName = normalizePlayerName(participant?.name);
          return {
            id: String(p?.id || participant?.id || participant?.documentId || participant?.name || 'unknown'),
            name: normalizedName,
            goals: hasGoalEvents
              ? Number(goalScorerCounts.get(normalizedName) || 0)
              : Number(participant?.goals || 0),
          };
        })
        .sort((a: any, b: any) => b.goals - a.goals);
    };

    const cardEvents = toArray(attrs.card_events).map((event: any, index: number) => {
      const eventAttrs = event?.attributes || event || {};
      const player = relationName(eventAttrs.player);
      const teamLabel = eventAttrs.team === 'team_a' ? teamAName : teamBName;
      const cardLabel =
        eventAttrs.card_type === 'red'
          ? 'Red Card'
          : eventAttrs.card_type === 'yellow_red'
            ? 'Yellow + Red Card'
            : 'Yellow Card';
      const minute = Number(eventAttrs.minute || 0);
      const eventSeconds = toTimelineSeconds(minute, 0);

      return {
        minute,
        time: `${minute}'`,
        action: cardLabel,
        player,
        team: teamLabel,
        description: '',
        eventSeconds,
        sortIndex: 1000 + index,
      };
    });

    const substituteEvents = toArray(attrs.substitution_events).map((event: any, index: number) => {
      const eventAttrs = event?.attributes || event || {};
      const offPlayer = relationName(eventAttrs.player_off);
      const onPlayer = relationName(eventAttrs.player_on);
      const teamLabel = eventAttrs.team === 'team_a' ? teamAName : teamBName;
      const minute = Number(eventAttrs.minute || 0);
      const second = Number(eventAttrs.second || 0);
      const eventSeconds = toTimelineSeconds(minute, second);
      const formattedSecond = Math.min(59, Math.max(0, second)).toString().padStart(2, '0');

      return {
        minute,
        time: `${minute}' ${formattedSecond}\"`,
        action: 'Substitution',
        player: `${offPlayer} off, ${onPlayer} on`,
        team: teamLabel,
        description: '',
        eventSeconds,
        sortIndex: 3000 + index,
      };
    });

    const timelineEvents = [...goalEvents, ...cardEvents, ...substituteEvents].sort(
      (a: any, b: any) => (a.eventSeconds || 0) - (b.eventSeconds || 0) || (a.sortIndex || 0) - (b.sortIndex || 0)
    );

    const scoreA = attrs.team_a_score || 0;
    const scoreB = attrs.team_b_score || 0;

    return {
      id,
      teamA: teamAName,
      teamB: teamBName,
      teamALogo: getStrapiMediaUrl(teamAData.logo),
      teamBLogo: getStrapiMediaUrl(teamBData.logo),
      scoreA,
      scoreB,
      status: attrs.status || 'upcoming',
      type: attrs.round?.replace('_', ' ') || 'Group stage',
      period: attrs.period?.replace('_', ' ') || 'Not started',
      start_time: attrs.start_time,
      details: {
        events: timelineEvents,
      },
      teamAPlayers: parsePlayers('team_a'),
      teamBPlayers: parsePlayers('team_b'),
    };
  }, [rawData, id]);

  const isLive = String(matchData.status).toLowerCase() === 'live';

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

      <Card className="border-2 border-primary/20 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 m-4">
          <Badge variant={isLive ? 'destructive' : 'default'} className={isLive ? 'animate-pulse' : ''}>
            {matchData.status}
          </Badge>
        </div>
        <CardHeader className="text-center pt-8">
          <CardDescription className="uppercase tracking-widest font-semibold text-muted-foreground">
            {matchData.type}
            {matchData.start_time && (() => {
              const { date, time } = formatISTDateTimeDisplay(matchData.start_time);
              return ` • ${date} ${time}`.trim();
            })()}
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
              ) : (
                matchData.details.events.map((ev: any, idx: number) => (
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from 'lucide-react';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function getStrapiMediaUrl(media: any): string | null {
  if (!media?.data?.attributes?.url) return null;
  const url = media.data.attributes.url;
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

// Mock Data for Fallbacks
const LIVE_MATCH_FALLBACK: any = {
  id: 1,
  teamA: 'BLUE HAWKS',
  teamB: 'STEEL TITANS',
  scoreA: 48,
  scoreB: 52,
  status: 'LIVE',
  period: 'Q2 • 08:12',
  arena: 'ASHOKA MAIN COURT',
  start_time: new Date().toISOString(),
  details: {
    sets: [],
    events: []
  }
};

const MOCK_UPCOMING_MATCHES = [
  { id: 2, teamA: 'WOLVES', teamB: 'BEARS', start_time: new Date(Date.now() + 86400000).toISOString() },
  { id: 3, teamA: 'LIONS', teamB: 'DRAGONS', start_time: new Date(Date.now() + 172800000).toISOString() },
];

const MOCK_TOP_SCORERS = [
  { id: 101, name: 'Jason M.', team: 'STEEL TITANS', points: 142 },
];

const MOCK_PAST_MATCHES = [
  { id: 7, teamA: 'BLIZZARD', teamB: 'VIPERS', scoreA: 98, scoreB: 104, date: 'FINAL • DEC 12' },
];

const MOCK_GROUPS = [
  {
    name: 'Group A',
    teams: [
      { id: 10, rank: 1, team: 'STEEL TITANS', played: 5, won: 4, lost: 1, points: 12 },
    ]
  }
];

export default function ABAEventPage() {
  const [rawMatches, setRawMatches] = useState<any[]>([]);
  const [rawTeams, setRawTeams] = useState<any[]>([]);
  const [rawParticipants, setRawParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [matchesRes, teamsRes, participantsRes] = await Promise.all([
        fetch('/api/platform/sports/aba/matches'),
        fetch('/api/platform/sports/aba/teams'),
        fetch('/api/platform/sports/aba/participants?limit=10')
      ]);

      if (matchesRes.ok) {
        const d = await matchesRes.json();
        setRawMatches(d.data || []);
      }
      if (teamsRes.ok) {
        const d = await teamsRes.json();
        setRawTeams(d.data || []);
      }
      if (participantsRes.ok) {
        const d = await participantsRes.json();
        setRawParticipants(d.data || []);
      }
    } catch (e) {
      console.error("Polling error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Initial load

    // SSE: listen for real-time push events from Strapi webhook
    const eventSource = new EventSource('/api/platform/sports/aba/sse');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log('[SSE] Received update:', payload);
        // Re-fetch all data when any ABA entity changes
        fetchData();
      } catch (e) {
        console.error('[SSE] Parse error:', e);
      }
    };

    eventSource.onerror = () => {
      console.warn('[SSE] Connection lost, will auto-reconnect...');
      // EventSource auto-reconnects by default
    };

    // Commented out polling (kept for fallback reference):
    // const interval = setInterval(fetchData, 2000);

    return () => {
      eventSource.close();
      // clearInterval(interval);
    };
  }, []);

  // Transform Logic (Memoized for performance)
  const dashboardData = useMemo(() => {
    // 1. Matches
    let liveMatch = LIVE_MATCH_FALLBACK;
    let upcomingMatches = MOCK_UPCOMING_MATCHES;
    let pastMatches = MOCK_PAST_MATCHES;

    if (rawMatches && rawMatches.length > 0) {
      const parsed = rawMatches.map((m: any) => {
        const attrs = m.attributes || {};
        const details = attrs.details || {};
        return {
          id: m.id,
          teamA: attrs.team_a?.data?.attributes?.name || 'TBD',
          teamB: attrs.team_b?.data?.attributes?.name || 'TBD',
          teamALogo: getStrapiMediaUrl(attrs.team_a?.data?.attributes?.logo),
          teamBLogo: getStrapiMediaUrl(attrs.team_b?.data?.attributes?.logo),
          scoreA: details.scoreA || 0,
          scoreB: details.scoreB || 0,
          status: (attrs.status || 'Upcoming').toUpperCase(),
          time: details.time || 'TBD',
          date: details.date || 'TBD',
          period: details.period || 'Q1 • 10:00',
          arena: details.arena || 'ASHOKA MAIN COURT',
          start_time: attrs.start_time,
          details: details
        };
      });

      const live = parsed.find((m: any) => m.status === 'LIVE');
      if (live) liveMatch = live;
      upcomingMatches = parsed.filter((m: any) => m.status === 'UPCOMING');
      pastMatches = parsed.filter((m: any) => m.status === 'PAST');
    }

    // 2. Leaderboards
    let groupsMap: Record<string, any[]> = {};
    const teamStats: Record<number, any> = {};

    if (rawTeams && rawTeams.length > 0) {
      rawTeams.forEach((t: any) => {
        const attrs = t.attributes || {};
        const groupName = attrs.group || 'Unassigned';
        if (!groupsMap[groupName]) groupsMap[groupName] = [];

        const stats = {
          id: t.id,
          team: attrs.name || `Team ${t.id}`,
          played: 0,
          won: 0,
          lost: 0,
          points: 0
        };
        teamStats[t.id] = stats;
        groupsMap[groupName].push(stats);
      });

      rawMatches.forEach((m: any) => {
        const attrs = m.attributes || {};
        const status = (attrs.status || '').toUpperCase();
        const details = attrs.details || {};
        if (status === 'PAST') {
          const teamAId = attrs.team_a?.data?.id;
          const teamBId = attrs.team_b?.data?.id;
          const scoreA = details.scoreA || 0;
          const scoreB = details.scoreB || 0;

          if (teamAId && teamStats[teamAId]) {
            teamStats[teamAId].played += 1;
            if (scoreA > scoreB) { teamStats[teamAId].won += 1; teamStats[teamAId].points += 3; }
            else if (scoreA < scoreB) { teamStats[teamAId].lost += 1; }
          }
          if (teamBId && teamStats[teamBId]) {
            teamStats[teamBId].played += 1;
            if (scoreB > scoreA) { teamStats[teamBId].won += 1; teamStats[teamBId].points += 3; }
            else if (scoreB < scoreA) { teamStats[teamBId].lost += 1; }
          }
        }
      });
    }

    const displayGroups = Object.keys(groupsMap).sort().map(groupName => {
      const sortedTeams = groupsMap[groupName]
        .sort((a, b) => b.points - a.points || b.won - a.won)
        .map((t, idx) => ({ ...t, rank: idx + 1 }));
      return { name: groupName, teams: sortedTeams };
    });

    // 3. Scorers

    const displayScorers = rawParticipants.length > 0
      ? rawParticipants.map((p: any) => ({
        id: p.id,
        name: p.attributes?.name || 'Unknown',
        team: p.attributes?.team?.data?.attributes?.name || 'Unassigned',
        points: p.attributes?.points_scored || 0
      }))
      : MOCK_TOP_SCORERS;

    return {
      liveMatch,
      upcomingMatches,
      pastMatches,
      displayGroups: displayGroups.length > 0 ? displayGroups : MOCK_GROUPS,
      displayScorers,
      liveMatchSets: liveMatch?.details?.sets || []
    };
  }, [rawMatches, rawTeams, rawParticipants]);

  if (loading && rawMatches.length === 0) return <div className="p-8 text-center text-muted-foreground bg-background">Loading Basketball Portal...</div>;

  const { liveMatch, upcomingMatches, pastMatches, displayGroups, displayScorers, liveMatchSets } = dashboardData;

  return (
    <div className="p-4 md:p-8 space-y-12 max-w-7xl mx-auto">

      {/* Hero Live Match Banner */}
      <section>
        <Link href={`/platform/sports/aba/${liveMatch.id}`}>
          <Card className="bg-zinc-900 border-zinc-800 dark:bg-zinc-950 text-white overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer shadow-2xl">
            <CardContent className="p-8 md:p-12 flex flex-col items-center relative">
              <div className="flex items-center gap-3 mb-8">
                <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 animate-pulse text-xs px-2 py-0.5 rounded-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-bounce" /> {liveMatch.status}
                </Badge>
                <span className="text-zinc-400 text-[10px] md:text-sm font-black uppercase tracking-widest bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/50">
                  {liveMatch.start_time ? new Date(liveMatch.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : (liveMatch.date + ' • ' + liveMatch.time)}
                </span>
              </div>

              <div className="flex items-center justify-center w-full max-w-3xl gap-4 md:gap-12">
                <div className="flex-1 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 md:w-32 md:h-32 bg-zinc-950/50 dark:bg-black/50 rounded-2xl flex items-center justify-center border border-zinc-800 overflow-hidden">
                    {liveMatch.teamALogo ? (
                      <Image src={liveMatch.teamALogo} alt={liveMatch.teamA} width={128} height={128} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <div className="w-12 h-12 md:w-20 md:h-20 bg-zinc-800 rounded-full opacity-50" />
                    )}
                  </div>
                  <h3 className="text-sm! md:text-2xl! font-black tracking-wider text-center">{liveMatch.teamA}</h3>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-4 md:gap-8">
                    <span className="text-6xl md:text-9xl font-black tabular-nums tracking-tighter text-white">{liveMatch.scoreA}</span>
                    <span className="text-3xl md:text-5xl font-black text-zinc-700">-</span>
                    <span className="text-6xl md:text-9xl font-black tabular-nums tracking-tighter text-white">{liveMatch.scoreB}</span>
                  </div>

                  {/* Set Scores Display */}
                  {liveMatchSets.length > 0 && (
                    <div className="flex gap-4 mt-2">
                      {liveMatchSets.map((set: any, idx: number) => (
                        <div key={idx} className="flex flex-col items-center">
                          <span className="text-[10px] items-center text-zinc-500 font-bold uppercase tracking-tighter mb-1">{set.name}</span>
                          <div className="bg-zinc-800/50 px-2 py-1 rounded border border-zinc-700/50 flex gap-2 text-xs font-mono font-bold">
                            <span className={set.scoreA > set.scoreB ? 'text-white' : 'text-zinc-500'}>{set.scoreA}</span>
                            <span className="text-zinc-600">:</span>
                            <span className={set.scoreB > set.scoreA ? 'text-white' : 'text-zinc-500'}>{set.scoreB}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 md:w-32 md:h-32 bg-zinc-950/50 dark:bg-black/50 rounded-2xl flex items-center justify-center border border-zinc-800 overflow-hidden">
                    {liveMatch.teamBLogo ? (
                      <Image src={liveMatch.teamBLogo} alt={liveMatch.teamB} width={128} height={128} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <div className="w-12 h-12 md:w-20 md:h-20 bg-zinc-800 rounded-full opacity-50" />
                    )}
                  </div>
                  <h3 className="text-sm! md:text-2xl! font-black tracking-wider text-center">{liveMatch.teamB}</h3>
                </div>
              </div>

              <div className="mt-8 text-sm tracking-widest text-zinc-400 font-semibold uppercase">
                {liveMatch.arena}
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* Middle Section: Matches Tabs & Top Scorers */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        <section className="lg:col-span-3">
          <Tabs defaultValue="upcoming" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-muted border border-border">
                <TabsTrigger value="upcoming" className="data-[state=active]:bg-card shadow-sm">Upcoming</TabsTrigger>
                <TabsTrigger value="finished" className="data-[state=active]:bg-card shadow-sm">Finished</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upcoming" className="mt-0">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {upcomingMatches.length === 0 && <p className="text-center py-10 text-muted-foreground">No upcoming matches scheduled.</p>}
                  {upcomingMatches.map((match: any) => (
                    <div key={match.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer shadow-sm">
                      <div>
                        <h4 className="font-bold text-foreground">{match.teamA} VS {match.teamB}</h4>
                        <p className="text-xs text-muted-foreground font-semibold tracking-wide mt-1">
                          {match.start_time ? new Date(match.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : (match.date + ' • ' + match.time)}
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="finished" className="mt-0">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {pastMatches.length === 0 && <p className="text-center py-10 text-muted-foreground">No past matches recorded.</p>}
                  {pastMatches.map((match: any) => (
                    <div key={match.id} className="bg-card border border-border rounded-xl p-5 hover:bg-muted/50 transition-colors cursor-pointer relative overflow-hidden shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-muted-foreground tracking-wide">{match.date}</span>
                        <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500/20 text-[10px] px-1.5 py-0 uppercase tracking-wider rounded-sm" variant="outline">Finished</Badge>
                      </div>
                      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                        <div className="text-center">
                          <h4 className="font-bold text-sm text-foreground md:text-base">{match.teamA}</h4>
                          <p className={`text-3xl font-black mt-2 ${match.scoreA > match.scoreB ? 'text-foreground' : 'text-muted-foreground'}`}>{match.scoreA}</p>
                        </div>
                        <div className="text-xs font-bold text-muted/50 dark:text-zinc-700">VS</div>
                        <div className="text-center">
                          <h4 className="font-bold text-sm text-foreground md:text-base">{match.teamB}</h4>
                          <p className={`text-3xl font-black mt-2 ${match.scoreB > match.scoreA ? 'text-yellow-600 dark:text-yellow-500' : 'text-muted-foreground'}`}>{match.scoreB}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </section>

        <section className="lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4 h-10">
            <h3 className="text-xl font-bold tracking-tight">Top Scorers</h3>
            <span className="text-xs font-bold text-muted-foreground tracking-widest hover:text-primary cursor-pointer transition-colors">FULL STATS</span>
          </div>
          <Card className="bg-card border border-border text-foreground pt-4 flex-1 shadow-sm">
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0 z-10 backdrop-blur-md">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="w-12 text-center text-muted-foreground font-bold px-2">#</TableHead>
                      <TableHead className="text-muted-foreground font-bold px-4">PLAYER</TableHead>
                      <TableHead className="text-right text-foreground font-bold px-6 w-24">PTS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayScorers.map((scorer: any, index: number) => (
                      <TableRow key={scorer.id || index} className="border-border hover:bg-muted/30">
                        <TableCell className="text-center font-bold text-muted-foreground px-2">{index + 1}</TableCell>
                        <TableCell className="px-4">
                          <p className="font-bold tracking-wide whitespace-nowrap">{scorer.name}</p>
                          <p className="text-xs text-muted-foreground font-semibold mt-0.5">{scorer.team}</p>
                        </TableCell>
                        <TableCell className="text-right font-black text-yellow-600 dark:text-yellow-500 text-lg px-6">
                          {scorer.points}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Leaderboard */}
      <section id="leaderboard" className="pt-4">
        <Tabs defaultValue="group" className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pt-4 border-t border-zinc-800">
            <h2 className="text-2xl font-bold tracking-tight">Standings</h2>
            <TabsList className="bg-zinc-900 border border-zinc-800">
              <TabsTrigger value="group" className="data-[state=active]:bg-zinc-800">Group Stage</TabsTrigger>
              <TabsTrigger value="knockout" className="data-[state=active]:bg-zinc-800">Knockout Stage</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="group" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {displayGroups.map((group: any) => (
                <Card key={group.name} className="bg-card border-border text-foreground flex flex-col shadow-sm overflow-hidden">
                  <CardHeader className="py-4 border-b border-border bg-muted/30">
                    <CardTitle className="text-lg font-bold tracking-tight">{group.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead className="w-12 text-center text-muted-foreground font-bold px-2">#</TableHead>
                          <TableHead className="text-muted-foreground font-bold px-4">TEAM</TableHead>
                          <TableHead className="text-center text-muted-foreground font-bold w-12 px-2">P</TableHead>
                          <TableHead className="text-center text-muted-foreground font-bold w-12 px-2">W</TableHead>
                          <TableHead className="text-center text-muted-foreground font-bold w-12 px-2">L</TableHead>
                          <TableHead className="text-center text-foreground font-bold w-16 px-4">PTS</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.teams.map((team: any, idx: number) => (
                          <TableRow key={team.id || idx} className="border-border hover:bg-muted/30">
                            <TableCell className="text-center font-bold text-muted-foreground px-2">{team.rank}</TableCell>
                            <TableCell className="font-bold tracking-wide px-4 whitespace-nowrap">{team.team}</TableCell>
                            <TableCell className="text-center text-muted-foreground px-2">{team.played}</TableCell>
                            <TableCell className="text-center text-green-600 dark:text-green-500/80 px-2">{team.won}</TableCell>
                            <TableCell className="text-center text-red-600 dark:text-red-500/80 px-2">{team.lost}</TableCell>
                            <TableCell className="text-center font-black text-yellow-600 dark:text-yellow-500 text-base px-4">{team.points}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="knockout" className="mt-0">
            <Card className="bg-zinc-900 border-zinc-800 text-zinc-500">
              <CardContent className="h-64 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-lg font-bold tracking-widest uppercase mb-2">Knockout Stage</p>
                <p className="text-sm">The bracket will be generated once the group stages conclude.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

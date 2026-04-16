"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './apl.module.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Trophy, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { normalizePlayerName } from '@/lib/utils';
import { formatISTDateTimeDisplay } from '@/lib/date-utils';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

const GROUP_NAMES = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F'];

const PERIOD_LABELS: Record<string, string> = {
  not_started: 'Not started',
  first_half: '1H',
  half_time: 'Half-time',
  second_half: '2H',
  extra_time_first: 'ET 1',
  extra_time_second: 'ET 2',
  penalty_shootout: 'Penalties',
  full_time: 'Full-time',
};

const normalizeMatchStatus = (status?: string) => {
  const normalized = (status || 'upcoming').toString().trim().toLowerCase();
  if (normalized === 'live') return 'LIVE';
  if (normalized === 'completed' || normalized === 'past') return 'COMPLETED';
  return 'UPCOMING';
};

const isKnockoutRound = (round?: string, type?: string) => {
  const normalizedRound = (round || '').toString().trim().toLowerCase();
  if (normalizedRound && normalizedRound !== 'group_stage') return true;
  return (type || '').toString().trim().toLowerCase() === 'knockout';
};

const getMatchScore = (primary: unknown, fallback: unknown) => {
  const score = Number(primary);
  if (Number.isFinite(score)) return score;
  const fallbackScore = Number(fallback);
  return Number.isFinite(fallbackScore) ? fallbackScore : 0;
};

const formatMatchDateTime = (startTime?: string, fallbackDate?: string, fallbackTime?: string) => {
  if (!startTime) {
    return {
      date: fallbackDate || 'TBD',
      time: fallbackTime || 'TBD',
    };
  }

  const formatted = formatISTDateTimeDisplay(startTime);
  if (!formatted.date || !formatted.time) {
    return {
      date: fallbackDate || 'TBD',
      time: fallbackTime || 'TBD',
    };
  }

  return formatted;
};

const formatPeriodLabel = (period?: string, fallback?: string) => {
  const normalized = (period || '').toString().trim().toLowerCase();
  if (normalized && PERIOD_LABELS[normalized]) return PERIOD_LABELS[normalized];
  return fallback || 'Not started';
};

const normalizeGroupName = (group?: string) => {
  if (!group || typeof group !== 'string') return 'Unassigned';
  const trimmed = group.trim();
  if (/^group\s*/i.test(trimmed)) {
    return `Group ${trimmed.replace(/^group\s*/i, '').toUpperCase()}`;
  }
  return `Group ${trimmed.toUpperCase()}`;
};

function getStrapiMediaUrl(media: any): string | null {
  if (!media?.data?.attributes?.url) return null;
  const url = media.data.attributes.url;
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

// Mock Data for Fallbacks
const MOCK_UPCOMING_MATCHES = [
  { id: 2, teamA: 'WOLVES', teamB: 'BEARS', start_time: new Date(Date.now() + 86400000).toISOString(), date: 'TOMORROW', time: '18:00', teamALogo: null, teamBLogo: null },
  { id: 3, teamA: 'LIONS', teamB: 'DRAGONS', start_time: new Date(Date.now() + 172800000).toISOString(), date: 'IN 2 DAYS', time: '17:30', teamALogo: null, teamBLogo: null },
];

const MOCK_TOP_SCORERS = [
  { id: 101, name: 'Jason M.', team: 'STEEL TITANS', goals: 5 },
];

const MOCK_TOP_ASSISTS = [
  { id: 201, name: 'Jason M.', team: 'STEEL TITANS', assists: 3 },
];

const MOCK_PAST_MATCHES = [
  { id: 7, teamA: 'BLIZZARD', teamB: 'VIPERS', scoreA: 3, scoreB: 2, date: 'FINAL • DEC 12' },
];

const MOCK_GROUPS = [
  {
    name: 'Group A',
    teams: [
      { id: 10, rank: 1, team: 'STEEL TITANS', played: 5, won: 4, lost: 1, points: 12 },
    ]
  }
];

const WINNERS = [
  { rank: 1, teamId: 18, name: 'Club Penguin' },
  { rank: 2, teamId: 3, name: 'Topbar' },
  { rank: 3, teamId: 20, name: 'Chhoti Advance Bade Sapne' },
];

export default function APLFootballPage() {
  const [rawMatches, setRawMatches] = useState<any[]>([]);
  const [rawTeams, setRawTeams] = useState<any[]>([]);
  const [rawParticipants, setRawParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLiveMatchId, setSelectedLiveMatchId] = useState<number | null>(null);
  const [matchTransitionDirection, setMatchTransitionDirection] = useState<'prev' | 'next' | null>(null);

  const fetchData = async () => {
    try {
      const [matchesRes, teamsRes, participantsRes] = await Promise.all([
        fetch('/api/platform/sports/apl/matches', { cache: 'no-store' }),
        fetch('/api/platform/sports/apl/teams', { cache: 'no-store' }),
        fetch('/api/platform/sports/apl/participants?limit=500', { cache: 'no-store' })
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
    const eventSource = new EventSource('/api/platform/sports/apl/sse');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        console.log('[SSE] Received update:', payload);
        if (payload?.model && !['apl-matches', 'apl-teams', 'apl-participants'].includes(payload.model)) {
          return;
        }
        // Re-fetch all data when relevant APL entity changes
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
    let liveMatches: any[] = [];
    let upcomingMatches = [];
    let pastMatches = [];
    let nextMatch = null;

    if (rawMatches && rawMatches.length > 0) {
      const parsed = rawMatches.map((m: any) => {
        const attrs = m.attributes || {};
        const details = attrs.details || {};
        const startTime = attrs.start_time;
        const formattedDateTime = formatMatchDateTime(startTime, details.date, details.time);
        const normalizedStatus = normalizeMatchStatus(attrs.status);
        const round = attrs.round || details.round || '';
        const knockout = isKnockoutRound(round, attrs.type);

        return {
          id: m.id,
          teamA: attrs.team_a?.data?.attributes?.name || 'TBD',
          teamB: attrs.team_b?.data?.attributes?.name || 'TBD',
          teamALogo: getStrapiMediaUrl(attrs.team_a?.data?.attributes?.logo),
          teamBLogo: getStrapiMediaUrl(attrs.team_b?.data?.attributes?.logo),
          scoreA: getMatchScore(attrs.team_a_score, details.scoreA),
          scoreB: getMatchScore(attrs.team_b_score, details.scoreB),
          status: normalizedStatus,
          isKnockout: knockout,
          round,
          time: formattedDateTime.time,
          date: formattedDateTime.date,
          period: formatPeriodLabel(attrs.period, details.period),
          arena: details.arena || 'ASHOKA MAIN FIELD',
          start_time: startTime,
          details: details
        };
      });

      liveMatches = parsed.filter((m: any) => m.status === 'LIVE' && !m.isKnockout);
      upcomingMatches = parsed.filter((m: any) => m.status === 'UPCOMING' && !m.isKnockout);
      pastMatches = parsed.filter((m: any) => m.status === 'COMPLETED' && !m.isKnockout);

      if (liveMatches.length === 0 && upcomingMatches.length > 0) {
        // Find earliest upcoming match
        nextMatch = [...upcomingMatches].sort((a, b) => {
          const timeA = a.start_time ? new Date(a.start_time).getTime() : Infinity;
          const timeB = b.start_time ? new Date(b.start_time).getTime() : Infinity;
          return timeA - timeB;
        })[0];
      }
    } else {
      // Fallbacks for mockup if no matches at all
      upcomingMatches = MOCK_UPCOMING_MATCHES;
      pastMatches = MOCK_PAST_MATCHES;
      nextMatch = MOCK_UPCOMING_MATCHES[0];
    }

    // 2. Leaderboards
    const groupsMap: Record<string, any[]> = {};
    const teamStats: Record<number, any> = {};
    GROUP_NAMES.forEach((groupName) => {
      groupsMap[groupName] = [];
    });

    if (rawTeams && rawTeams.length > 0) {
      rawTeams.forEach((t: any) => {
        const attrs = t.attributes || {};
        const groupName = normalizeGroupName(attrs.group);
        if (!groupsMap[groupName]) groupsMap[groupName] = [];

        const stats = {
          id: t.id,
          team: attrs.name || `Team ${t.id}`,
          played: attrs.matches_played || 0,
          won: attrs.matches_won || 0,
          draws: attrs.matches_tied || 0,
          lost: attrs.matches_lost || 0,
          points: attrs.points || 0
        };
        teamStats[t.id] = stats;
        groupsMap[groupName].push(stats);
      });
    }

    const orderedGroupNames = [
      ...GROUP_NAMES,
      ...Object.keys(groupsMap).filter((name) => !GROUP_NAMES.includes(name)).sort(),
    ];

    const displayGroups = orderedGroupNames.map((groupName) => {
      const sortedTeams = groupsMap[groupName]
        .sort((a, b) => b.points - a.points || b.won - a.won)
        .map((t, idx) => ({ ...t, rank: idx + 1 }));
      return { name: groupName, teams: sortedTeams };
    });

    // 3. Knockout matches
    const knockoutMatches = rawMatches.length > 0
      ? rawMatches
        .filter((m: any) => isKnockoutRound(m.attributes?.round, m.attributes?.type))
        .map((m: any) => {
          const attrs = m.attributes || {};
          const details = attrs.details || {};
          const formattedDateTime = formatMatchDateTime(attrs.start_time, details.date, details.time);
          return {
            id: m.id,
            teamA: attrs.team_a?.data?.attributes?.name || 'TBD',
            teamB: attrs.team_b?.data?.attributes?.name || 'TBD',
            scoreA: getMatchScore(attrs.team_a_score, details.scoreA),
            scoreB: getMatchScore(attrs.team_b_score, details.scoreB),
            status: normalizeMatchStatus(attrs.status),
            round: attrs.round || details.round || '',
            start_time: attrs.start_time,
            date: formattedDateTime.date,
            time: formattedDateTime.time,
          };
        })
        .sort((a: any, b: any) => {
          const order = ['COMPLETED', 'LIVE', 'UPCOMING'];
          const statusDiff = order.indexOf(a.status) - order.indexOf(b.status);
          if (statusDiff !== 0) return statusDiff;
          // Within same status, latest start_time first
          const timeA = a.start_time ? new Date(a.start_time).getTime() : 0;
          const timeB = b.start_time ? new Date(b.start_time).getTime() : 0;
          return timeB - timeA;
        })
      : [];

    // 4. Top Scorers (Goals)

    const displayScorers = rawParticipants.length > 0
      ? rawParticipants
          .map((p: any) => ({
            id: p.id,
            name: normalizePlayerName(p.attributes?.name),
            team: p.attributes?.team?.data?.attributes?.name || 'Unassigned',
            goals: p.attributes?.goals || 0
          }))
          .filter((p: any) => p.goals > 0)
          .sort((a: any, b: any) => b.goals - a.goals || a.name.localeCompare(b.name))
      : MOCK_TOP_SCORERS;

    const displayAssists = rawParticipants.length > 0
      ? rawParticipants
          .map((p: any) => ({
            id: p.id,
            name: normalizePlayerName(p.attributes?.name),
            team: p.attributes?.team?.data?.attributes?.name || 'Unassigned',
            assists: p.attributes?.assists || 0
          }))
          .filter((p: any) => p.assists > 0)
          .sort((a: any, b: any) => b.assists - a.assists || a.name.localeCompare(b.name))
      : MOCK_TOP_ASSISTS;

    // 5. Winner team logos
    const winnerLogos = WINNERS.map(w => {
      const team = rawTeams.find((t: any) => t.id === w.teamId);
      return getStrapiMediaUrl(team?.attributes?.logo) ?? null;
    });

    const selectedLiveMatch = liveMatches.find((match: any) => match.id === selectedLiveMatchId) || null;
    const currentMatchData = selectedLiveMatch || liveMatches[0] || nextMatch;
    const currentLiveMatchIndex = selectedLiveMatch
      ? liveMatches.findIndex((match: any) => match.id === selectedLiveMatch.id)
      : (liveMatches.length > 0 ? 0 : -1);
    return {
      liveMatches,
      nextMatch,
      currentMatch: currentMatchData ? {
        id: currentMatchData.id,
        teamA: currentMatchData.teamA,
        teamB: currentMatchData.teamB,
        teamALogo: currentMatchData.teamALogo || null,
        teamBLogo: currentMatchData.teamBLogo || null,
        scoreA: (currentMatchData as any).scoreA || 0,
        scoreB: (currentMatchData as any).scoreB || 0,
        status: (currentMatchData as any).status || 'UPCOMING',
        time: currentMatchData.time || 'TBD',
        date: currentMatchData.date || 'TBD',
        period: (currentMatchData as any).period || '1H • 00:00',
        arena: (currentMatchData as any).arena || 'ASHOKA MAIN FIELD',
        start_time: currentMatchData.start_time,
        details: (currentMatchData as any).details || {}
      } : null,
      currentLiveMatchIndex,
      upcomingMatches,
      pastMatches,
      knockoutMatches,
      winnerLogos,
      displayGroups: displayGroups.length > 0 ? displayGroups : MOCK_GROUPS,
      displayScorers,
      displayAssists,
      liveMatchSets: currentMatchData?.details?.sets || []
    };
  }, [rawMatches, rawTeams, rawParticipants, selectedLiveMatchId]);

  useEffect(() => {
    const liveMatches = dashboardData.liveMatches || [];
    if (liveMatches.length === 0) {
      if (selectedLiveMatchId !== null) {
        setSelectedLiveMatchId(null);
      }
      return;
    }

    const selectedMatchExists = liveMatches.some((match: any) => match.id === selectedLiveMatchId);
    if (!selectedMatchExists) {
      setSelectedLiveMatchId(liveMatches[0].id);
    }
  }, [dashboardData.liveMatches, selectedLiveMatchId]);

  if (loading && rawMatches.length === 0) return <div className="p-8 text-center text-muted-foreground bg-background">Loading Football Portal...</div>;

  const { currentMatch, currentLiveMatchIndex, liveMatches, upcomingMatches, pastMatches, knockoutMatches, displayGroups, displayScorers, displayAssists } = dashboardData;

  const hasMultipleLiveMatches = liveMatches.length > 1;

  const navigateLiveMatch = (direction: 'prev' | 'next') => {
    if (!hasMultipleLiveMatches) return;

    const currentIndex = currentLiveMatchIndex >= 0 ? currentLiveMatchIndex : 0;
    const nextIndex = direction === 'next'
      ? (currentIndex + 1) % liveMatches.length
      : (currentIndex - 1 + liveMatches.length) % liveMatches.length;

    setMatchTransitionDirection(direction);
    setSelectedLiveMatchId(liveMatches[nextIndex].id);
  };

  return (
    <div className={`p-4 md:p-8 space-y-12 max-w-7xl mx-auto ${styles.aplRoot}`}>

      {/* Hero Live Match Banner or Stay Tuned */}
      <section>
        {currentMatch && (
          <Card className={`relative bg-zinc-900 border-zinc-800 dark:bg-zinc-950 text-white overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all shadow-2xl ${styles.heroCard}`}>
            <Link href={`/platform/sports/apl/${currentMatch.id}`} aria-label={`View match details for ${currentMatch.teamA} versus ${currentMatch.teamB}`} className="absolute inset-0 z-0" />
            {hasMultipleLiveMatches && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateLiveMatch('prev')}
                  aria-label="Previous live match"
                  className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 text-white hover:bg-white/10 hover:text-white md:left-5"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateLiveMatch('next')}
                  aria-label="Next live match"
                  className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 text-white hover:bg-white/10 hover:text-white md:right-5"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
            <CardContent className="relative z-10 p-8 md:p-12 flex flex-col items-center">
              <div
                key={currentMatch.id}
                className={`w-full flex flex-col items-center ${matchTransitionDirection === 'next' ? styles.heroSlideNext : matchTransitionDirection === 'prev' ? styles.heroSlidePrev : ''}`}
                onAnimationEnd={() => setMatchTransitionDirection(null)}
              >
                <div className="flex items-center gap-3 mb-8">
                  <Badge variant={currentMatch.status === 'LIVE' ? "destructive" : "secondary"} className={currentMatch.status === 'LIVE' ? "bg-red-500 hover:bg-red-600 animate-pulse text-xs px-2 py-0 rounded-sm" : "text-xs px-2 py-0 rounded-sm"}>
                    {currentMatch.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-bounce" />}
                    {currentMatch.status}
                  </Badge>
                  <span className="text-zinc-400 text-[10px] md:text-sm font-black uppercase tracking-widest bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/50">
                    {currentMatch.start_time ? (() => {
                      const { date, time } = formatISTDateTimeDisplay(currentMatch.start_time);
                      return `${date} • ${time}`.trim();
                    })() : (currentMatch.date + ' • ' + currentMatch.time)}
                  </span>
                </div>

                <div className="flex items-center justify-center w-full max-w-3xl gap-4 md:gap-12">
                  <div className="flex-1 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 md:w-32 md:h-32 bg-zinc-950/50 dark:bg-black/50 rounded-2xl flex items-center justify-center border border-zinc-800 overflow-hidden">
                      {currentMatch.teamALogo ? (
                        <Image src={currentMatch.teamALogo} alt={currentMatch.teamA} width={128} height={128} className="w-full h-full object-cover" unoptimized />
                      ) : (
                        <div className="w-12 h-12 md:w-20 md:h-20 bg-zinc-800 rounded-full opacity-50" />
                      )}
                    </div>
                    <h3 className="text-sm! md:text-2xl! font-black tracking-wider text-center">{currentMatch.teamA}</h3>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-4 md:gap-8">
                      <span className="text-6xl md:text-9xl font-black tabular-nums tracking-tighter text-white">{currentMatch.scoreA}</span>
                      <span className="text-3xl md:text-5xl font-black text-zinc-700">-</span>
                      <span className="text-6xl md:text-9xl font-black tabular-nums tracking-tighter text-white">{currentMatch.scoreB}</span>
                    </div>

                    {/* Period Display */}
                    {currentMatch.status === 'LIVE' && (
                      <div className="mt-2">
                        <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">{currentMatch.period}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 md:w-32 md:h-32 bg-zinc-950/50 dark:bg-black/50 rounded-2xl flex items-center justify-center border border-zinc-800 overflow-hidden">
                      {currentMatch.teamBLogo ? (
                        <Image src={currentMatch.teamBLogo} alt={currentMatch.teamB} width={128} height={128} className="w-full h-full object-cover" unoptimized />
                      ) : (
                        <div className="w-12 h-12 md:w-20 md:h-20 bg-zinc-800 rounded-full opacity-50" />
                      )}
                    </div>
                    <h3 className="text-sm! md:text-2xl! font-black tracking-wider text-center">{currentMatch.teamB}</h3>
                  </div>
                </div>

                <div className="mt-8 text-sm tracking-widest text-zinc-400 font-semibold uppercase">
                  {currentMatch.arena}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Navigation Links */}
      <section>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/platform/sports/apl/matches" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                <Calendar className="w-4 h-4" />
                All Matches
              </Link>
              <Link href="/platform/sports/apl/standings" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                <BarChart3 className="w-4 h-4" />
                Standings
              </Link>
              <Link href="/platform/sports/apl/players" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                <Trophy className="w-4 h-4" />
                Player Statistics
              </Link>
              <Link href="/platform/sports/apl/knockout" className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                <Calendar className="w-4 h-4" />
                Knockout Bracket
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Middle Section: Standings & Top Scorers */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        <section className="lg:col-span-3">
          <Tabs defaultValue="group" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold tracking-tight">Standings</h3>
              <TabsList className="bg-muted border border-border">
                <TabsTrigger value="group" className="data-[state=active]:bg-card shadow-sm">Group Stage</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="group" className="mt-0">
              <div className="space-y-4">
                {displayGroups.map((group: any) => (
                  <Card key={group.name} className="bg-card border-border text-foreground flex flex-col shadow-sm overflow-hidden">
                    <CardHeader className="py-3 border-b border-border bg-muted/30">
                      <CardTitle className="text-sm font-bold tracking-tight">{group.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="w-12 text-center text-muted-foreground font-bold px-2">#</TableHead>
                            <TableHead className="text-muted-foreground font-bold px-4">TEAM</TableHead>
                            <TableHead className="text-center text-muted-foreground font-bold w-12 px-2">P</TableHead>
                            <TableHead className="text-center text-muted-foreground font-bold w-12 px-2">W</TableHead>
                            <TableHead className="text-center text-muted-foreground font-bold w-12 px-2">D</TableHead>
                            <TableHead className="text-center text-muted-foreground font-bold w-12 px-2">L</TableHead>
                            <TableHead className="text-center text-foreground font-bold w-16 px-4">PTS</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.teams.length === 0 ? (
                            <TableRow className="border-border hover:bg-muted/30">
                              <TableCell colSpan={7} className="text-center text-muted-foreground px-4 py-6">
                                No teams in this group yet.
                              </TableCell>
                            </TableRow>
                          ) : (
                            group.teams.map((team: any, idx: number) => (
                              <TableRow key={team.id || idx} className="border-border hover:bg-muted/30">
                                <TableCell className="text-center font-bold text-muted-foreground px-2">{team.rank}</TableCell>
                                <TableCell className="font-bold tracking-wide px-4 whitespace-nowrap">{team.team}</TableCell>
                                <TableCell className="text-center text-muted-foreground px-2">{team.played}</TableCell>
                                <TableCell className="text-center text-green-600 dark:text-green-500/80 px-2">{team.won}</TableCell>
                                <TableCell className="text-center text-sky-500 dark:text-sky-400/90 px-2">{team.draws}</TableCell>
                                <TableCell className="text-center text-red-600 dark:text-red-500/80 px-2">{team.lost}</TableCell>
                                <TableCell className="text-center font-black text-yellow-600 dark:text-yellow-500 text-base px-4">{team.points}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
              </TabsContent>

            <TabsContent value="knockout" className="mt-0">
                  <div className="space-y-6">
                <div className="text-center">
                  <h4 className="text-lg font-bold">Knockout Bracket Preview</h4>
                  <p className="text-sm text-muted-foreground">Matchups are shown with placeholders until teams are confirmed.</p>
                </div>
                <div className="w-full overflow-x-auto">
                  <div className={styles.bracketPreviewMini}>
                    <div className="space-y-4">
                      <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground font-semibold text-center">Round of 16</div>
                      {knockoutMatches.filter(m => m.round === 'round_of_16').slice(0, 4).map((match: any) => (
                        <div key={match.id} className={`${styles.bracketCard} ${styles.bracketPlaceholder}`}>
                          <div className={styles.bracketCardTitle}>
                            <span className={styles.bracketTeam}>{match.teamA || 'TBD'}</span>
                            <span className={styles.bracketScore}>{match.scoreA ?? '-'}</span>
                          </div>
                          <div className={styles.bracketCardTitle}>
                            <span className={styles.bracketTeam}>{match.teamB || 'TBD'}</span>
                            <span className={styles.bracketScore}>{match.scoreB ?? '-'}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground font-semibold text-center">Quarterfinals</div>
                      {knockoutMatches.filter(m => m.round === 'quarter_final').slice(0, 2).map((match: any) => (
                        <div key={match.id} className={`${styles.bracketCard} ${styles.bracketPlaceholder}`}>
                          <div className={styles.bracketCardTitle}>
                            <span className={styles.bracketTeam}>{match.teamA || 'TBD'}</span>
                            <span className={styles.bracketScore}>{match.scoreA ?? '-'}</span>
                          </div>
                          <div className={styles.bracketCardTitle}>
                            <span className={styles.bracketTeam}>{match.teamB || 'TBD'}</span>
                            <span className={styles.bracketScore}>{match.scoreB ?? '-'}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground font-semibold text-center">Semifinals</div>
                      {knockoutMatches.filter(m => m.round === 'semi_final').map((match: any) => (
                        <div key={match.id} className={`${styles.bracketCard} ${styles.bracketPlaceholder}`}>
                          <div className={styles.bracketCardTitle}>
                            <span className={styles.bracketTeam}>{match.teamA || 'TBD'}</span>
                            <span className={styles.bracketScore}>{match.scoreA ?? '-'}</span>
                          </div>
                          <div className={styles.bracketCardTitle}>
                            <span className={styles.bracketTeam}>{match.teamB || 'TBD'}</span>
                            <span className={styles.bracketScore}>{match.scoreB ?? '-'}</span>
                          </div>
                        </div>
                      ))}
                      <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground font-semibold text-center mt-4">Final</div>
                      {knockoutMatches.filter(m => m.round === 'final').map((match: any) => (
                        <div key={match.id} className={`${styles.bracketCard} ${styles.bracketPlaceholder}`}>
                          <div className={styles.bracketCardTitle}>
                            <span className={styles.bracketTeam}>{match.teamA || 'TBD'}</span>
                            <span className={styles.bracketScore}>{match.scoreA ?? '-'}</span>
                          </div>
                          <div className={styles.bracketCardTitle}>
                            <span className={styles.bracketTeam}>{match.teamB || 'TBD'}</span>
                            <span className={styles.bracketScore}>{match.scoreB ?? '-'}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground font-semibold text-center">Quarterfinals</div>
                      {knockoutMatches.filter(m => m.round === 'quarter_final').slice(2, 4).map((match: any) => (
                        <div key={match.id} className={`${styles.bracketCard} ${styles.bracketPlaceholder}`}>
                          <div className={styles.bracketCardTitle}>
                            <span className={styles.bracketTeam}>{match.teamA || 'TBD'}</span>
                            <span className={styles.bracketScore}>{match.scoreA ?? '-'}</span>
                          </div>
                          <div className={styles.bracketCardTitle}>
                            <span className={styles.bracketTeam}>{match.teamB || 'TBD'}</span>
                            <span className={styles.bracketScore}>{match.scoreB ?? '-'}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="text-xs uppercase tracking-[0.35em] text-muted-foreground font-semibold text-center">Round of 16</div>
                      {knockoutMatches.filter(m => m.round === 'round_of_16').slice(4, 8).map((match: any) => (
                        <div key={match.id} className={`${styles.bracketCard} ${styles.bracketPlaceholder}`}>
                          <div className={styles.bracketCardTitle}>
                            <span className={styles.bracketTeam}>{match.teamA || 'TBD'}</span>
                            <span className={styles.bracketScore}>{match.scoreA ?? '-'}</span>
                          </div>
                          <div className={styles.bracketCardTitle}>
                            <span className={styles.bracketTeam}>{match.teamB || 'TBD'}</span>
                            <span className={styles.bracketScore}>{match.scoreB ?? '-'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Link href="/platform/sports/apl/knockout" className="text-sm text-primary hover:underline">
                    View Full Bracket →
                  </Link>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        <div className="lg:col-span-2 flex flex-col gap-8 w-full self-start">
          <section className="flex flex-col w-full">
            <div className="flex items-center justify-between mb-4 h-10 w-full">
              <h3 className="text-xl font-bold tracking-tight">Top Scorers</h3>
            </div>
            <Card className="bg-card border-border text-foreground shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <ScrollArea className="w-full h-[400px]">
                  <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm">
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="w-12 text-center text-muted-foreground font-bold px-2">#</TableHead>
                        <TableHead className="text-muted-foreground font-bold px-4">PLAYER</TableHead>
                        <TableHead className="text-right text-foreground font-bold px-6 w-24">GOALS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayScorers.map((scorer: any, index: number) => (
                        <TableRow key={scorer.id || index} className="border-border hover:bg-muted/30">
                          <TableCell className="text-center font-bold text-muted-foreground px-2">{index + 1}</TableCell>
                          <TableCell className="px-4">
                            <p className="font-bold text-red-500 tracking-wide whitespace-nowrap">{scorer.name}</p>
                            <p className="text-xs text-muted-foreground font-semibold mt-0.5">{scorer.team}</p>
                          </TableCell>
                          <TableCell className="text-right font-black text-yellow-600 dark:text-yellow-500 text-lg px-6">
                            {scorer.goals}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </section>

          <section className="flex flex-col w-full">
            <div className="flex items-center justify-between mb-4 h-10 w-full">
              <h3 className="text-xl font-bold tracking-tight">Top Assists</h3>
            </div>
            <Card className="bg-card border-border text-foreground shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <ScrollArea className="w-full h-[400px]">
                  <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm">
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="w-12 text-center text-muted-foreground font-bold px-2">#</TableHead>
                        <TableHead className="text-muted-foreground font-bold px-4">PLAYER</TableHead>
                        <TableHead className="text-right text-foreground font-bold px-6 w-24">ASSISTS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayAssists.map((player: any, index: number) => (
                        <TableRow key={player.id || index} className="border-border hover:bg-muted/30">
                          <TableCell className="text-center font-bold text-muted-foreground px-2">{index + 1}</TableCell>
                          <TableCell className="px-4">
                            <p className="font-bold text-red-500 tracking-wide whitespace-nowrap">{player.name}</p>
                            <p className="text-xs text-muted-foreground font-semibold mt-0.5">{player.team}</p>
                          </TableCell>
                          <TableCell className="text-right font-black text-yellow-600 dark:text-yellow-500 text-lg px-6">
                            {player.assists}
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
      </div>

      {/* Matches */}
      <section className="pt-4 border-t border-border">
        <Tabs defaultValue="finished" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold tracking-tight">Matches</h2>
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
                  <div key={match.id} className={`bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:bg-muted/50 transition-colors shadow-sm ${styles.matchCard}`}>
                    <div>
                      <h4 className="font-bold text-foreground">{match.teamA} VS {match.teamB}</h4>
                      <p className="text-xs text-muted-foreground font-semibold tracking-wide mt-1">
                        {match.start_time ? (() => {
                          const { date, time } = formatISTDateTimeDisplay(match.start_time);
                          return `${date} • ${time}`.trim();
                        })() : (match.date + ' • ' + match.time)}
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
                  <div key={match.id} className={`bg-card border border-border rounded-xl p-5 hover:bg-muted/50 transition-colors relative overflow-hidden shadow-sm ${styles.matchCard}`}>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-muted-foreground tracking-wide">{match.date}</span>
                      <Badge className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500/20 text-[10px] px-1.5 py-0 uppercase tracking-wider rounded-sm" variant="outline">Finished</Badge>
                    </div>
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                      <div className="text-center">
                        <h4 className="font-bold text-sm text-foreground md:text-base">{match.teamA}</h4>
                        <p className={`text-3xl font-black mt-2 ${match.scoreA > match.scoreB ? 'text-yellow-600 dark:text-yellow-500' : 'text-muted-foreground'}`}>{match.scoreA}</p>
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
    </div>
  );
}

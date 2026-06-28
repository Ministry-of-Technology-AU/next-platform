"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import DeveloperCredits from '@/components/developer-credits';

const GROUP_NAMES = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F'];

const normalizeGroupName = (group?: string) => {
  if (!group || typeof group !== 'string') return 'Unassigned';
  const trimmed = group.trim();
  if (/^group\s*/i.test(trimmed)) {
    return `Group ${trimmed.replace(/^group\s*/i, '').toUpperCase()}`;
  }
  return `Group ${trimmed.toUpperCase()}`;
};

export default function APLStandingsPage() {
  const [rawTeams, setRawTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const teamsRes = await fetch('/api/platform/sports/apl/teams', { cache: 'no-store' });

      if (teamsRes.ok) {
        const d = await teamsRes.json();
        setRawTeams(d.data || []);
      }
    } catch (e) {
      console.error('Error fetching standings data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const eventSource = new EventSource('/api/platform/sports/apl/sse');
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.model && payload.model !== 'apl-teams') {
          return;
        }
        fetchData();
      } catch (e) {
        console.error('[SSE] Parse error:', e);
      }
    };
    eventSource.onerror = () => console.warn('[SSE] Connection lost');

    return () => eventSource.close();
  }, []);

  const displayGroups = useMemo(() => {
    const groupsMap: Record<string, any[]> = {};
    GROUP_NAMES.forEach((groupName) => {
      groupsMap[groupName] = [];
    });

    rawTeams.forEach((team: any) => {
      const attrs = team.attributes || {};
      const groupName = normalizeGroupName(attrs.group);
      if (!groupsMap[groupName]) groupsMap[groupName] = [];

      const stats = {
        id: team.id,
        team: attrs.name || `Team ${team.id}`,
        played: attrs.matches_played || 0,
        won: attrs.matches_won || 0,
        draws: attrs.matches_tied || 0,
        lost: attrs.matches_lost || 0,
        points: attrs.points || 0,
      };

      groupsMap[groupName].push(stats);
    });

    const orderedGroupNames = [
      ...GROUP_NAMES,
      ...Object.keys(groupsMap).filter((name) => !GROUP_NAMES.includes(name)).sort(),
    ];

    return orderedGroupNames.map((groupName) => {
      const teams = (groupsMap[groupName] || []).sort(
        (a, b) => b.points - a.points || b.won - a.won || b.draws - a.draws
      );
      return {
        name: groupName,
        teams: teams.map((team, idx) => ({ ...team, rank: idx + 1 })),
      };
    });
  }, [rawTeams]);

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading Standings...</div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3 text-primary mb-3">
            <BarChart3 className="h-5 w-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">APL Standings</h1>
          <p className="text-muted-foreground">Full group stage standings for all groups A through F.</p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <Link href="/platform/sports/apl">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to APL Home
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {displayGroups.map((group) => (
          <Card key={group.name} className="bg-card border-border shadow-sm overflow-hidden">
            <CardHeader className="py-3 border-b border-border bg-muted/30">
              <CardTitle className="text-sm font-bold tracking-tight">{group.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {group.teams.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground">No teams yet in this group.</div>
              ) : (
                <ScrollArea className="h-[300px] sm:h-[340px] md:h-[360px]">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="w-10 sm:w-12 text-center text-muted-foreground font-bold px-1 sm:px-2">#</TableHead>
                        <TableHead className="text-muted-foreground font-bold px-2 sm:px-4">Team</TableHead>
                        <TableHead className="hidden sm:table-cell text-center text-muted-foreground font-bold w-12 px-2">P</TableHead>
                        <TableHead className="hidden md:table-cell text-center text-muted-foreground font-bold w-12 px-2">W</TableHead>
                        <TableHead className="hidden md:table-cell text-center text-muted-foreground font-bold w-12 px-2">D</TableHead>
                        <TableHead className="hidden md:table-cell text-center text-muted-foreground font-bold w-12 px-2">L</TableHead>
                        <TableHead className="text-center text-foreground font-bold w-14 sm:w-16 px-2 sm:px-4">PTS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.teams.map((team: any) => (
                        <TableRow key={team.id} className="border-border hover:bg-muted/30">
                          <TableCell className="text-center font-bold text-muted-foreground px-1 sm:px-2">{team.rank}</TableCell>
                          <TableCell className="font-bold tracking-wide px-2 sm:px-4 max-w-[9rem] sm:max-w-[13rem] truncate">{team.team}</TableCell>
                          <TableCell className="hidden sm:table-cell text-center text-muted-foreground px-2">{team.played}</TableCell>
                          <TableCell className="hidden md:table-cell text-center text-green-600 dark:text-green-500/80 px-2">{team.won}</TableCell>
                          <TableCell className="hidden md:table-cell text-center text-sky-500 dark:text-sky-400/90 px-2">{team.draws}</TableCell>
                          <TableCell className="hidden md:table-cell text-center text-red-600 dark:text-red-500/80 px-2">{team.lost}</TableCell>
                          <TableCell className="text-center font-black text-yellow-600 dark:text-yellow-500 text-sm sm:text-base px-2 sm:px-4">{team.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <DeveloperCredits
        developers={[
          {
            name: 'Nitin S',
            role: 'Lead Developer',
            profileUrl: 'https://github.com/28nitin07',
          },
        ]}
      />
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Users } from 'lucide-react';
import { normalizePlayerName } from '@/lib/utils';
import DeveloperCredits from '@/components/developer-credits';

export default function APLPlayerStatsPage() {
  const [rawParticipants, setRawParticipants] = useState<any[]>([]);
  const [rawTeams, setRawTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [participantsResponse, teamsResponse] = await Promise.all([
        fetch('/api/platform/sports/apl/participants?limit=500'),
        fetch('/api/platform/sports/apl/teams'),
      ]);

      if (participantsResponse.ok) {
        const participantsData = await participantsResponse.json();
        setRawParticipants(participantsData.data || []);
      }

      if (teamsResponse.ok) {
        const teamsData = await teamsResponse.json();
        setRawTeams(teamsData.data || []);
      }
    } catch (e) {
      console.error('Error fetching player stats data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // SSE: listen for real-time updates
    const eventSource = new EventSource('/api/platform/sports/apl/sse');
    eventSource.onmessage = () => fetchData();
    eventSource.onerror = () => console.warn('[SSE] Connection lost');

    return () => eventSource.close();
  }, []);

  const statsData = useMemo(() => {
    if (!rawParticipants.length && !rawTeams.length) return {
      topScorers: [],
      topTeamCleanSheets: [],
      teamStats: []
    };

    const participants = rawParticipants.map((p: any) => ({
      id: p.id,
      name: normalizePlayerName(p.attributes?.name),
      team: p.attributes?.team?.data?.attributes?.name || 'Unassigned',
      goals: p.attributes?.goals || 0,
      sold_at: p.attributes?.sold_at || 0,
      tier: p.attributes?.tier || 'tier4',
      isCM: p.attributes?.isCM || false
    }));

    const topScorers = [...participants]
      .filter(p => p.goals > 0)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 20);

    const topTeamCleanSheets = [...rawTeams]
      .map((team: any) => ({
        id: team.id,
        name: team.attributes?.name || `Team ${team.id}`,
        clean_sheets: team.attributes?.clean_sheets || 0,
      }))
      .filter((team) => team.clean_sheets > 0)
      .sort((a, b) => b.clean_sheets - a.clean_sheets)
      .slice(0, 20);

    // Team stats
    const teamMap: Record<string, any> = {};
    participants.forEach(p => {
      if (!teamMap[p.team]) {
        teamMap[p.team] = { team: p.team, players: 0, totalGoals: 0 };
      }
      teamMap[p.team].players += 1;
      teamMap[p.team].totalGoals += p.goals;
    });
    const teamStats = Object.values(teamMap).sort((a: any, b: any) => b.totalGoals - a.totalGoals);

    return { topScorers, topTeamCleanSheets, teamStats };
  }, [rawParticipants, rawTeams]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading Player Stats...</div>;

  const { topScorers, teamStats, topTeamCleanSheets } = statsData;

  return (
    <div className="p-3 sm:p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <div className="text-center space-y-4">
        <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between md:items-center">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">APL Player Statistics</h1>
            <p className="text-muted-foreground">Track goals and team performance</p>
          </div>
          <Link href="/platform/sports/apl">
            <Button variant="outline" className="w-full sm:w-auto">
              APL Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{topScorers[0]?.goals || 0}</div>
            <div className="text-sm text-muted-foreground">Top Goals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{rawParticipants.length}</div>
            <div className="text-sm text-muted-foreground">Total Players</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{topTeamCleanSheets[0]?.clean_sheets || 0}</div>
            <div className="text-sm text-muted-foreground">Top Clean Sheets</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-1 sm:grid-cols-3 gap-1">
          <TabsTrigger value="goals" className="text-xs sm:text-sm">Top Scorers</TabsTrigger>
          <TabsTrigger value="teams" className="text-xs sm:text-sm">Team Stats</TabsTrigger>
          <TabsTrigger value="cleanSheets" className="text-xs sm:text-sm">Clean Sheets</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Goal Scorers</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead className="hidden sm:table-cell">Team</TableHead>
                      <TableHead className="hidden sm:table-cell">Tier</TableHead>
                      <TableHead className="text-right">Goals</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topScorers.map((player, index) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-bold">{index + 1}</TableCell>
                        <TableCell className="font-medium max-w-[10rem] sm:max-w-none truncate">{player.name}</TableCell>
                        <TableCell className="hidden sm:table-cell max-w-[10rem] truncate">{player.team}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="capitalize">
                            {player.tier.replace('tier', 'Tier ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-yellow-600">
                          {player.goals}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-center">Players</TableHead>
                      <TableHead className="text-center">Total Goals</TableHead>
                      <TableHead className="hidden sm:table-cell text-center">Avg Goals/Player</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamStats.map((team: any) => (
                      <TableRow key={team.team}>
                        <TableCell className="font-medium max-w-[10rem] sm:max-w-none truncate">{team.team}</TableCell>
                        <TableCell className="text-center">{team.players}</TableCell>
                        <TableCell className="text-center font-bold text-yellow-600">
                          {team.totalGoals}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-center">
                          {(team.totalGoals / team.players).toFixed(1)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cleanSheets" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Clean Sheets</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] max-h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-right">Clean Sheets</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topTeamCleanSheets.map((team: any, index: number) => (
                      <TableRow key={team.id}>
                        <TableCell className="font-bold">{index + 1}</TableCell>
                        <TableCell className="font-medium max-w-[10rem] sm:max-w-none truncate">{team.name}</TableCell>
                        <TableCell className="text-right font-bold text-emerald-600">
                          {team.clean_sheets}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
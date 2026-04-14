"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Target, Users } from 'lucide-react';

export default function APLPlayerStatsPage() {
  const [rawParticipants, setRawParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipants = async () => {
    try {
      const response = await fetch('/api/platform/sports/apl/participants?limit=500');
      if (response.ok) {
        const d = await response.json();
        setRawParticipants(d.data || []);
      }
    } catch (e) {
      console.error("Error fetching participants:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();

    // SSE: listen for real-time updates
    const eventSource = new EventSource('/api/platform/sports/apl/sse');
    eventSource.onmessage = () => fetchParticipants();
    eventSource.onerror = () => console.warn('[SSE] Connection lost');

    return () => eventSource.close();
  }, []);

  const statsData = useMemo(() => {
    if (!rawParticipants.length) return {
      topScorers: [],
      topAssists: [],
      teamStats: [],
      tierStats: []
    };

    const participants = rawParticipants.map((p: any) => ({
      id: p.id,
      name: p.attributes?.name || 'Unknown',
      team: p.attributes?.team?.data?.attributes?.name || 'Unassigned',
      goals: p.attributes?.goals || 0,
      assists: p.attributes?.assists || 0,
      sold_at: p.attributes?.sold_at || 0,
      tier: p.attributes?.tier || 'tier4',
      isCM: p.attributes?.isCM || false
    }));

    const topScorers = [...participants]
      .filter(p => p.goals > 0)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 20);

    const topAssists = [...participants]
      .filter(p => p.assists > 0)
      .sort((a, b) => b.assists - a.assists)
      .slice(0, 20);

    // Team stats
    const teamMap: Record<string, any> = {};
    participants.forEach(p => {
      if (!teamMap[p.team]) {
        teamMap[p.team] = { team: p.team, players: 0, totalGoals: 0, totalAssists: 0 };
      }
      teamMap[p.team].players += 1;
      teamMap[p.team].totalGoals += p.goals;
      teamMap[p.team].totalAssists += p.assists;
    });
    const teamStats = Object.values(teamMap).sort((a: any, b: any) => b.totalGoals - a.totalGoals);

    // Tier stats
    const tierMap: Record<string, any> = {};
    participants.forEach(p => {
      if (!tierMap[p.tier]) {
        tierMap[p.tier] = { tier: p.tier, players: 0, totalGoals: 0, totalAssists: 0 };
      }
      tierMap[p.tier].players += 1;
      tierMap[p.tier].totalGoals += p.goals;
      tierMap[p.tier].totalAssists += p.assists;
    });
    const tierStats = Object.values(tierMap);

    return { topScorers, topAssists, teamStats, tierStats };
  }, [rawParticipants]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading Player Stats...</div>;

  const { topScorers, topAssists, teamStats, tierStats } = statsData;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">APL Player Statistics</h1>
        <p className="text-muted-foreground">Track goals, assists, and team performance</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{topScorers[0]?.goals || 0}</div>
            <div className="text-sm text-muted-foreground">Top Goals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{topAssists[0]?.assists || 0}</div>
            <div className="text-sm text-muted-foreground">Top Assists</div>
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
            <div className="text-2xl font-bold">{teamStats.length}</div>
            <div className="text-sm text-muted-foreground">Teams</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="goals">Top Scorers</TabsTrigger>
          <TabsTrigger value="assists">Top Assists</TabsTrigger>
          <TabsTrigger value="teams">Team Stats</TabsTrigger>
          <TabsTrigger value="tiers">Tier Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Goal Scorers</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead className="text-right">Goals</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topScorers.map((player, index) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-bold">{index + 1}</TableCell>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell>{player.team}</TableCell>
                        <TableCell>
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

        <TabsContent value="assists" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Assist Providers</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Player</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead className="text-right">Assists</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topAssists.map((player, index) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-bold">{index + 1}</TableCell>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell>{player.team}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {player.tier.replace('tier', 'Tier ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-blue-600">
                          {player.assists}
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
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-center">Players</TableHead>
                      <TableHead className="text-center">Total Goals</TableHead>
                      <TableHead className="text-center">Total Assists</TableHead>
                      <TableHead className="text-center">Avg Goals/Player</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamStats.map((team: any) => (
                      <TableRow key={team.team}>
                        <TableCell className="font-medium">{team.team}</TableCell>
                        <TableCell className="text-center">{team.players}</TableCell>
                        <TableCell className="text-center font-bold text-yellow-600">
                          {team.totalGoals}
                        </TableCell>
                        <TableCell className="text-center font-bold text-blue-600">
                          {team.totalAssists}
                        </TableCell>
                        <TableCell className="text-center">
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

        <TabsContent value="tiers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tier Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tier</TableHead>
                      <TableHead className="text-center">Players</TableHead>
                      <TableHead className="text-center">Total Goals</TableHead>
                      <TableHead className="text-center">Total Assists</TableHead>
                      <TableHead className="text-center">Avg Goals/Player</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tierStats.map((tier: any) => (
                      <TableRow key={tier.tier}>
                        <TableCell className="font-medium capitalize">
                          {tier.tier.replace('tier', 'Tier ')}
                        </TableCell>
                        <TableCell className="text-center">{tier.players}</TableCell>
                        <TableCell className="text-center font-bold text-yellow-600">
                          {tier.totalGoals}
                        </TableCell>
                        <TableCell className="text-center font-bold text-blue-600">
                          {tier.totalAssists}
                        </TableCell>
                        <TableCell className="text-center">
                          {(tier.totalGoals / tier.players).toFixed(1)}
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
    </div>
  );
}
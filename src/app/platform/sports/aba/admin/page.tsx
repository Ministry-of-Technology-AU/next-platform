"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Play, Square, Settings2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function ABAAdminPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [matchType, setMatchType] = useState('Group Stage');
  const [matchDate, setMatchDate] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [matchesRes, teamsRes] = await Promise.all([
        fetch('/api/platform/sports/aba/matches'),
        fetch('/api/platform/sports/aba/teams')
      ]);
      const matchesData = await matchesRes.json();
      const teamsData = await teamsRes.json();
      setMatches(matchesData.data || []);
      setTeams(teamsData.data || []);
    } catch (e) {
      console.error("Failed to load admin data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateMatch = async () => {
    if (!teamA || !teamB || !matchDate) return alert("Please fill all fields");

    try {
      const newMatchPayload = {
        team_a: Number(teamA),
        team_b: Number(teamB),
        type: matchType,
        status: "Upcoming",
        details: {
          date: new Date(matchDate).toLocaleDateString(),
          time: new Date(matchDate).toLocaleTimeString(),
          period: "Q1 • 10:00",
          arena: "ASHOKA MAIN COURT",
          scoreA: 0,
          scoreB: 0
        }
      };

      const res = await fetch('/api/platform/sports/aba/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMatchPayload)
      });

      if (!res.ok) throw new Error("Creation failed");
      await fetchDashboardData(); // Reload table
      alert("Match Created!");
    } catch (e) {
      console.error(e);
      alert("Failed to create match");
    }
  };

  const updateMatchStatus = async (matchId: number, status: string) => {
    try {
      const res = await fetch(`/api/platform/sports/aba/matches/${matchId}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ status: status })
      });
      if (!res.ok) throw new Error("Status update failed");
      await fetchDashboardData();
    } catch (e) {
       console.error(e);
       alert("Failed to update status");
    }
  };



  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading Admin Dashboard...</div>;

  return (
    <div className="p-4 md:p-6 w-full max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">ABA Admin Controls</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Match Panel */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Match
            </CardTitle>
            <CardDescription>Schedule a new match.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teamA">Team A</Label>
              <Select value={teamA} onValueChange={setTeamA}>
                <SelectTrigger id="teamA">
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id.toString()}>{team.attributes?.name || `Team ${team.id}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="teamB">Team B</Label>
              <Select value={teamB} onValueChange={setTeamB}>
                <SelectTrigger id="teamB">
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id.toString()}>{team.attributes?.name || `Team ${team.id}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Match Type</Label>
              <Select value={matchType} onValueChange={setMatchType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Group Stage">Group Stage</SelectItem>
                  <SelectItem value="Knockout">Knockout Stage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="datetime">Date & Time</Label>
              <Input id="datetime" type="datetime-local" value={matchDate} onChange={(e) => setMatchDate(e.target.value)} />
            </div>
            <Button className="w-full mt-2" onClick={handleCreateMatch}>Create Match</Button>
          </CardContent>
        </Card>

        {/* Existing Matches List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5" />
              Manage Matches
            </CardTitle>
            <CardDescription>Update statuses and scores of existing matches.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matchup</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No matches found</TableCell></TableRow>
                ) : matches.map((match) => {
                  const attrs = match.attributes || {};
                  const status = attrs.status || 'Upcoming';
                  return (
                    <TableRow key={match.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {attrs.team_a?.data?.attributes?.name || 'TBD'} vs {attrs.team_b?.data?.attributes?.name || 'TBD'}
                      </TableCell>
                      <TableCell>{attrs.type || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant={status === 'Live' ? 'destructive' : status === 'Upcoming' ? 'outline' : 'secondary'}>
                          {status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/platform/sports/aba/admin/${match.id}`)}>
                          <Settings2 className="w-4 h-4 mr-1" />
                          Manage Match
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

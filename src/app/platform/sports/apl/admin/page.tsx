"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Edit, Trash2, Users, Trophy, Calendar, BarChart3, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

function getStrapiMediaUrl(media: any): string | null {
  if (!media?.data?.attributes?.url) return null;
  const url = media.data.attributes.url;
  return url.startsWith('http') ? url : `${STRAPI_URL}${url}`;
}

export default function APLAdminPage() {
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [participantDialogOpen, setParticipantDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [matchForm, setMatchForm] = useState<any>({
    team_a: '',
    team_b: '',
    status: 'upcoming',
    team_a_score: 0,
    team_b_score: 0,
    start_time: '',
    period: 'not_started',
    round: 'group_stage',
    match_number: '',
    goal_events: [] as any[],
    card_events: [] as any[],
    save_events: [] as any[],
    substitution_events: [] as any[],
  });

  const [teamForm, setTeamForm] = useState({
    name: '',
    group: 'A',
    logo: null as File | null
  });

  const [participantForm, setParticipantForm] = useState({
    name: '',
    team: '',
    isCM: false,
    sold_at: 0,
    tier: 'tier1',
    goals: 0,
    assists: 0,
    clean_sheets: 0
  });

  const fetchData = async () => {
    try {
      const [matchesRes, teamsRes, participantsRes] = await Promise.all([
        fetch('/api/platform/sports/apl/matches?populate=*'),
        fetch('/api/platform/sports/apl/teams?populate=*'),
        fetch('/api/platform/sports/apl/participants?populate=*&limit=1000')
      ]);

      if (matchesRes.ok) {
        const d = await matchesRes.json();
        setMatches(d.data || []);
      }
      if (teamsRes.ok) {
        const d = await teamsRes.json();
        setTeams(d.data || []);
      }
      if (participantsRes.ok) {
        const d = await participantsRes.json();
        setParticipants(d.data || []);
      }
    } catch {
      console.error("Error fetching admin data");
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const teamMap = useMemo(() => {
    const map: Record<number, any> = {};
    teams.forEach(team => {
      map[team.id] = team;
    });
    return map;
  }, [teams]);

  const createEmptyGoalEvent = () => ({
    scorer: '',
    assister: '',
    minute: 1,
    is_penalty: false,
    is_own_goal: false,
    team: 'team_a'
  });

  const createEmptyCardEvent = () => ({
    player: '',
    minute: 1,
    card_type: 'yellow',
    team: 'team_a'
  });

  const createEmptySaveEvent = () => ({
    goalkeeper: '',
    minute: 1,
    saves: 1,
    team: 'team_a'
  });

  const createEmptySubstitutionEvent = () => ({
    player_off: '',
    player_on: '',
    minute: 1,
    team: 'team_a'
  });

  const prepareMatchPayload = (form: any) => {
    const goal_events = (form.goal_events || []).map((event: any) => ({
      team: event.team,
      minute: parseInt(event.minute?.toString() || '0') || 0,
      is_penalty: event.is_penalty,
      is_own_goal: event.is_own_goal,
      ...(event.scorer ? { scorer: { id: parseInt(event.scorer) } } : {}),
      ...(event.assister ? { assister: { id: parseInt(event.assister) } } : {})
    }));

    const card_events = (form.card_events || []).map((event: any) => ({
      team: event.team,
      minute: parseInt(event.minute?.toString() || '0') || 0,
      card_type: event.card_type,
      ...(event.player ? { player: { id: parseInt(event.player) } } : {})
    }));

    const save_events = (form.save_events || []).map((event: any) => ({
      team: event.team,
      minute: parseInt(event.minute?.toString() || '0') || 0,
      saves: parseInt(event.saves?.toString() || '0') || 0,
      ...(event.goalkeeper ? { goalkeeper: { id: parseInt(event.goalkeeper) } } : {})
    }));

    const substitution_events = (form.substitution_events || []).map((event: any) => ({
      team: event.team,
      minute: parseInt(event.minute?.toString() || '0') || 0,
      ...(event.player_off ? { player_off: { id: parseInt(event.player_off) } } : {}),
      ...(event.player_on ? { player_on: { id: parseInt(event.player_on) } } : {})
    }));

    return {
      goal_events,
      card_events,
      save_events,
      substitution_events,
    };
  };

  // Match CRUD operations
  const handleCreateMatch = async () => {
    try {
      const response = await fetch('/api/platform/sports/apl/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            ...matchForm,
            ...prepareMatchPayload(matchForm),
            team_a: { id: parseInt(matchForm.team_a) },
            team_b: { id: parseInt(matchForm.team_b) },
            match_number: matchForm.match_number ? parseInt(matchForm.match_number) : null
          }
        })
      });

      if (response.ok) {
        toast.success("Match created successfully");
        setMatchDialogOpen(false);
        resetMatchForm();
        fetchData();
      } else {
        toast.error("Failed to create match");
      }
    } catch {
      toast.error("Error creating match");
    }
  };

  const handleUpdateMatch = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/platform/sports/apl/matches/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            ...matchForm,
            ...prepareMatchPayload(matchForm),
            team_a: { id: parseInt(matchForm.team_a) },
            team_b: { id: parseInt(matchForm.team_b) },
            match_number: matchForm.match_number ? parseInt(matchForm.match_number) : null
          }
        })
      });

      if (response.ok) {
        toast.success("Match updated successfully");
        setMatchDialogOpen(false);
        setEditingItem(null);
        resetMatchForm();
        fetchData();
      } else {
        toast.error("Failed to update match");
      }
    } catch {
      toast.error("Error updating match");
    }
  };

  const handleDeleteMatch = async (id: number) => {
    try {
      const response = await fetch(`/api/platform/sports/apl/matches/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success("Match deleted successfully");
        fetchData();
      } else {
        toast.error("Failed to delete match");
      }
    } catch {
      toast.error("Error deleting match");
    }
  };

  // Team CRUD operations
  const handleCreateTeam = async () => {
    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify({
        name: teamForm.name,
        group: teamForm.group
      }));
      if (teamForm.logo) {
        formData.append('files.logo', teamForm.logo);
      }

      const response = await fetch('/api/platform/sports/apl/teams', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        toast.success("Team created successfully");
        setTeamDialogOpen(false);
        resetTeamForm();
        fetchData();
      } else {
        toast.error("Failed to create team");
      }
    } catch {
      toast.error("Error creating team");
    }
  };

  const handleUpdateTeam = async () => {
    if (!editingItem) return;

    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify({
        name: teamForm.name,
        group: teamForm.group
      }));
      if (teamForm.logo) {
        formData.append('files.logo', teamForm.logo);
      }

      const response = await fetch(`/api/platform/sports/apl/teams/${editingItem.id}`, {
        method: 'PATCH',
        body: formData
      });

      if (response.ok) {
        toast.success("Team updated successfully");
        setTeamDialogOpen(false);
        setEditingItem(null);
        resetTeamForm();
        fetchData();
      } else {
        toast.error("Failed to update team");
      }
    } catch {
      toast.error("Error updating team");
    }
  };

  const handleDeleteTeam = async (id: number) => {
    try {
      const response = await fetch(`/api/platform/sports/apl/teams/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success("Team deleted successfully");
        fetchData();
      } else {
        toast.error("Failed to delete team");
      }
    } catch {
      toast.error("Error deleting team");
    }
  };

  // Participant CRUD operations
  const handleCreateParticipant = async () => {
    try {
      const response = await fetch('/api/platform/sports/apl/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            ...participantForm,
            team: { id: parseInt(participantForm.team) }
          }
        })
      });

      if (response.ok) {
        toast.success("Participant created successfully");
        setParticipantDialogOpen(false);
        resetParticipantForm();
        fetchData();
      } else {
        toast.error("Failed to create participant");
      }
    } catch {
      toast.error("Error creating participant");
    }
  };

  const handleUpdateParticipant = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(`/api/platform/sports/apl/participants/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            ...participantForm,
            team: { id: parseInt(participantForm.team) }
          }
        })
      });

      if (response.ok) {
        toast.success("Participant updated successfully");
        setParticipantDialogOpen(false);
        setEditingItem(null);
        resetParticipantForm();
        fetchData();
      } else {
        toast.error("Failed to update participant");
      }
    } catch {
      toast.error("Error updating participant");
    }
  };

  const handleDeleteParticipant = async (id: number) => {
    try {
      const response = await fetch(`/api/platform/sports/apl/participants/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success("Participant deleted successfully");
        fetchData();
      } else {
        toast.error("Failed to delete participant");
      }
    } catch {
      toast.error("Error deleting participant");
    }
  };

  // Form reset functions
  const resetMatchForm = () => {
    setMatchForm({
      team_a: '',
      team_b: '',
      status: 'upcoming',
      team_a_score: 0,
      team_b_score: 0,
      start_time: '',
      period: 'not_started',
      round: 'group_stage',
      match_number: '',
      goal_events: [],
      card_events: [],
      save_events: [],
      substitution_events: []
    });
  };

  const resetTeamForm = () => {
    setTeamForm({
      name: '',
      group: 'A',
      logo: null
    });
  };

  const resetParticipantForm = () => {
    setParticipantForm({
      name: '',
      team: '',
      isCM: false,
      sold_at: 0,
      tier: 'tier1',
      goals: 0,
      assists: 0,
      clean_sheets: 0
    });
  };

  // Edit functions
  const editMatch = (match: any) => {
    const attrs = match.attributes || {};
    setMatchForm({
      team_a: attrs.team_a?.data?.id?.toString() || '',
      team_b: attrs.team_b?.data?.id?.toString() || '',
      status: attrs.status || 'upcoming',
      team_a_score: attrs.team_a_score || 0,
      team_b_score: attrs.team_b_score || 0,
      start_time: attrs.start_time ? new Date(attrs.start_time).toISOString().slice(0, 16) : '',
      period: attrs.period || 'not_started',
      round: attrs.round || 'group_stage',
      match_number: attrs.match_number?.toString() || '',
      goal_events: (attrs.goal_events?.data || []).map((event: any) => {
        const eventAttrs = event.attributes || {};
        return {
          scorer: eventAttrs.scorer?.data?.id?.toString() || '',
          assister: eventAttrs.assister?.data?.id?.toString() || '',
          minute: eventAttrs.minute || 1,
          is_penalty: eventAttrs.is_penalty || false,
          is_own_goal: eventAttrs.is_own_goal || false,
          team: eventAttrs.team || 'team_a'
        };
      }),
      card_events: (attrs.card_events?.data || []).map((event: any) => {
        const eventAttrs = event.attributes || {};
        return {
          player: eventAttrs.player?.data?.id?.toString() || '',
          minute: eventAttrs.minute || 1,
          card_type: eventAttrs.card_type || 'yellow',
          team: eventAttrs.team || 'team_a'
        };
      }),
      save_events: (attrs.save_events?.data || []).map((event: any) => {
        const eventAttrs = event.attributes || {};
        return {
          goalkeeper: eventAttrs.goalkeeper?.data?.id?.toString() || '',
          minute: eventAttrs.minute || 1,
          saves: eventAttrs.saves || 1,
          team: eventAttrs.team || 'team_a'
        };
      }),
      substitution_events: (attrs.substitution_events?.data || []).map((event: any) => {
        const eventAttrs = event.attributes || {};
        return {
          player_off: eventAttrs.player_off?.data?.id?.toString() || '',
          player_on: eventAttrs.player_on?.data?.id?.toString() || '',
          minute: eventAttrs.minute || 1,
          team: eventAttrs.team || 'team_a'
        };
      })
    });
    setEditingItem(match);
    setMatchDialogOpen(true);
  };

  const editTeam = (team: any) => {
    const attrs = team.attributes || {};
    setTeamForm({
      name: attrs.name || '',
      group: attrs.group || 'A',
      logo: null
    });
    setEditingItem(team);
    setTeamDialogOpen(true);
  };

  const editParticipant = (participant: any) => {
    const attrs = participant.attributes || {};
    setParticipantForm({
      name: attrs.name || '',
      team: attrs.team?.data?.id?.toString() || '',
      isCM: attrs.isCM || false,
      sold_at: attrs.sold_at || 0,
      tier: attrs.tier || 'tier1',
      goals: attrs.goals || 0,
      assists: attrs.assists || 0,
      clean_sheets: attrs.clean_sheets || 0
    });
    setEditingItem(participant);
    setParticipantDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <Badge className="bg-red-500">Live</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">APL Admin Panel</h1>
          <p className="text-muted-foreground">Manage Ashoka Premier League data</p>
        </div>
        <div className="flex gap-2">
          <Link href="/platform/sports/apl">
            <Button variant="outline">
              <Trophy className="w-4 h-4 mr-2" />
              View League
            </Button>
          </Link>
          <Link href="/platform/sports/apl/matches">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              View Matches
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="matches">
            <Calendar className="w-4 h-4 mr-2" />
            Matches ({matches.length})
          </TabsTrigger>
          <TabsTrigger value="teams">
            <Trophy className="w-4 h-4 mr-2" />
            Teams ({teams.length})
          </TabsTrigger>
          <TabsTrigger value="participants">
            <Users className="w-4 h-4 mr-2" />
            Players ({participants.length})
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* Matches Tab */}
        <TabsContent value="matches" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Match Management</CardTitle>
                <Dialog open={matchDialogOpen} onOpenChange={setMatchDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingItem(null); resetMatchForm(); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Match
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Edit Match' : 'Create New Match'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="team_a">Team A</Label>
                        <Select value={matchForm.team_a} onValueChange={(value) => setMatchForm({...matchForm, team_a: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Team A" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map(team => (
                              <SelectItem key={team.id} value={team.id.toString()}>
                                {team.attributes?.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="team_b">Team B</Label>
                        <Select value={matchForm.team_b} onValueChange={(value) => setMatchForm({...matchForm, team_b: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Team B" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map(team => (
                              <SelectItem key={team.id} value={team.id.toString()}>
                                {team.attributes?.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={matchForm.status} onValueChange={(value) => setMatchForm({...matchForm, status: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="live">Live</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="round">Round</Label>
                        <Select value={matchForm.round} onValueChange={(value) => setMatchForm({...matchForm, round: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="group_stage">Group Stage</SelectItem>
                            <SelectItem value="round_of_16">Round of 16</SelectItem>
                            <SelectItem value="quarter_final">Quarter Final</SelectItem>
                            <SelectItem value="semi_final">Semi Final</SelectItem>
                            <SelectItem value="final">Final</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="match_number">Match Number</Label>
                        <Input
                          id="match_number"
                          type="number"
                          value={matchForm.match_number}
                          onChange={(e) => setMatchForm({...matchForm, match_number: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                          id="start_time"
                          type="datetime-local"
                          value={matchForm.start_time}
                          onChange={(e) => setMatchForm({...matchForm, start_time: e.target.value})}
                        />
                      </div>
                      {matchForm.status === 'live' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="period">Period</Label>
                            <Select value={matchForm.period} onValueChange={(value) => setMatchForm({...matchForm, period: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="first_half">1st Half</SelectItem>
                                <SelectItem value="half_time">Half Time</SelectItem>
                                <SelectItem value="second_half">2nd Half</SelectItem>
                                <SelectItem value="extra_time_first">Extra Time 1st</SelectItem>
                                <SelectItem value="extra_time_second">Extra Time 2nd</SelectItem>
                                <SelectItem value="penalty_shootout">Penalties</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="team_a_score">Team A Score</Label>
                            <Input
                              id="team_a_score"
                              type="number"
                              value={matchForm.team_a_score}
                              onChange={(e) => setMatchForm({...matchForm, team_a_score: parseInt(e.target.value) || 0})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="team_b_score">Team B Score</Label>
                            <Input
                              id="team_b_score"
                              type="number"
                              value={matchForm.team_b_score}
                              onChange={(e) => setMatchForm({...matchForm, team_b_score: parseInt(e.target.value) || 0})}
                            />
                          </div>
                        </>
                      )}

                      <div className="col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Goal Events</h3>
                          <Button size="sm" variant="outline" onClick={() => setMatchForm({
                            ...matchForm,
                            goal_events: [...(matchForm.goal_events || []), createEmptyGoalEvent()]
                          })}>
                            Add Goal
                          </Button>
                        </div>
                        {matchForm.goal_events.length === 0 && (
                          <p className="text-sm text-muted-foreground">No goal events recorded.</p>
                        )}
                        <div className="space-y-3">
                          {(matchForm.goal_events || []).map((event: any, idx: number) => (
                            <div key={`goal-${idx}`} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 border rounded-lg">
                              <div className="space-y-2">
                                <Label>Team</Label>
                                <Select value={event.team} onValueChange={(value) => {
                                  const nextGoals = [...matchForm.goal_events];
                                  nextGoals[idx] = { ...nextGoals[idx], team: value };
                                  setMatchForm({ ...matchForm, goal_events: nextGoals });
                                }}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="team_a">Team A</SelectItem>
                                    <SelectItem value="team_b">Team B</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Minute</Label>
                                <Input
                                  type="number"
                                  value={event.minute}
                                  onChange={(e) => {
                                    const nextGoals = [...matchForm.goal_events];
                                    nextGoals[idx] = { ...nextGoals[idx], minute: parseInt(e.target.value) || 1 };
                                    setMatchForm({ ...matchForm, goal_events: nextGoals });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Scorer</Label>
                                <Select value={event.scorer} onValueChange={(value) => {
                                  const nextGoals = [...matchForm.goal_events];
                                  nextGoals[idx] = { ...nextGoals[idx], scorer: value };
                                  setMatchForm({ ...matchForm, goal_events: nextGoals });
                                }}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select scorer" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {participants.map(player => (
                                      <SelectItem key={player.id} value={player.id.toString()}>
                                        {player.attributes?.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Assist</Label>
                                <Select value={event.assister} onValueChange={(value) => {
                                  const nextGoals = [...matchForm.goal_events];
                                  nextGoals[idx] = { ...nextGoals[idx], assister: value };
                                  setMatchForm({ ...matchForm, goal_events: nextGoals });
                                }}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select assist" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {participants.map(player => (
                                      <SelectItem key={player.id} value={player.id.toString()}>
                                        {player.attributes?.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Flags</Label>
                                <div className="grid grid-cols-2 gap-2">
                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={event.is_penalty}
                                      onChange={(e) => {
                                        const nextGoals = [...matchForm.goal_events];
                                        nextGoals[idx] = { ...nextGoals[idx], is_penalty: e.target.checked };
                                        setMatchForm({ ...matchForm, goal_events: nextGoals });
                                      }}
                                    />
                                    Penalty
                                  </label>
                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={event.is_own_goal}
                                      onChange={(e) => {
                                        const nextGoals = [...matchForm.goal_events];
                                        nextGoals[idx] = { ...nextGoals[idx], is_own_goal: e.target.checked };
                                        setMatchForm({ ...matchForm, goal_events: nextGoals });
                                      }}
                                    />
                                    Own Goal
                                  </label>
                                </div>
                              </div>
                              <div className="flex items-end justify-end">
                                <Button size="sm" variant="ghost" onClick={() => {
                                  const nextGoals = matchForm.goal_events.filter((_: any, i: number) => i !== idx);
                                  setMatchForm({ ...matchForm, goal_events: nextGoals });
                                }}>
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Card Events</h3>
                          <Button size="sm" variant="outline" onClick={() => setMatchForm({
                            ...matchForm,
                            card_events: [...(matchForm.card_events || []), createEmptyCardEvent()]
                          })}>
                            Add Card
                          </Button>
                        </div>
                        {matchForm.card_events.length === 0 && (
                          <p className="text-sm text-muted-foreground">No card events recorded.</p>
                        )}
                        <div className="space-y-3">
                          {(matchForm.card_events || []).map((event: any, idx: number) => (
                            <div key={`card-${idx}`} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 border rounded-lg">
                              <div className="space-y-2">
                                <Label>Team</Label>
                                <Select value={event.team} onValueChange={(value) => {
                                  const nextCards = [...matchForm.card_events];
                                  nextCards[idx] = { ...nextCards[idx], team: value };
                                  setMatchForm({ ...matchForm, card_events: nextCards });
                                }}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="team_a">Team A</SelectItem>
                                    <SelectItem value="team_b">Team B</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Minute</Label>
                                <Input
                                  type="number"
                                  value={event.minute}
                                  onChange={(e) => {
                                    const nextCards = [...matchForm.card_events];
                                    nextCards[idx] = { ...nextCards[idx], minute: parseInt(e.target.value) || 1 };
                                    setMatchForm({ ...matchForm, card_events: nextCards });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Player</Label>
                                <Select value={event.player} onValueChange={(value) => {
                                  const nextCards = [...matchForm.card_events];
                                  nextCards[idx] = { ...nextCards[idx], player: value };
                                  setMatchForm({ ...matchForm, card_events: nextCards });
                                }}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select player" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {participants.map(player => (
                                      <SelectItem key={player.id} value={player.id.toString()}>
                                        {player.attributes?.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Card Type</Label>
                                <Select value={event.card_type} onValueChange={(value) => {
                                  const nextCards = [...matchForm.card_events];
                                  nextCards[idx] = { ...nextCards[idx], card_type: value };
                                  setMatchForm({ ...matchForm, card_events: nextCards });
                                }}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="yellow">Yellow</SelectItem>
                                    <SelectItem value="red">Red</SelectItem>
                                    <SelectItem value="yellow_red">Yellow + Red</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-end justify-end">
                                <Button size="sm" variant="ghost" onClick={() => {
                                  const nextCards = matchForm.card_events.filter((_: any, i: number) => i !== idx);
                                  setMatchForm({ ...matchForm, card_events: nextCards });
                                }}>
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Goalkeeper Saves</h3>
                          <Button size="sm" variant="outline" onClick={() => setMatchForm({
                            ...matchForm,
                            save_events: [...(matchForm.save_events || []), createEmptySaveEvent()]
                          })}>
                            Add Save
                          </Button>
                        </div>
                        {matchForm.save_events.length === 0 && (
                          <p className="text-sm text-muted-foreground">No goalkeeper saves recorded.</p>
                        )}
                        <div className="space-y-3">
                          {(matchForm.save_events || []).map((event: any, idx: number) => (
                            <div key={`save-${idx}`} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 border rounded-lg">
                              <div className="space-y-2">
                                <Label>Team</Label>
                                <Select value={event.team} onValueChange={(value) => {
                                  const nextSaves = [...matchForm.save_events];
                                  nextSaves[idx] = { ...nextSaves[idx], team: value };
                                  setMatchForm({ ...matchForm, save_events: nextSaves });
                                }}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="team_a">Team A</SelectItem>
                                    <SelectItem value="team_b">Team B</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Minute</Label>
                                <Input
                                  type="number"
                                  value={event.minute}
                                  onChange={(e) => {
                                    const nextSaves = [...matchForm.save_events];
                                    nextSaves[idx] = { ...nextSaves[idx], minute: parseInt(e.target.value) || 1 };
                                    setMatchForm({ ...matchForm, save_events: nextSaves });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Goalkeeper</Label>
                                <Select value={event.goalkeeper} onValueChange={(value) => {
                                  const nextSaves = [...matchForm.save_events];
                                  nextSaves[idx] = { ...nextSaves[idx], goalkeeper: value };
                                  setMatchForm({ ...matchForm, save_events: nextSaves });
                                }}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select goalkeeper" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {participants.map(player => (
                                      <SelectItem key={player.id} value={player.id.toString()}>
                                        {player.attributes?.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Saves</Label>
                                <Input
                                  type="number"
                                  value={event.saves}
                                  onChange={(e) => {
                                    const nextSaves = [...matchForm.save_events];
                                    nextSaves[idx] = { ...nextSaves[idx], saves: parseInt(e.target.value) || 0 };
                                    setMatchForm({ ...matchForm, save_events: nextSaves });
                                  }}
                                />
                              </div>
                              <div className="flex items-end justify-end">
                                <Button size="sm" variant="ghost" onClick={() => {
                                  const nextSaves = matchForm.save_events.filter((_: any, i: number) => i !== idx);
                                  setMatchForm({ ...matchForm, save_events: nextSaves });
                                }}>
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Substitution Events</h3>
                          <Button size="sm" variant="outline" onClick={() => setMatchForm({
                            ...matchForm,
                            substitution_events: [...(matchForm.substitution_events || []), createEmptySubstitutionEvent()]
                          })}>
                            Add Substitution
                          </Button>
                        </div>
                        {matchForm.substitution_events.length === 0 && (
                          <p className="text-sm text-muted-foreground">No substitutions recorded.</p>
                        )}
                        <div className="space-y-3">
                          {(matchForm.substitution_events || []).map((event: any, idx: number) => (
                            <div key={`sub-${idx}`} className="grid grid-cols-1 md:grid-cols-6 gap-2 p-3 border rounded-lg">
                              <div className="space-y-2">
                                <Label>Team</Label>
                                <Select value={event.team} onValueChange={(value) => {
                                  const nextSubs = [...matchForm.substitution_events];
                                  nextSubs[idx] = { ...nextSubs[idx], team: value };
                                  setMatchForm({ ...matchForm, substitution_events: nextSubs });
                                }}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="team_a">Team A</SelectItem>
                                    <SelectItem value="team_b">Team B</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Minute</Label>
                                <Input
                                  type="number"
                                  value={event.minute}
                                  onChange={(e) => {
                                    const nextSubs = [...matchForm.substitution_events];
                                    nextSubs[idx] = { ...nextSubs[idx], minute: parseInt(e.target.value) || 1 };
                                    setMatchForm({ ...matchForm, substitution_events: nextSubs });
                                  }}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Player Off</Label>
                                <Select value={event.player_off} onValueChange={(value) => {
                                  const nextSubs = [...matchForm.substitution_events];
                                  nextSubs[idx] = { ...nextSubs[idx], player_off: value };
                                  setMatchForm({ ...matchForm, substitution_events: nextSubs });
                                }}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Off" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {participants.map(player => (
                                      <SelectItem key={player.id} value={player.id.toString()}>
                                        {player.attributes?.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Player On</Label>
                                <Select value={event.player_on} onValueChange={(value) => {
                                  const nextSubs = [...matchForm.substitution_events];
                                  nextSubs[idx] = { ...nextSubs[idx], player_on: value };
                                  setMatchForm({ ...matchForm, substitution_events: nextSubs });
                                }}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="On" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {participants.map(player => (
                                      <SelectItem key={player.id} value={player.id.toString()}>
                                        {player.attributes?.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-end justify-end">
                                <Button size="sm" variant="ghost" onClick={() => {
                                  const nextSubs = matchForm.substitution_events.filter((_: any, i: number) => i !== idx);
                                  setMatchForm({ ...matchForm, substitution_events: nextSubs });
                                }}>
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setMatchDialogOpen(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={editingItem ? handleUpdateMatch : handleCreateMatch}>
                        <Save className="w-4 h-4 mr-2" />
                        {editingItem ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Match #</TableHead>
                      <TableHead>Teams</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Round</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.map((match) => {
                      const attrs = match.attributes || {};
                      const teamA = teamMap[attrs.team_a?.data?.id];
                      const teamB = teamMap[attrs.team_b?.data?.id];

                      return (
                        <TableRow key={match.id}>
                          <TableCell>{attrs.match_number || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{teamA?.attributes?.name || 'TBD'}</span>
                              <span className="text-muted-foreground">vs</span>
                              <span>{teamB?.attributes?.name || 'TBD'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(attrs.status)}</TableCell>
                          <TableCell>{attrs.round?.replace('_', ' ')}</TableCell>
                          <TableCell>
                            {attrs.status === 'completed' || attrs.status === 'live' ?
                              `${attrs.team_a_score || 0} - ${attrs.team_b_score || 0}` :
                              '-'
                            }
                          </TableCell>
                          <TableCell>
                            {attrs.start_time ? new Date(attrs.start_time).toLocaleString() : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => editMatch(match)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                if (window.confirm('Are you sure you want to delete this match? This action cannot be undone.')) {
                                  handleDeleteMatch(match.id);
                                }
                              }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teams Tab */}
        <TabsContent value="teams" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Team Management</CardTitle>
                <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingItem(null); resetTeamForm(); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Team
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Edit Team' : 'Create New Team'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="team_name">Team Name</Label>
                        <Input
                          id="team_name"
                          value={teamForm.name}
                          onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                          placeholder="Enter team name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="group">Group</Label>
                        <Select value={teamForm.group} onValueChange={(value) => setTeamForm({...teamForm, group: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">Group A</SelectItem>
                            <SelectItem value="B">Group B</SelectItem>
                            <SelectItem value="C">Group C</SelectItem>
                            <SelectItem value="D">Group D</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="logo">Team Logo</Label>
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setTeamForm({...teamForm, logo: e.target.files?.[0] || null})}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setTeamDialogOpen(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={editingItem ? handleUpdateTeam : handleCreateTeam}>
                        <Save className="w-4 h-4 mr-2" />
                        {editingItem ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Logo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Players</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.map((team) => {
                      const attrs = team.attributes || {};
                      const teamParticipants = participants.filter(p => p.attributes?.team?.data?.id === team.id);

                      return (
                        <TableRow key={team.id}>
                          <TableCell>
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center overflow-hidden">
                              {attrs.logo ? (
                                <Image
                                  src={getStrapiMediaUrl(attrs.logo)!}
                                  alt={attrs.name}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-4 h-4 bg-muted-foreground/20 rounded" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{attrs.name}</TableCell>
                          <TableCell>Group {attrs.group}</TableCell>
                          <TableCell>{teamParticipants.length} players</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>W: {attrs.matches_won || 0}</div>
                              <div>L: {attrs.matches_lost || 0}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => editTeam(team)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                if (window.confirm('Are you sure you want to delete this team? This will also remove all associated matches and participants.')) {
                                  handleDeleteTeam(team.id);
                                }
                              }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Player Management</CardTitle>
                <Dialog open={participantDialogOpen} onOpenChange={setParticipantDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingItem(null); resetParticipantForm(); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Player
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Edit Player' : 'Create New Player'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="player_name">Player Name</Label>
                        <Input
                          id="player_name"
                          value={participantForm.name}
                          onChange={(e) => setParticipantForm({...participantForm, name: e.target.value})}
                          placeholder="Enter player name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="team">Team</Label>
                        <Select value={participantForm.team} onValueChange={(value) => setParticipantForm({...participantForm, team: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map(team => (
                              <SelectItem key={team.id} value={team.id.toString()}>
                                {team.attributes?.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tier">Tier</Label>
                          <Select value={participantForm.tier} onValueChange={(value) => setParticipantForm({...participantForm, tier: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tier1">Tier 1</SelectItem>
                              <SelectItem value="tier2">Tier 2</SelectItem>
                              <SelectItem value="tier3">Tier 3</SelectItem>
                              <SelectItem value="tier4">Tier 4</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sold_at">Auction Price (₹)</Label>
                          <Input
                            id="sold_at"
                            type="number"
                            value={participantForm.sold_at}
                            onChange={(e) => setParticipantForm({...participantForm, sold_at: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="goals">Goals</Label>
                          <Input
                            id="goals"
                            type="number"
                            value={participantForm.goals}
                            onChange={(e) => setParticipantForm({...participantForm, goals: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="assists">Assists</Label>
                          <Input
                            id="assists"
                            type="number"
                            value={participantForm.assists}
                            onChange={(e) => setParticipantForm({...participantForm, assists: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="clean_sheets">Clean Sheets</Label>
                          <Input
                            id="clean_sheets"
                            type="number"
                            value={participantForm.clean_sheets}
                            onChange={(e) => setParticipantForm({...participantForm, clean_sheets: parseInt(e.target.value) || 0})}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isCM"
                          checked={participantForm.isCM}
                          onChange={(e) => setParticipantForm({...participantForm, isCM: e.target.checked})}
                        />
                        <Label htmlFor="isCM">Captain / Marquee Player</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setParticipantDialogOpen(false)}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={editingItem ? handleUpdateParticipant : handleCreateParticipant}>
                        <Save className="w-4 h-4 mr-2" />
                        {editingItem ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Goals</TableHead>
                      <TableHead>Assists</TableHead>
                      <TableHead>Clean Sheets</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {participants.map((participant) => {
                      const attrs = participant.attributes || {};
                      const playerTeam = teamMap[attrs.team?.data?.id];

                      return (
                        <TableRow key={participant.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{attrs.name}</span>
                              {attrs.isCM && <Badge variant="secondary" className="text-xs">CM</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>{playerTeam?.attributes?.name || 'No Team'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{attrs.tier?.replace('tier', 'Tier ')}</Badge>
                          </TableCell>
                          <TableCell>₹{attrs.sold_at || 0}M</TableCell>
                          <TableCell>{attrs.goals || 0}</TableCell>
                          <TableCell>{attrs.assists || 0}</TableCell>
                          <TableCell>{attrs.clean_sheets || 0}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => editParticipant(participant)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                if (window.confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
                                  handleDeleteParticipant(participant.id);
                                }
                              }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{matches.length}</div>
                <p className="text-xs text-muted-foreground">
                  {matches.filter(m => m.attributes?.status === 'completed').length} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teams.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across {new Set(teams.map(t => t.attributes?.group)).size} groups
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Players</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{participants.length}</div>
                <p className="text-xs text-muted-foreground">
                  {participants.filter(p => p.attributes?.isCM).length} marquee players
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {participants.reduce((sum, p) => sum + (p.attributes?.goals || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Scored in league
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Scorers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {participants
                    .filter(p => p.attributes?.goals > 0)
                    .sort((a, b) => (b.attributes?.goals || 0) - (a.attributes?.goals || 0))
                    .slice(0, 5)
                    .map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="font-semibold">{player.attributes?.name}</span>
                        </div>
                        <Badge>{player.attributes?.goals} goals</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Assist Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {participants
                    .filter(p => p.attributes?.assists > 0)
                    .sort((a, b) => (b.attributes?.assists || 0) - (a.attributes?.assists || 0))
                    .slice(0, 5)
                    .map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="font-semibold">{player.attributes?.name}</span>
                        </div>
                        <Badge>{player.attributes?.assists} assists</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

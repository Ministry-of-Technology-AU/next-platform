"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
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
import { Plus, Edit, Trash2, Trophy, Calendar, BarChart3, Save, X, Play, Pause, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { formatISTDateTimeDisplay, formatISTDateTimeForInput } from '@/lib/date-utils';
import DeveloperCredits from '@/components/developer-credits';

export default function APLAdminPage() {
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Live minute tracking for event entry
  const [clockRunning, setClockRunning] = useState(false);
  const [clockBaseMinute, setClockBaseMinute] = useState(1);
  const [clockElapsedSeconds, setClockElapsedSeconds] = useState(0);
  const [halftimeCarryMinute, setHalftimeCarryMinute] = useState<number | null>(null);

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

  const fetchData = async () => {
    try {
      const [matchesRes, teamsRes, participantsRes] = await Promise.all([
        fetch('/api/platform/sports/apl/matches?populate=*', { cache: 'no-store' }),
        fetch('/api/platform/sports/apl/teams?populate=*', { cache: 'no-store' }),
        fetch('/api/platform/sports/apl/participants?populate=*&limit=1000', { cache: 'no-store' })
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

  useEffect(() => {
    if (!clockRunning) return;

    const intervalId = window.setInterval(() => {
      setClockElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [clockRunning]);

  useEffect(() => {
    if (matchForm.status !== 'live') {
      setClockRunning(false);
    }
  }, [matchForm.status]);

  const teamMap = useMemo(() => {
    const map: Record<number, any> = {};
    teams.forEach(team => {
      map[team.id] = team;
    });
    return map;
  }, [teams]);

  const extractRelationId = (relation: any): string => {
    if (!relation) return '';

    const candidate = relation?.data?.id ?? relation?.id ?? relation?.documentId ?? relation;
    return typeof candidate === 'string' || typeof candidate === 'number' ? candidate.toString() : '';
  };

  const getParticipantTeamId = (participant: any): string => {
    const attrs = participant?.attributes || participant || {};
    return extractRelationId(attrs?.team);
  };

  const getTeamNameById = (teamId: string, fallback: string) => {
    const parsedId = parseInt(teamId, 10);
    if (Number.isNaN(parsedId)) return fallback;
    return teamMap[parsedId]?.attributes?.name || fallback;
  };

  const hasInvalidTeamSelection = Boolean(matchForm.team_a && matchForm.team_b && matchForm.team_a === matchForm.team_b);

  const validateTeamSelection = () => {
    if (!hasInvalidTeamSelection) return true;

    toast.error('Team A and Team B must be different teams');
    return false;
  };

  const teamAName = getTeamNameById(matchForm.team_a, 'Team A');
  const teamBName = getTeamNameById(matchForm.team_b, 'Team B');

  const teamAPlayers = useMemo(() => {
    if (!matchForm.team_a) return [];
    return participants.filter((player) => getParticipantTeamId(player) === matchForm.team_a);
  }, [participants, matchForm.team_a]);

  const teamBPlayers = useMemo(() => {
    if (!matchForm.team_b) return [];
    return participants.filter((player) => getParticipantTeamId(player) === matchForm.team_b);
  }, [participants, matchForm.team_b]);

  const normalizeComponentCollection = (value: any): any[] => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.data)) return value.data;
    return [];
  };

  const getPlayersForEventTeam = (eventTeam: string) => {
    if (eventTeam === 'team_b') return teamBPlayers;
    return teamAPlayers;
  };

  const sanitizeEventPlayerFields = (event: any, nextTeam: string, playerFields: string[]) => {
    const allowedPlayerIds = new Set(
      getPlayersForEventTeam(nextTeam).map((player: any) => player.id.toString())
    );
    const updatedEvent = { ...event, team: nextTeam };

    playerFields.forEach((field) => {
      const value = updatedEvent[field];
      if (value && !allowedPlayerIds.has(value.toString())) {
        updatedEvent[field] = '';
      }
    });

    return updatedEvent;
  };

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

  const currentSuggestedMinute = useMemo(
    () => Math.max(1, clockBaseMinute + Math.floor(clockElapsedSeconds / 60)),
    [clockBaseMinute, clockElapsedSeconds]
  );

  const getClockStateLabel = () => {
    if (clockRunning) return 'Running';
    if (clockElapsedSeconds > 0 || clockBaseMinute > 1) return 'Paused';
    return 'Not started';
  };

  const startClock = () => {
    setClockBaseMinute(1);
    setClockElapsedSeconds(0);
    setHalftimeCarryMinute(null);
    setClockRunning(true);
  };

  const pauseClock = () => setClockRunning(false);

  const resumeClock = () => setClockRunning(true);

  const resetClock = () => {
    setClockRunning(false);
    setClockBaseMinute(1);
    setClockElapsedSeconds(0);
    setHalftimeCarryMinute(null);
  };

  const applyCurrentMinuteToEvent = (eventCollection: string, index: number) => {
    setMatchForm((prev: any) => {
      const nextEvents = [...(prev[eventCollection] || [])];
      nextEvents[index] = { ...nextEvents[index], minute: currentSuggestedMinute };
      return { ...prev, [eventCollection]: nextEvents };
    });
  };

  const handlePeriodChange = (nextPeriod: string) => {
    const previousPeriod = matchForm.period;
    const minuteAtSwitch = currentSuggestedMinute;

    setMatchForm((prev: any) => ({ ...prev, period: nextPeriod }));

    if (nextPeriod === 'half_time') {
      setHalftimeCarryMinute(minuteAtSwitch);
      setClockRunning(false);
      return;
    }

    if (previousPeriod === 'half_time' && nextPeriod === 'second_half') {
      const resumeFromMinute = Math.max(1, (halftimeCarryMinute ?? minuteAtSwitch) + 1);
      setClockBaseMinute(resumeFromMinute);
      setClockElapsedSeconds(0);
      setClockRunning(true);
      return;
    }

    if (nextPeriod === 'not_started') {
      resetClock();
    }
  };

  const getMaxEventMinute = (form: any) => {
    const eventCollections = [
      ...(form.goal_events || []),
      ...(form.card_events || []),
      ...(form.save_events || []),
      ...(form.substitution_events || []),
    ];

    return eventCollections.reduce((maxMinute: number, event: any) => {
      const value = parseInt(event?.minute?.toString() || '', 10);
      if (Number.isNaN(value)) return maxMinute;
      return Math.max(maxMinute, value);
    }, 1);
  };

  const getDerivedMatchScores = (goalEvents: any[] = []) => ({
    team_a_score: goalEvents.filter((event: any) => event?.team === 'team_a').length,
    team_b_score: goalEvents.filter((event: any) => event?.team === 'team_b').length,
  });

  const toInteger = (value: any, fallback = 0) => {
    const parsed = parseInt(value?.toString() || '', 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  const normalizeMinute = (value: any, fallback = 1) => Math.max(1, toInteger(value, fallback));

  const prepareMatchPayload = (form: any) => {
    const goal_events = (form.goal_events || []).map((event: any) => ({
      team: event.team,
      minute: normalizeMinute(event.minute, 1),
      is_penalty: event.is_penalty,
      is_own_goal: event.is_own_goal,
      ...(event.scorer ? { scorer: { id: parseInt(event.scorer) } } : {}),
      ...(event.assister ? { assister: { id: parseInt(event.assister) } } : {})
    }));

    const card_events = (form.card_events || []).map((event: any) => ({
      team: event.team,
      minute: normalizeMinute(event.minute, 1),
      card_type: event.card_type,
      ...(event.player ? { player: { id: parseInt(event.player) } } : {})
    }));

    const save_events = (form.save_events || []).map((event: any) => ({
      team: event.team,
      minute: normalizeMinute(event.minute, 1),
      saves: toInteger(event.saves, 0),
      ...(event.goalkeeper ? { goalkeeper: { id: parseInt(event.goalkeeper) } } : {})
    }));

    const substitution_events = (form.substitution_events || []).map((event: any) => ({
      team: event.team,
      minute: normalizeMinute(event.minute, 1),
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
    if (!validateTeamSelection()) return;

    try {
      const response = await fetch('/api/platform/sports/apl/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            ...matchForm,
            ...prepareMatchPayload(matchForm),
            ...getDerivedMatchScores(matchForm.goal_events || []),
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
    if (!validateTeamSelection()) return;

    try {
      const response = await fetch(`/api/platform/sports/apl/matches/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            ...matchForm,
            ...prepareMatchPayload(matchForm),
            ...getDerivedMatchScores(matchForm.goal_events || []),
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
    resetClock();
  };

  // Edit functions
  const editMatch = async (match: any) => {
    try {
      const response = await fetch(`/api/platform/sports/apl/matches/${match.id}`, { cache: 'no-store' });
      if (!response.ok) {
        toast.error('Failed to load match for editing');
        return;
      }

      const data = await response.json();
      const record = data?.data || data || match;
      const attrs = record.attributes || record || {};

      const goalEvents = normalizeComponentCollection(attrs.goal_events).map((event: any) => {
        const eventAttrs = event?.attributes || event || {};
        return {
          scorer: extractRelationId(eventAttrs.scorer),
          assister: extractRelationId(eventAttrs.assister),
          minute: eventAttrs.minute || 1,
          is_penalty: eventAttrs.is_penalty || false,
          is_own_goal: eventAttrs.is_own_goal || false,
          team: eventAttrs.team || 'team_a'
        };
      });

      const cardEvents = normalizeComponentCollection(attrs.card_events).map((event: any) => {
        const eventAttrs = event?.attributes || event || {};
        return {
          player: extractRelationId(eventAttrs.player),
          minute: eventAttrs.minute || 1,
          card_type: eventAttrs.card_type || 'yellow',
          team: eventAttrs.team || 'team_a'
        };
      });

      const saveEvents = normalizeComponentCollection(attrs.save_events).map((event: any) => {
        const eventAttrs = event?.attributes || event || {};
        return {
          goalkeeper: extractRelationId(eventAttrs.goalkeeper),
          minute: eventAttrs.minute || 1,
          saves: eventAttrs.saves || 1,
          team: eventAttrs.team || 'team_a'
        };
      });

      const substitutionEvents = normalizeComponentCollection(attrs.substitution_events).map((event: any) => {
        const eventAttrs = event?.attributes || event || {};
        return {
          player_off: extractRelationId(eventAttrs.player_off),
          player_on: extractRelationId(eventAttrs.player_on),
          minute: eventAttrs.minute || 1,
          team: eventAttrs.team || 'team_a'
        };
      });

      setMatchForm({
        team_a: extractRelationId(attrs.team_a),
        team_b: extractRelationId(attrs.team_b),
        status: attrs.status || 'upcoming',
        team_a_score: attrs.team_a_score || 0,
        team_b_score: attrs.team_b_score || 0,
        start_time: formatISTDateTimeForInput(attrs.start_time),
        period: attrs.period || 'not_started',
        round: attrs.round || 'group_stage',
        match_number: attrs.match_number?.toString() || '',
        goal_events: goalEvents,
        card_events: cardEvents,
        save_events: saveEvents,
        substitution_events: substitutionEvents
      });

      const maxExistingMinute = getMaxEventMinute({
        goal_events: goalEvents,
        card_events: cardEvents,
        save_events: saveEvents,
        substitution_events: substitutionEvents,
      });
      setClockBaseMinute(maxExistingMinute);
      setClockElapsedSeconds(0);
      setHalftimeCarryMinute(attrs.period === 'half_time' ? maxExistingMinute : null);
      setClockRunning(false);

      setEditingItem(record);
      setMatchDialogOpen(true);
    } catch (error) {
      console.error('Error loading match for editing:', error);
      toast.error('Error loading match for editing');
    }
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

  const derivedScores = useMemo(
    () => getDerivedMatchScores(matchForm.goal_events || []),
    [matchForm.goal_events]
  );

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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="matches">
            <Calendar className="w-4 h-4 mr-2" />
            Matches ({matches.length})
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
                              <SelectItem
                                key={team.id}
                                value={team.id.toString()}
                                disabled={team.id.toString() === matchForm.team_b}
                              >
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
                              <SelectItem
                                key={team.id}
                                value={team.id.toString()}
                                disabled={team.id.toString() === matchForm.team_a}
                              >
                                {team.attributes?.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {hasInvalidTeamSelection && (
                          <p className="text-sm text-destructive">Team A and Team B must be different.</p>
                        )}
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
                        <div className="space-y-2">
                          <Label htmlFor="period">Period</Label>
                          <Select value={matchForm.period} onValueChange={handlePeriodChange}>
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
                      )}
                      {(matchForm.status === 'live' || matchForm.status === 'completed') && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="team_a_score">Team A Score</Label>
                            <div
                              id="team_a_score"
                              className="h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                            >
                              {derivedScores.team_a_score}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="team_b_score">Team B Score</Label>
                            <div
                              id="team_b_score"
                              className="h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                            >
                              {derivedScores.team_b_score}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="col-span-2 space-y-6">
                        {matchForm.status === 'live' && (
                          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <h3 className="text-lg font-semibold">Match Clock</h3>
                                <p className="text-sm text-muted-foreground">Suggested event minute updates from this clock.</p>
                              </div>
                              <Badge variant={clockRunning ? 'default' : 'outline'}>{getClockStateLabel()}</Badge>
                            </div>
                            <div className="text-2xl font-semibold">{currentSuggestedMinute}'</div>
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" variant="default" onClick={startClock} disabled={clockRunning}>
                                <Play className="w-4 h-4 mr-2" />
                                Start
                              </Button>
                              <Button size="sm" variant="outline" onClick={pauseClock} disabled={!clockRunning}>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                              </Button>
                              <Button size="sm" variant="outline" onClick={resumeClock} disabled={clockRunning}>
                                <Play className="w-4 h-4 mr-2" />
                                Resume
                              </Button>
                              <Button size="sm" variant="ghost" onClick={resetClock}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Goal Events</h3>
                          <Button size="sm" variant="outline" onClick={() => setMatchForm({
                            ...matchForm,
                            goal_events: [...(matchForm.goal_events || []), { ...createEmptyGoalEvent(), minute: currentSuggestedMinute }]
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
                                  nextGoals[idx] = sanitizeEventPlayerFields(nextGoals[idx], value, ['scorer', 'assister']);
                                  setMatchForm({ ...matchForm, goal_events: nextGoals });
                                }}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="team_a">{teamAName}</SelectItem>
                                    <SelectItem value="team_b">{teamBName}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Minute</Label>
                                <Input
                                  type="number"
                                  value={event.minute}
                                  min={1}
                                  onChange={(e) => {
                                    const nextGoals = [...matchForm.goal_events];
                                    nextGoals[idx] = { ...nextGoals[idx], minute: e.target.value };
                                    setMatchForm({ ...matchForm, goal_events: nextGoals });
                                  }}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => applyCurrentMinuteToEvent('goal_events', idx)}
                                >
                                  Use current ({currentSuggestedMinute}')
                                </Button>
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
                                    {getPlayersForEventTeam(event.team).map(player => (
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
                                    {getPlayersForEventTeam(event.team).map(player => (
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
                            card_events: [...(matchForm.card_events || []), { ...createEmptyCardEvent(), minute: currentSuggestedMinute }]
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
                                  nextCards[idx] = sanitizeEventPlayerFields(nextCards[idx], value, ['player']);
                                  setMatchForm({ ...matchForm, card_events: nextCards });
                                }}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="team_a">{teamAName}</SelectItem>
                                    <SelectItem value="team_b">{teamBName}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Minute</Label>
                                <Input
                                  type="number"
                                  value={event.minute}
                                  min={1}
                                  onChange={(e) => {
                                    const nextCards = [...matchForm.card_events];
                                    nextCards[idx] = { ...nextCards[idx], minute: e.target.value };
                                    setMatchForm({ ...matchForm, card_events: nextCards });
                                  }}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => applyCurrentMinuteToEvent('card_events', idx)}
                                >
                                  Use current ({currentSuggestedMinute}')
                                </Button>
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
                                    {getPlayersForEventTeam(event.team).map(player => (
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
                            save_events: [...(matchForm.save_events || []), { ...createEmptySaveEvent(), minute: currentSuggestedMinute }]
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
                                  nextSaves[idx] = sanitizeEventPlayerFields(nextSaves[idx], value, ['goalkeeper']);
                                  setMatchForm({ ...matchForm, save_events: nextSaves });
                                }}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="team_a">{teamAName}</SelectItem>
                                    <SelectItem value="team_b">{teamBName}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Minute</Label>
                                <Input
                                  type="number"
                                  value={event.minute}
                                  min={1}
                                  onChange={(e) => {
                                    const nextSaves = [...matchForm.save_events];
                                    nextSaves[idx] = { ...nextSaves[idx], minute: e.target.value };
                                    setMatchForm({ ...matchForm, save_events: nextSaves });
                                  }}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => applyCurrentMinuteToEvent('save_events', idx)}
                                >
                                  Use current ({currentSuggestedMinute}')
                                </Button>
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
                                    {getPlayersForEventTeam(event.team).map(player => (
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
                                    nextSaves[idx] = { ...nextSaves[idx], saves: e.target.value };
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
                            substitution_events: [...(matchForm.substitution_events || []), { ...createEmptySubstitutionEvent(), minute: currentSuggestedMinute }]
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
                                  nextSubs[idx] = sanitizeEventPlayerFields(nextSubs[idx], value, ['player_off', 'player_on']);
                                  setMatchForm({ ...matchForm, substitution_events: nextSubs });
                                }}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="team_a">{teamAName}</SelectItem>
                                    <SelectItem value="team_b">{teamBName}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Minute</Label>
                                <Input
                                  type="number"
                                  value={event.minute}
                                  min={1}
                                  onChange={(e) => {
                                    const nextSubs = [...matchForm.substitution_events];
                                    nextSubs[idx] = { ...nextSubs[idx], minute: e.target.value };
                                    setMatchForm({ ...matchForm, substitution_events: nextSubs });
                                  }}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-xs"
                                  onClick={() => applyCurrentMinuteToEvent('substitution_events', idx)}
                                >
                                  Use current ({currentSuggestedMinute}')
                                </Button>
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
                                    {getPlayersForEventTeam(event.team).map(player => (
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
                                    {getPlayersForEventTeam(event.team).map(player => (
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
                      <Button
                        onClick={editingItem ? handleUpdateMatch : handleCreateMatch}
                        disabled={hasInvalidTeamSelection}
                      >
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
                            {attrs.start_time ? (() => {
                              const { date, time } = formatISTDateTimeDisplay(attrs.start_time);
                              return `${date} ${time}`.trim();
                            })() : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => { void editMatch(match); }}>
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
    </div>
  );
}

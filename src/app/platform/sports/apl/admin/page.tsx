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
import { Plus, Edit, Trash2, Trophy, Calendar, BarChart3, Save, X, Play, Pause, RotateCcw, Check, CircleX, Minus } from 'lucide-react';
import { toast } from 'sonner';
import { formatISTDateTimeDisplay, formatISTDateTimeForInput } from '@/lib/date-utils';
import {
  evaluateTeamSubstitutionCompliance,
  formatSecondsAsClock,
  getRequiredSecondsForStartingPlayerCount,
  toTimelineSeconds,
} from '@/lib/apl-substitution-compliance';
import { isKnockoutRound } from '@/lib/apl-knockout';
import DeveloperCredits from '@/components/developer-credits';

const STARTER_SLOT_COUNT = 6;
const EMPTY_STARTER_IDS = Array.from({ length: STARTER_SLOT_COUNT }, () => '');
const STARTING_PLAYER_COUNT_OPTIONS = [10, 9, 8] as const;
const MATCH_CLOCK_STORAGE_PREFIX = 'apl-admin-match-clock:';

type PersistedMatchClockState = {
  baseMinute: number;
  elapsedBeforeRunSeconds: number;
  runStartedAtMs: number | null;
  running: boolean;
  halftimeCarryMinute: number | null;
};

const getMatchClockStorageKey = (matchId: string) => `${MATCH_CLOCK_STORAGE_PREFIX}${matchId}`;

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
  const [clockBaseMinute, setClockBaseMinute] = useState(0);
  const [clockElapsedBeforeRunSeconds, setClockElapsedBeforeRunSeconds] = useState(0);
  const [clockRunStartedAtMs, setClockRunStartedAtMs] = useState<number | null>(null);
  const [clockNowMs, setClockNowMs] = useState(() => Date.now());
  const [halftimeCarryMinute, setHalftimeCarryMinute] = useState<number | null>(null);

  // Form states
  const [matchForm, setMatchForm] = useState<any>({
    team_a: '',
    team_b: '',
    team_a_starting_player_count: 10,
    team_b_starting_player_count: 10,
    team_a_starters: [...EMPTY_STARTER_IDS],
    team_b_starters: [...EMPTY_STARTER_IDS],
    status: 'upcoming',
    team_a_score: 0,
    team_b_score: 0,
    start_time: '',
    period: 'not_started',
    round: 'group_stage',
    knockout_winner_team_id: '',
    match_number: '',
    goal_events: [] as any[],
    card_events: [] as any[],
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
      setClockNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [clockRunning]);

  useEffect(() => {
    if (matchForm.status !== 'live') {
      if (clockRunning && clockRunStartedAtMs) {
        const now = Date.now();
        const additionalElapsedSeconds = Math.max(0, Math.floor((now - clockRunStartedAtMs) / 1000));
        setClockElapsedBeforeRunSeconds((prev) => prev + additionalElapsedSeconds);
        setClockRunStartedAtMs(null);
      }
      setClockRunning(false);
    }
  }, [clockRunStartedAtMs, clockRunning, matchForm.status]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentMatchId = editingItem?.id?.toString();
    if (!currentMatchId) return;

    if (matchForm.status === 'completed' || matchForm.period === 'full_time') {
      window.localStorage.removeItem(getMatchClockStorageKey(currentMatchId));
      return;
    }

    const stateToPersist: PersistedMatchClockState = {
      baseMinute: clockBaseMinute,
      elapsedBeforeRunSeconds: clockElapsedBeforeRunSeconds,
      runStartedAtMs: clockRunStartedAtMs,
      running: clockRunning,
      halftimeCarryMinute,
    };

    window.localStorage.setItem(getMatchClockStorageKey(currentMatchId), JSON.stringify(stateToPersist));
  }, [
    clockBaseMinute,
    clockElapsedBeforeRunSeconds,
    clockRunStartedAtMs,
    clockRunning,
    editingItem?.id,
    halftimeCarryMinute,
    matchForm.period,
    matchForm.status,
  ]);

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
  const isKnockoutSelection = isKnockoutRound(matchForm.round, 'knockout');

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

  const createEmptySubstitutionEvent = () => ({
    player_off: '',
    player_on: '',
    minute: 1,
    second: 0,
    team: 'team_a'
  });

  const getEffectiveClockElapsedSeconds = () => {
    if (!clockRunning || !clockRunStartedAtMs) {
      return clockElapsedBeforeRunSeconds;
    }

    const runningElapsedSeconds = Math.max(0, Math.floor((clockNowMs - clockRunStartedAtMs) / 1000));
    return clockElapsedBeforeRunSeconds + runningElapsedSeconds;
  };

  const effectiveClockElapsedSeconds = getEffectiveClockElapsedSeconds();

  const currentSuggestedMinute = useMemo(
    () => Math.max(0, clockBaseMinute + Math.floor(effectiveClockElapsedSeconds / 60)),
    [clockBaseMinute, effectiveClockElapsedSeconds]
  );

  const currentSuggestedSecond = useMemo(
    () => effectiveClockElapsedSeconds % 60,
    [effectiveClockElapsedSeconds]
  );

  const currentSuggestedTimelineSeconds = useMemo(
    () => toTimelineSeconds(currentSuggestedMinute, currentSuggestedSecond),
    [currentSuggestedMinute, currentSuggestedSecond]
  );

  const getClockStateLabel = () => {
    if (clockRunning) return 'Running';
    if (effectiveClockElapsedSeconds > 0 || clockBaseMinute > 0) return 'Paused';
    return 'Not started';
  };

  const startClock = () => {
    const now = Date.now();
    setClockBaseMinute(0);
    setClockElapsedBeforeRunSeconds(0);
    setClockRunStartedAtMs(now);
    setClockNowMs(now);
    setHalftimeCarryMinute(null);
    setClockRunning(true);
  };

  const pauseClock = () => {
    if (!clockRunning || !clockRunStartedAtMs) {
      setClockRunning(false);
      return;
    }

    const now = Date.now();
    const additionalElapsedSeconds = Math.max(0, Math.floor((now - clockRunStartedAtMs) / 1000));
    setClockElapsedBeforeRunSeconds((prev) => prev + additionalElapsedSeconds);
    setClockRunStartedAtMs(null);
    setClockNowMs(now);
    setClockRunning(false);
  };

  const resumeClock = () => {
    if (clockRunning) return;
    const now = Date.now();
    setClockRunStartedAtMs(now);
    setClockNowMs(now);
    setClockRunning(true);
  };

  const resetClock = () => {
    setClockRunning(false);
    setClockBaseMinute(0);
    setClockElapsedBeforeRunSeconds(0);
    setClockRunStartedAtMs(null);
    setHalftimeCarryMinute(null);
  };

  const applyCurrentMinuteToEvent = (eventCollection: string, index: number) => {
    setMatchForm((prev: any) => {
      const nextEvents = [...(prev[eventCollection] || [])];
      nextEvents[index] = {
        ...nextEvents[index],
        minute: currentSuggestedMinute,
        ...(eventCollection === 'substitution_events' ? { second: currentSuggestedSecond } : {}),
      };
      return { ...prev, [eventCollection]: nextEvents };
    });
  };

  const handlePeriodChange = (nextPeriod: string) => {
    const previousPeriod = matchForm.period;
    const minuteAtSwitch = currentSuggestedMinute;

    setMatchForm((prev: any) => ({ ...prev, period: nextPeriod }));

    if (nextPeriod === 'half_time') {
      setHalftimeCarryMinute(minuteAtSwitch);
      pauseClock();
      return;
    }

    if (previousPeriod === 'half_time' && nextPeriod === 'second_half') {
      const now = Date.now();
      const resumeFromMinute = Math.max(1, (halftimeCarryMinute ?? minuteAtSwitch) + 1);
      setClockBaseMinute(resumeFromMinute);
      setClockElapsedBeforeRunSeconds(0);
      setClockRunStartedAtMs(now);
      setClockNowMs(now);
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
      ...(form.substitution_events || []),
    ];

    return eventCollections.reduce((maxMinute: number, event: any) => {
      const value = parseInt(event?.minute?.toString() || '', 10);
      if (Number.isNaN(value)) return maxMinute;
      return Math.max(maxMinute, value);
    }, 0);
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

  const normalizeSecond = (value: any, fallback = 0) => {
    const parsedSecond = toInteger(value, fallback);
    return Math.min(59, Math.max(0, parsedSecond));
  };

  const normalizeStartingPlayerCount = (value: any, fallback = 10) => {
    const parsedCount = toInteger(value, fallback);
    return STARTING_PLAYER_COUNT_OPTIONS.includes(parsedCount as 8 | 9 | 10) ? parsedCount : fallback;
  };

  const normalizeStarterIds = (value: any): string[] => {
    if (!Array.isArray(value)) {
      return [...EMPTY_STARTER_IDS];
    }

    const rawIds = value
      .map((item: any) => (item === undefined || item === null ? '' : item.toString()))
      .slice(0, STARTER_SLOT_COUNT);

    while (rawIds.length < STARTER_SLOT_COUNT) {
      rawIds.push('');
    }

    return rawIds;
  };

  const getUniqueStarterIds = (value: any): string[] => {
    const starterIds = normalizeStarterIds(value).filter(Boolean);
    return Array.from(new Set(starterIds));
  };

  const hasCompleteStarters = (value: any) => getUniqueStarterIds(value).length === STARTER_SLOT_COUNT;

  const getStarterValidationError = () => {
    if (!matchForm.team_a || !matchForm.team_b) {
      return null;
    }

    const hasSubstitutions = (matchForm.substitution_events || []).length > 0;
    const needsTrackingSetup = matchForm.status === 'live' || matchForm.status === 'completed' || hasSubstitutions;

    if (!needsTrackingSetup) {
      return null;
    }

    if (!hasCompleteStarters(matchForm.team_a_starters)) {
      return `${teamAName}: select 6 unique starters`;
    }

    if (!hasCompleteStarters(matchForm.team_b_starters)) {
      return `${teamBName}: select 6 unique starters`;
    }

    return null;
  };

  const validateStarterSetup = () => {
    const validationError = getStarterValidationError();
    if (!validationError) return true;

    toast.error(validationError);
    return false;
  };

  const validateKnockoutWinnerSelection = () => {
    if (!isKnockoutSelection) {
      return true;
    }

    const winnerTeamId = (matchForm.knockout_winner_team_id || '').toString();
    if (winnerTeamId && winnerTeamId !== matchForm.team_a && winnerTeamId !== matchForm.team_b) {
      toast.error('Knockout winner must be Team A or Team B');
      return false;
    }

    if (matchForm.status !== 'completed') {
      return true;
    }

    const scoreA = Number(derivedScores.team_a_score);
    const scoreB = Number(derivedScores.team_b_score);
    if (Number.isFinite(scoreA) && Number.isFinite(scoreB) && scoreA === scoreB && !winnerTeamId) {
      toast.error('Select a manual winner for tied knockout matches');
      return false;
    }

    return true;
  };

  const participantNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    participants.forEach((participant: any) => {
      map[participant.id.toString()] = participant.attributes?.name || `Player ${participant.id}`;
    });
    return map;
  }, [participants]);

  const substitutionComplianceByTeam = useMemo(() => {
    const substitutions = (matchForm.substitution_events || []).map((event: any) => ({
      team: event.team,
      minute: normalizeMinute(event.minute, 1),
      second: normalizeSecond(event.second, 0),
      player_on: event.player_on || '',
      player_off: event.player_off || '',
    }));

    const maxEventTimelineSeconds = Math.max(
      ...substitutions.map((event: any) => toTimelineSeconds(event.minute, event.second)),
      ...((matchForm.goal_events || []).map((event: any) => toTimelineSeconds(normalizeMinute(event.minute, 1), 0))),
      ...((matchForm.card_events || []).map((event: any) => toTimelineSeconds(normalizeMinute(event.minute, 1), 0))),
      0
    );

    const evaluationEndSeconds = (matchForm.status === 'live' || matchForm.status === 'completed' || matchForm.period === 'full_time')
      ? Math.max(maxEventTimelineSeconds, currentSuggestedTimelineSeconds)
      : maxEventTimelineSeconds;

    const isMatchComplete = matchForm.status === 'completed' || matchForm.period === 'full_time';

    const teamAStartingCount = normalizeStartingPlayerCount(matchForm.team_a_starting_player_count, 10);
    const teamBStartingCount = normalizeStartingPlayerCount(matchForm.team_b_starting_player_count, 10);

    const teamAResult = evaluateTeamSubstitutionCompliance({
      team: 'team_a',
      substitutions,
      starterIds: getUniqueStarterIds(matchForm.team_a_starters),
      requiredSeconds: getRequiredSecondsForStartingPlayerCount(teamAStartingCount),
      evaluationEndSeconds,
      isMatchComplete,
    });

    const teamBResult = evaluateTeamSubstitutionCompliance({
      team: 'team_b',
      substitutions,
      starterIds: getUniqueStarterIds(matchForm.team_b_starters),
      requiredSeconds: getRequiredSecondsForStartingPlayerCount(teamBStartingCount),
      evaluationEndSeconds,
      isMatchComplete,
    });

    return {
      team_a: teamAResult,
      team_b: teamBResult,
    };
  }, [
    currentSuggestedTimelineSeconds,
    matchForm.card_events,
    matchForm.goal_events,
    matchForm.period,
    matchForm.status,
    matchForm.substitution_events,
    matchForm.team_a_starters,
    matchForm.team_a_starting_player_count,
    matchForm.team_b_starters,
    matchForm.team_b_starting_player_count,
  ]);

  const getSubstitutionRowSnapshot = (teamKey: 'team_a' | 'team_b', rowIndex: number) => {
    const teamSummary = substitutionComplianceByTeam[teamKey];
    return teamSummary.eventSnapshots.find((snapshot: any) => snapshot.index === rowIndex) || null;
  };

  const getSubstitutionPlayersForRow = (
    teamKey: 'team_a' | 'team_b',
    rowIndex: number,
    role: 'off' | 'on',
    selectedPlayerId?: string
  ) => {
    const teamSummary = substitutionComplianceByTeam[teamKey];
    const snapshot = getSubstitutionRowSnapshot(teamKey, rowIndex);
    const currentOnFieldIds = new Set((snapshot?.currentOnFieldPlayerIds || teamSummary.currentOnFieldPlayerIds || []).map((playerId: string) => playerId.toString()));
    const teamPlayers = getPlayersForEventTeam(teamKey);
    const normalizedSelectedPlayerId = selectedPlayerId?.toString().trim();

    const filteredPlayers = teamPlayers.filter((player: any) => {
      const playerId = player.id.toString();
      return role === 'off' ? currentOnFieldIds.has(playerId) : !currentOnFieldIds.has(playerId);
    });

    if (!normalizedSelectedPlayerId) {
      return filteredPlayers;
    }

    const hasSelectedInOptions = filteredPlayers.some(
      (player: any) => player.id.toString() === normalizedSelectedPlayerId
    );

    if (hasSelectedInOptions) {
      return filteredPlayers;
    }

    const selectedPlayer = teamPlayers.find(
      (player: any) => player.id.toString() === normalizedSelectedPlayerId
    );

    return selectedPlayer ? [...filteredPlayers, selectedPlayer] : filteredPlayers;
  };

  const getPlayerComplianceBadge = (status: 'pass' | 'fail' | 'pending' | 'ignored') => {
    if (status === 'pass') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
          <Check className="w-3.5 h-3.5" />
          Tick
        </span>
      );
    }

    if (status === 'fail') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
          <CircleX className="w-3.5 h-3.5" />
          Cross
        </span>
      );
    }

    if (status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
          <Minus className="w-3.5 h-3.5" />
          Pending
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
        <Minus className="w-3.5 h-3.5" />
        Ignored
      </span>
    );
  };

  const updateStarterSlot = (teamKey: 'team_a_starters' | 'team_b_starters', slotIndex: number, playerId: string) => {
    setMatchForm((prev: any) => {
      const nextStarterIds = normalizeStarterIds(prev[teamKey]);
      nextStarterIds[slotIndex] = playerId;
      return {
        ...prev,
        [teamKey]: nextStarterIds,
      };
    });
  };

  const prepareMatchPayload = (form: any) => {
    const goal_events = (form.goal_events || []).map((event: any) => ({
      team: event.team,
      minute: normalizeMinute(event.minute, 1),
      is_penalty: event.is_penalty,
      is_own_goal: event.is_own_goal,
      ...(event.scorer ? { scorer: { id: parseInt(event.scorer) } } : {})
    }));

    const card_events = (form.card_events || []).map((event: any) => ({
      team: event.team,
      minute: normalizeMinute(event.minute, 1),
      card_type: event.card_type,
      ...(event.player ? { player: { id: parseInt(event.player) } } : {})
    }));

    const substitution_events = (form.substitution_events || []).map((event: any) => ({
      team: event.team,
      minute: normalizeMinute(event.minute, 1),
      second: normalizeSecond(event.second, 0),
      ...(event.player_off ? { player_off: { id: parseInt(event.player_off) } } : {}),
      ...(event.player_on ? { player_on: { id: parseInt(event.player_on) } } : {})
    }));

    const team_a_starting_player_count = normalizeStartingPlayerCount(form.team_a_starting_player_count, 10);
    const team_b_starting_player_count = normalizeStartingPlayerCount(form.team_b_starting_player_count, 10);

    const team_a_starters = getUniqueStarterIds(form.team_a_starters);
    const team_b_starters = getUniqueStarterIds(form.team_b_starters);
    const existingDetails = form.details && typeof form.details === 'object' ? form.details : {};
    const winnerCandidate = (form.knockout_winner_team_id || '').toString();
    const normalizedWinnerId = winnerCandidate && /^\d+$/.test(winnerCandidate)
      ? Number(winnerCandidate)
      : null;

    return {
      goal_events,
      card_events,
      substitution_events,
      team_a_starting_player_count,
      team_b_starting_player_count,
      team_a_starters,
      team_b_starters,
      details: {
        ...existingDetails,
        knockout_winner_team_id: normalizedWinnerId,
      },
    };
  };

  // Match CRUD operations
  const handleCreateMatch = async () => {
    if (!validateTeamSelection()) return;
    if (!validateStarterSetup()) return;
    if (!validateKnockoutWinnerSelection()) return;

    try {
      const matchFormPayload = { ...matchForm };
      delete matchFormPayload.knockout_winner_team_id;

      const response = await fetch('/api/platform/sports/apl/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            ...matchFormPayload,
            ...prepareMatchPayload(matchForm),
            ...getDerivedMatchScores(matchForm.goal_events || []),
            team_a: { id: parseInt(matchForm.team_a) },
            team_b: { id: parseInt(matchForm.team_b) },
            ...(matchForm.match_number ? { match_number: parseInt(matchForm.match_number, 10) } : {})
          }
        })
      });

      if (response.ok) {
        toast.success("Match created successfully");
        setMatchDialogOpen(false);
        resetMatchForm();
        fetchData();
      } else {
        const errorPayload = await response.json().catch(() => null);
        toast.error(errorPayload?.error || "Failed to create match");
      }
    } catch {
      toast.error("Error creating match");
    }
  };

  const handleUpdateMatch = async () => {
    if (!editingItem) return;
    if (!validateTeamSelection()) return;
    if (!validateStarterSetup()) return;
    if (!validateKnockoutWinnerSelection()) return;

    try {
      const matchFormPayload = { ...matchForm };
      delete matchFormPayload.knockout_winner_team_id;

      const response = await fetch(`/api/platform/sports/apl/matches/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            ...matchFormPayload,
            ...prepareMatchPayload(matchForm),
            ...getDerivedMatchScores(matchForm.goal_events || []),
            team_a: { id: parseInt(matchForm.team_a) },
            team_b: { id: parseInt(matchForm.team_b) }
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
        const errorPayload = await response.json().catch(() => null);
        toast.error(errorPayload?.error || "Failed to update match");
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
      team_a_starting_player_count: 10,
      team_b_starting_player_count: 10,
      team_a_starters: [...EMPTY_STARTER_IDS],
      team_b_starters: [...EMPTY_STARTER_IDS],
      status: 'upcoming',
      team_a_score: 0,
      team_b_score: 0,
      start_time: '',
      period: 'not_started',
      round: 'group_stage',
      knockout_winner_team_id: '',
      match_number: '',
      goal_events: [],
      card_events: [],
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

      const substitutionEvents = normalizeComponentCollection(attrs.substitution_events).map((event: any) => {
        const eventAttrs = event?.attributes || event || {};
        return {
          player_off: extractRelationId(eventAttrs.player_off),
          player_on: extractRelationId(eventAttrs.player_on),
          minute: eventAttrs.minute || 1,
          second: eventAttrs.second || 0,
          team: eventAttrs.team || 'team_a'
        };
      });

      const teamAStarters = normalizeStarterIds(attrs.team_a_starters);
      const teamBStarters = normalizeStarterIds(attrs.team_b_starters);

      setMatchForm({
        team_a: extractRelationId(attrs.team_a),
        team_b: extractRelationId(attrs.team_b),
        team_a_starting_player_count: normalizeStartingPlayerCount(attrs.team_a_starting_player_count, 10),
        team_b_starting_player_count: normalizeStartingPlayerCount(attrs.team_b_starting_player_count, 10),
        team_a_starters: teamAStarters,
        team_b_starters: teamBStarters,
        status: attrs.status || 'upcoming',
        team_a_score: attrs.team_a_score || 0,
        team_b_score: attrs.team_b_score || 0,
        start_time: formatISTDateTimeForInput(attrs.start_time),
        period: attrs.period || 'not_started',
        round: attrs.round || 'group_stage',
        knockout_winner_team_id: attrs?.details?.knockout_winner_team_id?.toString?.() || '',
        match_number: attrs.match_number?.toString() || '',
        goal_events: goalEvents,
        card_events: cardEvents,
        substitution_events: substitutionEvents
      });

      const maxExistingMinute = getMaxEventMinute({
        goal_events: goalEvents,
        card_events: cardEvents,
        substitution_events: substitutionEvents,
      });
      const currentMatchId = record.id?.toString();
      let persistedClockState: PersistedMatchClockState | null = null;

      if (typeof window !== 'undefined' && currentMatchId) {
        const rawPersistedState = window.localStorage.getItem(getMatchClockStorageKey(currentMatchId));
        if (rawPersistedState) {
          try {
            persistedClockState = JSON.parse(rawPersistedState) as PersistedMatchClockState;
          } catch {
            window.localStorage.removeItem(getMatchClockStorageKey(currentMatchId));
          }
        }
      }

      const shouldRestorePersistedClock = Boolean(
        persistedClockState && attrs.status === 'live' && attrs.period !== 'full_time'
      );

      if (shouldRestorePersistedClock && persistedClockState) {
        const now = Date.now();
        setClockBaseMinute(Math.max(0, persistedClockState.baseMinute || 0));
        setClockElapsedBeforeRunSeconds(Math.max(0, persistedClockState.elapsedBeforeRunSeconds || 0));
        setClockRunStartedAtMs(
          persistedClockState.running && persistedClockState.runStartedAtMs
            ? persistedClockState.runStartedAtMs
            : null
        );
        setClockNowMs(now);
        setHalftimeCarryMinute(persistedClockState.halftimeCarryMinute ?? (attrs.period === 'half_time' ? maxExistingMinute : null));
        setClockRunning(Boolean(persistedClockState.running && persistedClockState.runStartedAtMs));
      } else {
        setClockBaseMinute(maxExistingMinute);
        setClockElapsedBeforeRunSeconds(0);
        setClockRunStartedAtMs(null);
        setClockNowMs(Date.now());
        setHalftimeCarryMinute(attrs.period === 'half_time' ? maxExistingMinute : null);
        setClockRunning(false);
      }

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

  const teamAStarterSlots = useMemo(
    () => normalizeStarterIds(matchForm.team_a_starters),
    [matchForm.team_a_starters]
  );

  const teamBStarterSlots = useMemo(
    () => normalizeStarterIds(matchForm.team_b_starters),
    [matchForm.team_b_starters]
  );

  const substitutionIssueSummaryByTeam = useMemo(() => {
    const subbedInByTeam: Record<'team_a' | 'team_b', Set<string>> = {
      team_a: new Set<string>(),
      team_b: new Set<string>(),
    };

    (matchForm.substitution_events || []).forEach((event: any) => {
      const teamKey = event?.team === 'team_b' ? 'team_b' : 'team_a';
      const playerOnId = event?.player_on?.toString().trim();
      if (playerOnId) {
        subbedInByTeam[teamKey].add(playerOnId);
      }
    });

    const teamConfigs = {
      team_a: {
        players: teamAPlayers,
        starterIds: new Set(getUniqueStarterIds(matchForm.team_a_starters)),
      },
      team_b: {
        players: teamBPlayers,
        starterIds: new Set(getUniqueStarterIds(matchForm.team_b_starters)),
      },
    } as const;

    return (['team_a', 'team_b'] as const).reduce((acc, teamKey) => {
      const teamSummary = substitutionComplianceByTeam[teamKey];
      const insufficientTimePlayers = teamSummary.playerResults.filter((result) => result.status === 'fail');

      const neverSubbedInPlayerIds = teamConfigs[teamKey].players
        .map((player: any) => player.id.toString())
        .filter((playerId: string) => !teamConfigs[teamKey].starterIds.has(playerId))
        .filter((playerId: string) => !subbedInByTeam[teamKey].has(playerId));

      acc[teamKey] = {
        insufficientTimePlayers,
        neverSubbedInPlayerIds,
      };

      return acc;
    }, {
      team_a: {
        insufficientTimePlayers: [] as any[],
        neverSubbedInPlayerIds: [] as string[],
      },
      team_b: {
        insufficientTimePlayers: [] as any[],
        neverSubbedInPlayerIds: [] as string[],
      },
    });
  }, [
    matchForm.substitution_events,
    matchForm.team_a_starters,
    matchForm.team_b_starters,
    substitutionComplianceByTeam,
    teamAPlayers,
    teamBPlayers,
  ]);

  const starterValidationError = getStarterValidationError();
  const editingMatchNumber = editingItem?.attributes?.match_number ?? editingItem?.match_number;

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
                  <DialogContent className="w-[96vw] max-w-[82rem] max-h-[86vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Edit Match' : 'Create New Match'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="team_a">Team A</Label>
                        <Select value={matchForm.team_a} onValueChange={(value) => setMatchForm((prev: any) => ({
                          ...prev,
                          team_a: value,
                          team_a_starters: [...EMPTY_STARTER_IDS],
                          knockout_winner_team_id: prev.knockout_winner_team_id === value || prev.knockout_winner_team_id === prev.team_b
                            ? prev.knockout_winner_team_id
                            : '',
                        }))}>
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
                        <Select value={matchForm.team_b} onValueChange={(value) => setMatchForm((prev: any) => ({
                          ...prev,
                          team_b: value,
                          team_b_starters: [...EMPTY_STARTER_IDS],
                          knockout_winner_team_id: prev.knockout_winner_team_id === value || prev.knockout_winner_team_id === prev.team_a
                            ? prev.knockout_winner_team_id
                            : '',
                        }))}>
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
                        <Select value={matchForm.round} onValueChange={(value) => setMatchForm({
                          ...matchForm,
                          round: value,
                          knockout_winner_team_id: isKnockoutRound(value, 'knockout') ? matchForm.knockout_winner_team_id : '',
                        })}>
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
                        <Label htmlFor="knockout_winner_team_id">Knockout Winner (Tie Break)</Label>
                        <Select
                          value={matchForm.knockout_winner_team_id || '__none__'}
                          onValueChange={(value) => setMatchForm({
                            ...matchForm,
                            knockout_winner_team_id: value === '__none__' ? '' : value,
                          })}
                          disabled={!isKnockoutSelection || !matchForm.team_a || !matchForm.team_b}
                        >
                          <SelectTrigger id="knockout_winner_team_id">
                            <SelectValue placeholder="No manual winner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">No manual winner</SelectItem>
                            {matchForm.team_a && (
                              <SelectItem value={matchForm.team_a}>{teamAName}</SelectItem>
                            )}
                            {matchForm.team_b && (
                              <SelectItem value={matchForm.team_b}>{teamBName}</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Required only when a knockout match is completed with tied scores.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="match_number">Match Number</Label>
                        {editingItem ? (
                          <div
                            id="match_number"
                            className="h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
                          >
                            {editingMatchNumber ? `Match #${editingMatchNumber}` : 'No match number assigned'}
                          </div>
                        ) : (
                          <Input
                            id="match_number"
                            type="number"
                            min={1}
                            placeholder="Leave blank to auto-assign"
                            value={matchForm.match_number}
                            onChange={(e) => setMatchForm({...matchForm, match_number: e.target.value})}
                          />
                        )}
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
                      <div className="space-y-2">
                        <Label htmlFor="team_a_starting_player_count">{teamAName} Starting Player Count</Label>
                        <Select
                          value={normalizeStartingPlayerCount(matchForm.team_a_starting_player_count, 10).toString()}
                          onValueChange={(value) => setMatchForm({
                            ...matchForm,
                            team_a_starting_player_count: normalizeStartingPlayerCount(value, 10),
                          })}
                        >
                          <SelectTrigger id="team_a_starting_player_count">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STARTING_PLAYER_COUNT_OPTIONS.map((count) => (
                              <SelectItem key={`team-a-count-${count}`} value={count.toString()}>{count}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="team_b_starting_player_count">{teamBName} Starting Player Count</Label>
                        <Select
                          value={normalizeStartingPlayerCount(matchForm.team_b_starting_player_count, 10).toString()}
                          onValueChange={(value) => setMatchForm({
                            ...matchForm,
                            team_b_starting_player_count: normalizeStartingPlayerCount(value, 10),
                          })}
                        >
                          <SelectTrigger id="team_b_starting_player_count">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STARTING_PLAYER_COUNT_OPTIONS.map((count) => (
                              <SelectItem key={`team-b-count-${count}`} value={count.toString()}>{count}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <div className="rounded-lg border p-4 space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold">Starting Lineup Setup</h3>
                            <p className="text-sm text-muted-foreground">
                              Select 6 starters per team. Starters and players subbed on twice are ignored for tick/cross tracking.
                            </p>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <p className="text-sm font-medium">{teamAName} Starters (6)</p>
                              <p className="text-xs text-muted-foreground">
                                Required on-field time: {formatSecondsAsClock(
                                  getRequiredSecondsForStartingPlayerCount(
                                    normalizeStartingPlayerCount(matchForm.team_a_starting_player_count, 10)
                                  )
                                )}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {Array.from({ length: STARTER_SLOT_COUNT }).map((_, slotIndex) => {
                                  const selectedStarterIds = new Set(teamAStarterSlots.filter(Boolean));
                                  const currentStarterId = teamAStarterSlots[slotIndex];
                                  if (currentStarterId) selectedStarterIds.delete(currentStarterId);

                                  return (
                                    <Select
                                      key={`team-a-starter-${slotIndex}`}
                                      value={currentStarterId || '__empty__'}
                                      onValueChange={(value) => updateStarterSlot('team_a_starters', slotIndex, value === '__empty__' ? '' : value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder={`Starter ${slotIndex + 1}`} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="__empty__">Unselected</SelectItem>
                                        {teamAPlayers.map((player) => {
                                          const playerId = player.id.toString();
                                          return (
                                            <SelectItem
                                              key={`team-a-starter-option-${slotIndex}-${playerId}`}
                                              value={playerId}
                                              disabled={selectedStarterIds.has(playerId)}
                                            >
                                              {player.attributes?.name}
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <p className="text-sm font-medium">{teamBName} Starters (6)</p>
                              <p className="text-xs text-muted-foreground">
                                Required on-field time: {formatSecondsAsClock(
                                  getRequiredSecondsForStartingPlayerCount(
                                    normalizeStartingPlayerCount(matchForm.team_b_starting_player_count, 10)
                                  )
                                )}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {Array.from({ length: STARTER_SLOT_COUNT }).map((_, slotIndex) => {
                                  const selectedStarterIds = new Set(teamBStarterSlots.filter(Boolean));
                                  const currentStarterId = teamBStarterSlots[slotIndex];
                                  if (currentStarterId) selectedStarterIds.delete(currentStarterId);

                                  return (
                                    <Select
                                      key={`team-b-starter-${slotIndex}`}
                                      value={currentStarterId || '__empty__'}
                                      onValueChange={(value) => updateStarterSlot('team_b_starters', slotIndex, value === '__empty__' ? '' : value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder={`Starter ${slotIndex + 1}`} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="__empty__">Unselected</SelectItem>
                                        {teamBPlayers.map((player) => {
                                          const playerId = player.id.toString();
                                          return (
                                            <SelectItem
                                              key={`team-b-starter-option-${slotIndex}-${playerId}`}
                                              value={playerId}
                                              disabled={selectedStarterIds.has(playerId)}
                                            >
                                              {player.attributes?.name}
                                            </SelectItem>
                                          );
                                        })}
                                      </SelectContent>
                                    </Select>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          {starterValidationError && (
                            <p className="text-sm text-destructive">{starterValidationError}</p>
                          )}
                        </div>

                        {matchForm.status === 'live' && (
                          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold">Match Clock</h3>
                                <p className="text-sm text-muted-foreground">Suggested event minute updates from this clock.</p>
                              </div>
                              <Badge className="whitespace-nowrap flex-shrink-0" variant={clockRunning ? 'default' : 'outline'}>{getClockStateLabel()}</Badge>
                            </div>
                            <div className="h-8 flex items-center">
                              <div className="text-2xl font-semibold leading-none">
                                {currentSuggestedMinute}' {currentSuggestedSecond.toString().padStart(2, '0')}"
                              </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <Button className="w-full" size="sm" variant="default" onClick={startClock} disabled={clockRunning}>
                                <Play className="w-4 h-4 mr-2" />
                                Start
                              </Button>
                              <Button className="w-full" size="sm" variant="outline" onClick={pauseClock} disabled={!clockRunning}>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause
                              </Button>
                              <Button className="w-full" size="sm" variant="outline" onClick={resumeClock} disabled={clockRunning}>
                                <Play className="w-4 h-4 mr-2" />
                                Resume
                              </Button>
                              <Button className="w-full" size="sm" variant="ghost" onClick={resetClock}>
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
                            <div key={`goal-${idx}`} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 border rounded-lg">
                              <div className="space-y-2">
                                <Label>Team</Label>
                                <Select value={event.team} onValueChange={(value) => {
                                  const nextGoals = [...matchForm.goal_events];
                                  nextGoals[idx] = sanitizeEventPlayerFields(nextGoals[idx], value, ['scorer']);
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
                          <h3 className="text-lg font-semibold">Substitution Events</h3>
                          <Button size="sm" variant="outline" onClick={() => setMatchForm({
                            ...matchForm,
                            substitution_events: [...(matchForm.substitution_events || []), {
                              ...createEmptySubstitutionEvent(),
                              minute: currentSuggestedMinute,
                              second: currentSuggestedSecond,
                            }]
                          })}>
                            Add Substitution
                          </Button>
                        </div>
                        {matchForm.substitution_events.length === 0 && (
                          <p className="text-sm text-muted-foreground">No substitutions recorded.</p>
                        )}
                        <div className="space-y-3">
                          {(matchForm.substitution_events || []).map((event: any, idx: number) => (
                            <div key={`sub-${idx}`} className="grid grid-cols-1 md:grid-cols-7 gap-2 p-3 border rounded-lg">
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
                                  Use current ({currentSuggestedMinute}' {currentSuggestedSecond.toString().padStart(2, '0')}")
                                </Button>
                              </div>
                              <div className="space-y-2">
                                <Label>Second</Label>
                                <Input
                                  type="number"
                                  value={event.second ?? 0}
                                  min={0}
                                  max={59}
                                  onChange={(e) => {
                                    const nextSubs = [...matchForm.substitution_events];
                                    nextSubs[idx] = { ...nextSubs[idx], second: e.target.value };
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
                                    {getSubstitutionPlayersForRow(event.team, idx, 'off', event.player_off).map(player => (
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
                                    {getSubstitutionPlayersForRow(event.team, idx, 'on', event.player_on).map(player => (
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

                        <div className="rounded-lg border p-4 space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold">Substitution Timer Compliance</h3>
                            <p className="text-sm text-muted-foreground">
                              Tick: player met required time before being subbed off. Cross: player did not meet required time.
                            </p>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {(['team_a', 'team_b'] as const).map((teamKey) => {
                              const teamLabel = teamKey === 'team_a' ? teamAName : teamBName;
                              const teamSummary = substitutionComplianceByTeam[teamKey];

                              return (
                                <div key={`compliance-${teamKey}`} className="rounded-md border p-3 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium">{teamLabel}</p>
                                    <Badge variant="outline">
                                      Need {formatSecondsAsClock(teamSummary.requiredSeconds)}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    On field: {teamSummary.currentOnFieldPlayerIds.length} | Played: {teamSummary.playedPlayerIds.length}
                                  </p>
                                  {teamSummary.playerResults.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No tracked substitute entries yet.</p>
                                  ) : (
                                    <div className="space-y-2">
                                      {teamSummary.playerResults.map((result) => {
                                        const playerName = participantNameMap[result.playerId] || `Player ${result.playerId}`;
                                        const durationLabel = result.status === 'ignored'
                                          ? result.ignoreReason === 'starter'
                                            ? 'Starter'
                                            : 'Ignored'
                                          : `${formatSecondsAsClock(result.playedSeconds)} played`;

                                        return (
                                          <div key={`${teamKey}-${result.playerId}`} className="flex items-center justify-between rounded border px-2 py-1.5">
                                            <div>
                                              <p className="text-sm font-medium">{playerName}</p>
                                              <p className="text-xs text-muted-foreground">{durationLabel}</p>
                                            </div>
                                            {getPlayerComplianceBadge(result.status)}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                            <p className="text-sm font-semibold text-foreground">Players Who Did Not Fulfill Criteria</p>
                            <div className="grid grid-cols-2 gap-3">
                              {(['team_a', 'team_b'] as const).map((teamKey) => {
                                const teamLabel = teamKey === 'team_a' ? teamAName : teamBName;
                                const issueSummary = substitutionIssueSummaryByTeam[teamKey];
                                const missedTimePlayers = issueSummary.insufficientTimePlayers;
                                const neverSubbedInPlayerIds = issueSummary.neverSubbedInPlayerIds;

                                return (
                                  <div key={`failed-${teamKey}`} className="rounded-md border bg-card p-3 space-y-3 min-w-0">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <p className="font-medium text-foreground">{teamLabel}</p>
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <Badge variant="outline" className="text-[11px]">
                                          Missed Time: {missedTimePlayers.length}
                                        </Badge>
                                        <Badge variant="outline" className="text-[11px]">
                                          Never Subbed: {neverSubbedInPlayerIds.length}
                                        </Badge>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-[11rem_minmax(0,1fr)] gap-3">
                                      <div className="rounded-md border bg-background p-2.5 space-y-1.5">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Missed Required Time</p>
                                        {missedTimePlayers.length === 0 ? (
                                          <p className="text-sm text-muted-foreground">None</p>
                                        ) : (
                                          <div className="space-y-1.5">
                                            {missedTimePlayers.map((result) => {
                                              const playerName = participantNameMap[result.playerId] || `Player ${result.playerId}`;
                                              return (
                                                <div key={`missed-${teamKey}-${result.playerId}`} className="rounded border px-2.5 py-2 space-y-1 min-w-0">
                                                  <p className="text-sm font-medium break-words leading-snug">{playerName}</p>
                                                  <p className="text-xs text-muted-foreground">Subbed in but missed required time</p>
                                                  <p className="text-xs font-medium text-muted-foreground">
                                                    Played {formatSecondsAsClock(result.playedSeconds)} of {formatSecondsAsClock(result.requiredSeconds)} required
                                                  </p>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>

                                      <div className="rounded-md border bg-background p-2.5 space-y-1.5">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Never Subbed In</p>
                                        {neverSubbedInPlayerIds.length === 0 ? (
                                          <p className="text-sm text-muted-foreground">None</p>
                                        ) : (
                                          <div className="space-y-1.5">
                                            {neverSubbedInPlayerIds.map((playerId) => {
                                              const playerName = participantNameMap[playerId] || `Player ${playerId}`;
                                              return (
                                                <div key={`never-subbed-${teamKey}-${playerId}`} className="rounded border px-2.5 py-2 space-y-1 min-w-0">
                                                  <p className="text-sm font-medium break-words leading-snug">{playerName}</p>
                                                  <p className="text-xs text-muted-foreground">Never entered (0:00)</p>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
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
                        disabled={hasInvalidTeamSelection || Boolean(starterValidationError)}
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

export type KnockoutRound = 'round_of_16' | 'quarter_final' | 'semi_final' | 'final';

export type KnockoutStatus = 'upcoming' | 'live' | 'completed';

export type KnockoutMatchRecord = {
  id: number;
  round: KnockoutRound;
  matchNumber: number;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  teamALogoUrl: string;
  teamBLogoUrl: string;
  teamAScore: number | null;
  teamBScore: number | null;
  status: KnockoutStatus;
  startTime: string;
  manualWinnerTeamId: string;
  raw: any;
};

export type KnockoutSlot = {
  id: number | null;
  round: KnockoutRound;
  index: number;
  label: string;
  matchNumber: number | null;
  teamAId: string;
  teamBId: string;
  teamAName: string;
  teamBName: string;
  teamALogoUrl: string;
  teamBLogoUrl: string;
  scoreA: number | null;
  scoreB: number | null;
  status: KnockoutStatus;
  startTime: string;
  isPlaceholder: boolean;
};

export type FixedKnockoutBracket = {
  round_of_16: KnockoutSlot[];
  quarter_final: KnockoutSlot[];
  semi_final: KnockoutSlot[];
  final: KnockoutSlot[];
  hasData: boolean;
};

const ROUND_SLOT_COUNTS: Record<KnockoutRound, number> = {
  round_of_16: 8,
  quarter_final: 4,
  semi_final: 2,
  final: 1,
};

const ROUND_LABELS: Record<KnockoutRound, string> = {
  round_of_16: 'Round of 16',
  quarter_final: 'Quarter Final',
  semi_final: 'Semi Final',
  final: 'Final',
};

const KNOCKOUT_ROUNDS: KnockoutRound[] = ['round_of_16', 'quarter_final', 'semi_final', 'final'];

const KNOCKOUT_ROUND_ALIASES = new Set<string>([
  'round_of_16',
  'roundof16',
  'round16',
  'r16',
  'quarter_final',
  'quarterfinal',
  'qf',
  'semi_final',
  'semifinal',
  'sf',
  'final',
]);

const normalizeRoundToken = (value?: string) => (
  (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/_+/g, '_')
);

export const isKnockoutRound = (round?: string, type?: string) => {
  const normalizedRound = normalizeRoundToken(round);
  if (KNOCKOUT_ROUND_ALIASES.has(normalizedRound)) return true;
  if (normalizedRound === 'group_stage') return false;
  return (type || '').toString().trim().toLowerCase() === 'knockout';
};

export const extractRelationId = (value: any): string => {
  if (!value) return '';

  const candidate = value?.data?.id ?? value?.id ?? value?.documentId ?? value;
  return typeof candidate === 'string' || typeof candidate === 'number' ? candidate.toString() : '';
};

const normalizeScore = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeStatus = (value: unknown): KnockoutStatus => {
  const normalized = (value || 'upcoming').toString().trim().toLowerCase();
  if (normalized === 'live') return 'live';
  if (normalized === 'completed' || normalized === 'past') return 'completed';
  return 'upcoming';
};

const normalizeRound = (value: unknown): KnockoutRound | null => {
  const normalized = (value || '').toString().trim().toLowerCase();
  return KNOCKOUT_ROUNDS.includes(normalized as KnockoutRound) ? (normalized as KnockoutRound) : null;
};

const getTeamName = (match: any, side: 'team_a' | 'team_b') => {
  const name = match?.attributes?.[side]?.data?.attributes?.name;
  return typeof name === 'string' && name.trim() ? name : 'TBD';
};

const getTeamLogoUrl = (match: any, side: 'team_a' | 'team_b') => {
  const logoUrl = match?.attributes?.[side]?.data?.attributes?.logo?.data?.attributes?.url;
  return typeof logoUrl === 'string' ? logoUrl : '';
};

const toRecord = (match: any): KnockoutMatchRecord | null => {
  const attrs = match?.attributes || {};
  const round = normalizeRound(attrs.round || attrs?.details?.round);
  if (!round) return null;

  return {
    id: Number(match.id),
    round,
    matchNumber: Number.isFinite(Number(attrs.match_number)) ? Number(attrs.match_number) : 0,
    teamAId: extractRelationId(attrs.team_a),
    teamBId: extractRelationId(attrs.team_b),
    teamAName: getTeamName(match, 'team_a'),
    teamBName: getTeamName(match, 'team_b'),
    teamALogoUrl: getTeamLogoUrl(match, 'team_a'),
    teamBLogoUrl: getTeamLogoUrl(match, 'team_b'),
    teamAScore: normalizeScore(attrs.team_a_score),
    teamBScore: normalizeScore(attrs.team_b_score),
    status: normalizeStatus(attrs.status),
    startTime: typeof attrs.start_time === 'string' ? attrs.start_time : '',
    manualWinnerTeamId: extractRelationId(attrs?.details?.knockout_winner_team_id),
    raw: match,
  };
};

const sortByMatchNumber = (a: KnockoutMatchRecord, b: KnockoutMatchRecord) => {
  if (a.matchNumber !== b.matchNumber) return a.matchNumber - b.matchNumber;
  return a.id - b.id;
};

const createPlaceholderSlot = (round: KnockoutRound, index: number): KnockoutSlot => ({
  id: null,
  round,
  index,
  label: `${ROUND_LABELS[round]} ${index + 1}`,
  matchNumber: null,
  teamAId: '',
  teamBId: '',
  teamAName: 'TBD',
  teamBName: 'TBD',
  teamALogoUrl: '',
  teamBLogoUrl: '',
  scoreA: null,
  scoreB: null,
  status: 'upcoming',
  startTime: '',
  isPlaceholder: true,
});

const toSlot = (record: KnockoutMatchRecord, index: number): KnockoutSlot => ({
  id: record.id,
  round: record.round,
  index,
  label: `${ROUND_LABELS[record.round]} ${index + 1}`,
  matchNumber: record.matchNumber || null,
  teamAId: record.teamAId,
  teamBId: record.teamBId,
  teamAName: record.teamAName,
  teamBName: record.teamBName,
  teamALogoUrl: record.teamALogoUrl,
  teamBLogoUrl: record.teamBLogoUrl,
  scoreA: record.teamAScore,
  scoreB: record.teamBScore,
  status: record.status,
  startTime: record.startTime,
  isPlaceholder: false,
});

export const buildFixedKnockoutBracket = (matches: any[]): FixedKnockoutBracket => {
  const records = (matches || [])
    .map(toRecord)
    .filter((value): value is KnockoutMatchRecord => Boolean(value));

  const roundBuckets: Record<KnockoutRound, KnockoutMatchRecord[]> = {
    round_of_16: [],
    quarter_final: [],
    semi_final: [],
    final: [],
  };

  records.forEach((record) => {
    roundBuckets[record.round].push(record);
  });

  const rounds = {
    round_of_16: Array.from({ length: ROUND_SLOT_COUNTS.round_of_16 }, (_, index) => createPlaceholderSlot('round_of_16', index)),
    quarter_final: Array.from({ length: ROUND_SLOT_COUNTS.quarter_final }, (_, index) => createPlaceholderSlot('quarter_final', index)),
    semi_final: Array.from({ length: ROUND_SLOT_COUNTS.semi_final }, (_, index) => createPlaceholderSlot('semi_final', index)),
    final: Array.from({ length: ROUND_SLOT_COUNTS.final }, (_, index) => createPlaceholderSlot('final', index)),
  };

  (Object.keys(roundBuckets) as KnockoutRound[]).forEach((round) => {
    roundBuckets[round]
      .sort(sortByMatchNumber)
      .slice(0, ROUND_SLOT_COUNTS[round])
      .forEach((record, index) => {
        rounds[round][index] = toSlot(record, index);
      });
  });

  return {
    ...rounds,
    hasData: records.length > 0,
  };
};

export const getManualWinnerTeamId = (record: KnockoutMatchRecord): string => {
  if (!record.manualWinnerTeamId) return '';
  if (record.manualWinnerTeamId !== record.teamAId && record.manualWinnerTeamId !== record.teamBId) return '';
  return record.manualWinnerTeamId;
};

export const resolveKnockoutWinner = (record: KnockoutMatchRecord): { winnerTeamId: string | null; reason: string } => {
  if (record.status !== 'completed') {
    return { winnerTeamId: null, reason: 'match_not_completed' };
  }

  if (record.teamAScore === null || record.teamBScore === null) {
    return { winnerTeamId: null, reason: 'missing_scores' };
  }

  if (record.teamAScore > record.teamBScore && record.teamAId) {
    return { winnerTeamId: record.teamAId, reason: 'score_result' };
  }

  if (record.teamBScore > record.teamAScore && record.teamBId) {
    return { winnerTeamId: record.teamBId, reason: 'score_result' };
  }

  const manualWinner = getManualWinnerTeamId(record);
  if (manualWinner) {
    return { winnerTeamId: manualWinner, reason: 'manual_tie_break' };
  }

  return { winnerTeamId: null, reason: 'tie_requires_manual_winner' };
};

export const getNextRoundTarget = (
  round: KnockoutRound,
  index: number
): { round: KnockoutRound; index: number; slot: 'team_a' | 'team_b' } | null => {
  if (round === 'round_of_16') {
    return {
      round: 'quarter_final',
      index: Math.floor(index / 2),
      slot: index % 2 === 0 ? 'team_a' : 'team_b',
    };
  }

  if (round === 'quarter_final') {
    return {
      round: 'semi_final',
      index: Math.floor(index / 2),
      slot: index % 2 === 0 ? 'team_a' : 'team_b',
    };
  }

  if (round === 'semi_final') {
    return {
      round: 'final',
      index: 0,
      slot: index % 2 === 0 ? 'team_a' : 'team_b',
    };
  }

  return null;
};

export const buildOrderedKnockoutRoundMap = (matches: any[]): Record<KnockoutRound, KnockoutMatchRecord[]> => {
  const records = (matches || [])
    .map(toRecord)
    .filter((value): value is KnockoutMatchRecord => Boolean(value));

  const map: Record<KnockoutRound, KnockoutMatchRecord[]> = {
    round_of_16: [],
    quarter_final: [],
    semi_final: [],
    final: [],
  };

  records.forEach((record) => {
    map[record.round].push(record);
  });

  (Object.keys(map) as KnockoutRound[]).forEach((round) => {
    map[round].sort(sortByMatchNumber);
  });

  return map;
};

export const createRecordFromStrapiMatch = (match: any): KnockoutMatchRecord | null => toRecord(match);

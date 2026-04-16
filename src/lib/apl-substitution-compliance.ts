export type TeamSide = 'team_a' | 'team_b';

export type PlayerComplianceStatus = 'pass' | 'fail' | 'pending' | 'ignored';

export type PlayerIgnoreReason = 'starter' | 'multiple_sub_on_events';

export type SubstitutionComplianceEvent = {
  team: TeamSide;
  minute: number;
  second?: number;
  player_on?: string | null;
  player_off?: string | null;
};

export type PlayerSubstitutionCompliance = {
  playerId: string;
  onTimeSeconds: number;
  offTimeSeconds: number | null;
  playedSeconds: number;
  requiredSeconds: number;
  status: PlayerComplianceStatus;
  ignoreReason?: PlayerIgnoreReason;
};

export type TeamSubstitutionComplianceSummary = {
  requiredSeconds: number;
  playerResults: PlayerSubstitutionCompliance[];
  failedPlayerIds: string[];
};

type EvaluateTeamSubstitutionComplianceParams = {
  team: TeamSide;
  substitutions: SubstitutionComplianceEvent[];
  starterIds: string[];
  requiredSeconds: number;
  evaluationEndSeconds: number;
  isMatchComplete: boolean;
};

const REQUIRED_SECONDS_BY_STARTING_COUNT: Record<8 | 9 | 10, number> = {
  10: 60,
  9: 90,
  8: 120,
};

const STARTING_PLAYER_COUNTS = new Set<number>([8, 9, 10]);

const clampSecond = (value: number): number => {
  if (value < 0) return 0;
  if (value > 59) return 59;
  return value;
};

const toMinute = (value: number): number => {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value));
};

const toSecond = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return clampSecond(Math.floor(value));
};

const toPlayerId = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

export function getRequiredSecondsForStartingPlayerCount(playerCount: number): number {
  const normalized = Number(playerCount);
  if (STARTING_PLAYER_COUNTS.has(normalized)) {
    return REQUIRED_SECONDS_BY_STARTING_COUNT[normalized as 8 | 9 | 10];
  }
  return REQUIRED_SECONDS_BY_STARTING_COUNT[10];
}

export function toTimelineSeconds(minute: number, second = 0): number {
  const normalizedMinute = toMinute(minute);
  const normalizedSecond = toSecond(second);
  return Math.max(0, (normalizedMinute - 1) * 60 + normalizedSecond);
}

export function formatSecondsAsClock(seconds: number): string {
  const normalized = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(normalized / 60);
  const remainingSeconds = normalized % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function evaluateTeamSubstitutionCompliance({
  team,
  substitutions,
  starterIds,
  requiredSeconds,
  evaluationEndSeconds,
  isMatchComplete,
}: EvaluateTeamSubstitutionComplianceParams): TeamSubstitutionComplianceSummary {
  const starterIdSet = new Set(starterIds.map((id) => toPlayerId(id)).filter(Boolean));

  const normalizedEvents = substitutions
    .filter((event) => event?.team === team)
    .map((event, index) => ({
      index,
      timeSeconds: toTimelineSeconds(event.minute, event.second ?? 0),
      playerOn: toPlayerId(event.player_on),
      playerOff: toPlayerId(event.player_off),
    }))
    .sort((a, b) => a.timeSeconds - b.timeSeconds || a.index - b.index);

  const onTimesByPlayer = new Map<string, number[]>();
  const offTimesByPlayer = new Map<string, number[]>();

  normalizedEvents.forEach((event) => {
    if (event.playerOn) {
      const previousOnTimes = onTimesByPlayer.get(event.playerOn) || [];
      previousOnTimes.push(event.timeSeconds);
      onTimesByPlayer.set(event.playerOn, previousOnTimes);
    }

    if (event.playerOff) {
      const previousOffTimes = offTimesByPlayer.get(event.playerOff) || [];
      previousOffTimes.push(event.timeSeconds);
      offTimesByPlayer.set(event.playerOff, previousOffTimes);
    }
  });

  const results: PlayerSubstitutionCompliance[] = [];

  Array.from(onTimesByPlayer.entries())
    .sort((a, b) => a[1][0] - b[1][0])
    .forEach(([playerId, onTimes]) => {
      const firstOnTime = onTimes[0];

      if (starterIdSet.has(playerId)) {
        results.push({
          playerId,
          onTimeSeconds: firstOnTime,
          offTimeSeconds: null,
          playedSeconds: 0,
          requiredSeconds,
          status: 'ignored',
          ignoreReason: 'starter',
        });
        return;
      }

      if (onTimes.length > 1) {
        results.push({
          playerId,
          onTimeSeconds: firstOnTime,
          offTimeSeconds: null,
          playedSeconds: 0,
          requiredSeconds,
          status: 'ignored',
          ignoreReason: 'multiple_sub_on_events',
        });
        return;
      }

      const offTimes = offTimesByPlayer.get(playerId) || [];
      const firstOffAfterOn = offTimes.find((timeSeconds) => timeSeconds > firstOnTime) ?? null;
      const cutoffTime = firstOffAfterOn ?? evaluationEndSeconds;
      const playedSeconds = Math.max(0, cutoffTime - firstOnTime);

      let status: PlayerComplianceStatus;
      if (firstOffAfterOn !== null) {
        status = playedSeconds >= requiredSeconds ? 'pass' : 'fail';
      } else if (playedSeconds >= requiredSeconds) {
        status = 'pass';
      } else {
        status = isMatchComplete ? 'fail' : 'pending';
      }

      results.push({
        playerId,
        onTimeSeconds: firstOnTime,
        offTimeSeconds: firstOffAfterOn,
        playedSeconds,
        requiredSeconds,
        status,
      });
    });

  return {
    requiredSeconds,
    playerResults: results,
    failedPlayerIds: results.filter((result) => result.status === 'fail').map((result) => result.playerId),
  };
}

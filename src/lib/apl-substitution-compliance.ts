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

export type TeamSubstitutionStateSnapshot = {
  index: number;
  timeSeconds: number;
  playerOn: string;
  playerOff: string;
  currentOnFieldPlayerIds: string[];
  playedPlayerIds: string[];
};

export type TeamSubstitutionEvaluation = TeamSubstitutionComplianceSummary & {
  currentOnFieldPlayerIds: string[];
  playedPlayerIds: string[];
  eventSnapshots: TeamSubstitutionStateSnapshot[];
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

const uniqueIds = (values: Iterable<string>): string[] => Array.from(new Set(Array.from(values).filter(Boolean)));

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
}: EvaluateTeamSubstitutionComplianceParams): TeamSubstitutionEvaluation {
  const starterIdSet = new Set(starterIds.map((id) => toPlayerId(id)).filter(Boolean));

  const normalizedEvents = substitutions
    .map((event, index) => ({
      index,
      team: event?.team,
      timeSeconds: toTimelineSeconds(event.minute, event.second ?? 0),
      playerOn: toPlayerId(event.player_on),
      playerOff: toPlayerId(event.player_off),
    }))
    .filter((event) => event.team === team)
    .sort((a, b) => a.timeSeconds - b.timeSeconds || a.index - b.index);

  const currentOnFieldPlayerIds = new Set<string>(starterIdSet);
  const playedPlayerIds = new Set<string>(starterIdSet);
  const onFieldSinceByPlayer = new Map<string, number>();
  const playedSecondsByPlayer = new Map<string, number>();
  const onTimesByPlayer = new Map<string, number[]>();
  const offTimesByPlayer = new Map<string, number[]>();
  const eventSnapshots: TeamSubstitutionStateSnapshot[] = [];

  starterIdSet.forEach((playerId) => {
    onFieldSinceByPlayer.set(playerId, 0);
  });

  normalizedEvents.forEach((event) => {
    eventSnapshots.push({
      index: event.index,
      timeSeconds: event.timeSeconds,
      playerOn: event.playerOn,
      playerOff: event.playerOff,
      currentOnFieldPlayerIds: uniqueIds(currentOnFieldPlayerIds),
      playedPlayerIds: uniqueIds(playedPlayerIds),
    });

    const hasValidPair = Boolean(
      event.playerOn
      && event.playerOff
      && event.playerOn !== event.playerOff
    );

    if (!hasValidPair) {
      return;
    }

    const previousOnTimes = onTimesByPlayer.get(event.playerOn) || [];
    previousOnTimes.push(event.timeSeconds);
    onTimesByPlayer.set(event.playerOn, previousOnTimes);

    if (!currentOnFieldPlayerIds.has(event.playerOn)) {
      currentOnFieldPlayerIds.add(event.playerOn);
      onFieldSinceByPlayer.set(event.playerOn, event.timeSeconds);
    }

    playedPlayerIds.add(event.playerOn);

    const previousOffTimes = offTimesByPlayer.get(event.playerOff) || [];
    previousOffTimes.push(event.timeSeconds);
    offTimesByPlayer.set(event.playerOff, previousOffTimes);

    if (currentOnFieldPlayerIds.has(event.playerOff)) {
      const startedAt = onFieldSinceByPlayer.get(event.playerOff) ?? event.timeSeconds;
      const playedSeconds = Math.max(0, event.timeSeconds - startedAt);
      playedSecondsByPlayer.set(
        event.playerOff,
        (playedSecondsByPlayer.get(event.playerOff) || 0) + playedSeconds,
      );
      currentOnFieldPlayerIds.delete(event.playerOff);
      onFieldSinceByPlayer.delete(event.playerOff);
    }
  });

  currentOnFieldPlayerIds.forEach((playerId) => {
    const startedAt = onFieldSinceByPlayer.get(playerId) ?? evaluationEndSeconds;
    const playedSeconds = Math.max(0, evaluationEndSeconds - startedAt);
    playedSecondsByPlayer.set(
      playerId,
      (playedSecondsByPlayer.get(playerId) || 0) + playedSeconds,
    );
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

      const offTimes = offTimesByPlayer.get(playerId) || [];
      const firstOffAfterOn = offTimes.find((timeSeconds) => timeSeconds > firstOnTime) ?? null;
      const playedSeconds = playedSecondsByPlayer.get(playerId) || 0;
      const isCurrentlyOnField = currentOnFieldPlayerIds.has(playerId);

      let status: PlayerComplianceStatus;
      if (playedSeconds >= requiredSeconds) {
        status = 'pass';
      } else if (isCurrentlyOnField) {
        status = isMatchComplete ? 'fail' : 'pending';
      } else {
        status = 'fail';
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
    currentOnFieldPlayerIds: uniqueIds(currentOnFieldPlayerIds),
    playedPlayerIds: uniqueIds(playedPlayerIds),
    eventSnapshots,
  };
}

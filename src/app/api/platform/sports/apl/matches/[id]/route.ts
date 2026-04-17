import { NextResponse } from 'next/server';
import { strapiDelete, strapiGet, strapiPut } from '@/lib/apis/strapi';
import { auth } from '@/auth';
import { convertISTDateTimeLocalToISOString } from '@/lib/date-utils';
import {
  buildOrderedKnockoutRoundMap,
  createRecordFromStrapiMatch,
  getNextRoundTarget,
  isKnockoutRound,
  resolveKnockoutWinner,
  type KnockoutRound,
} from '@/lib/apl-knockout';

export const dynamic = 'force-dynamic';

const extractTeamId = (value: any): string => {
  if (!value) return '';

  const candidate = value?.data?.id ?? value?.id ?? value?.documentId ?? value;
  return typeof candidate === 'string' || typeof candidate === 'number' ? candidate.toString() : '';
};

const removeMatchNumberFromPayload = (payload: any) => {
  if (!payload || typeof payload !== 'object') return payload;
  const rest = { ...payload };
  delete rest.match_number;
  return rest;
};

const extractStrapiValidationMessage = (responseData: any): string | null => {
  const directMessage = responseData?.error?.message;
  if (typeof directMessage === 'string' && directMessage.trim()) {
    return directMessage;
  }

  const detailErrors = responseData?.error?.details?.errors;
  if (Array.isArray(detailErrors) && detailErrors.length > 0) {
    const firstMessage = detailErrors
      .map((error: any) => {
        const pathLabel = Array.isArray(error?.path) ? error.path.join('.') : error?.path;
        const message = typeof error?.message === 'string' ? error.message.trim() : '';
        if (!message) return '';
        return pathLabel ? `${pathLabel}: ${message}` : message;
      })
      .find((message: string) => Boolean(message));

    if (firstMessage) {
      return firstMessage;
    }
  }

  return null;
};

const buildProxyErrorResponse = (error: any) => {
  const responseStatus = error?.response?.status;
  const responseData = error?.response?.data;
  const serializedError = JSON.stringify(responseData || '').toLowerCase();
  const message = extractStrapiValidationMessage(responseData);

  if (
    serializedError.includes('match_number')
    && (serializedError.includes('unique') || serializedError.includes('constraint'))
  ) {
    return NextResponse.json(
      { error: 'Match number conflict while auto-assigning. Please try creating the match again.' },
      { status: 409 }
    );
  }

  if (typeof message === 'string' && message.trim() && responseStatus >= 400 && responseStatus < 500) {
    return NextResponse.json({ error: message }, { status: responseStatus });
  }

  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
};

const normalizeMatchPayload = (payload: any) => {
  if (!payload || typeof payload !== 'object') return payload;

  const payloadWithoutMatchNumber = removeMatchNumberFromPayload(payload);

  const normalizedStartTime = typeof payloadWithoutMatchNumber.start_time === 'string'
    ? convertISTDateTimeLocalToISOString(payloadWithoutMatchNumber.start_time)
    : payloadWithoutMatchNumber.start_time;

  const normalizedDetails = normalizeDetailsPayload(payloadWithoutMatchNumber.details);

  return {
    ...payloadWithoutMatchNumber,
    ...(normalizedStartTime ? { start_time: normalizedStartTime } : {}),
    ...(normalizedDetails ? { details: normalizedDetails } : {}),
  };
};

const normalizeKnockoutWinnerId = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

const normalizeDetailsPayload = (details: any) => {
  if (!details || typeof details !== 'object') return details;

  const winnerId = normalizeKnockoutWinnerId(details.knockout_winner_team_id);
  return {
    ...details,
    knockout_winner_team_id: winnerId,
  };
};

const listMatchesForKnockoutPropagation = async () => {
  const query = [
    'pagination[limit]=-1',
    'fields[0]=round',
    'fields[1]=status',
    'fields[2]=team_a_score',
    'fields[3]=team_b_score',
    'fields[4]=match_number',
    'fields[5]=details',
    'populate[team_a][fields][0]=id',
    'populate[team_b][fields][0]=id',
  ].join('&');

  const response = await strapiGet('/apl-matches', query);
  return Array.isArray(response?.data) ? response.data : [];
};

const findMatchRoundIndex = (roundMap: Record<KnockoutRound, any[]>, matchId: number) => {
  const roundEntries = Object.entries(roundMap) as Array<[KnockoutRound, any[]]>;
  for (const [round, matches] of roundEntries) {
    const index = matches.findIndex((record) => Number(record.id) === matchId);
    if (index >= 0) {
      return { round, index };
    }
  }

  return null;
};

const propagateKnockoutWinnersFromMatch = async (seedMatchId: number) => {
  const rawMatches = await listMatchesForKnockoutPropagation();
  const roundMap = buildOrderedKnockoutRoundMap(rawMatches);

  const byId = new Map<number, any>();
  (Object.values(roundMap).flat() as any[]).forEach((record: any) => {
    byId.set(Number(record.id), record);
  });

  const queue: number[] = [seedMatchId];
  const visited = new Set<number>();

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId || visited.has(currentId)) continue;
    visited.add(currentId);

    const currentRecord = byId.get(currentId);
    if (!currentRecord) continue;

    const currentPosition = findMatchRoundIndex(roundMap, currentId);
    if (!currentPosition) continue;

    const target = getNextRoundTarget(currentPosition.round, currentPosition.index);
    if (!target) continue;

    const targetRoundRecords = roundMap[target.round] || [];
    const nextRecord = targetRoundRecords[target.index];
    if (!nextRecord) continue;

    const winner = resolveKnockoutWinner(currentRecord);
    const desiredTeamId = winner.winnerTeamId || '';
    const currentTargetTeamId = target.slot === 'team_a' ? nextRecord.teamAId : nextRecord.teamBId;

    if (currentTargetTeamId === desiredTeamId) {
      queue.push(Number(nextRecord.id));
      continue;
    }

    await strapiPut(`/apl-matches/${nextRecord.id}`, {
      data: {
        [target.slot]: desiredTeamId ? { id: Number(desiredTeamId) } : null,
      },
    });

    if (target.slot === 'team_a') {
      nextRecord.teamAId = desiredTeamId;
    } else {
      nextRecord.teamBId = desiredTeamId;
    }

    queue.push(Number(nextRecord.id));
  }
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const populateQuery = `populate[team_a][populate][0]=participants&populate[team_a][populate][1]=logo&populate[team_b][populate][0]=participants&populate[team_b][populate][1]=logo&populate[goal_events][populate][0]=scorer&populate[card_events][populate][0]=player&populate[save_events][populate][0]=goalkeeper&populate[substitution_events][populate][0]=player_off&populate[substitution_events][populate][1]=player_on`;
    const data = await strapiGet(`/apl-matches/${id}`, populateQuery);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user?.access?.includes('apl_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const incomingData = body && typeof body === 'object' && 'data' in body ? body.data : body;

    const existingMatch = await strapiGet(`/apl-matches/${id}`);
    const existingAttrs = existingMatch?.data?.attributes || {};

    const normalizedIncomingData = normalizeMatchPayload(incomingData);

    const teamAId = extractTeamId(normalizedIncomingData?.team_a) || extractTeamId(existingAttrs?.team_a);
    const teamBId = extractTeamId(normalizedIncomingData?.team_b) || extractTeamId(existingAttrs?.team_b);
    if (teamAId && teamBId && teamAId === teamBId) {
      return NextResponse.json({ error: 'Team A and Team B must be different' }, { status: 400 });
    }
    
    // Merge nested details logic to avoid overwriting existing json sub-fields (date, time, arena, etc.)
    const mergedData = { ...normalizedIncomingData };
    const existingDetails = existingAttrs?.details || {};
    if (normalizedIncomingData?.details) {
      mergedData.details = { ...existingDetails, ...normalizedIncomingData.details };
    }

    const effectiveRound = (mergedData.round ?? existingAttrs.round ?? '').toString();
    const effectiveType = (mergedData.type ?? existingAttrs.type ?? '').toString();
    const isKnockoutMatch = isKnockoutRound(effectiveRound, effectiveType);

    if (isKnockoutMatch) {
      const syntheticMatch = {
        id: Number(id),
        attributes: {
          round: effectiveRound,
          status: mergedData.status ?? existingAttrs.status,
          team_a_score: mergedData.team_a_score ?? existingAttrs.team_a_score,
          team_b_score: mergedData.team_b_score ?? existingAttrs.team_b_score,
          match_number: mergedData.match_number ?? existingAttrs.match_number,
          team_a: mergedData.team_a ?? existingAttrs.team_a,
          team_b: mergedData.team_b ?? existingAttrs.team_b,
          details: mergedData.details ?? existingDetails,
        },
      };

      const knockoutRecord = createRecordFromStrapiMatch(syntheticMatch);
      if (knockoutRecord) {
        const winnerResolution = resolveKnockoutWinner(knockoutRecord);
        if (winnerResolution.reason === 'tie_requires_manual_winner') {
          return NextResponse.json(
            { error: 'Completed knockout matches with tied scores require a manual winner.' },
            { status: 400 }
          );
        }
      }
    }

    if (Object.prototype.hasOwnProperty.call(mergedData, 'match_number')) {
      delete mergedData.match_number;
    }

    const data = await strapiPut(`/apl-matches/${id}`, { data: mergedData });

    if (isKnockoutMatch) {
      await propagateKnockoutWinnersFromMatch(Number(id));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', {
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data,
    });
    return buildProxyErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user?.access?.includes('apl_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const data = await strapiDelete(`/apl-matches/${id}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

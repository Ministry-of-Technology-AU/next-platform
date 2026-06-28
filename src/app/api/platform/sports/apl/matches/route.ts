import { NextResponse } from 'next/server';
import { strapiGet, strapiPost } from '@/lib/apis/strapi';
import { convertISTDateTimeLocalToISOString } from '@/lib/date-utils';
import { createRecordFromStrapiMatch, isKnockoutRound, resolveKnockoutWinner } from '@/lib/apl-knockout';

export const dynamic = 'force-dynamic';
import { auth } from '@/auth';

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

const toPositiveInteger = (value: unknown): number | null => {
  if (typeof value === 'string' && value.trim() === '') return null;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

const isMatchNumberProvided = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
};

const getNextMatchNumber = async (): Promise<number> => {
  const response = await strapiGet('/apl-matches', 'fields[0]=match_number&pagination[limit]=-1');
  const matches = Array.isArray(response?.data) ? response.data : [];

  let maxMatchNumber = 0;
  for (const match of matches) {
    const matchNumber = toPositiveInteger(match?.attributes?.match_number ?? match?.match_number);
    if (matchNumber !== null && matchNumber > maxMatchNumber) {
      maxMatchNumber = matchNumber;
    }
  }

  return maxMatchNumber + 1;
};

const MAX_MATCH_NUMBER_RETRIES = 3;

const isMatchNumberConflictError = (error: any): boolean => {
  const responseStatus = error?.response?.status;
  const serializedError = JSON.stringify(error?.response?.data || '').toLowerCase();

  if (responseStatus === 409 && serializedError.includes('match_number')) {
    return true;
  }

  return (
    serializedError.includes('match_number')
    && (
      serializedError.includes('unique')
      || serializedError.includes('constraint')
      || serializedError.includes('already exists')
    )
  );
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
    && (
      serializedError.includes('unique')
      || serializedError.includes('constraint')
      || serializedError.includes('already exists')
    )
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // Optional filter for Live, Upcoming, Past
  const limit = searchParams.get('limit') || '-1';
  const sort = searchParams.get('sort') || 'start_time:asc';
  const includeTeamLogos = searchParams.get('includeTeamLogos') !== 'false';
  
  try {
    const queryParts = [
      `pagination[limit]=${limit}`,
      `sort[0]=${sort}`,
    ];

    if (includeTeamLogos) {
      queryParts.push('populate[team_a][populate][0]=logo');
      queryParts.push('populate[team_b][populate][0]=logo');
    }

    const query = queryParts.join('&');
    const filterQuery = status ? `&filters[status][$eq]=${status}` : '';

    const data = await strapiGet(`/apl-matches`, query + filterQuery);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user?.access?.includes('apl_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const payload = body && typeof body === 'object' && 'data' in body ? body.data : body;
    const requestedMatchNumber = toPositiveInteger(payload?.match_number);
    const hasRequestedMatchNumber = isMatchNumberProvided(payload?.match_number);

    const normalizedPayload = normalizeMatchPayload(payload);

    const teamAId = extractTeamId(normalizedPayload?.team_a);
    const teamBId = extractTeamId(normalizedPayload?.team_b);
    if (teamAId && teamBId && teamAId === teamBId) {
      return NextResponse.json({ error: 'Team A and Team B must be different' }, { status: 400 });
    }

    if (hasRequestedMatchNumber && requestedMatchNumber === null) {
      return NextResponse.json({ error: 'Match number must be a positive integer' }, { status: 400 });
    }

    const knockoutRound = (normalizedPayload?.round || '').toString();
    const knockoutType = (normalizedPayload?.type || '').toString();
    if (isKnockoutRound(knockoutRound, knockoutType)) {
      const syntheticMatch = {
        id: 0,
        attributes: {
          ...normalizedPayload,
          team_a: normalizedPayload.team_a,
          team_b: normalizedPayload.team_b,
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

    if (requestedMatchNumber !== null) {
      const data = await strapiPost('/apl-matches', {
        data: {
          ...normalizedPayload,
          match_number: requestedMatchNumber,
        },
      });

      return NextResponse.json(data);
    }

    // Retry a few times if another request claims the same auto-assigned number first.
    for (let attempt = 1; attempt <= MAX_MATCH_NUMBER_RETRIES; attempt += 1) {
      const nextMatchNumber = await getNextMatchNumber();

      try {
        const data = await strapiPost('/apl-matches', {
          data: {
            ...normalizedPayload,
            match_number: nextMatchNumber,
          },
        });

        return NextResponse.json(data);
      } catch (error) {
        const shouldRetry = isMatchNumberConflictError(error) && attempt < MAX_MATCH_NUMBER_RETRIES;
        if (!shouldRetry) {
          throw error;
        }
      }
    }

    throw new Error('Failed to auto-assign match number after retries');
  } catch (error) {
    console.error('API proxy error:', {
      status: (error as any)?.response?.status,
      data: (error as any)?.response?.data,
    });
    return buildProxyErrorResponse(error);
  }
}
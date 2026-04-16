import { NextResponse } from 'next/server';
import { strapiGet, strapiPost } from '@/lib/apis/strapi';
import { convertISTDateTimeLocalToISOString } from '@/lib/date-utils';

export const dynamic = 'force-dynamic';
import { auth } from '@/auth';

const extractTeamId = (value: any): string => {
  if (!value) return '';

  const candidate = value?.data?.id ?? value?.id ?? value?.documentId ?? value;
  return typeof candidate === 'string' || typeof candidate === 'number' ? candidate.toString() : '';
};

const removeMatchNumberFromPayload = (payload: any) => {
  if (!payload || typeof payload !== 'object') return payload;
  const { match_number: _ignoredMatchNumber, ...rest } = payload;
  return rest;
};

const toPositiveInteger = (value: unknown): number | null => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
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

const buildProxyErrorResponse = (error: any) => {
  const responseStatus = error?.response?.status;
  const responseData = error?.response?.data;
  const serializedError = JSON.stringify(responseData || '').toLowerCase();
  const message = responseData?.error?.message;

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

  return {
    ...payloadWithoutMatchNumber,
    ...(normalizedStartTime ? { start_time: normalizedStartTime } : {}),
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // Optional filter for Live, Upcoming, Past
  
  try {
    const query = `populate[team_a][populate][0]=logo&populate[team_b][populate][0]=logo&pagination[limit]=-1&sort[0]=start_time:asc`;
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

    const normalizedPayload = normalizeMatchPayload(payload);

    const teamAId = extractTeamId(normalizedPayload?.team_a);
    const teamBId = extractTeamId(normalizedPayload?.team_b);
    if (teamAId && teamBId && teamAId === teamBId) {
      return NextResponse.json({ error: 'Team A and Team B must be different' }, { status: 400 });
    }

    const nextMatchNumber = await getNextMatchNumber();
    const data = await strapiPost('/apl-matches', {
      data: {
        ...normalizedPayload,
        match_number: nextMatchNumber,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return buildProxyErrorResponse(error);
  }
}
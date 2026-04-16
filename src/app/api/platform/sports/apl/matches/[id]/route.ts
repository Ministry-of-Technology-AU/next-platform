import { NextResponse } from 'next/server';
import { strapiDelete, strapiGet, strapiPut } from '@/lib/apis/strapi';
import { auth } from '@/auth';
import { convertISTDateTimeLocalToISOString } from '@/lib/date-utils';

export const dynamic = 'force-dynamic';

const extractTeamId = (value: any): string => {
  if (!value) return '';

  const candidate = value?.data?.id ?? value?.id ?? value?.documentId ?? value;
  return typeof candidate === 'string' || typeof candidate === 'number' ? candidate.toString() : '';
};

const normalizeMatchPayload = (payload: any) => {
  if (!payload || typeof payload !== 'object') return payload;

  const normalizedStartTime = typeof payload.start_time === 'string'
    ? convertISTDateTimeLocalToISOString(payload.start_time)
    : payload.start_time;

  return {
    ...payload,
    ...(normalizedStartTime ? { start_time: normalizedStartTime } : {}),
  };
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const populateQuery = `populate[team_a][populate][0]=participants&populate[team_a][populate][1]=logo&populate[team_b][populate][0]=participants&populate[team_b][populate][1]=logo&populate[goal_events][populate][0]=scorer&populate[goal_events][populate][1]=assister&populate[card_events][populate][0]=player&populate[save_events][populate][0]=goalkeeper&populate[substitution_events][populate][0]=player_off&populate[substitution_events][populate][1]=player_on`;
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

    const normalizedIncomingData = normalizeMatchPayload(incomingData);

    const teamAId = extractTeamId(normalizedIncomingData?.team_a);
    const teamBId = extractTeamId(normalizedIncomingData?.team_b);
    if (teamAId && teamBId && teamAId === teamBId) {
      return NextResponse.json({ error: 'Team A and Team B must be different' }, { status: 400 });
    }
    
    // Merge nested details logic to avoid overwriting existing json sub-fields (date, time, arena, etc.)
    let mergedData = { ...normalizedIncomingData };
    if (normalizedIncomingData?.details) {
      const existingMatch = await strapiGet(`/apl-matches/${id}`);
      const existingDetails = existingMatch?.data?.attributes?.details || {};
      mergedData.details = { ...existingDetails, ...normalizedIncomingData.details };
    }

    const data = await strapiPut(`/apl-matches/${id}`, { data: mergedData });

    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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

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

    const data = await strapiPost('/apl-matches', { data: normalizedPayload });

    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
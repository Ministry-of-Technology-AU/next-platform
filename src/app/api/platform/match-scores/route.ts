import { NextResponse } from 'next/server';
import { strapiGet } from '@/lib/apis/strapi';
import { MatchScore } from '@/app/platform/match-scores/types';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  try {
    const res = await strapiGet('/match-scores', {
      populate: '*',
      sort: ['date:desc'],
      filters: {
        match_status: {
          $eq: 'live'
        }
      },
      pagination: { limit: 100 }
    });

    if (!res?.data) {
      console.error('No data returned from Strapi');
      return NextResponse.json([], { status: 500 });
    }

    const matches: MatchScore[] = res.data.map((d: any) => ({
      id: d.id,
      ...d.attributes,
    }));

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Failed to fetch match scores:', error);
    return NextResponse.json([], { status: 500 });
  }
}
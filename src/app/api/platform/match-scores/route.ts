import { NextResponse } from 'next/server';
import { strapiGet } from '@/lib/apis/strapi';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  try {
    console.log('Fetching match scores from Strapi...');
    const res = await strapiGet('/match-scores', {
      populate: '*',
      sort: ['date:desc'],
      pagination: { limit: 20 }
    });

    console.log('Raw Strapi response:', res);

    if (!res?.data) {
      console.error('No data returned from Strapi');
      return NextResponse.json([], { status: 500 });
    }

    const data = res.data.map((d: any) => ({
      id: d.id,
      ...d.attributes,
    }));

    console.log('Processed match scores:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch match scores:', error);
    return NextResponse.json([], { status: 500 });
  }
}
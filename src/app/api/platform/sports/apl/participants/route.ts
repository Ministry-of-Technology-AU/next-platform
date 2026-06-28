import { NextResponse } from 'next/server';
import { strapiGet } from '@/lib/apis/strapi';

function normalizePriceToMillions(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  if (numeric <= 0) return 0;

  // Backward compatibility: if value looks like rupees, convert to millions.
  if (numeric >= 1000) {
    return Number((numeric / 1_000_000).toFixed(2));
  }

  return Number(numeric.toFixed(2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '500';

  try {
    const query = [
      'populate[team][populate][0]=logo',
      'populate[user]=profile_url',
      `pagination[limit]=${limit}`,
      'sort[0]=tier:asc',
      'sort[1]=name:asc',
    ].join('&');

    const data = await strapiGet('/apl-participants', query);
    const normalizedData = {
      ...data,
      data: (data?.data || []).map((entry: any) => ({
        ...entry,
        attributes: {
          ...entry?.attributes,
          sold_at: normalizePriceToMillions(entry?.attributes?.sold_at),
        },
      })),
    };

    return NextResponse.json(normalizedData);
  } catch (error) {
    console.error('APL participants API proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { strapiGet } from '@/lib/apis/strapi';

interface AuctionRecord {
  serialNo: number;
  name: string;
  category: string;
  team: string;
  price: number;
}

function normalizeTier(value: unknown): string {
  if (value === null || value === undefined) return '4';
  const raw = String(value).trim().toLowerCase();
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits) return digits;
  return raw || '4';
}

export async function GET() {
  try {
    const query = [
      'populate[team][populate][0]=logo',
      'filters[sold_at][$notNull]=true',
      'pagination[limit]=-1',
      'sort[0]=updatedAt:desc',
      'sort[1]=name:asc',
    ].join('&');

    const payload = await strapiGet('/apl-participants', query);
    const rows = (payload?.data || []) as any[];

    const normalized: AuctionRecord[] = rows.map((entry, index) => ({
      serialNo: index + 1,
      name: entry.attributes?.name || `Player ${entry.id}`,
      category: normalizeTier(entry.attributes?.tier),
      team: entry.attributes?.team?.data?.attributes?.name || 'Unassigned',
      price: Number(entry.attributes?.sold_at || 0),
    }));

    return NextResponse.json({ data: normalized });
  } catch (error) {
    console.error('APL auction results API proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

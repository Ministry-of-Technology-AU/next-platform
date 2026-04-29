import { NextResponse } from 'next/server';
import { strapiGet } from '@/lib/apis/strapi';

export async function GET() {
  try {
    const data = await strapiGet('/apl-teams', 'populate=logo&pagination[limit]=-1&sort[0]=name:asc');
    return NextResponse.json(data);
  } catch (error) {
    console.error('APL teams API proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

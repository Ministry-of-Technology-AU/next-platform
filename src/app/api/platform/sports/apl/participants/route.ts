import { NextResponse } from 'next/server';
import { strapiGet } from '@/lib/apis/strapi';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '500';

  try {
    const query = [
      'populate[team][populate][0]=logo',
      `pagination[limit]=${limit}`,
      'sort[0]=tier:asc',
      'sort[1]=name:asc',
    ].join('&');

    const data = await strapiGet('/apl-participants', query);
    return NextResponse.json(data);
  } catch (error) {
    console.error('APL participants API proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

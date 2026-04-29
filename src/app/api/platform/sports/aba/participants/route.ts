import { NextResponse } from 'next/server';
import { strapiGet } from '@/lib/apis/strapi';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';

    const data = await strapiGet('/aba-participants', {
      populate: 'team',
      sort: ['points_scored:desc'],
      'pagination[limit]': limit
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

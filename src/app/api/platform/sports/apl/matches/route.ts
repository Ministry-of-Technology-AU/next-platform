import { NextResponse } from 'next/server';
import { strapiGet, strapiPost } from '@/lib/apis/strapi';

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
    const body = await request.json();
    const data = await strapiPost('/apl-matches', { data: body });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { strapiGet, strapiPost } from '@/lib/apis/strapi';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // Optional filter for Live, Upcoming, Past
  
  try {
    const query: any = { populate: '*' };
    if (status) {
       query.filters = { status: { $eq: status } };
    }

    const data = await strapiGet('/aba-matches', query);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await strapiPost('/aba-matches', { data: body });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { strapiGet } from '@/lib/apis/strapi';

export async function GET(request: Request) {
  try {
    const data = await strapiGet('/aba-teams?populate=*');
    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

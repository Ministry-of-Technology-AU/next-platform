import { NextResponse } from 'next/server';
import { strapiGet, strapiPut } from '@/lib/apis/strapi';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const populateQuery = `populate[team_a][populate][0]=members&populate[team_a][populate][1]=logo&populate[team_b][populate][0]=members&populate[team_b][populate][1]=logo`;
    const data = await strapiGet(`/apl-matches/${id}`, populateQuery);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Merge nested details logic to avoid overwriting existing json sub-fields (date, time, arena, etc.)
    let mergedData = { ...body };
    if (body.details) {
      const existingMatch = await strapiGet(`/apl-matches/${id}`);
      const existingDetails = existingMatch?.data?.attributes?.details || {};
      mergedData.details = { ...existingDetails, ...body.details };
    }

    const data = await strapiPut(`/apl-matches/${id}`, { data: mergedData });
    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
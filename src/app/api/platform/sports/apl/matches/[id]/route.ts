import { NextResponse } from 'next/server';
import { strapiDelete, strapiGet, strapiPut } from '@/lib/apis/strapi';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const populateQuery = `populate[team_a][populate][0]=members&populate[team_a][populate][1]=logo&populate[team_b][populate][0]=members&populate[team_b][populate][1]=logo&populate[goal_events][populate][0]=scorer&populate[goal_events][populate][1]=assister&populate[card_events][populate][0]=player&populate[save_events][populate][0]=goalkeeper&populate[substitution_events][populate][0]=player_off&populate[substitution_events][populate][1]=player_on`;
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
    const incomingData = body && typeof body === 'object' && 'data' in body ? body.data : body;
    
    // Merge nested details logic to avoid overwriting existing json sub-fields (date, time, arena, etc.)
    let mergedData = { ...incomingData };
    if (incomingData?.details) {
      const existingMatch = await strapiGet(`/apl-matches/${id}`);
      const existingDetails = existingMatch?.data?.attributes?.details || {};
      mergedData.details = { ...existingDetails, ...incomingData.details };
    }

    const data = await strapiPut(`/apl-matches/${id}`, { data: mergedData });

    return NextResponse.json(data);
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await strapiDelete(`/apl-matches/${id}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

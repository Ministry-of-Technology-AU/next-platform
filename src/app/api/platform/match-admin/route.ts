import { NextResponse } from 'next/server';
import { strapiGet, strapiPut, strapiPost, strapiDelete } from '@/lib/apis/strapi';

export async function GET() {
  try {
    const res = await strapiGet('/match-scores', {
      populate: ['team_a_logo', 'team_b_logo'],
      sort: ['date:desc'],
      pagination: { limit: 200 },
    });
    const data = res?.data?.map((d: any) => ({
      id: d.id,
      ...d.attributes,
    })) || [];
    return NextResponse.json(data);
  } catch (err) {
    console.error('❌ Failed to fetch matches:', err);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, data } = await request.json();
    const res = await strapiPut(`/match-scores/${id}`, { data });
    return NextResponse.json(res.data);
  } catch (err) {
    console.error('Failed to update match:', err);
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await strapiDelete(`/match-scores/${id}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete match:', err);
    return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { strapiGet, strapiPut, strapiPost, strapiDelete } from '@/lib/apis/strapi';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337/api';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const jsonData = JSON.parse(formData.get('data') as string);
    
    // First create the match record
    const matchResponse = await fetch(`${STRAPI_URL}/match-scores`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: jsonData })
    });

    if (!matchResponse.ok) {
      throw new Error('Failed to create match record');
    }

    const match = await matchResponse.json();
    const matchId = match.data.id;

    // Handle logo uploads if present
    const uploadPromises = [];

    // Team A Logo
    const teamALogo = formData.get('files.team_a_logo') as File;
    if (teamALogo) {
      const logoFormData = new FormData();
      logoFormData.append('files', teamALogo);
      logoFormData.append('ref', 'api::match-score.match-score');
      logoFormData.append('refId', matchId.toString());
      logoFormData.append('field', 'team_a_logo');

      uploadPromises.push(
        fetch(`${STRAPI_URL.replace('/api', '')}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STRAPI_TOKEN}`,
          },
          body: logoFormData
        })
      );
    }

    // Team B Logo
    const teamBLogo = formData.get('files.team_b_logo') as File;
    if (teamBLogo) {
      const logoFormData = new FormData();
      logoFormData.append('files', teamBLogo);
      logoFormData.append('ref', 'api::match-score.match-score');
      logoFormData.append('refId', matchId.toString());
      logoFormData.append('field', 'team_b_logo');

      uploadPromises.push(
        fetch(`${STRAPI_URL.replace('/api', '')}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${STRAPI_TOKEN}`,
          },
          body: logoFormData
        })
      );
    }

    // Wait for all uploads to complete
    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    }

    // Fetch the final match data with populated logos
    const finalMatch = await fetch(`${STRAPI_URL}/match-scores/${matchId}?populate=*`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
      },
    }).then(res => res.json());

    return NextResponse.json(finalMatch);
  } catch (error) {
    console.error('Failed to create match:', error);
    return NextResponse.json(
      { error: 'Failed to create match' },
      { status: 500 }
    );
  }
}

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
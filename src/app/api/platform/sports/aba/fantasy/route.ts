import { NextResponse } from 'next/server';
import { strapiGet, strapiPut } from '@/lib/apis/strapi';
import { requireAuth } from '@/lib/auth';
import { getUserIdByEmail } from '@/lib/userid';

const FANTASY_OPEN = process.env.ABA_FANTASY_OPEN === 'true';

export async function GET() {
  const authResult = await requireAuth(['platform']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const users = await strapiGet('/users', {
      filters: { email: { $eq: user.email } },
      populate: 'fantasy_teams'
    });

    const strapiUser = Array.isArray(users) ? users[0] : null;
    const fantasyTeams: any[] = strapiUser?.fantasy_teams ?? [];

    return NextResponse.json({ data: fantasyTeams });
  } catch (error) {
    console.error('Fantasy GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authResult = await requireAuth(['platform']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  if (!FANTASY_OPEN) {
    return NextResponse.json({ error: 'Fantasy selections are closed' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { playerIds } = body;

    if (!Array.isArray(playerIds) || playerIds.length !== 6) {
      return NextResponse.json({ error: 'You must select exactly 6 players' }, { status: 400 });
    }

    const unique = new Set(playerIds);
    if (unique.size !== 6) {
      return NextResponse.json({ error: 'All 6 players must be unique' }, { status: 400 });
    }

    // Check if user already has a team saved
    const users = await strapiGet('/users', {
      filters: { email: { $eq: user.email } },
      populate: 'fantasy_teams'
    });

    const strapiUser = Array.isArray(users) ? users[0] : null;
    if (!strapiUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (strapiUser.fantasy_teams?.length > 0) {
      return NextResponse.json({ error: 'You have already saved your fantasy team' }, { status: 409 });
    }

    const userId = await getUserIdByEmail(user.email);
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await strapiPut(`/users/${userId}`, {
      fantasy_teams: playerIds
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fantasy POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

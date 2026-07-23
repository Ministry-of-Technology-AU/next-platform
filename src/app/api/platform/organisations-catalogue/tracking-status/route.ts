import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { strapiGet } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';

/**
 * GET /api/platform/organisations-catalogue/tracking-status
 * Returns the set of organisation IDs the current user is tracking
 * via their `track_deadline_fors` relation.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = await getUserIdByEmail(session.user.email);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch the user with their track_deadline_fors relation populated
    const userData = await strapiGet(`/users/${userId}`, {
      populate: {
        track_deadline_fors: {
          fields: ['id'],
        },
      },
    });

    // Extract tracked org IDs from the relation
    let trackedOrgIds: string[] = [];

    if (userData?.track_deadline_fors) {
      // Strapi v4 users-permissions returns relations as flat arrays (not wrapped in data)
      const trackData = userData.track_deadline_fors;
      if (Array.isArray(trackData)) {
        trackedOrgIds = trackData.map((org: any) => {
          // Could be { id: N } or { id: N, attributes: {...} }
          const orgId = org.id ?? org;
          return String(orgId);
        });
      }
    }

    return NextResponse.json({
      success: true,
      trackedOrgIds,
    });
  } catch (error) {
    console.error('Error fetching tracking status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tracking status' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { strapiGet } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';

export async function GET() {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }
    const userEmail = session.user.email;
    // Look up the user ID in Strapi
    const userId = await getUserIdByEmail(userEmail);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    // Fetch user by ID, include checklist field (orgs_checklist)
    const userData = await strapiGet(`/users/${userId}`, {
      // Add/check field here as it appears on Strapi
      fields: ['id', 'email', 'orgs_checklist'],
    });
    let checklist = [];
    if (userData?.orgs_checklist && Array.isArray(userData.orgs_checklist)) {
      checklist = userData.orgs_checklist;
    } else if (typeof userData?.orgs_checklist === 'string') {
      try {
        checklist = JSON.parse(userData.orgs_checklist);
      } catch {
        checklist = [];
      }
    }
    return NextResponse.json({ success: true, checklist });
  } catch (error) {
    console.error('Error fetching user checklist:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch checklist' }, { status: 500 });
  }
}

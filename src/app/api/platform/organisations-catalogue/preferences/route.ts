import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { strapiPut } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    const { preferences } = await request.json();

    if (!preferences) {
      return NextResponse.json(
        { success: false, error: 'Preferences data is required' },
        { status: 400 }
      );
    }

    // Get the user's Strapi ID
    const userId = await getUserIdByEmail(userEmail);

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user's filter preferences in Strapi
    const response = await strapiPut(`/users/${userId}`, {
      orgs_catalogue_filter_preferences: preferences,
    });

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error saving filter preferences:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save preferences'
      },
      { status: 500 }
    );
  }
}

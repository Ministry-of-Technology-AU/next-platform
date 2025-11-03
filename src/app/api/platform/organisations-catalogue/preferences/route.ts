import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { strapiPut, strapiGet } from '@/lib/apis/strapi';
import { getUserIdByEmail } from '@/lib/userid';

// Default preferences structure
const getDefaultPreferences = () => ({
  selectedOrganizations: [],
  selectedCategories: ['clubs', 'societies', 'departments', 'ministries', 'others'],
  categoryColors: {
    clubs: "#FF5A5F",
    societies: "#0088CC", 
    departments: "#FFA500",
    ministries: "#8A2BE2",
    others: "#3CB371",
  },
});

export async function GET() {
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
    
    // Get the user's Strapi ID
    const userId = await getUserIdByEmail(userEmail);
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch user preferences from Strapi
    const userData = await strapiGet(`/users/${userId}`, {
      fields: ['id', 'email', 'orgs_catalogue_filter_preferences'],
    });

    let preferences = getDefaultPreferences();
    
    if (userData?.orgs_catalogue_filter_preferences) {
      // Merge with defaults to ensure all fields exist
      preferences = {
        ...preferences,
        ...userData.orgs_catalogue_filter_preferences,
      };
    }

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch preferences'
      },
      { status: 500 }
    );
  }
}

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
    const { preferences, checklist } = await request.json();

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

    // Prepare update body (update filter preferences and checklist)
    const body = {
      orgs_catalogue_filter_preferences: preferences,
      orgs_checklist: checklist || [],
    };
    // Save both to Strapi
    const response = await strapiPut(`/users/${userId}`, body);
    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error saving filter preferences/checklist:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save preferences/checklist'
      },
      { status: 500 }
    );
  }
}

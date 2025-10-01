"use server";
import { NextRequest, NextResponse } from 'next/server';
import { strapiGet, strapiPut } from '@/lib/apis/strapi';

// Define the interface for events calendar filter preferences
interface EventsCalendarPreferences {
  selectedOrganizations: string[];
  selectedCategories: string[];
  categoryColors: Record<string, string>;
}

/**
 * GET handler for /api/events/preferences
 * Returns the user's event calendar preferences
 */
export async function GET(request: NextRequest) {
  try {
    // For now, hardcode the user ID as 1
    const userId = 1;
    
    // Fetch the user's preferences from Strapi
    const userData = await strapiGet(`/users/${userId}`, {
      fields: ['id', 'username', 'events_calendar_filter_preferences'],
    });
    
    let preferences: EventsCalendarPreferences | null = null;
    
    // Check if the user has saved preferences
    if (userData.events_calendar_filter_preferences) {
      try {
        // Try to parse if it's a JSON string
        if (typeof userData.events_calendar_filter_preferences === 'string') {
          preferences = JSON.parse(userData.events_calendar_filter_preferences);
        } else {
          // If it's already an object, use it directly
          preferences = userData.events_calendar_filter_preferences;
        }
        
        // Validate that the preferences match our expected format
        if (!validatePreferences(preferences)) {
          console.log('Invalid preferences format, resetting to default');
          preferences = null;
        }
      } catch (error) {
        console.error('Error parsing preferences:', error);
        preferences = null;
      }
    }
    
    // Return the preferences or default values
    return NextResponse.json({ 
      success: true, 
      data: preferences || getDefaultPreferences()
    });
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for /api/events/preferences
 * Saves the user's event calendar preferences
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { preferences } = body;
    
    // Validate the preferences
    if (!validatePreferences(preferences)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid preferences format" 
        },
        { status: 400 }
      );
    }
    
    // For now, hardcode the user ID as 1
    const userId = 1;
    
    // Save the preferences to Strapi
    await strapiPut(`/users/${userId}`, {
      events_calendar_filter_preferences: preferences
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Preferences saved successfully"
    });
  } catch (error) {
    console.error("Error saving user preferences:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * Validates that the preferences object has the expected structure
 */
function validatePreferences(preferences: any): preferences is EventsCalendarPreferences {
  return (
    preferences &&
    Array.isArray(preferences.selectedOrganizations) &&
    Array.isArray(preferences.selectedCategories) &&
    typeof preferences.categoryColors === 'object'
  );
}

/**
 * Returns default preferences for a new user
 */
function getDefaultPreferences(): EventsCalendarPreferences {
  return {
    selectedOrganizations: [], // Empty array means all organizations
    selectedCategories: ["clubs", "societies", "departments", "ministries", "others"], // All categories selected by default
    categoryColors: {
      clubs: "#FF5A5F",
      societies: "#0088CC",
      departments: "#FFA500",
      ministries: "#8A2BE2",
      others: "#3CB371",
    },
  };
}

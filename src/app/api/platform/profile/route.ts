import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { strapiGet, strapiPut } from "@/lib/apis/strapi";
import { getUserIdByEmail } from "@/lib/userid";
import { ProfileUpdateRequest, ProfileApiResponse, validatePhoneNumber } from "@/app/platform/profile/types";

export async function GET() {
  try {
    // Get the authenticated session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("[PROFILE API] Getting profile for email:", session.user.email);

    // Get user ID from Strapi
    const userId = await getUserIdByEmail(session.user.email);
    if (!userId) {
      // If user doesn't exist in Strapi, return session data only
      return NextResponse.json({
        success: true,
        data: {
          email: session.user.email,
          username: session.user.name,
          profile_image: session.user.image,
          // Set defaults for missing Strapi fields
          phone_number: null,
          batch: null,
          verified: false,
        },
        source: "session-only"
      });
    }

    // Fetch user data from Strapi
    console.log("[PROFILE API] Fetching user data for ID:", userId);
    const userData = await strapiGet(`/users/${userId}`, {
      populate: '*'
    });

    // Check for different possible phone field names
    const phoneValue = userData.phone_number || userData.phone || userData.phoneNumber || null;

    // Merge session data with Strapi data
    const profileData = {
      id: userData.id,
      email: session.user.email,
      username: userData.username || session.user.name,
      profile_image: session.user.image || userData.profile_image,
      phone_number: phoneValue,
      batch: userData.batch || null,
      verified: userData.verified || false,
    };

    console.log("[PROFILE API] Profile data assembled:", profileData);

    return NextResponse.json({
      success: true,
      data: profileData,
      source: "strapi-merged"
    } as ProfileApiResponse);

  } catch (error) {
    console.error("Error fetching profile data:", error);
    
    // Try to return session data as fallback
    try {
      const session = await auth();
      if (session?.user?.email) {
        return NextResponse.json({
          success: true,
          data: {
            email: session.user.email,
            username: session.user.name,
            profile_image: session.user.image,
            phone_number: null,
            batch: null,
            verified: false,
          },
          source: "session-fallback",
          warning: "Could not fetch additional profile data"
        });
      }
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch profile data",
        details: (error as Error).message 
      } as ProfileApiResponse,
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: ProfileUpdateRequest = await request.json();
    const { phone_number } = body;

    // Validate phone number if provided
    if (phone_number && phone_number.trim() !== '') {
      const validation = validatePhoneNumber(phone_number);
      if (!validation.isValid) {
        return NextResponse.json(
          { 
            success: false, 
            error: validation.error || "Invalid phone number" 
          },
          { status: 400 }
        );
      }
    }

    // Get user ID from Strapi
    const userId = await getUserIdByEmail(session.user.email);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User not found in database" },
        { status: 404 }
      );
    }

    // Update user data in Strapi - try both phone_number and phone field names
    console.log("[PROFILE API] Updating phone number for user ID:", userId, "with value:", phone_number);
    
    const updateData = {
      phone_number,
      phone: phone_number // Also try the 'phone' field name in case that's what Strapi expects
    };
    
    const updateResult = await strapiPut(`/users/${userId}`, updateData);
    console.log("[PROFILE API] Strapi update result:", updateResult);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully"
    });

  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update profile",
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
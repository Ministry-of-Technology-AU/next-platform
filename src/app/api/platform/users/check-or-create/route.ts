import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { strapiGet, strapiPost } from "@/lib/apis/strapi";

/**
 * POST /api/platform/users/check-or-create
 * Checks if a user exists in Strapi and creates them if not.
 * This endpoint is called from middleware to ensure users are synced.
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    const userName = session.user.name || '';

    // Check if a user with the same email exists
    const emailResponse = await strapiGet('/users', {
      filters: {
        email: {
          $eq: userEmail
        }
      }
    });

    // Strapi returns data in different formats, handle both
    const users = Array.isArray(emailResponse) 
      ? emailResponse 
      : (emailResponse?.data || []);

    if (users.length === 0) {
      // User doesn't exist, need to create them
      let finalUsername = userName;
      const batch = (userEmail.match(/_([^@]+)@/) || [])[1]?.toUpperCase() || "";

      // Check if username already exists
      if (userName) {
        const usernameResponse = await strapiGet('/users', {
          filters: {
            username: {
              $eq: userName
            }
          }
        });

        const existingUsers = Array.isArray(usernameResponse)
          ? usernameResponse
          : (usernameResponse?.data || []);

        // If username exists, append random number
        if (existingUsers.length > 0) {
          finalUsername = `${userName} ${Math.floor(Math.random() * 100) + 1}`;
        }
      }

      // Create new user in Strapi
      const userData = {
        email: userEmail,
        username: finalUsername,
        profile_url: session.user.image || '',
        password: Math.random().toString(36).slice(-8), // Random password
        role: 1,
        confirmed: true,
        blocked: false,
        batch: batch
      };

      console.log('Creating new user in Strapi:', userEmail);
      await strapiPost('/users', userData);

      return NextResponse.json({
        success: true,
        created: true,
        message: "User created successfully"
      });
    }

    // User already exists
    return NextResponse.json({
      success: true,
      created: false,
      message: "User already exists"
    });

  } catch (error) {
    console.error('Error checking/creating user in Strapi:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check/create user",
        details: (error as Error).message
      },
      { status: 500 }
    );
  }
}


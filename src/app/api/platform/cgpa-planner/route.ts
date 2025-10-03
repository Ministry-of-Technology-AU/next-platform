import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { strapiGet, strapiPut } from "@/lib/apis/strapi";
import { getUserIdByEmail } from "@/lib/userid";
import { CGPAData } from "./utils";

/**
 * GET handler for /api/platform/cgpa-planner
 * Returns CGPA data for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user ID from Strapi
    const userId = await getUserIdByEmail(session.user.email);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch CGPA data from user's cgpa_data field
    const response = await strapiGet(`/users/${userId}`, {
      populate: {
        cgpa_data: true
      }
    });

    if (!response || !response.cgpa_data) {
      return NextResponse.json({
        success: true,
        data: null,
        message: "No CGPA data found"
      });
    }

    // Return the CGPA data from user's cgpa_data field
    const cgpaData: CGPAData = response.cgpa_data;

    return NextResponse.json({
      success: true,
      data: cgpaData,
      lastUpdated: response.updatedAt
    });

  } catch (error) {
    console.error("Error fetching CGPA data:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch CGPA data",
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for /api/platform/cgpa-planner
 * Creates or updates CGPA data for the authenticated user
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

    // Parse request body
    const cgpaData = await request.json() as CGPAData;
    
    // Validate required fields
    if (!cgpaData.semesters || !Array.isArray(cgpaData.semesters)) {
      return NextResponse.json(
        { success: false, error: "Invalid CGPA data format" },
        { status: 400 }
      );
    }

    // Get user ID from Strapi
    const userId = await getUserIdByEmail(session.user.email);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Update user's cgpa_data field
    const updatedResponse = await strapiPut(`/users/${userId}`, {
      cgpa_data: cgpaData
    });

    return NextResponse.json({
      success: true,
      data: cgpaData,
      message: "CGPA data updated successfully",
      userId: userId,
      strapiResponse: updatedResponse
    });

  } catch (error) {
    console.error("Error saving CGPA data:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to save CGPA data",
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for /api/platform/cgpa-planner
 * Clears all CGPA data for the authenticated user (used for AMS resync)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get user ID from Strapi
    const userId = await getUserIdByEmail(session.user.email);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Clear user's cgpa_data field
    await strapiPut(`/users/${userId}`, {
      cgpa_data: null
    });

    return NextResponse.json({
      success: true,
      message: "CGPA data cleared successfully",
      deletedCount: 1
    });

  } catch (error) {
    console.error("Error deleting CGPA data:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete CGPA data",
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

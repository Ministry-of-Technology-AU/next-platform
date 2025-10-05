import { NextRequest, NextResponse } from "next/server";
import { strapiGet, strapiPut } from "@/lib/apis/strapi";
import { getAuthenticatedUser } from "@/lib/auth";
import { getUserIdByEmail } from "@/lib/userid";

// GET: fetch all semester_planner_tabs for the authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    // Get user ID using email
    const userId = await getUserIdByEmail(user.email);
    if (!userId) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Fetch user data from Strapi
    const userRes = await strapiGet(`users/${userId}`);
    const strapiUser = userRes || userRes?.data;
    
    if (!strapiUser) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Support both Strapi v4 (strapiUser.attributes) and flat user object
    const tabs = (strapiUser.attributes?.semester_planner_tabs ?? strapiUser.semester_planner_tabs) || [];
    return NextResponse.json({ success: true, data: tabs });
  } catch (error) {
    console.error('Error fetching semester planner tabs:', error);
    return NextResponse.json({ success: false, error: "Failed to fetch tabs" }, { status: 500 });
  }
}

// POST: update semester_planner_tabs for the authenticated user
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from session
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { drafts } = body;
    if (!Array.isArray(drafts)) {
      return NextResponse.json({ success: false, error: "Missing drafts array" }, { status: 400 });
    }

    // Get user ID using email
    const userId = await getUserIdByEmail(user.email);
    if (!userId) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Update semester planner tabs for the authenticated user
    await strapiPut(`users/${userId}`, { semester_planner_tabs: drafts });

    return NextResponse.json({ success: true, data: drafts });
  } catch (error) {
    console.error('Error saving semester planner tabs:', error);
    return NextResponse.json({ success: false, error: "Failed to save drafts" }, { status: 500 });
  }
}
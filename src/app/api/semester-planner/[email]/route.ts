import { NextRequest, NextResponse } from "next/server";
import { strapiGet, strapiPut } from "@/lib/apis/strapi";
import { TimeSlot, ScheduledCourse, TimetableDraft } from "@/app/(pages)/semester-planner/types";


// GET: fetch all semester_planner_tabs for a user (hardcoded userId = 1)
export async function GET(req: NextRequest) {
  const userId = 1;
  try {
    // Fetch user by hardcoded ID
    const userRes = await strapiGet(
      `users/${userId}`
    );
    const user = userRes || userRes?.data;
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }
    // Support both Strapi v4 (user.attributes) and flat user object
    const tabs = (user.attributes?.semester_planner_tabs ?? user.semester_planner_tabs) || [];
    return NextResponse.json({ success: true, data: tabs });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch tabs" }, { status: 500 });
  }
}

// POST: update semester_planner_tabs for a user (hardcoded userId = 1)
export async function POST(req: NextRequest) {
  const userId = 1;
  try {
    const body = await req.json();
    const { drafts } = body;
    if (!Array.isArray(drafts)) {
      return NextResponse.json({ success: false, error: "Missing drafts array" }, { status: 400 });
    }
    // Replace all drafts for hardcoded user
    await strapiPut(
      `users/${userId}`,
      { semester_planner_tabs: drafts }
    );
    return NextResponse.json({ success: true, data: drafts });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to save drafts" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { strapiGet, strapiPut } from "@/lib/apis/strapi";
import { getUserIdByEmail } from "@/lib/userid";

/**
 * GET handler for /api/platform/cgpa-planner
 * Returns CGPA data for the authenticated user
 */
export async function GET(request: NextRequest) {
    return NextResponse.json(
      { success: false, error: "GET method not implemented for CGPA Planner" },
      { status: 405 }
    );
}

/**
 * GET handler for /api/platform/cgpa-planner
 * Returns CGPA data for the authenticated user
 */
export async function POST(request: NextRequest) {
    return NextResponse.json(
      { success: false, error: "POST method not implemented for CGPA Planner" },
      { status: 405 }
    );
}
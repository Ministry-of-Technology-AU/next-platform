import { NextRequest, NextResponse } from "next/server";
import { CASHSurveyData } from "@/app/platform/cash-survey/types";
import { auth } from "@/auth";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body: CASHSurveyData = await request.json();

    // Get user session
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: "User not authenticated",
        },
        { status: 401 }
      );
    }

    // Hash the user's email
    const hashedEmail = crypto
      .createHash("sha256")
      .update(session.user.email)
      .digest("hex");

    // Log the survey data to the console
    console.log("=== CASH Survey Submission ===");
    console.log(`User Email (hashed): ${hashedEmail}`);
    console.log(JSON.stringify(body, null, 2));
    console.log("=============================");

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Survey submitted successfully",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing CASH survey submission:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process survey submission",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

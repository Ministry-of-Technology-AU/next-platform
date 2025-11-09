import { NextRequest, NextResponse } from "next/server";
import { CASHSurveyData } from "@/app/platform/cash-survey/types";

export async function POST(request: NextRequest) {
  try {
    const body: CASHSurveyData = await request.json();

    // Log the survey data to the console
    console.log("=== CASH Survey Submission ===");
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

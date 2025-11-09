import { NextRequest, NextResponse } from "next/server";
import { CASHSurveyData } from "@/app/platform/cash-survey/types";
import { auth } from "@/auth";
import crypto from "crypto";

// Function to convert survey data to CSV format
function convertSurveyToCSV(data: CASHSurveyData): string {
  const rows: string[] = [];
  
  // Add header
  rows.push("Section,Question,Answer");
  
  // Flatten the nested survey data
  Object.entries(data).forEach(([sectionKey, sectionData]) => {
    Object.entries(sectionData).forEach(([questionKey, answer]) => {
      // Format the section name (e.g., "section1A" -> "Section 1A")
      const sectionName = sectionKey
        .replace(/([A-Z])/g, " $1")
        .replace(/^section /, "Section ");
      
      // Format the question key to be more readable (e.g., "jokesSexualAcquaintances" -> "Jokes Sexual Acquaintances")
      const questionName = questionKey
        .replace(/([A-Z])/g, " $1")
        .charAt(0)
        .toUpperCase() + questionKey
        .replace(/([A-Z])/g, " $1")
        .slice(1)
        .toLowerCase();
      
      // Format the answer
      let formattedAnswer = "";
      if (Array.isArray(answer)) {
        formattedAnswer = answer.length > 0 ? answer.join("; ") : "";
      } else if (typeof answer === "number") {
        formattedAnswer = answer.toString();
      } else if (typeof answer === "string") {
        formattedAnswer = answer || "";
      } else {
        formattedAnswer = "";
      }
      
      // Escape CSV special characters
      const escapedAnswer = formattedAnswer.includes(",") || formattedAnswer.includes('"') || formattedAnswer.includes("\n")
        ? `"${formattedAnswer.replace(/"/g, '""')}"`
        : formattedAnswer;
      
      rows.push(`"${sectionName}","${questionName}","${escapedAnswer}"`);
    });
  });
  
  return rows.join("\n");
}

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

    // Convert survey data to CSV
    const csvData = convertSurveyToCSV(body);

    // Log the survey data to the console
    console.log("=== CASH Survey Submission ===");
    console.log(`User Email (hashed): ${hashedEmail}`);
    console.log("\n--- CSV Format ---");
    console.log(csvData);
    console.log("\n--- JSON Format ---");
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

import { NextRequest, NextResponse } from "next/server";
import { CASHSurveyData } from "@/app/platform/cash-survey/types";
import { auth } from "@/auth";
import crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

const SURVEYS_DIR = path.join(process.cwd(), "data", "surveys");

// Ensure surveys directory exists
function ensureSurveysDir() {
  if (!fs.existsSync(SURVEYS_DIR)) {
    fs.mkdirSync(SURVEYS_DIR, { recursive: true });
  }
}

// Hash email to get unique identifier
function hashEmail(email: string): string {
  return crypto
    .createHash("sha256")
    .update(email)
    .digest("hex");
}

// Get file paths for a user
function getUserFilePaths(hashedEmail: string) {
  return {
    json: path.join(SURVEYS_DIR, `${hashedEmail}.json`),
    csv: path.join(SURVEYS_DIR, `${hashedEmail}.csv`),
  };
}

// Function to convert survey data to CSV format
function convertSurveyToCSV(data: CASHSurveyData, includeTimestamp = true): string {
  const rows: string[] = [];
  
  // Add header with timestamp if requested
  const headers = includeTimestamp 
    ? ["Timestamp", "Section", "Question", "Answer"]
    : ["Section", "Question", "Answer"];
  rows.push(headers.map(h => `"${h}"`).join(","));
  
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
      
      const timestamp = new Date().toISOString();
      const row = includeTimestamp
        ? [`"${timestamp}"`, `"${sectionName}"`, `"${questionName}"`, escapedAnswer]
        : [`"${sectionName}"`, `"${questionName}"`, escapedAnswer];
      
      rows.push(row.join(","));
    });
  });
  
  return rows.join("\n");
}

// Read JSON submissions (array of submissions)
function readJsonSubmissions(filePath: string): Array<{ data: CASHSurveyData; timestamp: string }> {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading JSON submissions:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureSurveysDir();
    
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
    const hashedEmail = hashEmail(session.user.email);
    const { json: jsonPath, csv: csvPath } = getUserFilePaths(hashedEmail);

    // Check if user has already submitted
    const existingSubmissions = readJsonSubmissions(jsonPath);
    if (existingSubmissions.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already submitted this survey. Resubmissions are not permitted.",
          alreadySubmitted: true,
          lastSubmissionDate: existingSubmissions[existingSubmissions.length - 1].timestamp,
        },
        { status: 403 }
      );
    }

    const timestamp = new Date().toISOString();

    // Add new submission
    const submissions = [
      {
        data: body,
        timestamp: timestamp,
      },
    ];

    // Write JSON file
    fs.writeFileSync(jsonPath, JSON.stringify(submissions, null, 2), "utf-8");

    // Generate CSV row(s) for the current submission
    const csvData = convertSurveyToCSV(body, true);
    
    // Write CSV file (first submission)
    fs.writeFileSync(csvPath, csvData, "utf-8");

    // Log the survey data
    console.log("=== CASH Survey Submission ===");
    console.log(`User Email (hashed): ${hashedEmail}`);
    console.log(`Timestamp: ${timestamp}`);
    console.log(`First submission received`);
    console.log("=============================");

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Survey submitted successfully",
        timestamp: timestamp,
        submissionNumber: submissions.length,
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

export async function GET(request: NextRequest) {
  try {
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
    const hashedEmail = hashEmail(session.user.email);
    const { json: jsonPath } = getUserFilePaths(hashedEmail);

    // Read existing submissions
    const submissions = readJsonSubmissions(jsonPath);

    if (submissions.length === 0) {
      return NextResponse.json(
        {
          success: true,
          hasSubmitted: false,
          message: "User has not submitted the survey yet",
        },
        { status: 200 }
      );
    }

    // Return the latest submission
    const latestSubmission = submissions[submissions.length - 1];

    return NextResponse.json(
      {
        success: true,
        hasSubmitted: true,
        data: latestSubmission.data,
        timestamp: latestSubmission.timestamp,
        totalSubmissions: submissions.length,
        allSubmissions: submissions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching CASH survey data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch survey data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

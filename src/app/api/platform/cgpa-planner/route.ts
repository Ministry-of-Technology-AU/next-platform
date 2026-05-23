import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { strapiGet, strapiPut } from "@/lib/apis/strapi";
import { getUserIdByEmail } from "@/lib/userid";
import { ParsedCGPAData } from "@/lib/cgpa-types";
import { parseGradeDataText, sanitizeCGPAData } from "@/lib/cgpa-utils";

type GoogleUserInfo = {
  email?: string;
  name?: string;
  picture?: string;
};

type UserResolution =
  | { ok: true; userId: number; email: string; authMode: "session" | "bearer" }
  | { ok: false; status: number; error: string };

const ALLOWED_DOMAIN = (process.env.ALLOWED_EMAIL_DOMAIN || "ashoka.edu.in").replace(/^@/, "").toLowerCase();
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function withCors(response: NextResponse) {
  Object.entries(CORS_HEADERS).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

function jsonResponse(body: unknown, status = 200) {
  return withCors(NextResponse.json(body, { status }));
}

function extractBearerToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")?.trim();
  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  return token || null;
}

async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo | null> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as GoogleUserInfo;
}

async function resolveUserSessionOnly(): Promise<UserResolution> {
  const session = await auth();
  if (!session?.user?.email) {
    return { ok: false, status: 401, error: "Authentication required" };
  }

  const userId = await getUserIdByEmail(session.user.email);
  if (!userId) {
    return { ok: false, status: 404, error: "User not found" };
  }

  return { ok: true, userId, email: session.user.email, authMode: "session" };
}

async function resolveUserForSave(request: NextRequest): Promise<UserResolution> {
  const accessToken = extractBearerToken(request);
  if (accessToken) {
    const googleUser = await getGoogleUserInfo(accessToken);
    if (!googleUser?.email) {
      return { ok: false, status: 401, error: "invalid_google_token" };
    }

    const email = googleUser.email.toLowerCase();
    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      return { ok: false, status: 403, error: "unauthorized_domain" };
    }

    const userId = await getUserIdByEmail(email);
    if (!userId) {
      return { ok: false, status: 404, error: "User not found" };
    }

    return { ok: true, userId, email, authMode: "bearer" };
  }

  return resolveUserSessionOnly();
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function GET(request: NextRequest) {
  try {
    const resolved = await resolveUserSessionOnly();
    if (!resolved.ok) {
      return jsonResponse({ success: false, error: resolved.error }, resolved.status);
    }

    const response = await strapiGet(`/users/${resolved.userId}`, {
      populate: {
        cgpa_data: true
      }
    });

    if (!response || !response.cgpa_data) {
      return jsonResponse({
        success: true,
        data: null,
        message: "No CGPA data found"
      });
    }

    const cgpaData: ParsedCGPAData = response.cgpa_data;

    return jsonResponse({
      success: true,
      data: cgpaData,
      lastUpdated: response.updatedAt
    });

  } catch (error) {
    console.error("Error fetching CGPA data:", error);
    return jsonResponse(
      {
        success: false,
        error: "Failed to fetch CGPA data",
        details: (error as Error).message
      },
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const resolved = await resolveUserForSave(request);
    if (!resolved.ok) {
      return jsonResponse({ success: false, error: resolved.error }, resolved.status);
    }

    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text : "";
    let cgpaData: ParsedCGPAData;
    let parsedFromText = false;

    if (text.trim()) {
      const parsed = parseGradeDataText(text);
      cgpaData = sanitizeCGPAData(parsed);
      parsedFromText = true;
    } else {
      try {
        cgpaData = sanitizeCGPAData(body);
      } catch {
        return jsonResponse({ success: false, error: "Invalid CGPA data format" }, 400);
      }
    }

    const updatedResponse = await strapiPut(`/users/${resolved.userId}`, {
      cgpa_data: cgpaData
    });

    return jsonResponse({
      success: true,
      data: cgpaData,
      message: "CGPA data updated successfully",
      userId: resolved.userId,
      email: resolved.email,
      authMode: resolved.authMode,
      parsedFromText,
      strapiResponse: updatedResponse
    });

  } catch (error) {
    console.error("Error saving CGPA data:", error);
    return jsonResponse(
      {
        success: false,
        error: "Failed to save CGPA data",
        details: (error as Error).message
      },
      500
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const resolved = await resolveUserSessionOnly();
    if (!resolved.ok) {
      return jsonResponse({ success: false, error: resolved.error }, resolved.status);
    }

    await strapiPut(`/users/${resolved.userId}`, {
      cgpa_data: null
    });

    return jsonResponse({
      success: true,
      message: "CGPA data cleared successfully",
      deletedCount: 1
    });

  } catch (error) {
    console.error("Error deleting CGPA data:", error);
    return jsonResponse(
      {
        success: false,
        error: "Failed to delete CGPA data",
        details: (error as Error).message
      },
      500
    );
  }
}

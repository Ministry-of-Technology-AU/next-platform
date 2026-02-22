import { NextRequest, NextResponse } from "next/server";
import { strapiGet, strapiPost, strapiPut } from "@/lib/apis/strapi";
import { getUserIdByEmail } from "@/lib/userid";
import { parseGradeDataText, sanitizeCGPAData } from "@/lib/cgpa-utils";

type GoogleUserInfo = {
  email?: string;
  name?: string;
  picture?: string;
};

const ALLOWED_DOMAIN = (process.env.ALLOWED_EMAIL_DOMAIN || "ashoka.edu.in").replace(/^@/, "").toLowerCase();
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

  const data = (await response.json()) as GoogleUserInfo;
  return data;
}

async function createStrapiUser(email: string, name?: string, picture?: string): Promise<number | null> {
  const usernameBase = (name?.trim() || email.split("@")[0] || "student").slice(0, 64);
  let username = usernameBase;
  const existingUsername = await strapiGet("/users", {
    filters: {
      username: {
        $eq: username,
      },
    },
  });

  if (Array.isArray(existingUsername) && existingUsername.length > 0) {
    username = `${usernameBase} ${Math.floor(Math.random() * 10000)}`;
  }

  const batch = (email.match(/_([^@]+)@/) || [])[1]?.toUpperCase() || "";
  const created = await strapiPost("/users", {
    email,
    username,
    profile_url: picture || "",
    password: Math.random().toString(36).slice(-12),
    role: 1,
    confirmed: true,
    blocked: false,
    batch,
  });

  if (created && typeof created.id === "number") {
    return created.id;
  }

  return getUserIdByEmail(email);
}

async function getOrCreateUserId(email: string, name?: string, picture?: string): Promise<number | null> {
  const existingId = await getUserIdByEmail(email);
  if (existingId) {
    return existingId;
  }
  return createStrapiUser(email, name, picture);
}

export async function OPTIONS() {
  return withCors(new NextResponse(null, { status: 204 }));
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = extractBearerToken(request);
    if (!accessToken) {
      return jsonResponse({ success: false, error: "missing_bearer_token" }, 401);
    }

    const body = await request.json();
    const text = typeof body?.text === "string" ? body.text : "";
    const sourceUrl = typeof body?.sourceUrl === "string" ? body.sourceUrl : null;

    if (!text.trim()) {
      return jsonResponse({ success: false, error: "missing_text" }, 400);
    }

    const googleUser = await getGoogleUserInfo(accessToken);
    if (!googleUser?.email) {
      return jsonResponse({ success: false, error: "invalid_google_token" }, 401);
    }

    const email = googleUser.email.toLowerCase();
    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      return jsonResponse({ success: false, error: "unauthorized_domain" }, 403);
    }

    const userId = await getOrCreateUserId(email, googleUser.name, googleUser.picture);
    if (!userId) {
      return jsonResponse({ success: false, error: "user_sync_failed" }, 500);
    }

    const parsedData = parseGradeDataText(text);
    const sanitizedData = sanitizeCGPAData(parsedData);

    await strapiPut(`/users/${userId}`, {
      cgpa_data: sanitizedData,
    });

    return jsonResponse({
      success: true,
      userId,
      email,
      sourceUrl,
      semesters: sanitizedData.semesters.length,
      totalCredits: sanitizedData.totalCredits,
      degreeCGPA: sanitizedData.degreeCGPA,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "sync_failed";
    return jsonResponse({ success: false, error: message }, 500);
  }
}

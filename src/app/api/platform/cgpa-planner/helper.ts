import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { CACHE_CONTROL } from "@/lib/cache/headers";
import { getUserIdByEmail } from "@/lib/userid";
import { parseCourseReport } from "@/lib/cgpa/parser";
import { normaliseReport } from "@/lib/cgpa/schema";
import type { ParsedCGPAData } from "@/lib/cgpa/types";

/**
 * Shared plumbing for the CGPA planner routes. They are called from the platform and from
 * outside it (the browser extension sends a Google access token), hence CORS and bearer auth.
 */

const ALLOWED_DOMAIN = (process.env.ALLOWED_EMAIL_DOMAIN || "ashoka.edu.in").replace(/^@/, "").toLowerCase();
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

/** Largest paste we accept. A full four-year report is about 15 KB. */
export const MAX_TEXT_LENGTH = 200_000;

const DEFAULT_METHODS = "GET, POST, DELETE, OPTIONS";

function headersFor(methods: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    // Reports are per-user; even the stateless parse echoes a student's grades back.
    "Cache-Control": CACHE_CONTROL.private,
  };
}

export function json(body: unknown, status = 200, methods = DEFAULT_METHODS) {
  return NextResponse.json(body, { status, headers: headersFor(methods) });
}

export function preflight(methods = DEFAULT_METHODS) {
  return new NextResponse(null, { status: 204, headers: headersFor(methods) });
}

type Resolved = { ok: true; uid: number; email: string; authMode: "session" | "bearer" } | { ok: false; status: number; error: string };

/** The signed-in user from the session cookie. */
export async function resolveSessionUser(): Promise<Resolved> {
  const user = await getAuthenticatedUser();
  if (!user) return { ok: false, status: 401, error: "Authentication required" };
  if (!user.uid) return { ok: false, status: 404, error: "User not found" };
  return { ok: true, uid: user.uid, email: user.email, authMode: "session" };
}

/** A Google access token in `Authorization: Bearer`, else the session cookie. */
export async function resolveSessionOrBearerUser(request: NextRequest): Promise<Resolved> {
  const header = request.headers.get("authorization")?.trim() ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) return resolveSessionUser();

  // Token is verified with Google on every call; it is never cached or stored.
  const response = await fetch(GOOGLE_USERINFO_URL, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) return { ok: false, status: 401, error: "invalid_google_token" };
  const info = (await response.json()) as { email?: string };
  const email = info.email?.toLowerCase();
  if (!email) return { ok: false, status: 401, error: "invalid_google_token" };
  if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) return { ok: false, status: 403, error: "unauthorized_domain" };

  const uid = await getUserIdByEmail(email);
  if (!uid) return { ok: false, status: 404, error: "User not found" };
  return { ok: true, uid, email, authMode: "bearer" };
}

type ReportFromBody =
  | { ok: true; report: ParsedCGPAData; parsedFromText: boolean }
  | { ok: false; status: number; error: string };

/**
 * Reads a report out of a request body: `{ text }` (raw AMS paste, parsed here) or a
 * report object (`{ report }` or the report itself, validated and normalised).
 */
export async function reportFromRequest(request: NextRequest): Promise<ReportFromBody> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { ok: false, status: 400, error: "Body must be JSON" };
  }
  const record = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};

  if (typeof record.text === "string") {
    const text = record.text;
    if (!text.trim()) return { ok: false, status: 400, error: "Paste your AMS course report first" };
    if (text.length > MAX_TEXT_LENGTH) return { ok: false, status: 413, error: "That paste is too long to be a course report" };
    const report = parseCourseReport(text);
    if (report.semesters.length === 0) {
      return {
        ok: false,
        status: 422,
        error: "No terms or courses found. Copy the whole AMS \"My Course Report\" page (Ctrl+A, then Ctrl+C) and paste it again.",
      };
    }
    return { ok: true, report, parsedFromText: true };
  }

  const report = normaliseReport(record.report ?? body);
  if (!report) return { ok: false, status: 400, error: "Send { text } with the AMS paste, or a report object" };
  return { ok: true, report, parsedFromText: false };
}

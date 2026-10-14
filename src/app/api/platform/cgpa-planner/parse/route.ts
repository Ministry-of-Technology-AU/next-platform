import { NextRequest } from "next/server";
import { json, preflight, reportFromRequest } from "../helper";

export const dynamic = "force-dynamic";

/**
 * Stateless parse of an AMS course report. Public on purpose: it stores nothing and is
 * called from outside the platform. The global anonymous rate limit applies.
 *
 * POST { text } -> { success, data: ParsedCGPAData }
 * 422 when no terms could be found, with a message saying what to paste.
 */

const METHODS = "POST, OPTIONS";

export function OPTIONS() {
  return preflight(METHODS);
}

export async function POST(request: NextRequest) {
  try {
    const result = await reportFromRequest(request);
    if (!result.ok) return json({ success: false, error: result.error }, result.status, METHODS);
    return json({ success: true, data: result.report, message: "CGPA data parsed" }, 200, METHODS);
  } catch (error) {
    platform.error("POST /api/platform/cgpa-planner/parse failed:", error);
    return json({ success: false, error: "Failed to parse CGPA data" }, 500, METHODS);
  }
}

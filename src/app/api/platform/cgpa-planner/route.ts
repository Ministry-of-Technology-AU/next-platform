import { NextRequest } from "next/server";
import { clearCGPAReport, getCGPAReport, saveCGPAReport } from "@/lib/cgpa/data";
import { json, preflight, reportFromRequest, resolveSessionOrBearerUser, resolveSessionUser } from "./helper";

export const dynamic = "force-dynamic";

/**
 * The signed-in student's saved CGPA report.
 *
 * GET     -> { success, data: ParsedCGPAData | null, lastUpdated }
 * POST    -> body { text } (AMS paste, parsed server-side) or a report object; saves and returns it.
 *            Accepts a Google bearer token as well as the session cookie.
 * DELETE  -> clears the saved report.
 */

export function OPTIONS() {
  return preflight();
}

export async function GET() {
  try {
    const user = await resolveSessionUser();
    if (!user.ok) return json({ success: false, error: user.error }, user.status);

    const { report, updatedAt } = await getCGPAReport(user.uid);
    return json({
      success: true,
      data: report,
      lastUpdated: updatedAt,
      ...(report ? {} : { message: "No CGPA data found" }),
    });
  } catch (error) {
    platform.error("GET /api/platform/cgpa-planner failed:", error);
    return json({ success: false, error: "Failed to fetch CGPA data" }, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await resolveSessionOrBearerUser(request);
    if (!user.ok) return json({ success: false, error: user.error }, user.status);

    const result = await reportFromRequest(request);
    if (!result.ok) return json({ success: false, error: result.error }, result.status);

    await saveCGPAReport(user.uid, result.report);
    return json({
      success: true,
      data: result.report,
      message: "CGPA data saved",
      email: user.email,
      authMode: user.authMode,
      parsedFromText: result.parsedFromText,
    });
  } catch (error) {
    platform.error("POST /api/platform/cgpa-planner failed:", error);
    return json({ success: false, error: "Failed to save CGPA data" }, 500);
  }
}

export async function DELETE() {
  try {
    const user = await resolveSessionUser();
    if (!user.ok) return json({ success: false, error: user.error }, user.status);

    await clearCGPAReport(user.uid);
    return json({ success: true, message: "CGPA data cleared" });
  } catch (error) {
    platform.error("DELETE /api/platform/cgpa-planner failed:", error);
    return json({ success: false, error: "Failed to clear CGPA data" }, 500);
  }
}

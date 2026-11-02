import { NextResponse } from "next/server"
import { getTemplates } from "@/app/platform/trajectory-planner/_server/templates"
import { ok, privateError, requirePlannerUser } from "../helper"

export const dynamic = "force-dynamic"

/**
 * GET -> { success, data: { degreeTemplates, idealTrajectories } }
 *
 * The planner page reads these on the server (`getTemplates`); this route is for other clients.
 * Same body for every user, so the server keeps it in L2 and the browser may reuse it.
 */
export async function GET() {
    try {
        const user = await requirePlannerUser()
        if (user instanceof NextResponse) return user

        return ok(await getTemplates(), "shared")
    } catch (error) {
        platform.error("GET /api/platform/trajectory-planner/templates failed:", error)
        return privateError("Degree templates didn't load. Reload the page in a minute.", 500)
    }
}

import { NextResponse, type NextRequest } from "next/server"
import { withCacheControl } from "@/lib/cache/headers"
import { checkRateLimit, tooManyRequests } from "@/lib/rate-limit"
import { getTrajectory, saveTrajectory } from "@/app/platform/trajectory-planner/_server/plan"
import { SaveTrajectoryBodySchema } from "@/app/platform/trajectory-planner/schema"
import { ok, privateError, readJson, requirePlannerUser } from "./helper"

export const dynamic = "force-dynamic"

/**
 * The signed-in student's saved trajectory (`course_trajectory` on their Strapi user).
 *
 * GET  -> { success, data: CoursePlannerState | null }
 * POST -> body { state }; validated and saved. Returns { savedAt } only: auto-save calls this
 *         often, and echoing the plan back would double the traffic.
 *
 * Per-user, so every response is `private, no-store`.
 */

// The planner auto-saves five seconds after each burst of edits, so this is several
// times what a busy student sends.
const SAVE_LIMIT = { limit: 60, windowMs: 60_000 }

export async function GET() {
    try {
        const user = await requirePlannerUser()
        if (user instanceof NextResponse) return user

        return ok(await getTrajectory(user.uid))
    } catch (error) {
        platform.error("GET /api/platform/trajectory-planner failed:", error)
        return privateError("Your saved plan didn't load. Reload the page in a minute.", 500)
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await requirePlannerUser()
        if (user instanceof NextResponse) return user

        const limit = checkRateLimit(`trajectory-save:${user.uid}`, SAVE_LIMIT)
        if (!limit.ok) {
            return withCacheControl(
                tooManyRequests(limit.retryAfter, "Saving too often. Your plan is safe on this device and will save again shortly."),
                "private",
            )
        }

        const body = SaveTrajectoryBodySchema.safeParse(await readJson(request))
        if (!body.success) return privateError("That doesn't look like a trajectory. Reload the page and try again.", 400)

        await saveTrajectory(user.uid, body.data.state)
        return ok({ savedAt: new Date().toISOString() })
    } catch (error) {
        platform.error("POST /api/platform/trajectory-planner failed:", error)
        return privateError("Couldn't save your plan. It's still on this device; we'll try again.", 500)
    }
}

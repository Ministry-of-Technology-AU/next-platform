import { NextResponse, type NextRequest } from "next/server"
import { MIN_SEMESTERS_TO_SHARE } from "@/app/platform/trajectory-planner/data"
import { ShareTrajectoryBodySchema } from "@/app/platform/trajectory-planner/schema"
import {
    createSharedTrajectory,
    deleteOwnSharedTrajectory,
    getOwnSharedTrajectory,
    hasSharedTrajectory,
    listSharedTrajectories,
} from "@/app/platform/trajectory-planner/_server/shared"
import { ok, privateError, readJson, requirePlannerUser } from "../helper"

export const dynamic = "force-dynamic"

/**
 * The shared-trajectory repository. One trajectory per student, never with grades.
 *
 * GET              -> { success, data: SharedTrajectory[] }, newest first. Same for everyone.
 * GET ?mine=true   -> { success, data: SharedTrajectory | null }, the student's own.
 * POST             -> body { title, description?, semesters }; shares the plan (201).
 * DELETE           -> removes the student's shared trajectory.
 */

export async function GET(request: NextRequest) {
    try {
        const user = await requirePlannerUser()
        if (user instanceof NextResponse) return user

        if (request.nextUrl.searchParams.get("mine") === "true") {
            return ok(await getOwnSharedTrajectory(user.uid))
        }
        return ok(await listSharedTrajectories(), "shared")
    } catch (error) {
        platform.error("GET /api/platform/trajectory-planner/shared failed:", error)
        return privateError("Shared trajectories didn't load. Try again in a minute.", 500)
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await requirePlannerUser()
        if (user instanceof NextResponse) return user

        const body = ShareTrajectoryBodySchema.safeParse(await readJson(request))
        if (!body.success) {
            const issue = body.error.issues[0]
            return privateError(issue?.path[0] === "title" ? issue.message : "That trajectory couldn't be read. Reload the page and try again.", 400)
        }
        if (body.data.semesters.length < MIN_SEMESTERS_TO_SHARE) {
            return privateError(`Add at least ${MIN_SEMESTERS_TO_SHARE} semesters before sharing your trajectory.`, 400)
        }
        if (await hasSharedTrajectory(user.uid)) {
            return privateError("You already have a shared trajectory. Delete it first to share a new one.", 409)
        }

        await createSharedTrajectory(user.uid, body.data)
        return ok(null, "private", 201)
    } catch (error) {
        platform.error("POST /api/platform/trajectory-planner/shared failed:", error)
        return privateError("Couldn't share your trajectory. Try again in a minute.", 500)
    }
}

export async function DELETE() {
    try {
        const user = await requirePlannerUser()
        if (user instanceof NextResponse) return user

        const deleted = await deleteOwnSharedTrajectory(user.uid)
        if (!deleted) return privateError("You don't have a shared trajectory to delete.", 404)
        return ok(null)
    } catch (error) {
        platform.error("DELETE /api/platform/trajectory-planner/shared failed:", error)
        return privateError("Couldn't delete your shared trajectory. Try again in a minute.", 500)
    }
}

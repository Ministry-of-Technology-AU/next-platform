import "server-only"

import type { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, hasAccess } from "@/lib/auth"
import { withCacheControl, type CacheControlPreset } from "@/lib/cache/headers"
import { jsonError, jsonOk } from "@/lib/forms/api-helpers"

/** Shared plumbing for the trajectory planner routes. */

/** The signed-in student's Strapi id, or the error response to send instead. */
export async function requirePlannerUser(): Promise<{ uid: number } | NextResponse> {
    const user = await getAuthenticatedUser()
    if (!user) return privateError("Sign in to use the trajectory planner.", 401)
    if (!hasAccess(user, ["platform"])) return privateError("The trajectory planner is for Ashoka students.", 403)
    if (!user.uid) return privateError("We couldn't find your account. Sign out, sign back in and try again.", 404)
    return { uid: user.uid }
}

export function ok<T>(data: T, cache: CacheControlPreset = "private", status = 200): NextResponse {
    return withCacheControl(jsonOk(data, status), cache)
}

/** Errors are never cached: the next try should reach the server. */
export function privateError(message: string, status: number): NextResponse {
    return withCacheControl(jsonError(message, status), "private")
}

/** The parsed JSON body, or null when it isn't JSON. */
export function readJson(request: NextRequest): Promise<unknown> {
    return request.json().catch(() => null)
}

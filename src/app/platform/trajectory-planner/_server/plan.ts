import "server-only"

import { strapiGet, strapiPut } from "@/lib/apis/strapi"
import { normalisePlannerState } from "../schema"
import type { CoursePlannerState } from "../types"

/**
 * Strapi access for the trajectory saved on a user (`course_trajectory`).
 * Called by the route handler and directly by the page, so the page never fetches its own API.
 * Per-user data: never cached on the server (caching.md, rule 2).
 */

type StrapiUserWithTrajectory = { course_trajectory?: unknown } | null

export async function getTrajectory(uid: number): Promise<CoursePlannerState | null> {
    const user = (await strapiGet(`/users/${uid}`, { fields: ["course_trajectory"] })) as StrapiUserWithTrajectory
    // Plans saved before the planner used CGPA grades are migrated here.
    return user?.course_trajectory ? normalisePlannerState(user.course_trajectory) : null
}

export async function saveTrajectory(uid: number, state: CoursePlannerState): Promise<void> {
    await strapiPut(`/users/${uid}`, { course_trajectory: state })
}

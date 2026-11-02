"use client"

import type { ApiResponse, Semester, ShareTrajectoryRequest, SharedTrajectory } from "./types"

/** Browser calls for the shared-trajectory repository. Each returns data or a sentence to show. */

const SHARED_URL = "/api/platform/trajectory-planner/shared"

type Result<T> = { data: T; error: null } | { data: null; error: string }

async function call<T>(input: string, init: RequestInit, fallback: string): Promise<Result<T>> {
    try {
        const response = await fetch(input, init)
        const json = (await response.json().catch(() => null)) as ApiResponse<T> | null
        if (response.ok && json?.success) return { data: json.data, error: null }
        return { data: null, error: (json && !json.success && json.error) || fallback }
    } catch (err) {
        platform.error(`Trajectory planner: ${init.method ?? "GET"} ${input} failed`, err)
        return { data: null, error: "Couldn't reach the server. Check your connection and try again." }
    }
}

/**
 * The repository, newest first. The response is browser-cached for a few minutes (it is the
 * same for everyone); `fresh` skips that copy, for right after this student shares or deletes.
 */
export function fetchSharedList(fresh = false) {
    return call<SharedTrajectory[]>(
        SHARED_URL,
        fresh ? { cache: "reload" } : {},
        "Shared trajectories didn't load. Try again in a minute.",
    )
}

export function fetchOwnShared() {
    return call<SharedTrajectory | null>(
        `${SHARED_URL}?mine=true`,
        // Per-user and changes with this dialog's own actions, so never a cached copy.
        { cache: "no-store" },
        "Couldn't check whether you've shared a trajectory. Try again in a minute.",
    )
}

/** Shares the plan. Grades are dropped here, before anything leaves the browser. */
export async function shareTrajectory(title: string, description: string, semesters: Semester[]) {
    const body: ShareTrajectoryRequest = {
        title,
        description,
        semesters: semesters.map(({ id, name, courses }) => ({
            id,
            name,
            courses: courses.map(({ id: courseId, name: courseName, credits, deptCode, type, isInSemester }) => ({
                id: courseId,
                name: courseName,
                credits,
                deptCode,
                type,
                isInSemester,
            })),
        })),
    }
    const result = await call<null>(
        SHARED_URL,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
        "Couldn't share your trajectory. Try again in a minute.",
    )
    if (!result.error) void fetchSharedList(true)
    return result
}

export async function deleteSharedTrajectory() {
    const result = await call<null>(SHARED_URL, { method: "DELETE" }, "Couldn't delete your shared trajectory. Try again in a minute.")
    if (!result.error) void fetchSharedList(true)
    return result
}

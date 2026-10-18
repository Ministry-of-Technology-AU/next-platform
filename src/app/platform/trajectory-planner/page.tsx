import { Route } from "lucide-react"
import { TourStep } from "@/components/guided-tour"
import PageTitle from "@/components/page-title"
import { strapiGet } from "@/lib/apis/strapi"
import { getAuthenticatedUser } from "@/lib/auth"
import { TrajectoryPlannerClient } from "./client"
import type { CoursePlannerState } from "./types"
import { isPlannerState } from "./utils"

// Per-user data read with the session; never statically cached.
export const dynamic = "force-dynamic"

type StrapiUserTrajectory = { course_trajectory?: unknown }

async function loadTrajectory(): Promise<CoursePlannerState | null> {
    try {
        const user = await getAuthenticatedUser()
        if (!user?.email) return null

        const response: unknown = await strapiGet("users", {
            filters: { email: user.email },
            fields: ["id", "email", "course_trajectory"],
        })
        const users: StrapiUserTrajectory[] = Array.isArray(response)
            ? response
            : ((response as { results?: StrapiUserTrajectory[] } | null)?.results ?? [])

        const saved = users[0]?.course_trajectory
        return isPlannerState(saved) ? saved : null
    } catch (err) {
        // The board falls back to this device's copy, so a failed read is not fatal.
        platform.error("Trajectory planner: loading the saved trajectory failed:", err)
        return null
    }
}

export default async function TrajectoryPlannerPage() {
    const trajectory = await loadTrajectory()

    return (
        <>
            <TourStep
                id="page-title"
                title="Course Trajectory Planner"
                content="Plan your degree semester by semester. Templates cover a few majors so far. For minors and concentrations, add the courses yourself. Requirements follow the latest batch and the newest OAA documents."
                order={0}
            >
                <PageTitle
                    icon={Route}
                    text="Course Trajectory Planner"
                    subheading="Plan your degree semester by semester and see your credits and CGPA add up."
                />
            </TourStep>

            <div className="mt-6 sm:mt-8">
                <TrajectoryPlannerClient initialData={trajectory} />
            </div>
        </>
    )
}

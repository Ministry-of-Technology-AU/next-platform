import { Route } from "lucide-react"
import { TourStep } from "@/components/guided-tour"
import PageTitle from "@/components/page-title"
import { getAuthenticatedUser } from "@/lib/auth"
import { getTrajectory } from "./_server/plan"
import { getTemplates } from "./_server/templates"
import { TrajectoryPlannerClient } from "./client"
import type { CoursePlannerState } from "./types"

// Per-user data read with the session; never statically cached. Templates come from L2.
export const dynamic = "force-dynamic"

type LoadedTrajectory = { data: CoursePlannerState | null; error: string | null }

async function loadTrajectory(): Promise<LoadedTrajectory> {
    try {
        const user = await getAuthenticatedUser()
        return { data: user?.uid ? await getTrajectory(user.uid) : null, error: null }
    } catch (err) {
        // The board falls back to this device's copy. Auto-save stays off so it can't overwrite
        // the account's copy, which may be newer.
        platform.error("Trajectory planner: loading the saved trajectory failed:", err)
        return { data: null, error: "Your saved plan didn't load, so auto-save is paused. Reload the page in a minute." }
    }
}

export default async function TrajectoryPlannerPage() {
    const [{ data, error }, templates] = await Promise.all([loadTrajectory(), getTemplates()])

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
                <TrajectoryPlannerClient initialData={data} initialError={error} templates={templates} />
            </div>
        </>
    )
}

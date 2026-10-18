"use client"

import { useEffect, useState } from "react"
import { degreeTemplates as staticTemplates, idealTrajectories as staticTrajectories, type IdealTrajectory } from "./templates"
import type { DegreeTemplate } from "./types"

type TemplatesResponse = { degreeTemplates?: DegreeTemplate[]; idealTrajectories?: IdealTrajectory[] }

/** Degree templates and ideal trajectories. Starts with the bundled copy, then swaps in the latest from the API. */
export function useDegreeTemplates() {
    const [degreeTemplates, setDegreeTemplates] = useState<DegreeTemplate[]>(staticTemplates)
    const [idealTrajectories, setIdealTrajectories] = useState<IdealTrajectory[]>(staticTrajectories)

    useEffect(() => {
        const controller = new AbortController()
        fetch("/api/platform/trajectory-planner/templates", { signal: controller.signal })
            .then((res) => (res.ok ? (res.json() as Promise<TemplatesResponse>) : null))
            .then((data) => {
                if (data?.degreeTemplates?.length) setDegreeTemplates(data.degreeTemplates)
                if (data?.idealTrajectories?.length) setIdealTrajectories(data.idealTrajectories)
            })
            .catch((err: unknown) => {
                if (!controller.signal.aborted) platform.warn("Trajectory planner: templates API failed, using bundled data", err)
            })
        return () => controller.abort()
    }, [])

    return { degreeTemplates, idealTrajectories }
}

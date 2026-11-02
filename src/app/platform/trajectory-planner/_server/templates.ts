import "server-only"

import { revalidateTag } from "next/cache"
import { strapiGet } from "@/lib/apis/strapi"
import { sharedCache } from "@/lib/cache/shared"
import { CACHE_TAGS } from "@/lib/cache/tags"
import { bundledTemplates, bundledTrajectories } from "../_trajectories"
import { parseDegreeTemplates, parseIdealTrajectories } from "../schema"
import type { TemplatesPayload } from "../types"

/**
 * Degree templates and ideal trajectories: the bundled copies, overridden by whatever department
 * reps saved in Strapi (`dept-infos`), matched on template id. Same for every user.
 */

type StrapiDeptInfo = { attributes?: StrapiDeptInfo; degree_templates?: unknown; ideal_trajectories?: unknown }

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

function merge(strapiDepts: StrapiDeptInfo[]): TemplatesPayload {
    const templates = new Map(bundledTemplates.map((template) => [template.id, template]))
    const trajectories = new Map(bundledTrajectories.map((trajectory) => [trajectory.templateId, trajectory]))

    for (const dept of strapiDepts) {
        // Strapi v4 nests fields under `attributes`; v5 returns them flat.
        const fields = dept.attributes ?? dept
        for (const template of parseDegreeTemplates(asArray(fields.degree_templates))) templates.set(template.id, template)
        for (const trajectory of parseIdealTrajectories(asArray(fields.ideal_trajectories))) trajectories.set(trajectory.templateId, trajectory)
    }

    return { degreeTemplates: [...templates.values()], idealTrajectories: [...trajectories.values()] }
}

/**
 * L2, key cardinality 1 (no arguments). Tens of KB on disk (the bundled set is about 40 KB of JSON).
 * Cleared by the rep dashboard's save (`revalidateTemplates`) and by the Strapi webhook for
 * `dept-info`. Improves speed and bill: every page load used to fetch every department from Strapi.
 */
const getCachedTemplates = sharedCache(
    async (): Promise<TemplatesPayload> => {
        const response = (await strapiGet("/dept-infos", {
            fields: ["degree_templates", "ideal_trajectories"],
            pagination: { pageSize: 100 },
        })) as { data?: unknown } | null
        return merge(asArray(response?.data) as StrapiDeptInfo[])
    },
    ["trajectory-templates-v1"],
    { tags: [CACHE_TAGS.trajectoryTemplates], revalidate: 86_400 },
)

/** Never throws: when Strapi is down the bundled templates still let students plan. */
export async function getTemplates(): Promise<TemplatesPayload> {
    try {
        return await getCachedTemplates()
    } catch (err) {
        platform.warn("Trajectory templates: Strapi read failed, serving the bundled copy:", err)
        return merge([])
    }
}

/** Call after any write to `dept-infos`. */
export function revalidateTemplates(): void {
    revalidateTag(CACHE_TAGS.trajectoryTemplates)
}

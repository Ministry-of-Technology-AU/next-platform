import { NextRequest, NextResponse } from "next/server"
import { strapiGet } from "@/lib/apis/strapi"
import { degreeTemplates, idealTrajectories } from "@/app/platform/trajectory-planner/_trajectories"

// GET: Fetch all templates and trajectories (merges Strapi + static fallback)
export async function GET(request: NextRequest) {
    try {
        // Try to fetch all dept_info from Strapi
        let strapiTemplates: any[] = []
        let strapiTrajectories: any[] = []

        try {
            const response = await strapiGet("/dept-infos", {
                pagination: { limit: 100 }
            })

            if (response?.data) {
                for (const dept of response.data) {
                    // Strapi v4 returns data in attributes, v5 returns flat
                    const attrs = dept.attributes || dept
                    if (attrs.degree_templates) {
                        strapiTemplates.push(...attrs.degree_templates)
                    }
                    if (attrs.ideal_trajectories) {
                        strapiTrajectories.push(...attrs.ideal_trajectories)
                    }
                }
            }
        } catch (strapiError) {
            console.warn("Strapi fetch failed, using static data only:", strapiError)
        }

        // Merge: Strapi data takes priority over static data
        // Create maps by template ID for efficient merging
        const templateMap = new Map<string, any>()
        const trajectoryMap = new Map<string, any>()

        // Add static data first
        for (const template of degreeTemplates) {
            templateMap.set(template.id, template)
        }
        for (const trajectory of idealTrajectories) {
            trajectoryMap.set(trajectory.templateId, trajectory)
        }

        // Override with Strapi data (higher priority)
        for (const template of strapiTemplates) {
            templateMap.set(template.id, template)
        }
        for (const trajectory of strapiTrajectories) {
            trajectoryMap.set(trajectory.templateId, trajectory)
        }

        return NextResponse.json({
            degreeTemplates: Array.from(templateMap.values()),
            idealTrajectories: Array.from(trajectoryMap.values()),
            source: strapiTemplates.length > 0 ? "mixed" : "static"
        })
    } catch (error) {
        console.error("Error fetching templates:", error)

        // Fallback to static data on any error
        return NextResponse.json({
            degreeTemplates,
            idealTrajectories,
            source: "static"
        })
    }
}

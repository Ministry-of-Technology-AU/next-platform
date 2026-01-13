// Re-export everything from _trajectories
// This file maintains backward compatibility with existing imports
export * from "./_trajectories"
export type { DegreeTemplate } from "./types"
import { degreeTemplates, idealTrajectories } from "./_trajectories"

// Fetch all templates and trajectories from API (with static fallback)
export async function getAllTemplatesAndTrajectories() {
    try {
        const res = await fetch('/api/platform/trajectory-planner/templates', {
            next: { revalidate: 60 } // Cache for 60 seconds
        })
        if (res.ok) {
            return res.json()
        }
    } catch (e) {
        console.warn('API fetch failed, using static data:', e)
    }
    // Fallback to static data
    return { degreeTemplates, idealTrajectories, source: 'static' }
}

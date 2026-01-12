// Index file - combines all department trajectories and templates
import { csTrajectories, csTemplates } from "./cs"
import { psychTrajectories, psychTemplates } from "./psych"
import { ecoTrajectories, ecoTemplates } from "./eco"
import { bioTrajectories, bioTemplates } from "./bio"
import { chemTrajectories, chemTemplates } from "./chem"

// Re-export shared types and constants
export * from "./shared"

// Combined trajectories from all departments
export const idealTrajectories = [
    ...csTrajectories,
    ...psychTrajectories,
    ...ecoTrajectories,
    ...bioTrajectories,
    ...chemTrajectories,
]

// Combined templates from all departments
export const degreeTemplates = [
    ...csTemplates,
    ...psychTemplates,
    ...ecoTemplates,
    ...bioTemplates,
    ...chemTemplates,
]

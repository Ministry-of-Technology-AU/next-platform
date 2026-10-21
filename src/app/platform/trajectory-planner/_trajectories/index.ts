import type { DegreeTemplate, IdealTrajectory } from "../types"
import { bioTemplates, bioTrajectories } from "./bio"
import { chemTemplates, chemTrajectories } from "./chem"
import { csTemplates, csTrajectories } from "./cs"
import { ecoTemplates, ecoTrajectories } from "./eco"
import { psychTemplates, psychTrajectories } from "./psych"

/**
 * Degree templates and ideal trajectories that ship with the app. Department reps can
 * override any of them from the rep dashboard (Strapi `dept-infos`); see `../_server/templates.ts`.
 * Server-side only, so this data stays out of the client bundle.
 */

export const bundledTemplates: DegreeTemplate[] = [
    ...csTemplates,
    ...psychTemplates,
    ...ecoTemplates,
    ...bioTemplates,
    ...chemTemplates,
]

export const bundledTrajectories: IdealTrajectory[] = [
    ...csTrajectories,
    ...psychTrajectories,
    ...ecoTrajectories,
    ...bioTrajectories,
    ...chemTrajectories,
]

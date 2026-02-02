// Shared types and constants for trajectory planner
import type { Course } from "../types"

// Grade points map (4.0 scale) - matches cgpa-planner
export const gradePointsMap: Record<string, number> = {
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'D-': 0.7,
    'F': 0.0,
    'P': 0.0, // Pass - doesn't affect GPA
    'TP': 0.0, // Teaching Practicum - doesn't affect GPA
}

export const gradeOptions = [
    { value: "none", label: "No Grade" },
    { value: "A", label: "A" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B", label: "B" },
    { value: "B-", label: "B-" },
    { value: "C+", label: "C+" },
    { value: "C", label: "C" },
    { value: "C-", label: "C-" },
    { value: "D+", label: "D+" },
    { value: "D", label: "D" },
    { value: "D-", label: "D-" },
    { value: "F", label: "F" },
    { value: "P", label: "P (Pass)" },
    { value: "TP", label: "TP (Teaching Practicum)" },
]

// Ideal trajectory type - courses organized by semester
export interface IdealTrajectorySemester {
    semester: number
    name: string
    courses: Omit<Course, 'id'>[]
}

export interface IdealTrajectory {
    templateId: string
    semesters: IdealTrajectorySemester[]
    notes?: string
    policyDocPath?: string // Path to policy doc
}

// Re-export DegreeTemplate from types
export type { DegreeTemplate } from "../types"

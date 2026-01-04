import type { DegreeTemplate } from "./types"

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

// Placeholder templates - user will add actual courses/policies later
// FC and CC courses are already in the default tray, templates only add major-specific courses
export const degreeTemplates: DegreeTemplate[] = [
    {
        id: "cs-2024",
        name: "Computer Science Major",
        batch: "2024",
        requiredCredits: {
            major: 48,
            minor: 24,
            fc: 36,
            cc: 4,
            openCredits: 16,
            total: 128,
        },
        defaultCourses: [
            // CS Major courses (placeholders)
            { name: "Introduction to Computer Science", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Data Structures", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Discrete Mathematics", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Theory of Computation", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Operating Systems", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Computer Networks", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Database Systems", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
        ]
    },
    {
        id: "eco-2024",
        name: "Economics Major",
        batch: "2024",
        requiredCredits: {
            major: 44,
            minor: 24,
            fc: 36,
            cc: 4,
            openCredits: 20,
            total: 128,
        },
        defaultCourses: [
            // ECO Major courses (placeholders)
            { name: "Principles of Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Microeconomics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Macroeconomics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Econometrics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
        ]
    }
]

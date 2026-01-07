import type { DegreeTemplate, Course } from "./types"

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
    policyDocPath?: string // Path to policy PDF in /public
}

// Ideal trajectories for each degree template
export const idealTrajectories: IdealTrajectory[] = [
    {
        templateId: "cs-2024",
        notes: "** Incorporate either BIO-1200 or PHY-1220, along with 12 credits of Computer Science electives.",
        policyDocPath: "/policy_docs/CS_Major_Curriculum.pdf",
        semesters: [
            {
                semester: 1,
                name: "1st Semester",
                courses: [
                    { name: "Calculus", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 2,
                name: "2nd Semester",
                courses: [
                    { name: "Introduction to Computer Science", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Discrete Mathematics", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 3,
                name: "3rd Semester",
                courses: [
                    { name: "Probability and Statistics", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Linear Algebra", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Data Structures and Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Programming Laboratory", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 4,
                name: "4th Semester",
                courses: [
                    { name: "Design and Analysis of Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Computer Organisation and Systems", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Computer Networks", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Information Security", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 5,
                name: "5th Semester",
                courses: [
                    { name: "Design Practices in CS", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Introduction to Machine Learning", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Operating Systems", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 6,
                name: "6th Semester",
                courses: [
                    { name: "Theory of Computation", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Data Science and Management", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Programming Languages and Translation", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 7,
                name: "7th Semester",
                courses: [
                    { name: "Capstone Project", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 8,
                name: "8th Semester",
                courses: []
            },
        ]
    },
    {
        templateId: "eco-2024",
        notes: "** Complete foundation courses and choose electives based on specialization interest.",
        semesters: [
            {
                semester: 1,
                name: "1st Semester",
                courses: [
                    { name: "Principles of Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 2,
                name: "2nd Semester",
                courses: [
                    { name: "Microeconomics I", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Statistics for Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 3,
                name: "3rd Semester",
                courses: [
                    { name: "Macroeconomics I", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Mathematical Methods for Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 4,
                name: "4th Semester",
                courses: [
                    { name: "Microeconomics II", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Econometrics I", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 5,
                name: "5th Semester",
                courses: [
                    { name: "Macroeconomics II", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "International Trade", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 6,
                name: "6th Semester",
                courses: [
                    { name: "Development Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Econometrics II", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 7,
                name: "7th Semester",
                courses: [
                    { name: "Public Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 8,
                name: "8th Semester",
                courses: [
                    { name: "Economics Research Project", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
        ]
    }
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

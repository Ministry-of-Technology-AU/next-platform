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
        templateId: "cs-4yr",
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
        templateId: "cs-research-4yr",
        notes: "** Incorporate either BIO-1200 or PHY-1220, along with 16 credits of Computer Science electives, into your four-year curriculum in addition to the courses mentioned above.",
        policyDocPath: "/policy_docs/CS_Research_Curriculum.pdf",
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
                    { name: "Capstone Thesis", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 8,
                name: "8th Semester",
                courses: [
                    { name: "Capstone Thesis", credits: 8, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
        ]
    },
    {
        templateId: "cs-ent-4yr",
        notes: "** CS & ENT interdisciplinary major combining core CS courses with Entrepreneurship courses.",
        policyDocPath: "/policy_docs/CS_ENT_Curriculum.pdf",
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
                    { name: "ENT Course 1", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 4,
                name: "4th Semester",
                courses: [
                    { name: "Computer Organisation and Systems", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Computer Networks", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Information Security", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "ENT Course 2", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 5,
                name: "5th Semester",
                courses: [
                    { name: "Design Practices in CS", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Introduction to Machine Learning", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "ENT Course 3", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 6,
                name: "6th Semester",
                courses: [
                    { name: "ENT Course 4", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
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
        templateId: "cs-ent-research-4yr",
        notes: "** CS & ENT with Research - includes 12-credit Capstone Thesis.",
        policyDocPath: "/policy_docs/CS_ENT_Research_Curriculum.pdf",
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
                    { name: "ENT Course 1", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 4,
                name: "4th Semester",
                courses: [
                    { name: "Computer Organisation and Systems", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Computer Networks", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "ENT Course 2", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 5,
                name: "5th Semester",
                courses: [
                    { name: "Design Practices in CS", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Introduction to Machine Learning", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "ENT Course 3", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 6,
                name: "6th Semester",
                courses: [
                    { name: "ENT Course 4", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
                    { name: "Information Security", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
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
                courses: [
                    { name: "Capstone Thesis", credits: 8, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
        ]
    },
    {
        templateId: "cs-math-track1-4yr",
        notes: "** Incorporate either BIO-1200 or PHY-1220, along with 12 credits of CS or MATH electives. Track 1: Cryptography, Number Theory, Algebra.",
        policyDocPath: "/policy_docs/CS_MATH_Curriculum.pdf",
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
                    { name: "Computer Organisation and Systems", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Design and Analysis of Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Algebra 1", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 5,
                name: "5th Semester",
                courses: [
                    { name: "Cryptography", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Operating Systems", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Multivariate Calculus", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 6,
                name: "6th Semester",
                courses: [
                    { name: "Theory of Computation", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Number Theory", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Real Analysis", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
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
        templateId: "cs-math-track2-4yr",
        notes: "** Incorporate either BIO-1200 or PHY-1220, along with 12 credits of CS or MATH electives. Track 2: Data Science and Machine Learning.",
        policyDocPath: "/policy_docs/CS_MATH_Curriculum.pdf",
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
                    { name: "Computer Organisation and Systems", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Design and Analysis of Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Algebra 1", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 5,
                name: "5th Semester",
                courses: [
                    { name: "Introduction to Machine Learning", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Operating Systems", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Multivariate Calculus", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 6,
                name: "6th Semester",
                courses: [
                    { name: "Data Science and Management", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Statistical Inference", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Real Analysis", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
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
        templateId: "eco-4yr",
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
        id: "cs-4yr",
        name: "CS (4 years)",
        batch: "2024",
        requiredCredits: {
            major: 80, // Core 68 + Electives 12
            minor: 0,  // No minor for 4-year
            fc: 36,
            cc: 4,
            openCredits: 38,
            total: 160, // + 2 internship credits
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
        id: "cs-research-4yr",
        name: "CS with Research (4 years)",
        batch: "2024",
        requiredCredits: {
            major: 92, // Core 76 + Electives 16 (includes Capstone Thesis 12)
            minor: 0,
            fc: 36,
            cc: 4,
            openCredits: 26,
            total: 160, // + 2 internship credits
        },
        defaultCourses: [
            // CS with Research courses
            { name: "Introduction to Computer Science", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Data Structures and Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Discrete Mathematics", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Theory of Computation", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Operating Systems", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Computer Networks", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Information Security", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Capstone Thesis", credits: 12, deptCode: "CS", type: "Major", isInSemester: false },
        ]
    },
    {
        id: "cs-ent-4yr",
        name: "CS & ENT (4 years)",
        batch: "2024",
        requiredCredits: {
            major: 80, // Core 64 + Project 4 + Electives 12
            minor: 0,
            fc: 36,
            cc: 4,
            openCredits: 28,
            total: 150, // + 2 internship credits
        },
        defaultCourses: [
            // CS & ENT courses
            { name: "Introduction to Computer Science", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Data Structures and Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Discrete Mathematics", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Introduction to Machine Learning", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Information Security", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Computer Organisation and Systems", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Design Practices in CS", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Computer Networks", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "ENT Course 1", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
            { name: "ENT Course 2", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
            { name: "ENT Course 3", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
            { name: "ENT Course 4", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
            { name: "Capstone Project", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
        ]
    },
    {
        id: "cs-ent-research-4yr",
        name: "CS & ENT with Research (4 years)",
        batch: "2024",
        requiredCredits: {
            major: 92, // Core 64 + Thesis 12 + Electives 16
            minor: 0,
            fc: 36,
            cc: 4,
            openCredits: 16,
            total: 150, // + 2 internship credits
        },
        defaultCourses: [
            // CS & ENT with Research courses
            { name: "Introduction to Computer Science", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Data Structures and Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Discrete Mathematics", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Introduction to Machine Learning", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Information Security", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Computer Organisation and Systems", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Design Practices in CS", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Computer Networks", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "ENT Course 1", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
            { name: "ENT Course 2", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
            { name: "ENT Course 3", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
            { name: "ENT Course 4", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
            { name: "Capstone Project", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Capstone Thesis", credits: 8, deptCode: "CS", type: "Major", isInSemester: false },
        ]
    },
    {
        id: "cs-math-track1-4yr",
        name: "CS + MATH Track 1 (4 years)",
        batch: "2024",
        requiredCredits: {
            major: 80, // Core 64 + Project 4 + Electives 12
            minor: 0,
            fc: 36,
            cc: 4,
            openCredits: 38,
            total: 160, // + 2 internship credits
        },
        defaultCourses: [
            // CS + MATH Track 1: Cryptography, Number Theory, Algebra
            { name: "Introduction to Computer Science", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Discrete Mathematics", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Data Structures and Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Programming Laboratory", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Theory of Computation", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Design and Analysis of Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Cryptography", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Computer Organisation and Systems", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Operating Systems", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Probability and Statistics", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
            { name: "Linear Algebra", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
            { name: "Calculus", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
            { name: "Algebra 1", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
            { name: "Multivariate Calculus", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
            { name: "Number Theory", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
            { name: "Real Analysis", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
            { name: "Capstone Project", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
        ]
    },
    {
        id: "cs-math-track2-4yr",
        name: "CS + MATH Track 2 (4 years)",
        batch: "2024",
        requiredCredits: {
            major: 80, // Core 64 + Project 4 + Electives 12
            minor: 0,
            fc: 36,
            cc: 4,
            openCredits: 38,
            total: 160, // + 2 internship credits
        },
        defaultCourses: [
            // CS + MATH Track 2: Data Science and Machine Learning
            { name: "Introduction to Computer Science", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Discrete Mathematics", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Data Structures and Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Programming Laboratory", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Introduction to Machine Learning", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Data Science and Management", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Design and Analysis of Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Computer Organisation and Systems", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Operating Systems", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
            { name: "Probability and Statistics", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
            { name: "Linear Algebra", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
            { name: "Calculus", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
            { name: "Algebra 1", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
            { name: "Multivariate Calculus", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
            { name: "Statistical Inference", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
            { name: "Real Analysis", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
            { name: "Capstone Project", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
        ]
    },
    {
        id: "eco-4yr",
        name: "Economics (4 years)",
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
    },
    {
        id: "psy-4yr",
        name: "Psychology (4 years)",
        batch: "2024",
        policyDocPath: "/policy_docs/PSY_Curriculum.pdf",
        requiredCredits: {
            major: 72, // Required 32 + Electives 40
            minor: 0,
            fc: 36,
            cc: 4,
            openCredits: 46,
            total: 160, // + 2 internship credits
        },
        defaultCourses: [
            // PSY Required Courses (32 credits)
            { name: "Introduction to Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Statistics and Research Methods I", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Cognitive Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Social Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Developmental Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Statistics and Research Methods II", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Clinical Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Introduction to Neuroscience", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            // Capstone Project
            { name: "Capstone Project", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
        ]
    },
    {
        id: "psy-research-4yr",
        name: "Psychology with Research (4 years)",
        batch: "2024",
        policyDocPath: "/policy_docs/PSY_Curriculum.pdf",
        requiredCredits: {
            major: 84, // Required 32 + Electives 40 + Research 12
            minor: 0,
            fc: 36,
            cc: 4,
            openCredits: 34,
            total: 160, // + 2 internship credits
        },
        defaultCourses: [
            // PSY Required Courses (32 credits)
            { name: "Introduction to Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Statistics and Research Methods I", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Cognitive Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Social Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Developmental Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Statistics and Research Methods II", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Clinical Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Introduction to Neuroscience", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            // Research Credits (12)
            { name: "Thesis Proposal", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Thesis", credits: 8, deptCode: "PSY", type: "Major", isInSemester: false },
        ]
    }
]


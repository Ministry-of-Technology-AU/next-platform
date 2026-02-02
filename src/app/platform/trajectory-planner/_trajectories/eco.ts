// Economics Department: Economics, Economics & Finance, Economics & Public Policy
import type { IdealTrajectory, DegreeTemplate } from "./shared"

export const ecoTrajectories: IdealTrajectory[] = [
    {
        templateId: "eco-4yr",
        notes: "** 4-year BA Economics. 12 required courses + 8 ECO electives.",
        semesters: [
            { semester: 1, name: "1st Semester", courses: [] },
            {
                semester: 2, name: "2nd Semester", courses: [
                    { name: "Introduction to Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Mathematics for Economists", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Statistics for Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 3, name: "3rd Semester", courses: [
                    { name: "Microeconomic Theory I", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Macroeconomic Theory I", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 4, name: "4th Semester", courses: [
                    { name: "Microeconomic Theory II", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Macroeconomic Theory II", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Econometrics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 5, name: "5th Semester", courses: [
                    { name: "Development Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            { semester: 6, name: "6th Semester", courses: [] },
            { semester: 7, name: "7th Semester", courses: [] },
            { semester: 8, name: "8th Semester", courses: [] }
        ]
    },
    {
        templateId: "eco-fin-4yr",
        notes: "** 4-year BSc Economics & Finance. 12 required ECO courses + 8 ECO/FIN electives (at least 4 FIN).",
        semesters: [
            { semester: 1, name: "1st Semester", courses: [] },
            {
                semester: 2, name: "2nd Semester", courses: [
                    { name: "Introduction to Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Mathematics for Economists", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Statistics for Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 3, name: "3rd Semester", courses: [
                    { name: "Microeconomic Theory I", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Macroeconomic Theory I", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 4, name: "4th Semester", courses: [
                    { name: "Microeconomic Theory II", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Macroeconomic Theory II", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Econometrics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 5, name: "5th Semester", courses: [
                    { name: "Development Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            { semester: 6, name: "6th Semester", courses: [] },
            { semester: 7, name: "7th Semester", courses: [] },
            { semester: 8, name: "8th Semester", courses: [] }
        ]
    },
    {
        templateId: "eco-pub-4yr",
        notes: "** 4-year BA Economics & Public Policy. 12 required ECO courses + 8 ECO/PUB electives (at least 4 PUB).",
        semesters: [
            { semester: 1, name: "1st Semester", courses: [] },
            {
                semester: 2, name: "2nd Semester", courses: [
                    { name: "Introduction to Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Mathematics for Economists", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Statistics for Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 3, name: "3rd Semester", courses: [
                    { name: "Microeconomic Theory I", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Macroeconomic Theory I", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 4, name: "4th Semester", courses: [
                    { name: "Microeconomic Theory II", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Macroeconomic Theory II", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                    { name: "Econometrics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 5, name: "5th Semester", courses: [
                    { name: "Development Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
                ]
            },
            { semester: 6, name: "6th Semester", courses: [] },
            { semester: 7, name: "7th Semester", courses: [] },
            { semester: 8, name: "8th Semester", courses: [] }
        ]
    }
]

export const ecoTemplates: DegreeTemplate[] = [
    {
        id: "eco-4yr",
        name: "Economics (4 years)",
        batch: "2024",
        policyDocPath: "https://docs.google.com/document/d/1nQyvU2Q-mbm0cPj2wXkLK0LXapjV2cSF8vAUaOk2E8A/edit?usp=drive_link",
        requiredCredits: { major: 80, minor: 0, fc: 36, cc: 4, concentration: 0, openCredits: 38, total: 160 },
        defaultCourses: [
            // Required Courses (48 credits - 12 courses)
            { name: "Introduction to Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Mathematics for Economists", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Statistics for Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Econometrics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Microeconomic Theory I", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Microeconomic Theory II", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Macroeconomic Theory I", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Macroeconomic Theory II", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Development Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Advanced Microeconomics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Advanced Macroeconomics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Advanced Econometrics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
        ]
    },
    {
        id: "eco-fin-4yr",
        name: "Economics & Finance (4 years)",
        batch: "2024",
        policyDocPath: "https://docs.google.com/document/d/1zWgF0YTm-eP2MlqMCRPrTotQydMq_w-Ua4TMrK_mr0I/edit?usp=drive_link",
        requiredCredits: { major: 80, minor: 0, fc: 36, cc: 4, concentration: 0, openCredits: 38, total: 160 },
        defaultCourses: [
            // Required ECO Courses (48 credits - 12 courses)
            { name: "Introduction to Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Mathematics for Economists", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Statistics for Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Econometrics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Microeconomic Theory I", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Microeconomic Theory II", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Macroeconomic Theory I", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Macroeconomic Theory II", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Development Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Advanced Microeconomics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Advanced Macroeconomics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Advanced Econometrics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            // Note: 8 ECO/FIN electives required (at least 4 FIN), max 3 cross-listed, no ISM
        ]
    },
    {
        id: "eco-pub-4yr",
        name: "Economics & Public Policy (4 years)",
        batch: "2024",
        policyDocPath: "https://docs.google.com/document/d/1-EwOTuVPMqBrVTnXNNrvZZaX3so-MzMZWzRu4TQ3rHM/edit?usp=drive_link",
        requiredCredits: { major: 80, minor: 0, fc: 36, cc: 4, concentration: 0, openCredits: 38, total: 160 },
        defaultCourses: [
            // Required ECO Courses (48 credits - 12 courses)
            { name: "Introduction to Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Mathematics for Economists", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Statistics for Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Econometrics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Microeconomic Theory I", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Microeconomic Theory II", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Macroeconomic Theory I", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Macroeconomic Theory II", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Development Economics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Advanced Microeconomics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Advanced Macroeconomics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            { name: "Advanced Econometrics", credits: 4, deptCode: "ECO", type: "Major", isInSemester: false },
            // Note: 8 ECO/PUB electives required (at least 4 PUB), max 3 cross-listed, no ISM
        ]
    }
]

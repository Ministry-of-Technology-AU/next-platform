// Psychology Department: Psychology, Psychology with Research
import type { IdealTrajectory, DegreeTemplate } from "./shared"

export const psychTrajectories: IdealTrajectory[] = [
    {
        templateId: "psy-4yr",
        notes: "** Based on department recommendations. TAships can count as elective credits.",
        policyDocPath: "https://docs.google.com/document/d/1U88S09QZT-kEYeyM7jm5D4QET-fNBWTy4iQGycWJ67I/edit?tab=t.vzjiygp2rexm",
        semesters: [
            { semester: 1, name: "1st Semester", courses: [] },
            {
                semester: 2, name: "2nd Semester", courses: [
                    { name: "Introduction to Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
                    { name: "Statistics and Research Methods I", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false }
                ]
            },
            {
                semester: 3, name: "3rd Semester", courses: [
                    { name: "Statistics and Research Methods II", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
                    { name: "Introduction to Neuroscience", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
                    { name: "Cognitive Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false }
                ]
            },
            {
                semester: 4, name: "4th Semester", courses: [
                    { name: "Clinical Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
                    { name: "Social Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
                    { name: "Developmental Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false }
                ]
            },
            { semester: 5, name: "5th Semester", courses: [] },
            { semester: 6, name: "6th Semester", courses: [] },
            { semester: 7, name: "7th Semester", courses: [] },
            { semester: 8, name: "8th Semester", courses: [] }
        ]
    },
    {
        templateId: "psy-research-4yr",
        notes: "** Based on department recommendations. TAships can count as elective credits. Includes 12 credits of research.",
        policyDocPath: "https://docs.google.com/document/d/1U88S09QZT-kEYeyM7jm5D4QET-fNBWTy4iQGycWJ67I/edit?tab=t.vzjiygp2rexm",
        semesters: [
            { semester: 1, name: "1st Semester", courses: [] },
            {
                semester: 2, name: "2nd Semester", courses: [
                    { name: "Introduction to Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
                    { name: "Statistics and Research Methods I", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false }
                ]
            },
            {
                semester: 3, name: "3rd Semester", courses: [
                    { name: "Statistics and Research Methods II", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
                    { name: "Introduction to Neuroscience", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
                    { name: "Cognitive Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false }
                ]
            },
            {
                semester: 4, name: "4th Semester", courses: [
                    { name: "Clinical Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
                    { name: "Social Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
                    { name: "Developmental Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false }
                ]
            },
            { semester: 5, name: "5th Semester", courses: [] },
            { semester: 6, name: "6th Semester", courses: [] },
            {
                semester: 7, name: "7th Semester", courses: [
                    { name: "Thesis Proposal", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false }
                ]
            },
            {
                semester: 8, name: "8th Semester", courses: [
                    { name: "Thesis", credits: 12, deptCode: "PSY", type: "Major", isInSemester: false }
                ]
            }
        ]
    }
]

export const psychTemplates: DegreeTemplate[] = [
    {
        id: "psy-4yr",
        name: "Psychology (4 years)",
        batch: "2024",
        policyDocPath: "/policy_docs/PSY_Curriculum.pdf",
        requiredCredits: { major: 72, minor: 0, fc: 36, cc: 4, openCredits: 46, total: 160 },
        defaultCourses: [
            { name: "Introduction to Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Statistics and Research Methods I", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Cognitive Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Social Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Developmental Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Statistics and Research Methods II", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Clinical Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Introduction to Neuroscience", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Capstone Project", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
        ]
    },
    {
        id: "psy-research-4yr",
        name: "Psychology with Research (4 years)",
        batch: "2024",
        policyDocPath: "/policy_docs/PSY_Curriculum.pdf",
        requiredCredits: { major: 84, minor: 0, fc: 36, cc: 4, openCredits: 34, total: 160 },
        defaultCourses: [
            { name: "Introduction to Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Statistics and Research Methods I", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Cognitive Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Social Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Developmental Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Statistics and Research Methods II", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Clinical Psychology", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Introduction to Neuroscience", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Thesis Proposal", credits: 4, deptCode: "PSY", type: "Major", isInSemester: false },
            { name: "Thesis", credits: 8, deptCode: "PSY", type: "Major", isInSemester: false },
        ]
    }
]

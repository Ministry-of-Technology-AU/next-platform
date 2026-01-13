// CS Department: CS, CS-Research, CS-ENT, CS-ENT-Research, CS-MATH tracks
import type { IdealTrajectory, DegreeTemplate } from "./shared"

export const csTrajectories: IdealTrajectory[] = [
    {
        templateId: "cs-4yr",
        notes: "** Incorporate either BIO-1200 or PHY-1220, along with 12 credits of Computer Science electives.",
        policyDocPath: "/policy_docs/CS_Major_Curriculum.pdf",
        semesters: [
            { semester: 1, name: "1st Semester", courses: [{ name: "Calculus", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false }] },
            {
                semester: 2, name: "2nd Semester", courses: [
                    { name: "Introduction to Computer Science", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Discrete Mathematics", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 3, name: "3rd Semester", courses: [
                    { name: "Probability and Statistics", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Linear Algebra", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Data Structures and Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Programming Laboratory", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 4, name: "4th Semester", courses: [
                    { name: "Design and Analysis of Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Computer Organisation and Systems", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Computer Networks", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Information Security", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 5, name: "5th Semester", courses: [
                    { name: "Design Practices in CS", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Introduction to Machine Learning", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Operating Systems", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 6, name: "6th Semester", courses: [
                    { name: "Theory of Computation", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Data Science and Management", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Programming Languages and Translation", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            { semester: 7, name: "7th Semester", courses: [{ name: "Capstone Project", credits: 4, deptCode: "CS", type: "Major", isInSemester: false }] },
            { semester: 8, name: "8th Semester", courses: [] },
        ]
    },
    {
        templateId: "cs-research-4yr",
        notes: "** Incorporate either BIO-1200 or PHY-1220, along with 16 credits of Computer Science electives.",
        policyDocPath: "/policy_docs/CS_Research_Curriculum.pdf",
        semesters: [
            { semester: 1, name: "1st Semester", courses: [{ name: "Calculus", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false }] },
            {
                semester: 2, name: "2nd Semester", courses: [
                    { name: "Introduction to Computer Science", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Discrete Mathematics", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 3, name: "3rd Semester", courses: [
                    { name: "Probability and Statistics", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Linear Algebra", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Data Structures and Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Programming Laboratory", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 4, name: "4th Semester", courses: [
                    { name: "Design and Analysis of Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Computer Organisation and Systems", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Computer Networks", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Information Security", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 5, name: "5th Semester", courses: [
                    { name: "Design Practices in CS", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Introduction to Machine Learning", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Operating Systems", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 6, name: "6th Semester", courses: [
                    { name: "Theory of Computation", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Data Science and Management", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Programming Languages and Translation", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            { semester: 7, name: "7th Semester", courses: [{ name: "Capstone Thesis", credits: 4, deptCode: "CS", type: "Major", isInSemester: false }] },
            { semester: 8, name: "8th Semester", courses: [{ name: "Capstone Thesis", credits: 8, deptCode: "CS", type: "Major", isInSemester: false }] },
        ]
    },
    {
        templateId: "cs-ent-4yr",
        notes: "** CS & ENT interdisciplinary major combining core CS courses with Entrepreneurship courses.",
        policyDocPath: "https://docs.google.com/document/d/1OtFP_fcBZQ8V8Esm2U8fHThmugs6y0ND/edit",
        semesters: [
            { semester: 1, name: "1st Semester", courses: [{ name: "Calculus", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false }] },
            {
                semester: 2, name: "2nd Semester", courses: [
                    { name: "Introduction to Computer Science", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Discrete Mathematics", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 3, name: "3rd Semester", courses: [
                    { name: "Probability and Statistics", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Linear Algebra", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Data Structures and Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "ENT Course 1", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 4, name: "4th Semester", courses: [
                    { name: "Computer Organisation and Systems", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Computer Networks", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Information Security", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "ENT Course 2", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 5, name: "5th Semester", courses: [
                    { name: "Design Practices in CS", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Introduction to Machine Learning", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "ENT Course 3", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
                ]
            },
            { semester: 6, name: "6th Semester", courses: [{ name: "ENT Course 4", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false }] },
            { semester: 7, name: "7th Semester", courses: [{ name: "Capstone Project", credits: 4, deptCode: "CS", type: "Major", isInSemester: false }] },
            { semester: 8, name: "8th Semester", courses: [] },
        ]
    },
    {
        templateId: "cs-ent-research-4yr",
        notes: "** CS & ENT with Research - includes 12-credit Capstone Thesis.",
        policyDocPath: "https://docs.google.com/document/d/1OtFP_fcBZQ8V8Esm2U8fHThmugs6y0ND/edit",
        semesters: [
            { semester: 1, name: "1st Semester", courses: [{ name: "Calculus", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false }] },
            {
                semester: 2, name: "2nd Semester", courses: [
                    { name: "Introduction to Computer Science", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Discrete Mathematics", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 3, name: "3rd Semester", courses: [
                    { name: "Probability and Statistics", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Linear Algebra", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Data Structures and Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "ENT Course 1", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 4, name: "4th Semester", courses: [
                    { name: "Computer Organisation and Systems", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Computer Networks", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "ENT Course 2", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 5, name: "5th Semester", courses: [
                    { name: "Design Practices in CS", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Introduction to Machine Learning", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "ENT Course 3", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 6, name: "6th Semester", courses: [
                    { name: "ENT Course 4", credits: 4, deptCode: "ENT", type: "Major", isInSemester: false },
                    { name: "Information Security", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            { semester: 7, name: "7th Semester", courses: [{ name: "Capstone Project", credits: 4, deptCode: "CS", type: "Major", isInSemester: false }] },
            { semester: 8, name: "8th Semester", courses: [{ name: "Capstone Thesis", credits: 8, deptCode: "CS", type: "Major", isInSemester: false }] },
        ]
    },
    {
        templateId: "cs-math-track1-4yr",
        notes: "** Incorporate either BIO-1200 or PHY-1220, along with 12 credits of CS or MATH electives. Track 1: Cryptography, Number Theory, Algebra.",
        policyDocPath: "https://docs.google.com/document/d/1yabkBM64wTlEjg0_-mDmtw89M-Z7fa-r/edit",
        semesters: [
            { semester: 1, name: "1st Semester", courses: [{ name: "Calculus", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false }] },
            {
                semester: 2, name: "2nd Semester", courses: [
                    { name: "Introduction to Computer Science", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Discrete Mathematics", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 3, name: "3rd Semester", courses: [
                    { name: "Probability and Statistics", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Linear Algebra", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Data Structures and Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Programming Laboratory", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 4, name: "4th Semester", courses: [
                    { name: "Computer Organisation and Systems", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Design and Analysis of Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Algebra 1", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 5, name: "5th Semester", courses: [
                    { name: "Cryptography", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Operating Systems", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Multivariate Calculus", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 6, name: "6th Semester", courses: [
                    { name: "Theory of Computation", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Number Theory", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Real Analysis", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                ]
            },
            { semester: 7, name: "7th Semester", courses: [{ name: "Capstone Project", credits: 4, deptCode: "CS", type: "Major", isInSemester: false }] },
            { semester: 8, name: "8th Semester", courses: [] },
        ]
    },
    {
        templateId: "cs-math-track2-4yr",
        notes: "** Incorporate either BIO-1200 or PHY-1220, along with 12 credits of CS or MATH electives. Track 2: Data Science and Machine Learning.",
        policyDocPath: "https://docs.google.com/document/d/1yabkBM64wTlEjg0_-mDmtw89M-Z7fa-r/edit",
        semesters: [
            { semester: 1, name: "1st Semester", courses: [{ name: "Calculus", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false }] },
            {
                semester: 2, name: "2nd Semester", courses: [
                    { name: "Introduction to Computer Science", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Discrete Mathematics", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 3, name: "3rd Semester", courses: [
                    { name: "Probability and Statistics", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Linear Algebra", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Data Structures and Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Programming Laboratory", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 4, name: "4th Semester", courses: [
                    { name: "Computer Organisation and Systems", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Design and Analysis of Algorithms", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Algebra 1", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 5, name: "5th Semester", courses: [
                    { name: "Introduction to Machine Learning", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Operating Systems", credits: 2, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Multivariate Calculus", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                ]
            },
            {
                semester: 6, name: "6th Semester", courses: [
                    { name: "Data Science and Management", credits: 4, deptCode: "CS", type: "Major", isInSemester: false },
                    { name: "Statistical Inference", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                    { name: "Real Analysis", credits: 4, deptCode: "MATH", type: "Major", isInSemester: false },
                ]
            },
            { semester: 7, name: "7th Semester", courses: [{ name: "Capstone Project", credits: 4, deptCode: "CS", type: "Major", isInSemester: false }] },
            { semester: 8, name: "8th Semester", courses: [] },
        ]
    },
]

export const csTemplates: DegreeTemplate[] = [
    {
        id: "cs-4yr",
        name: "CS (4 years)",
        batch: "2024",
        requiredCredits: { major: 80, minor: 0, fc: 36, cc: 4, concentration: 0, openCredits: 38, total: 160 },
        defaultCourses: [
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
        requiredCredits: { major: 92, minor: 0, fc: 36, cc: 4, concentration: 0, openCredits: 26, total: 160 },
        defaultCourses: [
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
        requiredCredits: { major: 80, minor: 0, fc: 36, cc: 4, concentration: 0, openCredits: 28, total: 150 },
        defaultCourses: [
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
        requiredCredits: { major: 92, minor: 0, fc: 36, cc: 4, concentration: 0, openCredits: 16, total: 150 },
        defaultCourses: [
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
        requiredCredits: { major: 80, minor: 0, fc: 36, cc: 4, concentration: 0, openCredits: 38, total: 160 },
        defaultCourses: [
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
        requiredCredits: { major: 80, minor: 0, fc: 36, cc: 4, concentration: 0, openCredits: 38, total: 160 },
        defaultCourses: [
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
]

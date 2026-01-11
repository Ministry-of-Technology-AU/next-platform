// Biology Department: Biology, Biology with Research
import type { IdealTrajectory, DegreeTemplate } from "./shared"

export const bioTrajectories: IdealTrajectory[] = [
    {
        templateId: "bio-4yr",
        notes: "** Core sequence as recommended by the Department of Biology. Electives distributed mainly in years 3–4.",
        policyDocPath: "https://drive.google.com/drive/folders/1XWvEoidz4iZOpj_GDxvGZDad6eRDUhXp?usp=drive_link",
        semesters: [
            { semester: 1, name: "1st Semester", courses: [] },
            {
                semester: 2, name: "2nd Semester", courses: [
                    { name: "Introduction to Biology I: Genetics and Evolution", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
                    { name: "Exploring Life in the Neighbourhood Lab", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false }
                ]
            },
            {
                semester: 3, name: "3rd Semester", courses: [
                    { name: "Introduction to Biology II: Cell Biology", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
                    { name: "Chemical Basis of Life", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
                    { name: "Laboratory Course 2: Molecular Biology and Biochemistry", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false }
                ]
            },
            {
                semester: 4, name: "4th Semester", courses: [
                    { name: "Physiology", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
                    { name: "Introduction to Biology III: Molecular Genetics and Molecular Biology", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
                    { name: "Laboratory Course 3: Cell Biology and Genetics", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false }
                ]
            },
            {
                semester: 5, name: "5th Semester", courses: [
                    { name: "Ecology", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
                    { name: "Bioinformatics and Biostatistics", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
                    { name: "Ecology and Evolution Lab", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false }
                ]
            },
            { semester: 6, name: "6th Semester", courses: [] },
            {
                semester: 7, name: "7th Semester", courses: [
                    { name: "Research Methodology and Ethics", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false }
                ]
            },
            { semester: 8, name: "8th Semester", courses: [] }
        ]
    },
    {
        templateId: "bio-research-4yr",
        notes: "** Includes Thesis Proposal (4 credits) and Thesis (8 credits) in addition to Biology core.",
        policyDocPath: "https://drive.google.com/drive/folders/1XWvEoidz4iZOpj_GDxvGZDad6eRDUhXp?usp=drive_link",
        semesters: [
            { semester: 1, name: "1st Semester", courses: [] },
            {
                semester: 2, name: "2nd Semester", courses: [
                    { name: "Introduction to Biology I: Genetics and Evolution", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
                    { name: "Exploring Life in the Neighbourhood Lab", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false }
                ]
            },
            {
                semester: 3, name: "3rd Semester", courses: [
                    { name: "Introduction to Biology II: Cell Biology", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
                    { name: "Chemical Basis of Life", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
                    { name: "Laboratory Course 2: Molecular Biology and Biochemistry", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false }
                ]
            },
            {
                semester: 4, name: "4th Semester", courses: [
                    { name: "Physiology", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
                    { name: "Introduction to Biology III: Molecular Genetics and Molecular Biology", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
                    { name: "Laboratory Course 3: Cell Biology and Genetics", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false }
                ]
            },
            {
                semester: 5, name: "5th Semester", courses: [
                    { name: "Ecology", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
                    { name: "Bioinformatics and Biostatistics", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
                    { name: "Ecology and Evolution Lab", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false }
                ]
            },
            { semester: 6, name: "6th Semester", courses: [] },
            {
                semester: 7, name: "7th Semester", courses: [
                    { name: "Research Methodology and Ethics", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
                    { name: "Thesis Proposal", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false }
                ]
            },
            {
                semester: 8, name: "8th Semester", courses: [
                    { name: "Thesis", credits: 8, deptCode: "BIO", type: "Major", isInSemester: false }
                ]
            }
        ]
    }
]

export const bioTemplates: DegreeTemplate[] = [
    {
        id: "bio-4yr",
        name: "Biology (4 years)",
        batch: "2024",
        requiredCredits: { major: 80, minor: 0, fc: 36, cc: 4, openCredits: 38, total: 160 },
        defaultCourses: [
            { name: "Introduction to Biology I: Genetics and Evolution", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Introduction to Biology II: Cell Biology", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Introduction to Biology III: Molecular Genetics and Molecular Biology", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Chemical Basis of Life", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Ecology", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Bioinformatics and Biostatistics", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Physiology", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Research Methodology and Ethics", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Exploring Life in the Neighbourhood Lab", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Laboratory Course 2: Molecular Biology and Biochemistry", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Laboratory Course 3: Cell Biology and Genetics", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Ecology and Evolution Lab", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false }
        ]
    },
    {
        id: "bio-research-4yr",
        name: "Biology with Research (4 years)",
        batch: "2024",
        requiredCredits: { major: 92, minor: 0, fc: 36, cc: 4, openCredits: 26, total: 160 },
        defaultCourses: [
            { name: "Introduction to Biology I: Genetics and Evolution", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Introduction to Biology II: Cell Biology", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Introduction to Biology III: Molecular Genetics and Molecular Biology", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Chemical Basis of Life", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Ecology", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Bioinformatics and Biostatistics", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Physiology", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Research Methodology and Ethics", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Exploring Life in the Neighbourhood Lab", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Laboratory Course 2: Molecular Biology and Biochemistry", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Laboratory Course 3: Cell Biology and Genetics", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Ecology and Evolution Lab", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Thesis Proposal", credits: 4, deptCode: "BIO", type: "Major", isInSemester: false },
            { name: "Thesis", credits: 8, deptCode: "BIO", type: "Major", isInSemester: false }
        ]
    }
]

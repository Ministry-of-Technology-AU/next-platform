// Chemistry Department: Chemistry (3yr, 4yr, with Research)
import type { IdealTrajectory, DegreeTemplate } from "./shared"

export const chemTrajectories: IdealTrajectory[] = [
    {
        templateId: "chem-3yr",
        notes: "No official recommended trajectory has been listed for this major yet.",
        policyDocPath: "https://drive.google.com/drive/u/0/folders/1Lq7A3ITYNcqMyynE4S8BavOjLczPe4Sb",
        semesters: []
    },
    {
        templateId: "chem-4yr",
        notes: "No official recommended trajectory has been listed for this major yet.",
        policyDocPath: "https://drive.google.com/drive/u/0/folders/1Lq7A3ITYNcqMyynE4S8BavOjLczPe4Sb",
        semesters: []
    },
    {
        templateId: "chem-research-4yr",
        notes: "No official recommended trajectory has been listed for this major yet.",
        policyDocPath: "https://drive.google.com/drive/u/0/folders/1Lq7A3ITYNcqMyynE4S8BavOjLczPe4Sb",
        semesters: []
    }
]

export const chemTemplates: DegreeTemplate[] = [
    {
        id: "chem-3yr",
        name: "Chemistry (3 years)",
        batch: "2024",
        requiredCredits: { major: 60, minor: 0, fc: 36, cc: 4, openCredits: 0, total: 100 },
        defaultCourses: [
            { name: "Topics in Chemistry", credits: 4, deptCode: "CHM", type: "Major", isInSemester: false },
            { name: "Introductory Physical Chemistry", credits: 4, deptCode: "CHM", type: "Major", isInSemester: false },
            { name: "Concepts in Organic Chemistry", credits: 4, deptCode: "CHM", type: "Major", isInSemester: false },
            { name: "Introductory Inorganic Chemistry", credits: 4, deptCode: "CHM", type: "Major", isInSemester: false }
        ]
    },
    {
        id: "chem-4yr",
        name: "Chemistry (4 years)",
        batch: "2024",
        requiredCredits: { major: 80, minor: 0, fc: 36, cc: 4, openCredits: 36, total: 160 },
        defaultCourses: [
            { name: "Topics in Chemistry", credits: 4, deptCode: "CHM", type: "Major", isInSemester: false },
            { name: "Introductory Physical Chemistry", credits: 4, deptCode: "CHM", type: "Major", isInSemester: false },
            { name: "Concepts in Organic Chemistry", credits: 4, deptCode: "CHM", type: "Major", isInSemester: false },
            { name: "Introductory Inorganic Chemistry", credits: 4, deptCode: "CHM", type: "Major", isInSemester: false }
        ]
    },
    {
        id: "chem-research-4yr",
        name: "Chemistry with Research (4 years)",
        batch: "2024",
        requiredCredits: { major: 92, minor: 0, fc: 36, cc: 4, openCredits: 24, total: 160 },
        defaultCourses: [
            { name: "Topics in Chemistry", credits: 4, deptCode: "CHM", type: "Major", isInSemester: false },
            { name: "Introductory Physical Chemistry", credits: 4, deptCode: "CHM", type: "Major", isInSemester: false },
            { name: "Concepts in Organic Chemistry", credits: 4, deptCode: "CHM", type: "Major", isInSemester: false },
            { name: "Introductory Inorganic Chemistry", credits: 4, deptCode: "CHM", type: "Major", isInSemester: false },
            { name: "Research Credits", credits: 12, deptCode: "CHM", type: "Major", isInSemester: false }
        ]
    }
]

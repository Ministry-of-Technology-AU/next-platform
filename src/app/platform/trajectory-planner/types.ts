export type Credits = 2 | 4 | 8 | 12
export type CourseType = "FC" | "CC" | "Major" | "Minor" | "Open" | "CT"
export type DepartmentCode = "CS" | "ENT" | "ECO" | "MATH" | "PHY" | "PHI" | "ENG" | "HIS" | "BIO" | "CHM" | "POL" | "PSY" | "HUM" | "CW" | "YIF" | "MS" | "PA" | "AST" | "" // empty string for no dept
export type Grade = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F' | 'P' | 'TP' | null

export interface Course {
    id: string
    name: string
    credits: Credits
    deptCode: DepartmentCode
    type: CourseType
    isInSemester?: boolean
    grade?: Grade
}

export interface Semester {
    id: string
    name: string
    courses: Course[]
}

export interface CoursePlannerState {
    semesters: Semester[]
    availableCourses: Course[]
}

export interface DegreeTemplate {
    id: string
    name: string
    batch: string
    policyDocPath?: string
    requiredCredits: {
        major: number
        minor: number
        fc: number
        cc: number
        concentration: number
        openCredits: number
        total: number
    }
    defaultCourses: Omit<Course, 'id'>[]
}

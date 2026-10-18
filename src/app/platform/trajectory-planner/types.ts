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

/** Credits per requirement bucket. Same shape for what a plan has and what a degree needs. */
export type CreditBreakdown = DegreeTemplate["requiredCredits"]
export type CreditCategory = Exclude<keyof CreditBreakdown, "total">

/** Where a course sits: a semester id, or null for the unplaced tray. */
export type CourseLocation = string | null

/** The page's dialogs. Only one is open at a time. */
export type PlannerDialog = "ideal" | "ams" | "repository" | "share" | "reps" | "shortcuts"

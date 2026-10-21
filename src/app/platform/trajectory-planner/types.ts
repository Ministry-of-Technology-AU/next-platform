import type { GradeKey } from "@/app/platform/cgpa-planner/types"

/**
 * Shapes of a course trajectory: what the planner edits, what is saved on the Strapi user
 * (`course_trajectory`) and what the shared-trajectory repository stores. The page, its routes
 * and `_server/` all import from here.
 */

export type Credits = 0 | 2 | 4 | 8 | 12
export type CourseType = "FC" | "CC" | "Major" | "Minor" | "Open" | "CT"
/** Empty string means no department. */
export type DepartmentCode =
    | "CS" | "ENT" | "ECO" | "MATH" | "PHY" | "PHI" | "ENG" | "HIS" | "BIO" | "CHM"
    | "POL" | "PSY" | "HUM" | "CW" | "YIF" | "MS" | "PA" | "AST" | ""
/** The CGPA planner's grades, so both tools count a grade the same way. Null while ungraded. */
export type Grade = GradeKey | null

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

/** Credits per requirement bucket. Same shape for what a plan has and what a degree needs. */
export interface CreditBreakdown {
    major: number
    minor: number
    fc: number
    cc: number
    concentration: number
    openCredits: number
    total: number
}

export type CreditCategory = Exclude<keyof CreditBreakdown, "total">

export interface DegreeTemplate {
    id: string
    name: string
    batch: string
    policyDocPath?: string
    requiredCredits: CreditBreakdown
    defaultCourses: Omit<Course, "id">[]
}

export interface IdealTrajectorySemester {
    semester: number
    name: string
    courses: Omit<Course, "id">[]
}

export interface IdealTrajectory {
    templateId: string
    semesters: IdealTrajectorySemester[]
    notes?: string
    policyDocPath?: string
}

/** What the planner needs to offer degree templates. Same for every user. */
export interface TemplatesPayload {
    degreeTemplates: DegreeTemplate[]
    idealTrajectories: IdealTrajectory[]
}

/** A course as it is shared: grades never leave the owner's account. */
export type SharedCourse = Omit<Course, "grade">

export interface SharedSemester {
    id: string
    name: string
    courses: SharedCourse[]
}

/** A trajectory in the public repository. */
export interface SharedTrajectory {
    id: number
    title: string
    description: string
    semesters: SharedSemester[]
    totalCredits: number
    authorName: string
    batch: string
    createdAt: string | null
}

/** Derived numbers for one semester. `credits` is the load: every course placed, graded or not. */
export interface SemesterStats {
    credits: number
    gpa: number | null
}

/** Everything the planner shows about a plan, computed once per change. */
export interface PlannerSummary {
    cgpa: number | null
    /** Credits earned so far, with planned (ungraded) courses counted as if passed. */
    credits: CreditBreakdown
    semesters: Record<string, SemesterStats>
}

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------

/** Where a course sits: a semester id, or null for the unplaced tray. */
export type CourseLocation = string | null

/** The page's dialogs. Only one is open at a time. */
export type PlannerDialog = "ideal" | "ams" | "repository" | "share" | "reps" | "shortcuts" | "scratchpad"

// ---------------------------------------------------------------------------
// API contracts. Every response is { success: true, data } or { success: false, error }.
// ---------------------------------------------------------------------------

export type ApiResponse<T> = { success: true; data: T } | { success: false; error: string }

/** POST /api/platform/trajectory-planner */
export type SaveTrajectoryRequest = { state: CoursePlannerState }
export type SaveTrajectoryResponse = ApiResponse<{ savedAt: string }>

/** GET /api/platform/trajectory-planner → the saved plan, or null when there is none. */
export type GetTrajectoryResponse = ApiResponse<CoursePlannerState | null>

/** GET /api/platform/trajectory-planner/shared (`?mine=true` for the student's own). */
export type SharedListResponse = ApiResponse<SharedTrajectory[]>
export type OwnSharedResponse = ApiResponse<SharedTrajectory | null>

/** POST /api/platform/trajectory-planner/shared */
export type ShareTrajectoryRequest = { title: string; description: string; semesters: SharedSemester[] }

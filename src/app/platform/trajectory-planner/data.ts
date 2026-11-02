import type { GradeKey } from "@/app/platform/cgpa-planner/types"
import type { Course, CourseType, Credits, CreditCategory, DepartmentCode } from "./types"

export { GRADE_OPTIONS } from "@/app/platform/cgpa-planner/utils"

// ---------------------------------------------------------------------------
// Values the page and its routes both check against
// ---------------------------------------------------------------------------

/** 0 is for zero-credit courses: audits, some co-curriculars, non-credit labs. */
export const CREDIT_OPTIONS: ReadonlyArray<Credits> = [0, 2, 4, 8, 12]

export const COURSE_TYPES: ReadonlyArray<CourseType> = ["Major", "Minor", "FC", "CC", "CT", "Open"]

export const DEPARTMENT_CODES: ReadonlyArray<Exclude<DepartmentCode, "">> = [
    "CS", "ENT", "ECO", "MATH", "PHY", "CHM", "BIO", "PSY", "PHI",
    "ENG", "HIS", "POL", "MS", "PA", "AST", "YIF", "HUM", "CW",
]

/** A trajectory needs this many semesters before it can be shared. */
export const MIN_SEMESTERS_TO_SHARE = 6

/**
 * Upper bounds on a saved plan. A four-year plan is about 10 semesters and 50 courses, about
 * 8 KB. The caps stop a crafted request from writing megabytes into the user row.
 */
export const PLAN_LIMITS = {
    semesters: 24,
    coursesPerSemester: 30,
    unplacedCourses: 200,
    nameLength: 120,
    titleLength: 80,
    descriptionLength: 500,
} as const

// ---------------------------------------------------------------------------
// Board
// ---------------------------------------------------------------------------

/** The tray's droppable id. Semesters use their own ids. */
export const TRAY_ID = "available-courses"

/** Fewer credits than this in a semester is below the full-time load. */
export const MIN_SEMESTER_CREDITS = 16

/** Empty semesters a new plan starts with. */
export const DEFAULT_SEMESTER_COUNT = 4

export const STORAGE_KEYS = {
    /** The board, so it survives reloads on this device. Key predates the refactor; keep it. */
    plannerState: "course-planner-state",
    selectedDegree: "trajectory-planner:degree:v1",
    /** Saved as a bare string before v1. Read once as a fallback. */
    legacySelectedDegree: "selected-degree-id",
    breakdownOpen: "trajectory-planner-breakdown-open",
    tourSeen: "TRAJECTORY_PLANNER_TOUR_SEEN_V2",
    /** Scratchpad notes. This browser only, never sent to the server. */
    scratchpad: "trajectory-planner:scratchpad:v1",
} as const

/** Scratchpad writes to localStorage, which is cheap, so it saves almost as you type. */
export const SCRATCHPAD_SAVE_DELAY_MS = 500

/**
 * Auto-save timing. Saves 5 s after edits pause, and at least every 15 s while a student keeps
 * dragging. Retries twice (2 s, then 4 s) before showing an error.
 */
export const AUTO_SAVE = {
    delay: 5_000,
    maxWait: 15_000,
    retry: { attempts: 2, delay: 2_000 },
} as const

/** Browsers drop `keepalive` requests over 64 KB, so larger plans save without it. */
export const KEEPALIVE_MAX_BYTES = 60_000

/** Foundation and co-curricular courses every student takes. New plans start with them unplaced. */
export const DEFAULT_COURSES: ReadonlyArray<Omit<Course, "id">> = [
    { name: "Economy, Politics, and Society", credits: 4, deptCode: "", type: "FC" },
    { name: "Literature and the World", credits: 4, deptCode: "", type: "FC" },
    { name: "Great Books", credits: 4, deptCode: "", type: "FC" },
    { name: "Quantitative Reasoning and Mathematical Thinking", credits: 4, deptCode: "", type: "FC" },
    { name: "Principles of Science", credits: 4, deptCode: "", type: "FC" },
    { name: "Indian Civilisations", credits: 4, deptCode: "", type: "FC" },
    { name: "Environmental Studies", credits: 4, deptCode: "", type: "FC" },
    { name: "Introduction to Critical Thinking", credits: 4, deptCode: "CW", type: "FC" },
    { name: "Mind and Behaviour", credits: 4, deptCode: "", type: "FC" },
    { name: "CC1", credits: 2, deptCode: "", type: "CC" },
    { name: "CC2", credits: 2, deptCode: "", type: "CC" },
]

// ---------------------------------------------------------------------------
// AMS import
// ---------------------------------------------------------------------------

/** Title fragments that mark a foundation course in AMS ("indian civilis" covers both spellings). */
export const FC_TITLE_PATTERNS: ReadonlyArray<string> = [
    "economy, politics",
    "literature and the world",
    "great books",
    "quantitative reasoning",
    "principles of science",
    "indian civilis",
    "environmental studies",
    "critical thinking",
    "mind and behaviour",
]

/** AMS code prefixes that name a requirement, not a department. */
export const AMS_CATEGORY_PREFIXES: ReadonlyArray<string> = ["FC", "CC", "CT", "CPA", "CVA"]
export const AMS_FC_PREFIXES: ReadonlyArray<string> = ["FC-", "CT-"]
export const AMS_CC_PREFIXES: ReadonlyArray<string> = ["CPA-", "CVA-"]

/** AMS prefixes spelt differently from our department codes. */
export const AMS_DEPT_ALIASES: Readonly<Record<string, string>> = { MAT: "MATH" }

/** Characters of a course title compared when matching AMS courses to the tray's FC and CC. */
export const TITLE_MATCH_LENGTH = 15

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

export const COURSE_TYPE_OPTIONS: ReadonlyArray<{ value: CourseType; label: string }> = [
    { value: "Major", label: "Major" },
    { value: "Minor", label: "Minor" },
    { value: "FC", label: "Foundation (FC)" },
    { value: "CC", label: "Co-curricular (CC)" },
    { value: "CT", label: "Concentration" },
    { value: "Open", label: "Open credit" },
]

export const COURSE_TYPE_LABEL: Record<CourseType, string> = {
    Major: "Major",
    Minor: "Minor",
    FC: "FC",
    CC: "CC",
    Open: "Open",
    CT: "Concentration",
}

/** Grades as the pill shows them. The picker shows the full AMS label. */
export const GRADE_SHORT_LABEL: Partial<Record<GradeKey, string>> = {
    "F (w P/F)": "F",
    "F (w/o P/F)": "F",
    "TP (w credits)": "TP",
    "TP (w/o credits)": "TP",
}

/** Rows of the credit breakdown, in the order students think about them. */
export const CREDIT_CATEGORIES: ReadonlyArray<{ key: CreditCategory; label: string }> = [
    { key: "major", label: "Major" },
    { key: "minor", label: "Minor" },
    { key: "fc", label: "Foundation" },
    { key: "cc", label: "Co-curricular" },
    { key: "concentration", label: "Concentration" },
    { key: "openCredits", label: "Open" },
]

export const DEPARTMENT_REPS: ReadonlyArray<{ dept: string; email: string }> = [
    { dept: "Computer Science", email: "cs.rep@ashoka.edu.in" },
    { dept: "Physics", email: "phys.rep@ashoka.edu.in" },
    { dept: "Mathematics", email: "math.rep@ashoka.edu.in" },
    { dept: "Biology", email: "biology_ugrep@ashoka.edu.in" },
    { dept: "Economics", email: "econreps@ashoka.edu.in" },
    { dept: "English", email: "english.rep@ashoka.edu.in" },
    { dept: "History", email: "historyrepresentatives@ashoka.edu.in" },
    { dept: "Psychology", email: "psy.rep@ashoka.edu.in" },
    { dept: "Sociology/Anthropology", email: "soa.rep@ashoka.edu.in" },
    { dept: "Political Science", email: "polsci.rep@ashoka.edu.in" },
    { dept: "Chemistry", email: "chem.rep@ashoka.edu.in" },
    { dept: "Philosophy", email: "philosophy.studentrep@ashoka.edu.in" },
]

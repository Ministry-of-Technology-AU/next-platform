import type { CourseType, CreditCategory, Credits, DepartmentCode } from "./types"

/** The tray's droppable id. Semesters use their own ids. */
export const TRAY_ID = "available-courses"

/** Fewer credits than this in a semester is below the full-time load. */
export const MIN_SEMESTER_CREDITS = 16

/** A trajectory needs this many semesters before it can be shared. */
export const MIN_SEMESTERS_TO_SHARE = 6

export const STORAGE_KEYS = {
    breakdownOpen: "trajectory-planner-breakdown-open",
    tourSeen: "TRAJECTORY_PLANNER_TOUR_SEEN_V2",
} as const

export const CREDIT_OPTIONS: ReadonlyArray<Credits> = [2, 4, 8, 12]

export const DEPARTMENT_CODES: ReadonlyArray<Exclude<DepartmentCode, "">> = [
    "CS", "ENT", "ECO", "MATH", "PHY", "CHM", "BIO", "PSY", "PHI",
    "ENG", "HIS", "POL", "MS", "PA", "AST", "YIF", "HUM", "CW",
]

export const COURSE_TYPE_OPTIONS: ReadonlyArray<{ value: CourseType; label: string }> = [
    { value: "Major", label: "Major" },
    { value: "Minor", label: "Minor" },
    { value: "FC", label: "Foundation (FC)" },
    { value: "CC", label: "Co-curricular (CC)" },
    { value: "CT", label: "Concentration" },
    { value: "Open", label: "Open credit" },
]

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

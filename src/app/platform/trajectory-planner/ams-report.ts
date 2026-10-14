import type { Course, CourseType, Grade, Semester, DepartmentCode } from "./types"
import { v4 as uuidv4 } from "uuid"
import type { ParsedCGPAData } from "@/lib/cgpa/types"

// FC course name patterns to identify foundation courses
const FC_COURSE_PATTERNS = [
    "economy, politics",
    "literature and the world",
    "great books",
    "quantitative reasoning",
    "principles of science",
    "indian civilis", // matches both civilizations and civilisations
    "environmental studies",
    "critical thinking",
    "mind and behaviour",
]

// Valid department codes
const VALID_DEPT_CODES = ["CS", "ENT", "ECO", "MATH", "PHY", "HUM", "CW", "PSY", "BIO", "MAT", "POL", "IR", "HIS", "PHI", "ENG", "CHM", "YIF", "MS", "PA", "AST"]

// Map AMS grades to trajectory planner Grade type
export function mapGrade(gradeStr: string | null | undefined): Grade {
    if (!gradeStr || gradeStr === "--" || gradeStr === "Select") return null

    const normalized = gradeStr.trim()

    // Direct matches
    const validGrades: Grade[] = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'P', 'TP']
    if (validGrades.includes(normalized as Grade)) {
        return normalized as Grade
    }

    // Handle special grades
    if (normalized === 'F (w P/F)' || normalized === 'F (w/o P/F)') {
        return 'F'
    }
    if (normalized === 'TP (w credits)' || normalized === 'TP (w/o credits)') {
        return 'TP' // Teaching Practicum - may or may not have credits
    }
    if (normalized === 'AU') {
        return null // Audit doesn't count
    }

    return null
}

/**
 * Extract department code from course code
 * Examples:
 * - "CS-1101" -> "CS"
 * - "CS-1390/ PHY-1390" -> "CS" (first one)
 * - "BIO-3513/ BIO-4313/ BIO-6513/ PHY-3513/ PHY-6313/ CS-2456" -> "BIO" (first one)
 * - "FC-0102" -> "" (FC is not a real department)
 * - "CPA-0080" -> "" (CPA is CC, not a department)
 */
export function extractDeptCode(code: string | undefined): DepartmentCode {
    if (!code) return ""

    // Get the first code if multiple (split by /)
    const firstCode = code.split("/")[0].trim()

    // Extract the prefix before the dash
    const match = firstCode.match(/^([A-Z]{2,4})-/)
    if (match) {
        const prefix = match[1].toUpperCase()

        // Skip FC, CC, CT codes - these are category codes, not departments
        if (["FC", "CC", "CT", "CPA", "CVA"].includes(prefix)) {
            return ""
        }

        // Map MAT to MATH
        if (prefix === "MAT") {
            return "MATH" as DepartmentCode
        }

        // Check if it's a valid department code
        if (VALID_DEPT_CODES.includes(prefix)) {
            // Cast to the allowed values (only return ones in our type)
            if (["CS", "ENT", "ECO", "MATH", "PHY", "HUM", "CW"].includes(prefix)) {
                return prefix as DepartmentCode
            }
        }
    }

    return ""
}

/**
 * Infer course type from course code and title
 * - FC-XXXX codes or matching FC patterns -> FC
 * - CPA-XXXX or CVA-XXXX codes -> CC (Co-Curricular Activities)
 * - CT-XXXX codes -> FC (Critical Thinking is an FC)
 * - Everything else -> defaults based on code
 */
export function inferCourseType(title: string, code?: string): CourseType {
    const lowerTitle = title.toLowerCase()
    const upperCode = code?.toUpperCase() || ""

    // First code if multiple
    const firstCode = upperCode.split("/")[0].trim()

    // Check code prefix first
    if (firstCode.startsWith("FC-") || firstCode.startsWith("CT-")) {
        return "FC"
    }

    if (firstCode.startsWith("CPA-") || firstCode.startsWith("CVA-")) {
        return "CC"
    }

    // Check FC name patterns
    for (const pattern of FC_COURSE_PATTERNS) {
        if (lowerTitle.includes(pattern)) {
            return "FC"
        }
    }

    // Default to Major for department courses (user can change to Minor)
    return "Major"
}

// Parse credits from string
export function parseCredits(value: number | string | null | undefined): 2 | 4 | 8 {
    const num = typeof value === "number" ? value : parseFloat(value || "0")
    if (num <= 2) return 2
    if (num <= 4) return 4
    return 8
}

export interface ParsedCGPADataForPlanner {
    semesters: Semester[]
    takenCourseNames: string[] // Names of courses already taken (to remove from tray)
}

/**
 * Maps a parsed AMS report (from POST /api/platform/cgpa-planner/parse) onto planner semesters.
 * Parsing itself happens on the server, so this tool and the CGPA planner read AMS the same way.
 */
export function mapReportToPlanner(report: ParsedCGPAData): ParsedCGPADataForPlanner {
    const result: ParsedCGPADataForPlanner = { semesters: [], takenCourseNames: [] }

    for (const term of report.semesters) {
        const courses: Course[] = []
        for (const parsed of term.courses) {
            const title = parsed.title?.trim()
            if (!title) continue
            const code = parsed.code ?? undefined
            courses.push({
                id: uuidv4(),
                name: title,
                credits: parseCredits(parsed.creditsRegistered ?? parsed.creditsEarned),
                deptCode: extractDeptCode(code),
                type: inferCourseType(title, code),
                isInSemester: true,
                grade: mapGrade(parsed.grade),
            })
            result.takenCourseNames.push(title.toLowerCase())
        }
        if (courses.length > 0) {
            result.semesters.push({ id: `semester-${uuidv4()}`, name: term.semester, courses })
        }
    }

    return result
}

/** Sends the pasted AMS text to the shared parser and maps the result for the planner. */
export async function fetchPlannerSemesters(text: string): Promise<{ data: ParsedCGPADataForPlanner | null; error: string | null }> {
    try {
        const response = await fetch("/api/platform/cgpa-planner/parse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        })
        const json = (await response.json().catch(() => null)) as { success?: boolean; data?: ParsedCGPAData; error?: string } | null
        if (!response.ok || !json?.success || !json.data) {
            return { data: null, error: json?.error ?? "Failed to read the pasted data" }
        }
        return { data: mapReportToPlanner(json.data), error: null }
    } catch (error) {
        platform.error("Parsing AMS data failed:", error)
        return { data: null, error: "Couldn't reach the server. Check your connection and try again." }
    }
}

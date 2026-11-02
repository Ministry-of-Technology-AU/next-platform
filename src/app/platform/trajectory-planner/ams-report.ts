import { gradeOf } from "@/app/platform/cgpa-planner/utils"
import type { ParsedCGPAData } from "@/app/platform/cgpa-planner/types"
import {
    AMS_CATEGORY_PREFIXES,
    AMS_CC_PREFIXES,
    AMS_DEPT_ALIASES,
    AMS_FC_PREFIXES,
    CREDIT_OPTIONS,
    DEPARTMENT_CODES,
    FC_TITLE_PATTERNS,
} from "./data"
import type { ApiResponse, Course, CourseType, Credits, DepartmentCode, Semester } from "./types"

/**
 * Turns a parsed AMS report (from POST /api/platform/cgpa-planner/parse) into planner semesters.
 * Parsing happens on the server and grades map through the CGPA planner's `toGradeKey`, so both
 * tools read AMS the same way.
 */

/** First code of a cross-listed course: "CS-1390/ PHY-1390" -> "CS-1390". */
const firstCode = (code: string | undefined) => (code ?? "").split("/")[0]?.trim().toUpperCase() ?? ""

/** "CS-1101" -> "CS". Requirement codes (FC-, CPA-...) and unknown prefixes give "". */
export function extractDeptCode(code: string | undefined): DepartmentCode {
    const prefix = firstCode(code).match(/^([A-Z]{2,4})-/)?.[1]
    if (!prefix || AMS_CATEGORY_PREFIXES.includes(prefix)) return ""
    const dept = AMS_DEPT_ALIASES[prefix] ?? prefix
    return DEPARTMENT_CODES.find((known) => known === dept) ?? ""
}

/** FC from the code or a known FC title, CC from co-curricular codes, else Major (the student can change it). */
export function inferCourseType(title: string, code?: string): CourseType {
    const first = firstCode(code)
    if (AMS_FC_PREFIXES.some((prefix) => first.startsWith(prefix))) return "FC"
    if (AMS_CC_PREFIXES.some((prefix) => first.startsWith(prefix))) return "CC"
    const lower = title.toLowerCase()
    return FC_TITLE_PATTERNS.some((pattern) => lower.includes(pattern)) ? "FC" : "Major"
}

/**
 * Snaps AMS credits to the nearest option the planner offers, rounding up. A real 0 stays 0;
 * credits AMS doesn't show at all fall back to 2, as before zero-credit courses existed here.
 */
export function parseCredits(value: number | null | undefined): Credits {
    if (value === null || value === undefined || !Number.isFinite(value)) return 2
    return CREDIT_OPTIONS.find((option) => value <= option) ?? CREDIT_OPTIONS[CREDIT_OPTIONS.length - 1] ?? 4
}

export interface PlannerImport {
    semesters: Semester[]
    /** Lower-cased titles of every course taken, to take matching FC/CC off the tray. */
    takenTitles: string[]
}

export function mapReportToPlanner(report: ParsedCGPAData): PlannerImport {
    const result: PlannerImport = { semesters: [], takenTitles: [] }

    for (const term of report.semesters) {
        const courses: Course[] = []
        for (const parsed of term.courses) {
            const title = parsed.title?.trim()
            if (!title) continue
            const code = parsed.code ?? undefined
            const grade = gradeOf(parsed)
            courses.push({
                id: crypto.randomUUID(),
                name: title,
                credits: parseCredits(parsed.creditsRegistered ?? parsed.creditsEarned),
                deptCode: extractDeptCode(code),
                type: inferCourseType(title, code),
                isInSemester: true,
                ...(grade ? { grade } : {}),
            })
            result.takenTitles.push(title.toLowerCase())
        }
        if (courses.length > 0) result.semesters.push({ id: `semester-${crypto.randomUUID()}`, name: term.semester, courses })
    }

    return result
}

/** Sends the pasted AMS text to the shared parser and maps the result for the planner. */
export async function fetchPlannerImport(text: string): Promise<{ data: PlannerImport; error: null } | { data: null; error: string }> {
    try {
        const response = await fetch("/api/platform/cgpa-planner/parse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        })
        const json = (await response.json().catch(() => null)) as ApiResponse<ParsedCGPAData> | null
        if (!response.ok || !json?.success) {
            return { data: null, error: (json && !json.success && json.error) || "Couldn't read the pasted report. Copy the whole AMS page and try again." }
        }
        return { data: mapReportToPlanner(json.data), error: null }
    } catch (error) {
        platform.error("Trajectory planner: parsing AMS data failed:", error)
        return { data: null, error: "Couldn't reach the server. Check your connection and try again." }
    }
}

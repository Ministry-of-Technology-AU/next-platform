import type { Course, CourseType, Grade, Semester, DepartmentCode } from "./types"
import { v4 as uuidv4 } from "uuid"

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
const VALID_DEPT_CODES = ["CS", "ENT", "ECO", "MATH", "PHY", "HUM", "CW", "PSY", "BIO", "MAT", "POL", "IR"]

// Map CGPA planner grades to trajectory planner Grade type
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
 * Parse CGPA planner text data into trajectory planner format
 * Based on parseGradeData from cgpa-planner/useCalculations.tsx
 */
export function parseGradeDataForPlanner(text: string): ParsedCGPADataForPlanner {
    const lines = text.split('\n').map((line) => line.trim())
    const result: ParsedCGPADataForPlanner = {
        semesters: [],
        takenCourseNames: [],
    }

    let currentSemesterName: string | null = null
    let currentCourses: Course[] = []
    let semesterIndex = 0

    for (const line of lines) {
        // Detect semester header (e.g., "Monsoon 2022", "Spring 2023", "Summer 2024")
        if (line.match(/^(Monsoon|Spring|Summer)\s+\d{4}/)) {
            // Save previous semester if exists
            if (currentSemesterName && currentCourses.length > 0) {
                result.semesters.push({
                    id: `semester-${semesterIndex + 1}`,
                    name: currentSemesterName,
                    courses: currentCourses,
                })
                semesterIndex++
            }

            currentSemesterName = line.split('\t')[0].trim() // Get just the semester name
            currentCourses = []
            continue
        }

        // Parse course line (starts with a number - the S.No.)
        // Format: 1	CS-1101	Introduction to Computer Programming	4	A	4	16
        if (currentSemesterName && line.match(/^\d+\t/) && !line.includes('systems.support')) {
            const parts = line.split('\t')
            if (parts.length >= 5) {
                const [sno, code, title, creditsRegistered, grade, creditsEarned] = parts

                if (title && title !== '--') {
                    const mappedGrade = mapGrade(grade)
                    const credits = parseCredits(creditsRegistered || creditsEarned)
                    const courseType = inferCourseType(title, code)
                    const deptCode = extractDeptCode(code)

                    const course: Course = {
                        id: uuidv4(),
                        name: title.trim(),
                        credits,
                        deptCode,
                        type: courseType,
                        isInSemester: true,
                        grade: mappedGrade,
                    }

                    currentCourses.push(course)
                    result.takenCourseNames.push(title.trim().toLowerCase())
                }
            }
        }
    }

    // Don't forget last semester
    if (currentSemesterName && currentCourses.length > 0) {
        result.semesters.push({
            id: `semester-${semesterIndex + 1}`,
            name: currentSemesterName,
            courses: currentCourses,
        })
    }

    return result
}

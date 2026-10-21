import { gpaOf, scoreGrade, type GradeScore } from "@/app/platform/cgpa-planner/utils"
import { DEFAULT_COURSES, DEFAULT_SEMESTER_COUNT, GRADE_SHORT_LABEL, TITLE_MATCH_LENGTH, TRAY_ID } from "./data"
import type {
    Course,
    CourseLocation,
    CoursePlannerState,
    CourseType,
    CreditBreakdown,
    CreditCategory,
    Grade,
    PlannerSummary,
    Semester,
} from "./types"

export { formatGPA } from "@/app/platform/cgpa-planner/utils"
export { isTypingTarget, readStorage, writeStorage } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

/** Soft, borderless tints per course type: enough colour to scan a column, not so much it shouts. */
export const COURSE_TYPE_STYLES: Record<CourseType, string> = {
    Major: "bg-primary/10 text-primary dark:bg-primary/25 dark:text-primary-extralight",
    Minor: "bg-secondary/30 text-secondary-extradark dark:bg-secondary/15 dark:text-secondary",
    FC: "bg-green/15 text-green-dark dark:bg-green/20 dark:text-green-light",
    CC: "bg-blue/10 text-blue-dark dark:bg-blue/20 dark:text-blue-light",
    Open: "bg-gray/15 text-gray-dark dark:bg-gray/25 dark:text-gray-light",
    CT: "bg-green-extralight/30 text-green-extradark dark:bg-green-extralight/15 dark:text-green-extralight",
}

/** Grade pill tint by band. Ungraded stays a dashed outline so it reads as "pick one". */
export function gradeStyle(grade: Grade | undefined): string {
    if (!grade) return "border-dashed border-border bg-transparent text-muted-foreground"
    if (grade.startsWith("A")) return "border-transparent bg-green/15 text-green-dark dark:bg-green/20 dark:text-green-light"
    if (grade.startsWith("B")) return "border-transparent bg-blue/10 text-blue-dark dark:bg-blue/20 dark:text-blue-light"
    if (grade.startsWith("F")) return "border-transparent bg-destructive/10 text-destructive"
    return "border-transparent bg-gray/15 text-gray-dark dark:bg-gray/25 dark:text-gray-light"
}

export function gradeLabel(grade: Grade | undefined): string | null {
    return grade ? GRADE_SHORT_LABEL[grade] ?? grade : null
}

export function pluralise(count: number, word: string): string {
    return `${count} ${word}${count === 1 ? "" : "s"}`
}

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

/** Finds a course anywhere in the plan, with the semester it sits in (null for the tray). */
export function findCourse(state: CoursePlannerState, courseId: string): { course: Course; location: CourseLocation } | null {
    for (const semester of state.semesters) {
        const course = semester.courses.find((c) => c.id === courseId)
        if (course) return { course, location: semester.id }
    }
    const course = state.availableCourses.find((c) => c.id === courseId)
    return course ? { course, location: null } : null
}

/**
 * Turns whatever a course was dropped on (the tray, a semester, or another course)
 * into the location it should land in. Undefined when the drop target is unknown.
 */
export function resolveDropLocation(state: CoursePlannerState, overId: string): CourseLocation | undefined {
    if (overId === TRAY_ID) return null
    if (state.semesters.some((s) => s.id === overId)) return overId
    const hit = findCourse(state, overId)
    return hit ? hit.location : undefined
}

// ---------------------------------------------------------------------------
// State operations. Pure (state in, state out), so the context stays a thin wrapper.
// ---------------------------------------------------------------------------

const newSemesterId = () => `semester-${crypto.randomUUID()}`

/**
 * A fresh plan: four empty semesters and the FC/CC courses unplaced. Ids are fixed so the
 * server render and the first client render match.
 */
export function createInitialState(): CoursePlannerState {
    return {
        semesters: Array.from({ length: DEFAULT_SEMESTER_COUNT }, (_, i) => ({
            id: `semester-${i + 1}`,
            name: `Semester ${i + 1}`,
            courses: [],
        })),
        availableCourses: DEFAULT_COURSES.map((course, i) => ({ ...course, id: `default-course-${i + 1}`, isInSemester: false })),
    }
}

const mapCourses = (state: CoursePlannerState, fn: (courses: Course[]) => Course[]): CoursePlannerState => ({
    semesters: state.semesters.map((semester) => ({ ...semester, courses: fn(semester.courses) })),
    availableCourses: fn(state.availableCourses),
})

/** New tray courses go first, so the one just created is easy to find. */
export function addCourse(state: CoursePlannerState, location: CourseLocation, course: Course): CoursePlannerState {
    if (location === null) {
        return { ...state, availableCourses: [{ ...course, isInSemester: false }, ...state.availableCourses] }
    }
    return {
        ...state,
        semesters: state.semesters.map((semester) =>
            semester.id === location ? { ...semester, courses: [...semester.courses, { ...course, isInSemester: true }] } : semester,
        ),
    }
}

export function removeCourse(state: CoursePlannerState, courseId: string): CoursePlannerState {
    return mapCourses(state, (courses) => courses.filter((c) => c.id !== courseId))
}

export function updateCourse(state: CoursePlannerState, courseId: string, updates: Partial<Course>): CoursePlannerState {
    return mapCourses(state, (courses) => courses.map((c) => (c.id === courseId ? { ...c, ...updates } : c)))
}

export function updateSemester(state: CoursePlannerState, semesterId: string, updates: Partial<Semester>): CoursePlannerState {
    return { ...state, semesters: state.semesters.map((s) => (s.id === semesterId ? { ...s, ...updates } : s)) }
}

/** Moves a course between the tray and semesters. `index` places it within the target semester. */
export function moveCourse(
    state: CoursePlannerState,
    courseId: string,
    from: CourseLocation,
    to: CourseLocation,
    index?: number,
): CoursePlannerState {
    const source = from === null ? state.availableCourses : state.semesters.find((s) => s.id === from)?.courses
    const course = source?.find((c) => c.id === courseId)
    if (!course) return state

    const moved = { ...course, isInSemester: to !== null }
    const without: CoursePlannerState = {
        semesters: state.semesters.map((s) => (s.id === from ? { ...s, courses: s.courses.filter((c) => c.id !== courseId) } : s)),
        availableCourses: from === null ? state.availableCourses.filter((c) => c.id !== courseId) : state.availableCourses,
    }

    if (to === null) return { ...without, availableCourses: [...without.availableCourses, moved] }
    return {
        ...without,
        semesters: without.semesters.map((s) => {
            if (s.id !== to) return s
            const courses = [...s.courses]
            if (index === undefined) courses.push(moved)
            else courses.splice(index, 0, moved)
            return { ...s, courses }
        }),
    }
}

/** Deleting a semester sends its courses back to the tray rather than losing them. */
export function deleteSemester(state: CoursePlannerState, semesterId: string): CoursePlannerState {
    const semester = state.semesters.find((s) => s.id === semesterId)
    if (!semester) return state
    return {
        semesters: state.semesters.filter((s) => s.id !== semesterId),
        availableCourses: [...state.availableCourses, ...semester.courses.map((c) => ({ ...c, isInSemester: false }))],
    }
}

/** Numbers the new semester after the highest "Semester n" so far. */
export function addSemester(state: CoursePlannerState): CoursePlannerState {
    const highest = state.semesters.reduce((max, s) => {
        const match = s.name.match(/Semester (\d+)/i)
        return match ? Math.max(max, Number.parseInt(match[1] ?? "0", 10)) : max
    }, 0)
    const number = highest > 0 ? highest + 1 : state.semesters.length + 1
    return { ...state, semesters: [...state.semesters, { id: newSemesterId(), name: `Semester ${number}`, courses: [] }] }
}

/** Two course titles name the same course: equal, or one starts with the other's first characters. */
function sameCourseTitle(a: string, b: string): boolean {
    const x = a.toLowerCase()
    const y = b.toLowerCase()
    return x === y || x.includes(y.slice(0, TITLE_MATCH_LENGTH)) || y.includes(x.slice(0, TITLE_MATCH_LENGTH))
}

/**
 * Swaps in the semesters imported from AMS and takes the FC and CC courses already done
 * off the tray. Other unplaced courses stay where they are.
 */
export function applyAmsImport(state: CoursePlannerState, semesters: Semester[], takenTitles: string[]): CoursePlannerState {
    return {
        semesters,
        availableCourses: state.availableCourses.filter(
            (course) => (course.type !== "FC" && course.type !== "CC") || !takenTitles.some((taken) => sameCourseTitle(taken, course.name)),
        ),
    }
}

// ---------------------------------------------------------------------------
// Plan maths. Grades count exactly as in the CGPA planner (`scoreGrade`), with no retake
// rules: the trajectory planner has no course codes to match retakes on.
// ---------------------------------------------------------------------------

const CATEGORY_BY_TYPE: Record<CourseType, CreditCategory> = {
    Major: "major",
    Minor: "minor",
    FC: "fc",
    CC: "cc",
    CT: "concentration",
    Open: "openCredits",
}

export const emptyBreakdown = (): CreditBreakdown => ({ major: 0, minor: 0, fc: 0, cc: 0, concentration: 0, openCredits: 0, total: 0 })

/** Credits a course adds to the plan. Ungraded courses are planned, so they count as if passed. */
export function projectedCredits(course: Pick<Course, "credits" | "grade">): number {
    return course.grade ? scoreGrade(course.grade, course.credits).earnedCredits : course.credits
}

/** The course load of a semester: every course placed in it, graded or not. */
export function semesterLoad(semester: Pick<Semester, "courses">): number {
    return semester.courses.reduce((sum, course) => sum + course.credits, 0)
}

function addScore(total: GradeScore, course: Course): void {
    if (!course.grade) return
    const score = scoreGrade(course.grade, course.credits)
    total.gradePoints += score.gradePoints
    total.gpaCredits += score.gpaCredits
}

/** CGPA, credits by type and per-semester numbers in one pass over the plan. */
export function summarisePlanner(state: CoursePlannerState): PlannerSummary {
    const overall: GradeScore = { gradePoints: 0, gpaCredits: 0, earnedCredits: 0 }
    const credits = emptyBreakdown()
    const semesters: PlannerSummary["semesters"] = {}

    for (const semester of state.semesters) {
        const term: GradeScore = { gradePoints: 0, gpaCredits: 0, earnedCredits: 0 }
        for (const course of semester.courses) {
            addScore(term, course)
            const earned = projectedCredits(course)
            credits[CATEGORY_BY_TYPE[course.type]] += earned
            credits.total += earned
        }
        overall.gradePoints += term.gradePoints
        overall.gpaCredits += term.gpaCredits
        semesters[semester.id] = { credits: semesterLoad(semester), gpa: gpaOf(term) }
    }

    return { cgpa: gpaOf(overall), credits, semesters }
}

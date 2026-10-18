import type { Course, CoursePlannerState, CourseLocation, CourseType, Grade } from "./types"
import { TRAY_ID } from "./data"

export { formatGPA } from "@/lib/cgpa/calculations"
export { isTypingTarget, readStorage, writeStorage } from "@/lib/utils"

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
    if (grade === "F") return "border-transparent bg-destructive/10 text-destructive"
    return "border-transparent bg-gray/15 text-gray-dark dark:bg-gray/25 dark:text-gray-light"
}

export const COURSE_TYPE_LABEL: Record<CourseType, string> = {
    Major: "Major",
    Minor: "Minor",
    FC: "FC",
    CC: "CC",
    Open: "Open",
    CT: "Concentration",
}

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

export function pluralise(count: number, word: string): string {
    return `${count} ${word}${count === 1 ? "" : "s"}`
}

/** Saved trajectories are free-form JSON in Strapi. Accept only the shape the planner can render. */
export function isPlannerState(value: unknown): value is CoursePlannerState {
    if (typeof value !== "object" || value === null) return false
    const candidate = value as Partial<Record<keyof CoursePlannerState, unknown>>
    return Array.isArray(candidate.semesters) && Array.isArray(candidate.availableCourses)
}

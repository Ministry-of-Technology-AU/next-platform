"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import type { CoursePlannerState, Semester, Course } from "./types"
import { v4 as uuidv4 } from "uuid"

const DEFAULT_COURSES: Omit<Course, "id">[] = [
    { name: "Economy, Politics, and Society", credits: 4, deptCode: "", type: "FC", isInSemester: false },
    { name: "Literature and the World", credits: 4, deptCode: "", type: "FC", isInSemester: false },
    { name: "Great Books", credits: 4, deptCode: "", type: "FC", isInSemester: false },
    { name: "Quantitative Reasoning and Mathematical Thinking", credits: 4, deptCode: "", type: "FC", isInSemester: false },
    { name: "Principles of Science", credits: 4, deptCode: "", type: "FC", isInSemester: false },
    { name: "Indian Civilizations", credits: 4, deptCode: "", type: "FC", isInSemester: false },
    { name: "Environmental Studies", credits: 4, deptCode: "", type: "FC", isInSemester: false },
    { name: "Introduction to Critical Thinking", credits: 4, deptCode: "CW", type: "FC", isInSemester: false },
    { name: "Mind and Behaviour", credits: 4, deptCode: "", type: "FC", isInSemester: false },
    { name: "CC1", credits: 2, deptCode: "", type: "CC", isInSemester: false },
    { name: "CC2", credits: 2, deptCode: "", type: "CC", isInSemester: false },
]

interface CoursePlannerContextType {
    state: CoursePlannerState
    addCourse: (semesterId: string | null, course: Course) => void
    removeCourse: (courseId: string) => void
    updateCourse: (courseId: string, updates: Partial<Course>) => void
    moveCourse: (courseId: string, fromSemesterId: string | null, toSemesterId: string | null, newIndex?: number) => void
    deleteSemester: (semesterId: string) => void
    getSemesterCredits: (semesterId: string) => number
    exportState: () => string
    importState: (jsonString: string) => void
}

const CoursePlannerContext = createContext<CoursePlannerContextType | undefined>(undefined)

export function CoursePlannerProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<CoursePlannerState>(() => {
        // Initialize with 8 semesters and default courses
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("course-planner-state")
            if (saved) {
                try {
                    return JSON.parse(saved)
                } catch (e) {
                    console.error("[v0] Failed to parse saved state", e)
                }
            }
        }

        const semesters: Semester[] = Array.from({ length: 8 }, (_, i) => ({
            id: `semester-${i + 1}`,
            name: `Semester ${i + 1}`,
            courses: [],
        }))

        const availableCourses: Course[] = DEFAULT_COURSES.map(course => ({
            ...course,
            id: uuidv4(),
        }))

        return {
            semesters,
            availableCourses,
        }
    })

    useEffect(() => {
        localStorage.setItem("course-planner-state", JSON.stringify(state))
    }, [state])

    const addCourse = (semesterId: string | null, course: Course) => {
        setState((prev) => {
            if (semesterId === null) {
                // Add to available courses
                return {
                    ...prev,
                    availableCourses: [...prev.availableCourses, { ...course, isInSemester: false }],
                }
            }

            // Add to semester
            return {
                ...prev,
                semesters: prev.semesters.map((sem) =>
                    sem.id === semesterId ? { ...sem, courses: [...sem.courses, { ...course, isInSemester: true }] } : sem,
                ),
            }
        })
    }

    const removeCourse = (courseId: string) => {
        setState((prev) => ({
            ...prev,
            semesters: prev.semesters.map((sem) => ({
                ...sem,
                courses: sem.courses.filter((c) => c.id !== courseId),
            })),
            availableCourses: prev.availableCourses.filter((c) => c.id !== courseId),
        }))
    }

    const updateCourse = (courseId: string, updates: Partial<Course>) => {
        setState((prev) => ({
            ...prev,
            semesters: prev.semesters.map((sem) => ({
                ...sem,
                courses: sem.courses.map((c) => (c.id === courseId ? { ...c, ...updates } : c)),
            })),
            availableCourses: prev.availableCourses.map((c) => (c.id === courseId ? { ...c, ...updates } : c)),
        }))
    }

    const moveCourse = (
        courseId: string,
        fromSemesterId: string | null,
        toSemesterId: string | null,
        newIndex?: number,
    ) => {
        setState((prev) => {
            // Find the course
            let course: Course | undefined

            if (fromSemesterId === null) {
                course = prev.availableCourses.find((c) => c.id === courseId)
            } else {
                const fromSem = prev.semesters.find((s) => s.id === fromSemesterId)
                course = fromSem?.courses.find((c) => c.id === courseId)
            }

            if (!course) return prev

            const updatedCourse = { ...course, isInSemester: toSemesterId !== null }

            // Remove from source
            const newState = {
                ...prev,
                semesters: prev.semesters.map((sem) =>
                    sem.id === fromSemesterId ? { ...sem, courses: sem.courses.filter((c) => c.id !== courseId) } : sem,
                ),
                availableCourses:
                    fromSemesterId === null ? prev.availableCourses.filter((c) => c.id !== courseId) : prev.availableCourses,
            }

            // Add to destination
            if (toSemesterId === null) {
                return {
                    ...newState,
                    availableCourses: [...newState.availableCourses, updatedCourse],
                }
            }

            return {
                ...newState,
                semesters: newState.semesters.map((sem) => {
                    if (sem.id === toSemesterId) {
                        const newCourses = [...sem.courses]
                        if (newIndex !== undefined) {
                            newCourses.splice(newIndex, 0, updatedCourse)
                        } else {
                            newCourses.push(updatedCourse)
                        }
                        return { ...sem, courses: newCourses }
                    }
                    return sem
                }),
            }
        })
    }

    const deleteSemester = (semesterId: string) => {
        setState((prev) => {
            const semester = prev.semesters.find((s) => s.id === semesterId)
            if (!semester) return prev

            const movedCourses = semester.courses.map(c => ({ ...c, isInSemester: false }))

            return {
                ...prev,
                semesters: prev.semesters.filter((s) => s.id !== semesterId),
                availableCourses: [...prev.availableCourses, ...movedCourses],
            }
        })
    }

    const getSemesterCredits = (semesterId: string): number => {
        const semester = state.semesters.find((s) => s.id === semesterId)
        if (!semester) return 0
        return semester.courses.reduce((sum, course) => sum + course.credits, 0)
    }

    const exportState = (): string => {
        return JSON.stringify(state, null, 2)
    }

    const importState = (jsonString: string) => {
        try {
            const parsedState = JSON.parse(jsonString) as CoursePlannerState
            setState(parsedState)
            localStorage.setItem("course-planner-state", jsonString)
        } catch (e) {
            console.error("[v0] Failed to import state", e)
        }
    }

    return (
        <CoursePlannerContext.Provider
            value={{
                state,
                addCourse,
                removeCourse,
                updateCourse,
                moveCourse,
                deleteSemester,
                getSemesterCredits,
                exportState,
                importState,
            }}
        >
            {children}
        </CoursePlannerContext.Provider>
    )
}

export function useCoursePlanner() {
    const context = useContext(CoursePlannerContext)
    if (!context) {
        throw new Error("useCoursePlanner must be used within CoursePlannerProvider")
    }
    return context
}

"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import type { CoursePlannerState, Semester, Course, Grade } from "./types"
import { v4 as uuidv4 } from "uuid"
import { gradePointsMap } from "./templates"
import { parseGradeDataForPlanner } from "./parse-cgpa-data"

const DEFAULT_COURSES: Omit<Course, "id">[] = [
    { name: "Economy, Politics, and Society", credits: 4, deptCode: "", type: "FC", isInSemester: false },
    { name: "Literature and the World", credits: 4, deptCode: "", type: "FC", isInSemester: false },
    { name: "Great Books", credits: 4, deptCode: "", type: "FC", isInSemester: false },
    { name: "Quantitative Reasoning and Mathematical Thinking", credits: 4, deptCode: "", type: "FC", isInSemester: false },
    { name: "Principles of Science", credits: 4, deptCode: "", type: "FC", isInSemester: false },
    { name: "Indian Civilisations", credits: 4, deptCode: "", type: "FC", isInSemester: false },
    { name: "Environmental Studies", credits: 4, deptCode: "", type: "FC", isInSemester: false },
    { name: "Introduction to Critical Thinking", credits: 4, deptCode: "CW", type: "FC", isInSemester: false },
    { name: "Mind and Behaviour", credits: 4, deptCode: "", type: "FC", isInSemester: false },
    { name: "CC1", credits: 2, deptCode: "", type: "CC", isInSemester: false },
    { name: "CC2", credits: 2, deptCode: "", type: "CC", isInSemester: false },
]

interface CoursePlannerContextType {
    state: CoursePlannerState
    selectedDegreeId: string | null
    setSelectedDegree: (degreeId: string | null) => void
    loadPreviousSemesters: (cgpaText: string) => { success: boolean; message: string; semestersLoaded: number }
    addCourse: (semesterId: string | null, course: Course) => void
    removeCourse: (courseId: string) => void
    updateCourse: (courseId: string, updates: Partial<Course>) => void
    updateCourseGrade: (courseId: string, grade: Grade) => void
    updateSemester: (semesterId: string, updates: Partial<Semester>) => void
    moveCourse: (courseId: string, fromSemesterId: string | null, toSemesterId: string | null, newIndex?: number) => void
    deleteSemester: (semesterId: string) => void
    addSemester: () => void
    getSemesterCredits: (semesterId: string) => number
    getSemesterGPA: (semesterId: string) => number | null
    getCGPA: () => number | null
    getCreditsByType: () => { major: number; minor: number; fc: number; cc: number; concentration: number; openCredits: number; total: number }
    exportState: () => string
    importState: (jsonString: string) => void
}

const CoursePlannerContext = createContext<CoursePlannerContextType | undefined>(undefined)

export function CoursePlannerProvider({ children, initialData }: { children: ReactNode; initialData?: any }) {
    const [state, setState] = useState<CoursePlannerState>(() => {
        // Always initialize with default state for consistent server/client rendering
        const semesters: Semester[] = Array.from({ length: 4 }, (_, i) => ({
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

    // Selected degree template
    const [selectedDegreeId, setSelectedDegreeIdState] = useState<string | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)

    // Load from initialData (server-side) or local storage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            // If we have initialData from server, use it
            if (initialData) {
                setState(initialData);
                console.log("Loaded trajectory from Strapi (server-side)");
                setIsInitialized(true);
            } else {
                // Fall back to localStorage
                const savedState = localStorage.getItem("course-planner-state");
                if (savedState) {
                    try {
                        setState(JSON.parse(savedState));
                        console.log("Loaded trajectory from localStorage");
                    } catch (e) {
                        console.error("[v0] Failed to parse saved state", e);
                    }
                }
                setIsInitialized(true);
            }

            const savedDegree = localStorage.getItem("selected-degree-id");
            if (savedDegree) {
                setSelectedDegreeIdState(savedDegree);
            }
        }
    }, [initialData])

    // Persist state updates (only after initialization to avoid overwriting with defaults)
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem("course-planner-state", JSON.stringify(state))
        }
    }, [state, isInitialized])

    // Persist degree selection
    const setSelectedDegree = (degreeId: string | null) => {
        setSelectedDegreeIdState(degreeId)
        if (typeof window !== "undefined") {
            if (degreeId) {
                localStorage.setItem("selected-degree-id", degreeId)
            } else {
                localStorage.removeItem("selected-degree-id")
            }
        }
    }

    // Load previous semesters from AMS data
    const loadPreviousSemesters = (cgpaText: string): { success: boolean; message: string; semestersLoaded: number } => {
        try {
            const parsed = parseGradeDataForPlanner(cgpaText)

            if (parsed.semesters.length === 0) {
                return { success: false, message: "No semesters found in the pasted data", semestersLoaded: 0 }
            }

            setState((prev) => {
                // Get names of taken FC/CC courses to filter from tray
                const takenFCCC = new Set(
                    parsed.takenCourseNames.filter(name => {
                        const lower = name.toLowerCase()
                        return DEFAULT_COURSES.some(dc =>
                            dc.name.toLowerCase() === lower ||
                            lower.includes(dc.name.toLowerCase().substring(0, 15))
                        )
                    })
                )

                // Filter out taken FC/CC from available courses
                const filteredAvailableCourses = prev.availableCourses.filter(course => {
                    if (course.type === "FC" || course.type === "CC") {
                        const courseLower = course.name.toLowerCase()
                        return !parsed.takenCourseNames.some(taken =>
                            taken === courseLower ||
                            courseLower.includes(taken.substring(0, 15)) ||
                            taken.includes(courseLower.substring(0, 15))
                        )
                    }
                    return true
                })

                // Replace semesters with parsed ones + remaining empty semesters
                const totalSemesters = parsed.semesters.length
                const newSemesters: Semester[] = []

                for (let i = 0; i < totalSemesters; i++) {
                    if (i < parsed.semesters.length) {
                        newSemesters.push({
                            ...parsed.semesters[i],
                            id: `semester-${i + 1}`,
                        })
                    } else {
                        newSemesters.push({
                            id: `semester-${i + 1}`,
                            name: `Semester ${i + 1}`,
                            courses: [],
                        })
                    }
                }

                return {
                    semesters: newSemesters,
                    availableCourses: filteredAvailableCourses,
                }
            })

            return {
                success: true,
                message: `Loaded ${parsed.semesters.length} semesters with ${parsed.takenCourseNames.length} courses`,
                semestersLoaded: parsed.semesters.length
            }
        } catch (error) {
            console.error("Error parsing CGPA data:", error)
            return { success: false, message: "Failed to parse the pasted data", semestersLoaded: 0 }
        }
    }

    const addCourse = (semesterId: string | null, course: Course) => {
        setState((prev) => {
            if (semesterId === null) {
                // Prepend to available courses (so new course appears at beginning)
                return {
                    ...prev,
                    availableCourses: [{ ...course, isInSemester: false }, ...prev.availableCourses],
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

    const updateSemester = (semesterId: string, updates: Partial<Semester>) => {
        setState((prev) => ({
            ...prev,
            semesters: prev.semesters.map((sem) =>
                sem.id === semesterId ? { ...sem, ...updates } : sem
            ),
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

    const addSemester = () => {
        setState((prev) => {
            const newSemesterNumber = prev.semesters.length + 1
            const newSemester: Semester = {
                id: `semester-${newSemesterNumber}`,
                name: `Semester ${newSemesterNumber}`,
                courses: [],
            }
            return {
                ...prev,
                semesters: [...prev.semesters, newSemester],
            }
        })
    }

    const getSemesterCredits = (semesterId: string): number => {
        const semester = state.semesters.find((s) => s.id === semesterId)
        if (!semester) return 0
        return semester.courses.reduce((sum, course) => sum + course.credits, 0)
    }

    const updateCourseGrade = (courseId: string, grade: Grade) => {
        setState((prev) => ({
            ...prev,
            semesters: prev.semesters.map((sem) => ({
                ...sem,
                courses: sem.courses.map((c) => (c.id === courseId ? { ...c, grade } : c)),
            })),
        }))
    }

    const getSemesterGPA = (semesterId: string): number | null => {
        const semester = state.semesters.find((s) => s.id === semesterId)
        if (!semester) return null

        // GPA Calculation:
        // 1. Exclude 'P' (Pass) and 'TP' (Teaching Practicum) from calculation entirely.
        // 2. 'F' grade IS included: standard logic maps 'F' to 0.0 points in templates.ts, so it adds to denominator but 0 to numerator.
        const coursesWithGrades = semester.courses.filter(
            (c) => c.grade && c.grade !== 'P' && c.grade !== 'TP' && gradePointsMap[c.grade] !== undefined
        )

        if (coursesWithGrades.length === 0) return null

        let totalGradePoints = 0
        let totalCredits = 0

        for (const course of coursesWithGrades) {
            if (course.grade && course.grade !== 'P') {
                const gradePoints = gradePointsMap[course.grade] ?? 0
                totalGradePoints += gradePoints * course.credits
                totalCredits += course.credits
            }
        }

        return totalCredits > 0 ? totalGradePoints / totalCredits : null
    }

    const getCGPA = (): number | null => {
        let totalGradePoints = 0
        let totalCredits = 0

        for (const semester of state.semesters) {
            for (const course of semester.courses) {
                if (course.grade && course.grade !== 'P' && course.grade !== 'TP' && gradePointsMap[course.grade] !== undefined) {
                    const gradePoints = gradePointsMap[course.grade] ?? 0
                    totalGradePoints += gradePoints * course.credits
                    totalCredits += course.credits
                }
            }
        }

        return totalCredits > 0 ? totalGradePoints / totalCredits : null
    }

    const getCreditsByType = (): { major: number; minor: number; fc: number; cc: number; concentration: number; openCredits: number; total: number } => {
        const credits = { major: 0, minor: 0, fc: 0, cc: 0, concentration: 0, openCredits: 0, total: 0 }

        for (const semester of state.semesters) {
            for (const course of semester.courses) {
                // If grade is 'F', do NOT count it towards gained credits.
                // 'P' and 'TP' ARE counted towards credits (just not GPA).
                // Ungraded (planned) courses are counted as projected credits.
                if (course.grade === 'F') continue

                credits.total += course.credits
                switch (course.type) {
                    case "Major":
                        credits.major += course.credits
                        break
                    case "Minor":
                        credits.minor += course.credits
                        break
                    case "FC":
                        credits.fc += course.credits
                        break
                    case "CC":
                        credits.cc += course.credits
                        break
                    case "CT":
                        credits.concentration += course.credits
                        break
                    case "Open":
                        credits.openCredits += course.credits
                        break
                }
            }
        }

        return credits
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
                selectedDegreeId,
                setSelectedDegree,
                loadPreviousSemesters,
                addCourse,
                removeCourse,
                updateCourse,
                updateCourseGrade,
                updateSemester,
                moveCourse,
                deleteSemester,
                addSemester,
                getSemesterCredits,
                getSemesterGPA,
                getCGPA,
                getCreditsByType,
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

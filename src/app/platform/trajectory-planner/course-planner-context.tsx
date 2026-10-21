"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { fetchPlannerImport } from "./ams-report"
import { STORAGE_KEYS } from "./data"
import { normalisePlannerState } from "./schema"
import type { Course, CourseLocation, CoursePlannerState, Grade, PlannerSummary, Semester } from "./types"
import * as ops from "./utils"
import { pluralise, readStorage, summarisePlanner, writeStorage } from "./utils"

type ImportResult = { success: boolean; message: string; semestersLoaded: number }

interface CoursePlannerContextType {
    state: CoursePlannerState
    /** CGPA, credits by type and per-semester numbers. Recomputed once per change, not per read. */
    summary: PlannerSummary
    /** True once the board holds the student's plan (from the account or this device). */
    hydrated: boolean
    selectedDegreeId: string | null
    setSelectedDegree: (degreeId: string | null) => void
    loadPreviousSemesters: (amsText: string) => Promise<ImportResult>
    addCourse: (location: CourseLocation, course: Course) => void
    removeCourse: (courseId: string) => void
    updateCourse: (courseId: string, updates: Partial<Course>) => void
    updateCourseGrade: (courseId: string, grade: Grade) => void
    updateSemester: (semesterId: string, updates: Partial<Semester>) => void
    moveCourse: (courseId: string, from: CourseLocation, to: CourseLocation, index?: number) => void
    deleteSemester: (semesterId: string) => void
    addSemester: () => void
}

const CoursePlannerContext = createContext<CoursePlannerContextType | undefined>(undefined)

/** The degree picked last time. Read once from the pre-v1 key, which held a bare string. */
function readSelectedDegree(): string | null {
    const saved = readStorage<string>(STORAGE_KEYS.selectedDegree)
    if (saved) return saved
    try {
        return window.localStorage.getItem(STORAGE_KEYS.legacySelectedDegree)
    } catch {
        return null
    }
}

/**
 * The plan being edited. Starts from the copy saved in the student's account (`initialData`),
 * else this device's copy, else a fresh plan. Every change is mirrored to localStorage;
 * saving to the account is `use-save.ts`'s job.
 */
export function CoursePlannerProvider({ children, initialData }: { children: ReactNode; initialData: CoursePlannerState | null }) {
    const [state, setState] = useState<CoursePlannerState>(() => initialData ?? ops.createInitialState())
    const [hydrated, setHydrated] = useState(initialData !== null)
    const [selectedDegreeId, setSelectedDegreeId] = useState<string | null>(null)

    // localStorage isn't available during the server render, so this device's copy loads after mount.
    useEffect(() => {
        setSelectedDegreeId(readSelectedDegree())
        if (initialData) return
        const local = normalisePlannerState(readStorage<unknown>(STORAGE_KEYS.plannerState))
        if (local) setState(local)
        setHydrated(true)
    }, [initialData])

    useEffect(() => {
        if (hydrated) writeStorage(STORAGE_KEYS.plannerState, state)
    }, [state, hydrated])

    const setSelectedDegree = useCallback((degreeId: string | null) => {
        setSelectedDegreeId(degreeId)
        writeStorage(STORAGE_KEYS.selectedDegree, degreeId)
    }, [])

    const loadPreviousSemesters = useCallback(async (amsText: string): Promise<ImportResult> => {
        const result = await fetchPlannerImport(amsText)
        if (result.data === null) return { success: false, message: result.error, semestersLoaded: 0 }
        const { data } = result
        if (data.semesters.length === 0) {
            return { success: false, message: "No semesters found in the pasted report. Copy the whole AMS page and try again.", semestersLoaded: 0 }
        }
        setState((prev) => ops.applyAmsImport(prev, data.semesters, data.takenTitles))
        return {
            success: true,
            message: `Loaded ${pluralise(data.semesters.length, "semester")} with ${pluralise(data.takenTitles.length, "course")}`,
            semestersLoaded: data.semesters.length,
        }
    }, [])

    const addCourse = useCallback((location: CourseLocation, course: Course) => setState((prev) => ops.addCourse(prev, location, course)), [])
    const removeCourse = useCallback((courseId: string) => setState((prev) => ops.removeCourse(prev, courseId)), [])
    const updateCourse = useCallback(
        (courseId: string, updates: Partial<Course>) => setState((prev) => ops.updateCourse(prev, courseId, updates)),
        [],
    )
    const updateCourseGrade = useCallback(
        (courseId: string, grade: Grade) => setState((prev) => ops.updateCourse(prev, courseId, { grade })),
        [],
    )
    const updateSemester = useCallback(
        (semesterId: string, updates: Partial<Semester>) => setState((prev) => ops.updateSemester(prev, semesterId, updates)),
        [],
    )
    const moveCourse = useCallback(
        (courseId: string, from: CourseLocation, to: CourseLocation, index?: number) =>
            setState((prev) => ops.moveCourse(prev, courseId, from, to, index)),
        [],
    )
    const deleteSemester = useCallback((semesterId: string) => setState((prev) => ops.deleteSemester(prev, semesterId)), [])
    const addSemester = useCallback(() => setState((prev) => ops.addSemester(prev)), [])

    const summary = useMemo(() => summarisePlanner(state), [state])

    const value = useMemo<CoursePlannerContextType>(
        () => ({
            state,
            summary,
            hydrated,
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
        }),
        [
            state,
            summary,
            hydrated,
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
        ],
    )

    return <CoursePlannerContext.Provider value={value}>{children}</CoursePlannerContext.Provider>
}

export function useCoursePlanner() {
    const context = useContext(CoursePlannerContext)
    if (!context) throw new Error("useCoursePlanner must be used within CoursePlannerProvider")
    return context
}

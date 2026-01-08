"use client"

import {
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    rectIntersection,
} from "@dnd-kit/core"
import { useState } from "react"
import { useCoursePlanner } from "../course-planner-context"
import { SemesterColumn } from "./semester-column"
import { CourseCard } from "./course-card"
import { AvailableCoursesTray } from "./available-courses-tray"
import { SummaryAndTemplateTable } from "./summary-and-template-table"
import type { Course } from "../types"
import { Save, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CoursePlannerBoard() {
    const { state, moveCourse, exportState } = useCoursePlanner()
    const [activeCourse, setActiveCourse] = useState<Course | null>(null)
    const [hiddenSemesterIds, setHiddenSemesterIds] = useState<string[]>([])

    const toggleSemesterVisibility = (id: string) => {
        setHiddenSemesterIds(prev =>
            prev.includes(id)
                ? prev.filter(sid => sid !== id)
                : [...prev, id]
        )
    }

    const visibleSemesters = state.semesters.filter(s => !hiddenSemesterIds.includes(s.id))

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    )

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const courseId = active.id as string

        // Find the course in all semesters and available courses
        let course: Course | undefined
        for (const semester of state.semesters) {
            course = semester.courses.find((c) => c.id === courseId)
            if (course) break
        }
        if (!course) {
            course = state.availableCourses.find((c) => c.id === courseId)
        }

        if (course) {
            setActiveCourse(course)
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveCourse(null)

        if (!over) return

        const courseId = active.id as string
        const overId = over.id as string

        let toSemesterId: string | null = null

        if (overId === "available-courses") {
            toSemesterId = null
        } else if (overId.startsWith("semester-")) {
            toSemesterId = overId
        } else {
            // Find which semester contains the course we dropped over
            for (const semester of state.semesters) {
                if (semester.courses.some((c) => c.id === overId)) {
                    toSemesterId = semester.id
                    break
                }
            }
            // Check if dropped over a course in available tray
            if (toSemesterId === null && state.availableCourses.some((c) => c.id === overId)) {
                toSemesterId = null
            }
        }

        // Find current location
        let fromSemesterId: string | null = null
        for (const semester of state.semesters) {
            if (semester.courses.some((c) => c.id === courseId)) {
                fromSemesterId = semester.id
                break
            }
        }

        if (fromSemesterId !== toSemesterId) {
            moveCourse(courseId, fromSemesterId, toSemesterId)
        }
    }

    const [isSaving, setIsSaving] = useState(false)

    const handleSave = () => {
        setIsSaving(true)
        // Simulate save delay
        setTimeout(() => {
            const jsonState = exportState()
            console.log("[v0] Course Planner State (ready for DB):")
            console.log(jsonState)

            // Also show a brief success message
            console.log("[v0] State logged above. Copy this JSON to persist to your database.")
            setIsSaving(false)
        }, 1000)
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col gap-8">
                {/* <div className="flex items-center justify-end">
                    <Button onClick={handleSave} className="gap-2">
                        <Save size={16} />
                        Save Trajectory Plan
                    </Button>
                </div> */}

                <SummaryAndTemplateTable />

                <div className="flex flex-col md:flex-row gap-6 h-full items-start">
                    {/* Available Course Tray Side Panel */}
                    <div className="w-full md:w-64 shrink-0 top-24 sticky self-start max-h-[calc(100vh-160px)] overflow-hidden flex flex-col">
                        <AvailableCoursesTray />
                    </div>

                    {/* Semester Columns */}
                    <div className="flex-1 w-full overflow-x-auto pb-4">
                        <div className="flex flex-col gap-4 min-w-max pb-24 px-1">
                            {/* Hidden Semesters Button Array */}
                            {hiddenSemesterIds.length > 0 && (
                                <div className="flex gap-2 items-center p-2 bg-muted/20 rounded-lg border border-dashed text-sm">
                                    <span className="text-muted-foreground font-medium px-1 flex items-center gap-1">
                                        <EyeOff size={14} />
                                        Hidden Semesters:
                                    </span>
                                    {state.semesters
                                        .filter(s => hiddenSemesterIds.includes(s.id))
                                        .map(s => (
                                            <Button
                                                key={s.id}
                                                variant="secondary"
                                                size="sm"
                                                className="h-7 text-xs gap-1.5"
                                                onClick={() => toggleSemesterVisibility(s.id)}
                                            >
                                                <Eye size={12} />
                                                {s.name}
                                            </Button>
                                        ))}
                                </div>
                            )}

                            <div className="flex gap-6">
                                {visibleSemesters.map((semester) => (
                                    <div key={semester.id} className="w-full md:w-[320px] shrink-0">
                                        <SemesterColumn
                                            semester={semester}
                                            onHide={() => toggleSemesterVisibility(semester.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Button
                onClick={handleSave}
                disabled={isSaving}
                className={`
                fixed
                bottom-6
                right-6
                z-50
                h-14
                w-14
                rounded-full
                flex
                items-center
                justify-center
                bg-primary/70
                shadow-lg
                transition-all
                duration-300
                group
                hover:w-56
                hover:rounded-3xl
                hover:justify-start
                px-4
                overflow-hidden
                ${isSaving ? 'opacity-70' : ''}
              `}
                style={{ minWidth: "3.5rem" }}
            >
                <span className="flex items-center w-full justify-center group-hover:justify-start">
                    <Save
                        className={`w-15 h-15 flex-shrink-0 text-center ${isSaving ? 'animate-pulse' : ''}`}
                        strokeWidth={2.5}
                    />
                    <span
                        className={`
                    ml-4
                    text-lg
                    font-semibold
                    whitespace-nowrap
                    hidden
                    group-hover:inline
                    transition-all
                    duration-300
                  `}
                    >
                        {isSaving ? 'Saving...' : 'Save Trajectory'}
                    </span>
                </span>
            </Button>

            <DragOverlay>{activeCourse ? <CourseCard course={activeCourse} isDragging /> : null}</DragOverlay>
        </DndContext>
    )
}

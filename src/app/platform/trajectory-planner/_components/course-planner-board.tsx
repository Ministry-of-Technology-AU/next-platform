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
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CoursePlannerBoard() {
    const { state, moveCourse, exportState } = useCoursePlanner()
    const [activeCourse, setActiveCourse] = useState<Course | null>(null)

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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Course Trajectory Planner</h1>
                        <p className="text-sm text-muted-foreground">Plan your academic journey semester by semester</p>
                    </div>
                    <Button onClick={handleSave} className="gap-2">
                        <Save size={16} />
                        Save Trajectory Plan
                    </Button>
                </div>

                <SummaryAndTemplateTable />

                <AvailableCoursesTray />

                <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                    {state.semesters.map((semester) => (
                        <div key={semester.id} className="w-full md:w-[320px] shrink-0">
                            <SemesterColumn semester={semester} />
                        </div>
                    ))}
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

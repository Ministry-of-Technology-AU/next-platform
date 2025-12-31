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

    const handleSave = () => {
        const jsonState = exportState()
        console.log("[v0] Course Planner State (ready for DB):")
        console.log(jsonState)

        // Also show a brief success message
        console.log("[v0] State logged above. Copy this JSON to persist to your database.")
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

                <AvailableCoursesTray />

                <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                    {state.semesters.map((semester) => (
                        <div key={semester.id} className="w-full md:w-[320px] shrink-0">
                            <SemesterColumn semester={semester} />
                        </div>
                    ))}
                </div>
            </div>

            <DragOverlay>{activeCourse ? <CourseCard course={activeCourse} isDragging /> : null}</DragOverlay>
        </DndContext>
    )
}

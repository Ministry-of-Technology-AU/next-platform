"use client"

import {
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    PointerSensor,
    TouchSensor,
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
import { Save, Eye, EyeOff, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { TooltipContent, TooltipTrigger, TooltipProvider, Tooltip } from "@/components/ui/tooltip"
import { TourStep, TourTrigger } from "@/components/guided-tour"
import { HelpCircle } from "lucide-react"

export function CoursePlannerBoard() {
    const { state, moveCourse, exportState, addSemester } = useCoursePlanner()
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
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
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

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const jsonState = exportState()
            const response = await fetch("/api/platform/trajectory-planner", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ state: JSON.parse(jsonState) }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to save")
            }

            toast.success("Trajectory saved successfully!")
        } catch (error) {
            console.error("Save failed:", error)
            toast.error("Failed to save trajectory. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <DndContext
            id="course-planner-dnd"
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col gap-8">


                <SummaryAndTemplateTable />

                <div className="flex flex-col md:flex-row gap-6 h-full items-start">
                    {/* Available Course Tray - Full width on mobile, side panel on desktop */}
                    <div className="w-full md:w-64 shrink-0">
                        <AvailableCoursesTray />
                    </div>

                    {/* Semester Columns - scrollbar on top using CSS flip trick */}
                    <div
                        className="flex-1 w-full overflow-x-auto pb-4"
                        style={{ transform: 'rotateX(180deg)' }}
                    >
                        <div
                            className="flex flex-col gap-4 min-w-max pt-2 pb-4 px-1"
                            style={{ transform: 'rotateX(180deg)' }}
                        >
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
                                {visibleSemesters.map((semester, index) => (
                                    <div key={semester.id} className="w-full md:w-[320px] shrink-0">
                                        <SemesterColumn
                                            semester={semester}
                                            isFirst={index === 0}
                                            onHide={() => toggleSemesterVisibility(semester.id)}
                                        />
                                    </div>
                                ))}

                                {/* Add Semester Button */}
                                <div className="w-full md:w-[320px] shrink-0 flex items-center justify-center min-h-[400px]">
                                    <TourStep
                                        id="add-semester"
                                        title="Add Semester"
                                        content="Planning for more years? Add as many semesters as you need to visualize your entire degree."
                                        order={7}
                                    >
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        onClick={addSemester}
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-16 w-16 rounded-full border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/10 transition-all"
                                                        aria-label="Add new semester"
                                                    >
                                                        <Plus className="h-8 w-8" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    Add New Semester
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </TourStep>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            <DragOverlay>{activeCourse ? <CourseCard course={activeCourse} isDragging /> : null}</DragOverlay>
        </DndContext >
    )
}

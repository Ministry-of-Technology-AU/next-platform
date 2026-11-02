"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { TourStep } from "@/components/guided-tour"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useCoursePlanner } from "../course-planner-context"
import { TRAY_ID } from "../data"
import { CourseCard } from "./course-card"
import { KeyHint } from "./key-hint"

/** Courses not yet in a semester. Drag from here into the board, or drop a course back. */
export function CourseTray({ onNewCourse, onEditCourse }: { onNewCourse: () => void; onEditCourse: (courseId: string) => void }) {
    const { state } = useCoursePlanner()
    const { setNodeRef, isOver } = useDroppable({ id: TRAY_ID })
    const courses = state.availableCourses

    return (
        <TourStep
            id="trajectory-tray"
            title="Unplaced courses"
            content="Courses you still need to fit in. Drag one into a semester. On a phone, press and hold a course to drag it. Press New course to add one of your own."
            order={50}
            position="right"
            className="h-full"
        >
            <section
                ref={setNodeRef}
                aria-label="Unplaced courses"
                className={cn(
                    "flex h-full flex-col rounded-xl border-2 border-dashed transition-colors",
                    isOver ? "border-primary/50 bg-primary/5" : "border-border bg-card/60",
                )}
            >
                <header className="flex items-center gap-2 border-b border-border p-3">
                    <h3 className="flex flex-1 items-baseline gap-1.5 !text-left !text-sm !font-bold">
                        Unplaced
                        <span className="font-body text-xs font-normal tabular-nums text-muted-foreground">{courses.length}</span>
                    </h3>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="sm" variant="outline" onClick={onNewCourse} className="h-8 cursor-pointer gap-1 border-border px-2.5 text-xs">
                                <Plus /> New course
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="flex items-center gap-2">
                            Add a blank course here <KeyHint>N</KeyHint>
                        </TooltipContent>
                    </Tooltip>
                </header>

                <div className="flex-1 space-y-2 overflow-y-auto p-2">
                    <SortableContext items={courses.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} location={null} onEdit={onEditCourse} />
                        ))}
                    </SortableContext>
                    {courses.length === 0 && (
                        <p className="flex h-full min-h-24 flex-col items-center justify-center gap-1 px-4 text-center text-xs text-muted-foreground">
                            Every course is placed.
                            <span>Drop a course here to take it out of a semester.</span>
                        </p>
                    )}
                </div>
            </section>
        </TourStep>
    )
}

"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useCoursePlanner } from "../course-planner-context"
import { CourseCard } from "./course-card"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { v4 as uuidv4 } from "uuid"
import { TourStep } from "@/components/guided-tour"

export function AvailableCoursesTray() {
    const { state, addCourse } = useCoursePlanner()
    const { setNodeRef, isOver } = useDroppable({
        id: "available-courses",
    })

    const addNewCourse = () => {
        addCourse(null, {
            id: uuidv4(),
            name: "New Course",
            credits: 4,
            deptCode: "CS",
            type: "Major",
        })
    }

    return (
        <TourStep
            id="available-courses"
            title="Available Courses"
            content="Your course repository. Drag and drop courses from here into your semesters to build your schedule."
            order={5}
            position="right"
        >
            <div className="space-y-3 h-full flex flex-col">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">Courses</h2>
                    <Button onClick={addNewCourse} size="sm" className="h-7 text-xs gap-1">
                        <Plus size={14} /> Add
                    </Button>
                </div>

                <div
                    ref={setNodeRef}
                    className={cn(
                        "flex-1 min-h-[150px] p-2 rounded-xl border border-dashed transition-colors flex flex-col gap-3 overflow-y-auto bg-muted/10 custom-scrollbar",
                        isOver ? "border-primary bg-primary/5" : "border-border",
                    )}
                >
                    <SortableContext items={state.availableCourses.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                        {state.availableCourses.length > 0 ? (
                            state.availableCourses.map((course) => (
                                <CourseCard key={course.id} course={course} />
                            ))
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                                <p className="text-sm font-medium">No courses</p>
                                <p className="text-xs mt-1">Add or drag courses here</p>
                            </div>
                        )}
                    </SortableContext>
                </div>
            </div>
        </TourStep>
    )
}

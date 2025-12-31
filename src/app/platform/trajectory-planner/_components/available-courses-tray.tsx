"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { useCoursePlanner } from "../course-planner-context"
import { CourseCard } from "./course-card"
import { cn } from "@/lib/utils"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { v4 as uuidv4 } from "uuid"

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
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Available Courses</h2>
                <Button onClick={addNewCourse} size="sm" className="h-8 gap-1">
                    <Plus size={16} /> Add Course
                </Button>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "min-h-[140px] p-4 rounded-xl border border-dashed transition-colors flex gap-4 overflow-x-auto bg-muted/10",
                    isOver ? "border-primary bg-primary/5" : "border-border",
                )}
            >
                <SortableContext items={state.availableCourses.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
                    {state.availableCourses.map((course) => (
                        <div key={course.id} className="min-w-[240px]">
                            <CourseCard course={course} />
                        </div>
                    ))}
                </SortableContext>

                {state.availableCourses.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <p className="text-sm font-medium">No courses in tray</p>
                        <p className="text-xs">Drag courses here to park them or click "Add Course"</p>
                    </div>
                )}
            </div>
        </div>
    )
}

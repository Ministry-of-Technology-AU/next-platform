"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { Semester } from "../types"
import { CourseCard } from "./course-card"
import { useCoursePlanner } from "../course-planner-context"
import { cn } from "@/lib/utils"
import { AlertCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SemesterColumnProps {
    semester: Semester
}

export function SemesterColumn({ semester }: SemesterColumnProps) {
    const { getSemesterCredits, deleteSemester } = useCoursePlanner()
    const { setNodeRef, isOver } = useDroppable({
        id: semester.id,
    })

    const credits = getSemesterCredits(semester.id)
    const isBelowMinimum = credits < 16 && semester.courses.length > 0

    return (
        <div className="flex flex-col h-full min-h-[400px]">
            <div
                className={cn(
                    "flex items-center justify-between p-3 rounded-t-lg border-b bg-card",
                    isBelowMinimum ? "border-destructive/50 bg-destructive/5" : "border-border",
                )}
            >
                <div>
                    <h3 className="font-bold text-sm flex items-center gap-2">
                        {semester.name}
                        {isBelowMinimum && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <AlertCircle className="text-destructive" size={14} />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Minimum 16 credits required</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </h3>
                    <p className={cn("text-[11px] font-medium", isBelowMinimum ? "text-destructive" : "text-muted-foreground")}>
                        {credits} Credit{credits !== 1 ? "s" : ""}
                        {isBelowMinimum && " (Below minimum)"}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteSemester(semester.id)}
                >
                    <Trash2 size={14} />
                </Button>
            </div>

            <div
                ref={setNodeRef}
                className={cn(
                    "flex-1 p-3 transition-colors rounded-b-lg border border-t-0 bg-muted/20",
                    isOver && "bg-primary/5 border-primary/20",
                    isBelowMinimum && "bg-destructive/[0.02] border-destructive/20",
                )}
            >
                <div className="space-y-3">
                    <SortableContext items={semester.courses.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                        {semester.courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </SortableContext>

                    {semester.courses.length === 0 && (
                        <div className="h-24 flex items-center justify-center border-2 border-dashed border-border/50 rounded-lg text-muted-foreground text-[11px] italic">
                            Drop courses here
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

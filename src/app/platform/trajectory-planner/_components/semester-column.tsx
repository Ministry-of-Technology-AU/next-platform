"use client"

import { useState, useRef, useEffect } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { Semester } from "../types"
import { CourseCard } from "./course-card"
import { useCoursePlanner } from "../course-planner-context"
import { cn } from "@/lib/utils"
import { AlertCircle, Trash2, Pencil, Check, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TourStep } from "@/components/guided-tour"

interface SemesterColumnProps {
    semester: Semester
    onHide?: () => void
    isFirst?: boolean
}

export function SemesterColumn({ semester, onHide, isFirst }: SemesterColumnProps) {
    const { getSemesterCredits, deleteSemester, getSemesterGPA, updateSemester } = useCoursePlanner()
    const { setNodeRef, isOver } = useDroppable({
        id: semester.id,
    })

    const [isEditingName, setIsEditingName] = useState(false)
    const [editedName, setEditedName] = useState(semester.name)
    const inputRef = useRef<HTMLInputElement>(null)

    const credits = getSemesterCredits(semester.id)
    const gpa = getSemesterGPA(semester.id)
    const isBelowMinimum = credits < 16 && semester.courses.length > 0

    // Focus input when entering edit mode
    useEffect(() => {
        if (isEditingName && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditingName])

    const handleSaveName = () => {
        if (editedName.trim()) {
            updateSemester(semester.id, { name: editedName.trim() })
        } else {
            setEditedName(semester.name) // Reset to original if empty
        }
        setIsEditingName(false)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveName()
        } else if (e.key === 'Escape') {
            setEditedName(semester.name)
            setIsEditingName(false)
        }
    }

    const content = (
        <div className="flex flex-col h-full min-h-[400px]">
            <div
                className={cn(
                    "flex items-center justify-between p-3 rounded-t-lg border-b bg-card",
                    isBelowMinimum ? "border-destructive/50 bg-destructive/5" : "border-border",
                )}
            >
                <div>
                    <h3 className="font-bold text-sm flex items-center gap-2">
                        {isEditingName ? (
                            <div className="flex items-center gap-1">
                                <Input
                                    ref={inputRef}
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={handleSaveName}
                                    className="h-6 text-sm font-bold py-0 px-1 w-32"
                                />
                            </div>
                        ) : (
                            <>
                                <span
                                    className="cursor-pointer hover:underline"
                                    onClick={() => setIsEditingName(true)}
                                >
                                    {semester.name}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 opacity-0 group-hover:opacity-100 hover:opacity-100 text-muted-foreground hover:text-primary"
                                    onClick={() => setIsEditingName(true)}
                                >
                                    <Pencil size={12} />
                                </Button>
                            </>
                        )}
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
                    <div className="flex items-center gap-2">
                        <p className={cn("text-[11px] font-medium", isBelowMinimum ? "text-destructive" : "text-muted-foreground")}>
                            {credits} Credit{credits !== 1 ? "s" : ""}
                            {isBelowMinimum && " (Below minimum)"}
                        </p>
                        {gpa !== null && (
                            <span className="text-[11px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                GPA: {(Math.round(gpa * 100) / 100).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={onHide}
                        title="Hide semester"
                    >
                        <Eye size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteSemester(semester.id)}
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
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

    if (isFirst) {
        return (
            <TourStep
                id="semester-planning"
                title="Semester Planning"
                content="Organize your courses by semester. Drag to reorder or move courses between terms to optimize your workload."
                order={6}
            >
                {content}
            </TourStep>
        )
    }

    return content
}

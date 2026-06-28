"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Course, Credits, CourseType, DepartmentCode, Grade } from "../types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCoursePlanner } from "../course-planner-context"
import { cn } from "@/lib/utils"
import { GripVertical, Trash2, Pencil, Undo2, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { gradeOptions } from "../templates"

interface CourseCardProps {
    course: Course
    isDragging?: boolean
}

export function CourseCard({ course, isDragging }: CourseCardProps) {
    const { updateCourse, removeCourse, updateCourseGrade, moveCourse, state } = useCoursePlanner()
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: course.id })

    const [isEditMode, setIsEditMode] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)

    const isInSemester = course.isInSemester || false
    const showEditable = !isInSemester || isEditMode

    // Handle click outside to exit edit mode
    useEffect(() => {
        if (!isEditMode) return

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement
            // Don't close if clicking inside the card
            if (cardRef.current && cardRef.current.contains(target)) {
                return
            }
            // Don't close if clicking on Select popover content (which renders in a portal)
            if (target.closest('[role="listbox"]') || target.closest('[data-radix-popper-content-wrapper]')) {
                return
            }
            setIsEditMode(false)
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isEditMode])

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateCourse(course.id, { name: e.target.value })
    }

    const handleCreditsChange = (value: string) => {
        updateCourse(course.id, { credits: Number.parseInt(value) as Credits })
    }

    const handleDeptChange = (value: string) => {
        updateCourse(course.id, { deptCode: value as DepartmentCode })
    }

    const handleTypeChange = (value: string) => {
        updateCourse(course.id, { type: value as CourseType })
    }

    const handleGradeChange = (value: string) => {
        const grade = value === "none" ? null : (value as Grade)
        updateCourseGrade(course.id, grade)
    }

    // Using global colors as requested
    const getBadgeColor = (type: CourseType) => {
        switch (type) {
            case "Major":
                return "bg-primary/10 text-primary border-primary/20"
            case "Minor":
                return "bg-secondary/20 text-secondary-extradark border-secondary/20"
            case "FC":
                return "bg-green/15 text-green-dark border-green/20"
            case "CC":
                return "bg-blue/15 text-blue-dark border-blue/20"
            case "Open":
                return "bg-gray/15 text-gray-dark border-gray/20"
            case "CT":
                return "bg-purple/15 text-purple-dark border-purple/20"
            default:
                return "bg-gray/15 text-gray-dark border-gray/20"
        }
    }

    return (
        <div ref={(node) => { setNodeRef(node); (cardRef as any).current = node; }} style={style} className={cn("group relative", isDragging && "opacity-50")}>
            <Card className="hover:shadow-md transition-shadow border-muted bg-card">
                <CardContent className="p-3 space-y-3">
                    <div className="flex items-start gap-2">
                        <button
                            {...attributes}
                            {...listeners}
                            className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <GripVertical size={18} />
                        </button>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                {showEditable ? (
                                    <Input
                                        value={course.name}
                                        onChange={handleNameChange}
                                        placeholder="Course Name"
                                        className="h-7 text-sm font-semibold border-none focus-visible:ring-1 focus-visible:ring-primary p-0 bg-transparent shadow-none"
                                    />
                                ) : (
                                    <h4 className="text-sm font-semibold leading-tight text-left truncate">{course.name}</h4>
                                )}

                                {/* Action buttons - inline with title */}
                                <div className="flex gap-0.5 shrink-0">
                                    {isInSemester && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "h-5 w-5 transition-opacity text-muted-foreground hover:text-primary hover:bg-primary/10",
                                                isEditMode ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                                            )}
                                            onClick={() => setIsEditMode(!isEditMode)}
                                            title={isEditMode ? "Save changes" : "Edit course"}
                                        >
                                            {isEditMode ? <Check size={12} /> : <Pencil size={12} />}
                                        </Button>
                                    )}
                                    {isInSemester ? (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 opacity-80 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary hover:bg-primary/10"
                                            onClick={() => {
                                                const fromSemester = state.semesters.find(s => s.courses.some(c => c.id === course.id))
                                                if (fromSemester) {
                                                    moveCourse(course.id, fromSemester.id, null)
                                                }
                                            }}
                                            title="Move back to tray"
                                        >
                                            <Undo2 size={12} />
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 opacity-20 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => removeCourse(course.id)}
                                            title="Delete course"
                                        >
                                            <Trash2 size={12} />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mt-2 items-center">
                                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5 border", getBadgeColor(course.type))}>
                                    {course.type}
                                </Badge>
                                {course.deptCode && (
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-secondary/30 text-secondary-extradark hover:bg-secondary/40 border-transparent">
                                        {course.deptCode}
                                    </Badge>
                                )}
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-primary/20 text-primary">
                                    {course.credits} Cr
                                </Badge>

                                {/* Grade Selector Badge - always visible when in semester */}
                                {isInSemester && (
                                    <div className="relative">
                                        <Select value={course.grade || "none"} onValueChange={handleGradeChange}>
                                            <SelectTrigger
                                                className={cn(
                                                    "h-5 text-[10px] px-1.5 gap-1 rounded-full border shadow-none bg-transparent hover:bg-muted/50 focus:ring-0 flex items-center min-w-[50px] justify-between",
                                                    course.grade
                                                        ? (course.grade.startsWith('A')
                                                            ? "bg-green/10 text-green-dark border-green/20"
                                                            : course.grade.startsWith('B')
                                                                ? "bg-blue/10 text-blue-dark border-blue/20"
                                                                : "bg-gray/10 text-gray-dark border-gray/20")
                                                        : "bg-muted/30 text-muted-foreground border-transparent"
                                                )}
                                            >
                                                <span className="font-bold leading-none translate-y-[0.5px]">{course.grade || "Gr"}</span>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {gradeOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {showEditable && (
                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/50">
                            <Select value={course.credits.toString()} onValueChange={handleCreditsChange}>
                                <SelectTrigger className="h-6 text-[10px] px-1 bg-muted/30 border-none shadow-none">
                                    <SelectValue placeholder="Cred" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2">2 Credits</SelectItem>
                                    <SelectItem value="4">4 Credits</SelectItem>
                                    <SelectItem value="8">8 Credits</SelectItem>
                                    <SelectItem value="12">12 Credits</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={course.deptCode || "None"} onValueChange={handleDeptChange}>
                                <SelectTrigger className="h-6 text-[10px] px-1 bg-muted/30 border-none shadow-none">
                                    <SelectValue placeholder="Dept" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="None">None</SelectItem>
                                    <SelectItem value="CS">CS</SelectItem>
                                    <SelectItem value="ENT">ENT</SelectItem>
                                    <SelectItem value="ECO">ECO</SelectItem>
                                    <SelectItem value="MATH">MATH</SelectItem>
                                    <SelectItem value="PHY">PHY</SelectItem>
                                    <SelectItem value="CHM">CHM</SelectItem>
                                    <SelectItem value="BIO">BIO</SelectItem>
                                    <SelectItem value="PSY">PSY</SelectItem>
                                    <SelectItem value="PHI">PHI</SelectItem>
                                    <SelectItem value="ENG">ENG</SelectItem>
                                    <SelectItem value="HIS">HIS</SelectItem>
                                    <SelectItem value="POL">POL</SelectItem>
                                    <SelectItem value="MS">MS</SelectItem>
                                    <SelectItem value="PA">PA</SelectItem>
                                    <SelectItem value="AST">AST</SelectItem>
                                    <SelectItem value="YIF">YIF</SelectItem>
                                    <SelectItem value="HUM">HUM</SelectItem>
                                    <SelectItem value="CW">CW</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={course.type} onValueChange={handleTypeChange}>
                                <SelectTrigger className="h-6 text-[10px] px-1 bg-muted/30 border-none shadow-none">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FC">FC</SelectItem>
                                    <SelectItem value="CC">CC</SelectItem>
                                    <SelectItem value="Major">Major</SelectItem>
                                    <SelectItem value="Minor">Minor</SelectItem>
                                    <SelectItem value="CT">Concentration</SelectItem>
                                    <SelectItem value="Open">Open</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div >
    )
}
